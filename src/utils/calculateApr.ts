import { Price, Fraction, TokenAmount, JSBI } from '@venomswap/sdk'

export default function calculateApr(
  govTokenWethPrice: Price | undefined,
  baseBlockRewards: TokenAmount,
  blocksPerYear: JSBI,
  poolShare: Fraction,
  valueOfTotalStakedAmountInWETH: TokenAmount
): Fraction | undefined {
  return govTokenWethPrice?.raw
    .multiply(baseBlockRewards.raw)
    .multiply(blocksPerYear.toString())
    .multiply(poolShare)
    .divide(valueOfTotalStakedAmountInWETH?.raw)
}
