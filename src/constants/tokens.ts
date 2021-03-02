import { ChainId, Token } from '@viperswap/sdk'
import { ZERO_ONE_ADDRESS } from './index'

export const BUSD: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0xE176EBE47d621b984a73036B9DA5d834411ef734',
    18,
    'BUSD',
    'Binance USD'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x0E80905676226159cC3FF62B1876C907C91F7395',
    18,
    'BUSD',
    'Binance USD'
  )
}
