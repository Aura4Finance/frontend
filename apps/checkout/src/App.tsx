import { WalletProvider, AllDefaultWallets } from '@suiet/wallet-kit';
import { Route, Switch } from "wouter";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/Notfound";
import { Toaster } from "sonner";
import '@suiet/wallet-kit/style.css';

function App() {
  return (
    <WalletProvider defaultWallets={AllDefaultWallets}>
      <Switch>
        <Route path="/:txId" component={Checkout} />
        <Route path="*" component={NotFound}/>
      </Switch>
      <Toaster position="top-right" richColors />
    </WalletProvider>
  );
}

export default App;
