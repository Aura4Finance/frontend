import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Overview from "./components/Overview";
import Customers from "./components/Customers";
import TransactionsNew from "./components/TransactionsNew";
import Merchants from "./components/Merchants";
import SystemHealth from "./components/SystemHealth";
import Settings from "./components/Settings";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ChangePassword from "./components/auth/ChangePassword";
import { tokenStore } from "./components/client/client";

const queryClient = new QueryClient();

function App() {
  // MUST be inside component so UI reacts to login/logout
  const { token } = tokenStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>

        {/* Public route */}
        <Route path="/login" component={Login} />

        {/* Protected routes */}
        {token && (
          <>
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/change-password" component={ChangePassword} />
            <Route path="/" component={Overview} />
            <Route path="/dashboard" component={Overview} />
            <Route path="/customers" component={Customers} />
            <Route path="/transactions" component={TransactionsNew} />
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
