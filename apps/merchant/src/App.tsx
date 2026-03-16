import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "sonner";
import { tokenStore } from "./store/client";
import { getUserProfile } from "./hooks/mutations/useSettings";
import Callback from "./components/Callback";
import Dashboard from "./components/Dashboard";
import Settings  from "./components/Settings";
import Customers from "./components/Customers";
import  Balances from "./components/Balances";
import Transactions from "./components/Transactions";
import Fiats from "./components/Fiats";
import PaymentLink from "./components/PaymentLink";

function App() {
    const [location] = useLocation();
    const { profile } = tokenStore();
    const isAuthCallbackRoute = location === "/auth/callback";
    const { isLoading: isProfileLoading } = getUserProfile(!isAuthCallbackRoute);

  if (isProfileLoading && !profile && !isAuthCallbackRoute) {
    return (
      <>
        <div className="flex h-screen w-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
        </div>
        <Toaster position="top-right" richColors/>
      </>
    );
  }

  return (  
    <>
      <Route>
        <Switch>
          {
            !profile ? (
              <>
              <Route path="/auth/callback" component={Callback}/>
              </>
            ) : (
              <Switch>
                <Route path="/" component={Dashboard}/>
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
