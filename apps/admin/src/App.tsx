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
import { tokenStore } from "./components/client/client";

const queryClient = new QueryClient();

function App() {
  // MUST be inside component so UI reacts to login/logout
  const { token } = tokenStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>

        {/* Public routes */}
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/change-password" component={ChangePassword} />

        {/* Protected routes */}
        {token && (
          <>
            <Route path="/" component={Overview} />
            <Route path="/dashboard" component={Overview} />
            <Route path="/customers" component={Customers} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/merchants" component={Merchants} />
            <Route path="/system-health" component={SystemHealth} />
            <Route path="/settings" component={Settings} />
          </>
        )}

        {/* If not authenticated → always redirect to login */}
        {!token && (
          <Route>
            <Login />

          </Route>
        )}

      </Switch>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
