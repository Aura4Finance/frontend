import { WalletProvider, AllDefaultWallets } from '@suiet/wallet-kit';
import { Route, Switch } from "wouter";
import Checkout from "./components/Checkout";
import { Toaster } from "sonner";
import '@suiet/wallet-kit/style.css';

function App() {
  return (
    <WalletProvider defaultWallets={AllDefaultWallets}>
      <Switch>
        <Route path="/:txId" component={Checkout} />
      </Switch>
      <Toaster position="top-right" richColors />
    </WalletProvider>
  );
}

export default App;
