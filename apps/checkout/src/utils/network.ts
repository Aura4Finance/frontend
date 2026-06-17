import { createNetworkConfig } from '@mysten/dapp-kit';

export const { networkConfig } = createNetworkConfig({
  live: { 
    network: "mainnet",  
    url: "https://fullnode.mainnet.sui.io:443" 
},
  test: { 
    network: "testnet",
    url: "https://fullnode.testnet.sui.io:443"
 },
});
