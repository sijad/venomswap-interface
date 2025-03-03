import { ChainId, Token, WETH } from '@venomswap/sdk'
import { GOVERNANCE_TOKEN } from './'
import { BUSD, HARMONY_BSC_BRIDGED_BUSD, BRIDGED_ETH } from './tokens'

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    pid: number
  }[]
} = {
  [ChainId.HARMONY_MAINNET]: [
    {
      tokens: [WETH[ChainId.HARMONY_MAINNET], BUSD[ChainId.HARMONY_MAINNET]],
      pid: 0
    },
    {
      tokens: [WETH[ChainId.HARMONY_MAINNET], GOVERNANCE_TOKEN[ChainId.HARMONY_MAINNET]],
      pid: 1
    },
    {
      tokens: [WETH[ChainId.HARMONY_MAINNET], BRIDGED_ETH[ChainId.HARMONY_MAINNET]],
      pid: 2
    },
    {
      tokens: [BUSD[ChainId.HARMONY_MAINNET], GOVERNANCE_TOKEN[ChainId.HARMONY_MAINNET]],
      pid: 3
    },
    {
      tokens: [BUSD[ChainId.HARMONY_MAINNET], HARMONY_BSC_BRIDGED_BUSD[ChainId.HARMONY_MAINNET]],
      pid: 4
    }
  ],
  [ChainId.HARMONY_TESTNET]: [
    {
      tokens: [WETH[ChainId.HARMONY_TESTNET], BUSD[ChainId.HARMONY_TESTNET]],
      pid: 0
    },
    {
      tokens: [WETH[ChainId.HARMONY_TESTNET], GOVERNANCE_TOKEN[ChainId.HARMONY_TESTNET]],
      pid: 1
    },
    {
      tokens: [WETH[ChainId.HARMONY_TESTNET], BRIDGED_ETH[ChainId.HARMONY_TESTNET]],
      pid: 2
    },
    {
      tokens: [BUSD[ChainId.HARMONY_TESTNET], GOVERNANCE_TOKEN[ChainId.HARMONY_TESTNET]],
      pid: 3
    }
  ],
  [ChainId.BSC_TESTNET]: [
    {
      tokens: [WETH[ChainId.BSC_TESTNET], BUSD[ChainId.BSC_TESTNET]],
      pid: 0
    },
    {
      tokens: [WETH[ChainId.BSC_TESTNET], GOVERNANCE_TOKEN[ChainId.BSC_TESTNET]],
      pid: 1
    }
    /*{
      tokens: [LINK[ChainId.HARMONY_TESTNET], BUSD[ChainId.HARMONY_TESTNET]],
      pid: 2
    }*/
  ]
}
