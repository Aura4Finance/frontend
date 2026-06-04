import { Switch, Route } from "wouter";
import PayLink from "./pages/PayLink";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Route for generic payment link with ID */}
        <Route path="/:id" component={PayLink} />
        <Route path="/404" component={NotFound}/>
        <Route component = {NotFound}/>
      </Switch>
      <Toaster position="top-right" richColors/>
    </QueryClientProvider>
  );
}

export default App;
