import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { tokenStore } from "./store/client";
import Callback from "./components/Callback";
import Dashboard from "./components/Dashboard";
import Settings  from "./components/Settings";
import Customers from "./components/Customers";
import  Balances from "./components/Balances";
import Transactions from "./components/Transactions";
import Fiats from "./components/Fiats";
import PaymentLink from "./components/PaymentLink";

function App() {
    const { token } = tokenStore();
  return (  
    <>
      <Route>
        <Switch>
          {
            !token ? (
              <>
              <Route path="/auth/callback" component={Callback}/>
              <Route path="/" component={Dashboard}/>
              </>
            ) : (
              <Switch>
                <Route path="/dashboard" component={Dashboard}/>
                <Route path="/dashboard/settings" component={Settings}/>
                <Route path="/dashboard/customers" component={Customers}/>
                <Route path="/dashboard/balances" component={Balances}/>
                <Route path="/dashboard/transactions" component={Transactions}/>
                <Route path="/dashboard/fiats" component={Fiats}/>
                <Route path="/dashboard/payment-links" component={PaymentLink}/>
              </Switch>
            )
          }
          <Route path="*"/>
        </Switch>
      </Route>
      <Toaster position="top-right" richColors/>
    </>
  )
}

export default App
