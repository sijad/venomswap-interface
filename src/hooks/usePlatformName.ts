import { Blockchain } from '@venomswap/sdk'
import useBlockchain from './useBlockchain'

export default function usePlatformName(): string {
  const blockchain = useBlockchain()
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return 'Cobraswap'
    case Blockchain.HARMONY:
      return 'ViperSwap'
    case Blockchain.ETHEREUM:
      return 'Venomswap'
    default:
      return 'ViperSwap'
  }
}
