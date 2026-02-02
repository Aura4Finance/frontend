import { Switch, Route } from "wouter";
import PayLink from "./components/PayLink";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Route for generic payment link with ID */}
        <Route path="/:id" component={PayLink} />
        
        {/* Default route (useful for dev testing without ID) */}
        <Route path="/" component={PayLink} />
      </Switch>
      <Toaster position="top-right" richColors/>
    </QueryClientProvider>
  );
}

export default App;
