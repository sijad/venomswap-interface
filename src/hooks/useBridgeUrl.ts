import useBlockchain from './useBlockchain'
import { Blockchain } from '@venomswap/sdk'

const bridgeMap = {
  [Blockchain.ETHEREUM]: '',
  [Blockchain.HARMONY]: 'https://bridge.harmony.one/',
  [Blockchain.BINANCE_SMART_CHAIN]: 'https://www.binance.org/en/bridge'
}

export default function useDebounce(): string {
  const blockchain = useBlockchain()
  return bridgeMap[blockchain]
}
