import { WETH, CurrencyAmount, JSBI, Token, TokenAmount, Pair, Fraction, DEFAULT_CURRENCIES } from '@venomswap/sdk'
import { useMemo } from 'react'
import { STAKING_REWARDS_INFO } from '../../constants/staking'
import { useActiveWeb3React } from '../../hooks'
//import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
//import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useMasterBreederContract } from '../../hooks/useContract'
import { useMultipleContractSingleData } from '../../state/multicall/hooks'
import { abi as IUniswapV2PairABI } from '@venomswap/core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useGovernanceTokenWethPrice from '../../hooks/useGovernanceTokenWethPrice'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import { unwrappedToken, wrappedCurrency } from '../../utils/wrappedCurrency'
import getBlocksPerYear from '../../utils/getBlocksPerYear'
import calculateTotalStakedAmount from '../../utils/calculateTotalStakedAmount'
import getPair from '../../utils/getPair'
import calculateApr from '../../utils/calculateApr'

//import { useTotalSupply } from '../../data/TotalSupply'
//import { useBlockNumber } from '../application/hooks'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

export const STAKING_GENESIS = 6502000

export const REWARDS_DURATION_DAYS = 60
export interface StakingInfo {
  // the pool id (pid) of the pool
  pid: number
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the allocation point for the given pool
  allocPoint: JSBI
  // start block for all the rewards pools
  startBlock: number
  // base rewards per block
  baseRewardsPerBlock: TokenAmount
  // pool specific rewards per block
  poolRewardsPerBlock: TokenAmount
  // blocks generated per year
  blocksPerYear: JSBI
  // pool share vs all pools
  poolShare: Fraction
  // the percentage of rewards locked
  lockedRewardsPercentageUnits: number
  // the percentage of rewards locked
  unlockedRewardsPercentageUnits: number
  // the total supply of lp tokens in existence
  totalLpTokenSupply: TokenAmount
  // the amount of currently total staked tokens in the pool
  totalStakedAmount: TokenAmount
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the ratio of the user's share of the pool
  stakedRatio: Fraction
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be locked
  lockedEarnedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account - which will be unlocked
  unlockedEarnedAmount: TokenAmount
  // value of total staked amount, measured in weth (or wone/wbnb)
  valueOfTotalStakedAmountInPairCurrency: TokenAmount | undefined
  // pool APR
  apr: Fraction | undefined
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

  const weth = chainId && WETH[chainId]
  const govToken = useGovernanceToken()
  const govTokenWethPrice = useGovernanceTokenWethPrice()
  const govTokenBusdPrice = useBUSDPrice(govToken)
  const blocksPerYear = getBlocksPerYear(chainId)

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

  const lpTokenAddresses = useMemo(() => {
    return poolInfos.reduce<string[]>((memo, poolInfo) => {
      if (poolInfo && !poolInfo.loading && poolInfo.result) {
        const [lpTokenAddress] = poolInfo.result
        memo.push(lpTokenAddress)
      }
      return memo
    }, [])
  }, [poolInfos])

  const lpTokenTotalSupplies = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'totalSupply')
  const lpTokenReserves = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'getReserves')
  const lpTokenBalances = useMultipleContractSingleData(lpTokenAddresses, PAIR_INTERFACE, 'balanceOf', [
    masterBreederContract?.address
  ])

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
    if (!chainId || !weth || !govToken) return []

    return pids.reduce<StakingInfo[]>((memo, pid, index) => {
      const tokens = masterInfo[index].tokens
      const poolInfo = poolInfos[index]

      // amount uint256, rewardDebt uint256, rewardDebtAtBlock uint256, lastWithdrawBlock uint256, firstDepositBlock uint256, blockdelta uint256, lastDepositBlock uint256
      const userInfo = userInfos[index]
      const pendingReward = pendingRewards[index]
      const lpTokenTotalSupply = lpTokenTotalSupplies[index]
      const lpTokenReserve = lpTokenReserves[index]
      const lpTokenBalance = lpTokenBalances[index]

      // poolRewardsPerBlock indexes have to be +1'd to get the actual specific pool data
      const baseRewardsPerBlock = poolRewardsPerBlock[0]
      const specificPoolRewardsPerBlock = poolRewardsPerBlock[index + 1]

      if (
        tokens &&
        poolInfo &&
        !poolInfo.loading &&
        pendingReward &&
        !pendingReward.loading &&
        userInfo &&
        !userInfo.loading &&
        baseRewardsPerBlock &&
        !baseRewardsPerBlock.loading &&
        specificPoolRewardsPerBlock &&
        !specificPoolRewardsPerBlock.loading &&
        lpTokenTotalSupply &&
        !lpTokenTotalSupply.loading &&
        lpTokenReserve &&
        !lpTokenReserve.loading &&
        lpTokenBalance &&
        !lpTokenBalance.loading
      ) {
        if (poolInfo.error || userInfo.error || pendingReward.error) {
          //console.error('Failed to load staking rewards info')
          return memo
        }

        const baseBlockRewards = new TokenAmount(govToken, JSBI.BigInt(baseRewardsPerBlock?.result?.[0]))

        const poolBlockRewards = specificPoolRewardsPerBlock?.result?.[0]
          ? new TokenAmount(govToken, JSBI.BigInt(specificPoolRewardsPerBlock?.result?.[0]))
          : baseBlockRewards

        const poolShare = new Fraction(poolBlockRewards.raw, baseBlockRewards.raw)

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

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'))

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(userInfo?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(lpTokenBalance.result?.[0]))
        const stakedRatio = new Fraction(stakedAmount.raw, totalStakedAmount.raw)

        const totalLpTokenSupply = new TokenAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(lpTokenTotalSupply.result?.[0])
        )
        const totalPendingRewardAmount = new TokenAmount(govToken, calculatedTotalPendingRewards)
        const totalPendingLockedRewardAmount = new TokenAmount(govToken, calculatedLockedPendingRewards)
        const totalPendingUnlockedRewardAmount = new TokenAmount(govToken, calculatedUnlockedPendingRewards)
        const startsAtBlock = startBlock.result?.[0]

        // poolInfo: lpToken address, allocPoint uint256, lastRewardBlock uint256, accGovTokenPerShare uint256
        const poolInfoResult = poolInfo.result
        const allocPoint = JSBI.BigInt(poolInfoResult && poolInfoResult[1])
        const active = poolInfoResult && JSBI.GT(JSBI.BigInt(allocPoint), 0) ? true : false

        const pairToken0 = tokens[0]
        const pairToken1 = tokens[1]
        const currency0 = unwrappedToken(pairToken0)
        //const currency1 = unwrappedToken(pairToken1)
        //const token = currency0 && DEFAULT_CURRENCIES.includes(currency0) ? pairToken1 : pairToken0

        const baseToken = currency0 && DEFAULT_CURRENCIES.includes(currency0) ? pairToken0 : pairToken1
        const reserves = lpTokenReserve?.result
        const reserve0 = reserves?.reserve0
        const reserve1 = reserves?.reserve1

        const stakingTokenPair = getPair(
          wrappedCurrency(pairToken0, chainId),
          wrappedCurrency(pairToken1, chainId),
          reserve0,
          reserve1
        )

        let valueOfTotalStakedAmountInPairCurrency: TokenAmount | undefined
        let apr: Fraction | undefined

        if (totalLpTokenSupply && stakingTokenPair) {
          valueOfTotalStakedAmountInPairCurrency = calculateTotalStakedAmount(
            baseToken,
            stakingTokenPair,
            totalStakedAmount,
            totalLpTokenSupply
          )

          const govTokenPrice = baseToken === weth ? govTokenWethPrice : govTokenBusdPrice
          apr = calculateApr(
            govTokenPrice,
            baseBlockRewards,
            blocksPerYear,
            poolShare,
            valueOfTotalStakedAmountInPairCurrency
          )
        }

        const stakingInfo = {
          pid: pid,
          allocPoint: allocPoint,
          tokens: tokens,
          startBlock: startsAtBlock,
          baseRewardsPerBlock: baseBlockRewards,
          poolRewardsPerBlock: poolBlockRewards,
          blocksPerYear: blocksPerYear,
          poolShare: poolShare,
          lockedRewardsPercentageUnits: lockedRewardsPercentageUnits,
          unlockedRewardsPercentageUnits: unlockedRewardsPercentageUnits,
          totalLpTokenSupply: totalLpTokenSupply,
          totalStakedAmount: totalStakedAmount,
          stakedAmount: stakedAmount,
          stakedRatio: stakedRatio,
          earnedAmount: totalPendingRewardAmount,
          lockedEarnedAmount: totalPendingLockedRewardAmount,
          unlockedEarnedAmount: totalPendingUnlockedRewardAmount,
          valueOfTotalStakedAmountInPairCurrency: valueOfTotalStakedAmountInPairCurrency,
          apr: apr,
          active: active
        }

        memo.push(stakingInfo)
      }
      return memo
    }, [])
  }, [
    chainId,
    govToken,
    weth,
    masterInfo,
    govTokenWethPrice,
    govTokenBusdPrice,
    pids,
    poolInfos,
    userInfos,
    pendingRewards,
    lpTokenTotalSupplies,
    lpTokenReserves,
    lpTokenBalances,
    blocksPerYear,
    startBlock,
    lockRewardsRatio,
    poolRewardsPerBlock
  ])
}

export function useTotalGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

export function useTotalLockedGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.lockedEarnedAmount),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
}

export function useTotalUnlockedGovTokensEarned(): TokenAmount | undefined {
  const govToken = useGovernanceToken()
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!govToken) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.unlockedEarnedAmount),
        new TokenAmount(govToken, '0')
      ) ?? new TokenAmount(govToken, '0')
    )
  }, [stakingInfos, govToken])
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
