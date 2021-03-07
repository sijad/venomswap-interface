import { JSBI, TokenAmount } from '@venomswap/sdk'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useMasterBreederContract } from './useContract'
import { useActiveWeb3React } from './index'
import { GOVERNANCE_TOKEN } from '../constants'

export default function useBaseStakingRewardsEmission(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const govToken = chainId ? GOVERNANCE_TOKEN[chainId] : undefined
  const masterBreederContract = useMasterBreederContract()

  const result = useSingleCallResult(masterBreederContract, 'getNewRewardPerBlock', [0])
  const baseRewardsPerBlock =
    govToken && result && !result.loading && result.result
      ? new TokenAmount(govToken, JSBI.BigInt(result.result))
      : undefined

  return baseRewardsPerBlock
}
