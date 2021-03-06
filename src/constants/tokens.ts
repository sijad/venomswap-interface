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

export const ONE_ETH: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
    18,
    '1ETH',
    'Ethereum'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x1E120B3b4aF96e7F394ECAF84375b1C661830013',
    18,
    '1ETH',
    'Ethereum'
  )
}

export const LINK: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x218532a12a389a4a92fC0C5Fb22901D1c19198aA',
    18,
    'LINK',
    'ChainLink Token'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(
    ChainId.HARMONY_TESTNET,
    '0x2C6e26B2faD89bc52d043e78E3D980A08af0Ce88',
    18,
    'LINK',
    'ChainLink Token'
  )
}
