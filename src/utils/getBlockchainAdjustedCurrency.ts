import { Blockchain, Currency, ETHER, BINANCE_COIN, HARMONY } from '@viperswap/sdk'

export default function getBlockchainAdjustedCurrency(blockchain: Blockchain, currency: Currency): Currency {
  if (currency !== ETHER) return currency
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return BINANCE_COIN
    case Blockchain.HARMONY:
      return HARMONY
    default:
      return ETHER
  }
}
