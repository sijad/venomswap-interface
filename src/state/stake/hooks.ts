import { CurrencyAmount, JSBI, Token, TokenAmount, Pair } from '@viperswap/sdk'
import { useMemo } from 'react'
import { VIPER } from '../../constants'
import { STAKING_REWARDS_INFO } from '../../constants/staking'
import { useActiveWeb3React } from '../../hooks'
//import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
//import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useMasterBreederContract } from '../../hooks/useContract'
//import { useBlockNumber } from '../application/hooks'

export const STAKING_GENESIS = 6502000

export const REWARDS_DURATION_DAYS = 60
export interface StakingInfo {
  // the pool id (pid) of the pool
  pid: number
  // the allocation point for the given pool
  allocPoint: number | undefined
  // start block for all the rewards pools
  startBlock: number
  // base rewards per block
  baseRewardsPerBlock: TokenAmount
  // pool specific rewards per block
  poolRewardsPerBlock: TokenAmount
  // the percentage of rewards locked
  lockedRewardsPercentageUnits: number
  // the percentage of rewards locked
  unlockedRewardsPercentageUnits: number
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

  // getNewRewardPerBlock uses pid = 0 to return the base rewards
  // poolIds have to be +1'd to map to their actual pid
  // also include pid 0 to get the base emission rate
  let adjustedPids = pids.map(pid => pid + 1)
  adjustedPids = [...[0], ...adjustedPids]

  const poolRewardsPerBlock = useSingleContractMultipleData(
    masterBreederContract,
    'getNewRewardPerBlock',
    adjustedPids.map(adjustedPids => [adjustedPids])
  )

  //const poolLength = useSingleCallResult(masterBreederContract, 'poolLength')
  const startBlock = useSingleCallResult(masterBreederContract, 'START_BLOCK')
  const lockRewardsRatio = useSingleCallResult(masterBreederContract, 'PERCENT_LOCK_BONUS_REWARD')
  //const rewardPerBlock = useSingleCallResult(masterBreederContract, 'REWARD_PER_BLOCK')

  return useMemo(() => {
    if (!chainId || !viper) return []

    return pids.reduce<StakingInfo[]>((memo, pid, index) => {
      const poolInfo = poolInfos[index]

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]

      // poolRewardsPerBlock indexes have to be +1'd to get the actual specific pool data
      const baseRewardsPerBlock = poolRewardsPerBlock[0]
      const specificPoolRewardsPerBlock = poolRewardsPerBlock[index + 1]

      if (
        poolInfo &&
        !poolInfo.loading &&
        pendingReward &&
        !pendingReward.loading &&
        userInfo &&
        !userInfo.loading &&
        baseRewardsPerBlock &&
        !baseRewardsPerBlock.loading &&
        specificPoolRewardsPerBlock &&
        !specificPoolRewardsPerBlock.loading
      ) {
        if (poolInfo.error || userInfo.error || pendingReward.error) {
          //console.error('Failed to load staking rewards info')
          return memo
        }

        const baseBlockRewards = new TokenAmount(viper, JSBI.BigInt(baseRewardsPerBlock?.result?.[0]))

        const poolBlockRewards = specificPoolRewardsPerBlock?.result?.[0]
          ? new TokenAmount(viper, JSBI.BigInt(specificPoolRewardsPerBlock?.result?.[0]))
          : baseBlockRewards

        const lockedRewardsPercentageUnits = Number(lockRewardsRatio.result?.[0])
        const unlockedRewardsPercentageUnits = 100 - lockedRewardsPercentageUnits

        const calculatedTotalPendingRewards = JSBI.BigInt(pendingReward?.result?.[0] ?? 0)
        const calculatedLockedPendingRewards = JSBI.divide(
          JSBI.multiply(calculatedTotalPendingRewards, JSBI.BigInt(lockedRewardsPercentageUnits)),
          JSBI.BigInt(100)
        )
        const calculatedUnlockedPendingRewards = JSBI.divide(
          JSBI.multiply(calculatedTotalPendingRewards, JSBI.BigInt(unlockedRewardsPercentageUnits)),
          JSBI.BigInt(100)
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

        const stakingInfo = {
          pid: pid,
          allocPoint: allocPoint,
          startBlock: startsAtBlock,
          baseRewardsPerBlock: baseBlockRewards,
          poolRewardsPerBlock: poolBlockRewards,
          lockedRewardsPercentageUnits: lockedRewardsPercentageUnits,
          unlockedRewardsPercentageUnits: unlockedRewardsPercentageUnits,
          tokens: masterInfo[index].tokens,
          stakedAmount: stakedAmount,
          earnedAmount: totalPendingRewardAmount,
          lockedEarnedAmount: totalPendingLockedRewardAmount,
          unlockedEarnedAmount: totalPendingUnlockedRewardAmount,
          active: active
        }

        console.log({ stakingInfo })

        memo.push(stakingInfo)
      }
      return memo
    }, [])
  }, [
    chainId,
    masterInfo,
    pids,
    poolInfos,
    userInfos,
    pendingRewards,
    startBlock,
    lockRewardsRatio,
    poolRewardsPerBlock,
    viper
  ])
}

export function useTotalViperEarned(): TokenAmount | undefined {
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

export function useTotalLockedViperEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const viper = chainId ? VIPER[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!viper) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.lockedEarnedAmount),
        new TokenAmount(viper, '0')
      ) ?? new TokenAmount(viper, '0')
    )
  }, [stakingInfos, viper])
}

export function useTotalUnlockedViperEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const viper = chainId ? VIPER[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!viper) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.unlockedEarnedAmount),
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
