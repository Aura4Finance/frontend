import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from "wouter";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/Notfound";
import { Toaster } from "sonner";
import { networkConfig } from './utils/network';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="live">
        <WalletProvider autoConnect>
          <Switch>
            <Route path="/:txId" component={Checkout} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
          <Toaster position="top-right" richColors />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;