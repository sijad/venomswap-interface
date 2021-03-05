import { JSBI, TokenAmount } from '@viperswap/sdk'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useMasterBreederContract } from './useContract'
import { useActiveWeb3React } from './index'
import { VIPER } from '../constants'

export default function useBaseStakingRewardsEmission(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const viper = chainId ? VIPER[chainId] : undefined
  const masterBreederContract = useMasterBreederContract()

  const result = useSingleCallResult(masterBreederContract, 'getNewRewardPerBlock', [0])
  const baseRewardsPerBlock =
    viper && result && !result.loading && result.result ? new TokenAmount(viper, JSBI.BigInt(result.result)) : undefined

  return baseRewardsPerBlock
}
