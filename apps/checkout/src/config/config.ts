import { UniversalConnector } from '@reown/appkit-universal-connector';
import { suiMainnet, suiTestnet } from './networks/sui';

export async function createUniversalConnector() {
  return UniversalConnector.init({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: 'OraFi Checkout',
      description: 'Checkout System For OraFi',
      url: 'https://orafi.app',
      icons: ['https://orafi.app/icon.png']
    },
    networks: [
      {
        namespace: 'sui',
        chains: [suiMainnet, suiTestnet],
        methods: [
          'sui_signTransactionBlock',
          'sui_signAndExecuteTransactionBlock',
          'sui_signMessage'
        ],
        events: []
      }
    ]
  })
}
