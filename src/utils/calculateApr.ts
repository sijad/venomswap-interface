import { Price, Fraction, TokenAmount, JSBI } from '@venomswap/sdk'

export default function calculateApr(
  govTokenWethPrice: Price | undefined,
  baseBlockRewards: TokenAmount,
  blocksPerYear: JSBI,
  poolShare: Fraction,
  valueOfTotalStakedAmountInPairCurrency: TokenAmount
): Fraction | undefined {
  const multiplied = govTokenWethPrice?.raw
    .multiply(baseBlockRewards.raw)
    .multiply(blocksPerYear.toString())
    .multiply(poolShare)

  if (multiplied && valueOfTotalStakedAmountInPairCurrency.greaterThan('0')) {
    return multiplied.divide(valueOfTotalStakedAmountInPairCurrency?.raw)
  }

  //return multiplied
  return new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
}
