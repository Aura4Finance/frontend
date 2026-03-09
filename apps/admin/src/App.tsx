import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Overview from "./components/Overview";
import Customers from "./components/Customers";
import Transactions from "./components/Transactions";
import Merchants from "./components/Merchants";
import SystemHealth from "./components/SystemHealth";
import Settings from "./components/Settings";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ChangePassword from "./components/auth/ChangePassword";
import ResetPassword from "./components/auth/ResetPassword";

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/change-password" component={ChangePassword} />
        <Route path="/" component={Overview} />
        <Route path="/dashboard" component={Overview} />
        <Route path="/customers" component={Customers} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/merchants" component={Merchants} />
        <Route path="/system-health" component={SystemHealth} />
        <Route path="/settings" component={Settings} />
      </Switch>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
