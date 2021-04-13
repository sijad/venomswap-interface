import { ChainId } from '@venomswap/sdk'

// TODO: Update this to use blockchainSettings from @venomswap/sdk
export default function getNetworkSettings(chainId: number, rpcUrls: string[]): Record<string, any> {
  const bscMainnet = {
    chainId: `0x${chainId?.toString(16)}`,
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: rpcUrls,
    blockExplorerUrls: ['https://bscscan.com/']
  }

  switch (chainId) {
    case ChainId.BSC_TESTNET:
      return {
        chainId: `0x${chainId?.toString(16)}`,
        chainName: 'Binance Smart Chain Testnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: rpcUrls,
        blockExplorerUrls: ['https://testnet.bscscan.com/']
      }
    case ChainId.BSC_MAINNET:
      return bscMainnet
    case ChainId.HARMONY_MAINNET:
      return {
        chainId: `0x${chainId?.toString(16)}`,
        chainName: 'Harmony Mainnet',
        nativeCurrency: {
          name: 'ONE',
          symbol: 'ONE',
          decimals: 18
        },
        rpcUrls: rpcUrls,
        blockExplorerUrls: ['https://explorer.harmony.one/#/']
      }
    case ChainId.HARMONY_TESTNET:
      return {
        chainId: `0x${chainId?.toString(16)}`,
        chainName: 'Harmony Testnet',
        nativeCurrency: {
          name: 'ONE',
          symbol: 'ONE',
          decimals: 18
        },
        rpcUrls: rpcUrls,
        blockExplorerUrls: ['https://explorer.testnet.harmony.one/#/']
      }
    default:
      return bscMainnet
  }
}
