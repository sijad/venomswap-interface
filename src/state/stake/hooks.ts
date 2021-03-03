import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WETH, Pair } from '@viperswap/sdk'
import { useMemo } from 'react'
import { VIPER } from '../../constants'
//import { DAI, VIPER, USDC, USDT, WBTC } from '../../constants'
import { BUSD } from '../../constants/tokens'
//import { BUSD, ONE_ETH, LINK } from '../../constants/tokens'
import { useActiveWeb3React } from '../../hooks'
//import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import {
  useSingleCallResult,
  useSingleContractMultipleData
} from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
//import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useMasterBreederContract } from '../../hooks/useContract'

export const STAKING_GENESIS = 6502000

export const REWARDS_DURATION_DAYS = 60

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    pid: number
  }[]
} = {
  [ChainId.HARMONY_TESTNET]: [
    {
      tokens: [WETH[ChainId.HARMONY_TESTNET], BUSD[ChainId.HARMONY_TESTNET]],
      pid: 0
    },
    {
      tokens: [WETH[ChainId.HARMONY_TESTNET], VIPER[ChainId.HARMONY_TESTNET]],
      pid: 1
    }
    /*{
      tokens: [LINK[ChainId.HARMONY_TESTNET], BUSD[ChainId.HARMONY_TESTNET]],
      pid: 2
    }*/
  ]
}

export interface StakingInfo {
  // the pool id (pid) of the pool
  pid: number
  // the allocation point for the given pool
  allocPoint: number | undefined
  // start block for all the rewards pools
  startBlock: number
  // the percentage of rewards locked
  lockRewardsPercentage: JSBI
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be locked
  lockedEarnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be unlocked
  unlockedEarnedAmount: TokenAmount
  // if pool is active
  active: boolean
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()
  const masterBreederContract = useMasterBreederContract()

  const masterInfo = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
          ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const viper = chainId ? VIPER[chainId] : undefined

  const pids = useMemo(() => masterInfo.map(({ pid }) => pid), [masterInfo])
  const pidAccountMapping = useMemo(
    () => masterInfo.map(({ pid }) => (account ? [pid, account] : [undefined, undefined])),
    [masterInfo, account]
  )

  const pendingRewards = useSingleContractMultipleData(masterBreederContract, 'pendingReward', pidAccountMapping)
  const userInfos = useSingleContractMultipleData(masterBreederContract, 'userInfo', pidAccountMapping)

  const poolInfos = useSingleContractMultipleData(
    masterBreederContract,
    'poolInfo',
    pids.map(pids => [pids])
  )

  //const poolLength = useSingleCallResult(masterBreederContract, 'poolLength')
  const startBlock = useSingleCallResult(masterBreederContract, 'START_BLOCK')
  const lockRewardsRatio = useSingleCallResult(masterBreederContract, 'PERCENT_LOCK_BONUS_REWARD')

  return useMemo(() => {
    if (!chainId || !viper) return []

    return pids.reduce<StakingInfo[]>((memo, pid, index) => {
      const poolInfo = poolInfos[index]

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]

      if (poolInfo && !poolInfo.loading && pendingReward && !pendingReward.loading && userInfo && !userInfo.loading) {
        if (poolInfo.error || userInfo.error || pendingReward.error) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        const lockRewardsRatioPercentage = JSBI.BigInt(lockRewardsRatio.result?.[0])
        const calculatedTotalPendingRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const unlockedRewardsRatioPercentage = JSBI.divide(
          JSBI.subtract(JSBI.BigInt(100), lockRewardsRatioPercentage),
          JSBI.BigInt(100)
        )
        const lockedRewardsRatioPercentage = JSBI.divide(lockRewardsRatioPercentage, JSBI.BigInt(100))
        const calculatedLockedPendingRewards = JSBI.multiply(
          calculatedTotalPendingRewards,
          lockedRewardsRatioPercentage
        )

        const calculatedUnlockedPendingRewards = JSBI.multiply(
          calculatedTotalPendingRewards,
          unlockedRewardsRatioPercentage
        )

        const tokens = masterInfo[index].tokens
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(userInfo?.result?.[0] ?? 0))
        const totalPendingRewardAmount = new TokenAmount(viper, calculatedTotalPendingRewards)
        const totalPendingLockedRewardAmount = new TokenAmount(viper, calculatedLockedPendingRewards)
        const totalPendingUnlockedRewardAmount = new TokenAmount(viper, calculatedUnlockedPendingRewards)
        const startsAtBlock = startBlock.result?.[0]

        // poolInfo: lpToken address, allocPoint uint256, lastRewardBlock uint256, accViperPerShare uint256
        const poolInfoResult = poolInfo.result
        const allocPoint = poolInfoResult && poolInfoResult[1]
        const active = poolInfoResult && JSBI.GT(JSBI.BigInt(allocPoint), 0) ? true : false

        memo.push({
          pid: pid,
          startBlock: startsAtBlock,
          allocPoint: allocPoint,
          lockRewardsPercentage: lockRewardsRatioPercentage,
          tokens: masterInfo[index].tokens,
          stakedAmount: stakedAmount,
          earnedAmount: totalPendingRewardAmount,
          lockedEarnedAmount: totalPendingLockedRewardAmount,
          unlockedEarnedAmount: totalPendingUnlockedRewardAmount,
          active: active
        })
      }
      return memo
    }, [])
  }, [chainId, masterInfo, pids, poolInfos, userInfos, pendingRewards, startBlock, lockRewardsRatio, viper])
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const viper = chainId ? VIPER[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!viper) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(viper, '0')
      ) ?? new TokenAmount(viper, '0')
    )
  }, [stakingInfos, viper])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = stakingAmount
    ? tryParseAmount(typedValue, stakingAmount.token)
    : undefined

  const parsedAmount =
    parsedInput && stakingAmount && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
