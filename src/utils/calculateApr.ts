import { Price, Fraction, TokenAmount, JSBI } from '@venomswap/sdk'

export default function calculateApr(
  govTokenWethPrice: Price | undefined,
  baseBlockRewards: TokenAmount,
  blocksPerYear: JSBI,
  poolShare: Fraction,
  valueOfTotalStakedAmountInWETH: TokenAmount,
  userRatio?: Fraction | undefined 
): Fraction | undefined {
  let multiplications = govTokenWethPrice?.raw
    .multiply(baseBlockRewards.raw)
    .multiply(blocksPerYear.toString())
    .multiply(poolShare)

  if (userRatio) {
    multiplications = multiplications?.multiply(userRatio)
  }

  return multiplications?.divide(valueOfTotalStakedAmountInWETH?.raw)
}
