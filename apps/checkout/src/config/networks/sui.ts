import type { CustomCaipNetwork } from '@reown/appkit-common'

export const suiMainnet: CustomCaipNetwork<'sui'> = {
  id: 784,
  chainNamespace: 'sui',
  caipNetworkId: 'sui:mainnet',
  name: 'Sui Mainnet',
  nativeCurrency: {
    name: 'SUI',
    symbol: 'SUI',
    decimals: 9
  },
  rpcUrls: {
    default: {
      http: ['https://fullnode.mainnet.sui.io:443']
    }
  }
}

export const suiTestnet: CustomCaipNetwork<'sui'> = {
  id: 785,
  chainNamespace: 'sui',
  caipNetworkId: 'sui:testnet',
  name: 'Sui Testnet',
  nativeCurrency: {
    name: 'SUI',
    symbol: 'SUI',
    decimals: 9
  },
  rpcUrls: {
    default: {
      http: ['https://fullnode.testnet.sui.io:443']
    }
  }
}