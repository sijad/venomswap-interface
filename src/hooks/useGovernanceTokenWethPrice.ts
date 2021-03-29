import { useMemo } from 'react'
import { Price, WETH } from '@venomswap/sdk'
import { useActiveWeb3React } from './index'
import useGovernanceToken from './useGovernanceToken'
import { usePair } from '../data/Reserves'

export default function useGovernanceTokenWethPrice(): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const govToken = useGovernanceToken()
  const [, govTokenWethPair] = usePair(chainId && WETH[chainId], govToken)
  const price = chainId && govTokenWethPair && govToken ? govTokenWethPair.priceOf(govToken) : undefined

  return useMemo(() => {
    return govToken && chainId && price
      ? new Price(govToken, WETH[chainId], price.denominator, price.numerator)
      : undefined
  }, [chainId, govToken, price])
}
