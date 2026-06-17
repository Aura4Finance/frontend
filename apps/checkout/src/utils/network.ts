import { createNetworkConfig } from '@mysten/dapp-kit';
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"

export const { networkConfig } = createNetworkConfig({
  live: { 
    network: "mainnet",  
    url: getJsonRpcFullnodeUrl("mainnet")
},
  test: { 
    network: "testnet",
    url: getJsonRpcFullnodeUrl("testnet")
 },
});
