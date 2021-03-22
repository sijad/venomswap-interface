import { Price, Fraction, TokenAmount, JSBI } from '@venomswap/sdk'

export default function calculateApr(
  govTokenWethPrice: Price | undefined,
  baseBlockRewards: TokenAmount,
  blocksPerYear: JSBI,
  poolShare: Fraction,
  valueOfTotalStakedAmountInWETH: TokenAmount
): Fraction | undefined {
  const multiplied = govTokenWethPrice?.raw
    .multiply(baseBlockRewards.raw)
    .multiply(blocksPerYear.toString())
    .multiply(poolShare)

  if (multiplied && valueOfTotalStakedAmountInWETH.greaterThan('0')) {
    return multiplied.divide(valueOfTotalStakedAmountInWETH?.raw)
  }

  //return multiplied
  return new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
}
