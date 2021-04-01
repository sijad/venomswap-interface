import { ChainId, Token } from '@venomswap/sdk'
import { ZERO_ONE_ADDRESS } from './index'

export const BUSD: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    18,
    'BUSD',
    'Binance USD'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
    18,
    'BUSD',
    'Binance USD'
  ),
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

export const HARMONY_BSC_BRIDGED_BUSD: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
    18,
    'bscBUSD',
    'BUSD Token'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(ChainId.HARMONY_TESTNET, ZERO_ONE_ADDRESS, 18, 'BUSD', 'Binance USD')
}

export const BRIDGED_ETH: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, '1ETH', 'Ethereum'),
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Ethereum'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378',
    18,
    'ETH',
    'Ethereum'
  ),
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
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
    18,
    'LINK',
    'ChainLink Token'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
    18,
    'LINK',
    'ChainLink Token'
  ),
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

export const BRIDGED_USDC: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 6, '1USDC', 'USD Coin'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0x985458E523dB3d53125813eD68c274899e9DfAb4',
    6,
    '1USDC',
    'USD Coin'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(ChainId.HARMONY_TESTNET, ZERO_ONE_ADDRESS, 18, '1USDC', 'USD Coin'),
}

export const BRIDGED_ROT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0xFd2a8F8cF7CFFeA4a613F1DFf39b22881D4a1f92',
    18,
    '1ROT',
    'RottenToken'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(ChainId.HARMONY_TESTNET, ZERO_ONE_ADDRESS, 18, '1ROT', 'RottenToken')
}

export const BRIDGED_MAGGOT: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.BSC_MAINNET]: new Token(ChainId.BSC_MAINNET, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.BSC_TESTNET]: new Token(ChainId.BSC_TESTNET, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken'),
  [ChainId.HARMONY_MAINNET]: new Token(
    ChainId.HARMONY_MAINNET,
    '0xBfD4F1699b83eDBa1106B6E224b7aC599A40be1F',
    18,
    '1MAGGOT',
    'MaggotToken'
  ),
  [ChainId.HARMONY_TESTNET]: new Token(ChainId.HARMONY_TESTNET, ZERO_ONE_ADDRESS, 18, '1MAGGOT', 'MaggotToken')
}
