import { useMemo } from 'react'
import { Fraction, Token, Price, JSBI } from '@venomswap/sdk'
import { StakingInfo } from '../state/stake/hooks'

export default function useTotalTVL(
  stakingInfos: StakingInfo[],
  weth: Token | undefined,
  wethBusdPrice: Price | undefined,
  govTokenBusdPrice: Price | undefined
): Fraction {
  return useMemo(() => {
    return stakingInfos.reduce<Fraction>((memo, stakingInfo) => {
      if (
        stakingInfo &&
        stakingInfo.valueOfTotalStakedAmountInPairCurrency &&
        weth &&
        wethBusdPrice &&
        govTokenBusdPrice
      ) {
        const total =
          stakingInfo.valueOfTotalStakedAmountInPairCurrency.token === weth
            ? stakingInfo.valueOfTotalStakedAmountInPairCurrency.multiply(wethBusdPrice.raw)
            : stakingInfo.valueOfTotalStakedAmountInPairCurrency.multiply(govTokenBusdPrice.raw)
        if (total) {
          memo = memo.add(total)
        }
      }
      return memo
    }, new Fraction(JSBI.BigInt(0), JSBI.BigInt(1)))
  }, [stakingInfos, weth, wethBusdPrice, govTokenBusdPrice])
}
