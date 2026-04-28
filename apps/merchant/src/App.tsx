import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { tokenStore } from "./store/client";
import { useLoadingStore } from "./store/loading";
import { getUserProfile } from "./hooks/mutations/useSettings";
import Callback from "./components/Callback";
import Dashboard from "./components/Dashboard";
import Settings  from "./components/Settings";
import Customers from "./components/Customers";
import Settlements from "./components/Settlements";
import Onboarding from "./components/Onboarding";
import Transactions from "./components/Transactions";
import Webhook from "./components/Webhook";
import PaymentLink from "./components/PaymentLink";
import logo from "@orafi/ui/assets/OraFi.png";

// Global Progress Bar Component
function GlobalProgressBar() {
  const { isCreatingPaylink, isEditingPaylink } = useLoadingStore();
  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    if (isCreatingPaylink || isEditingPaylink) {
      const timer = setTimeout(() => setShowProgressBar(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowProgressBar(false);
    }
  }, [isCreatingPaylink, isEditingPaylink]);

  if (!showProgressBar) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
      <style>{`
        @keyframes shimmer {
          0%, 100% { width: 60%; opacity: 1; }
          50% { width: 85%; opacity: 0.8; }
        }
      `}</style>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100">
        <div 
          className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 animate-pulse"
          style={{ 
            animation: 'shimmer 2s infinite',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.9)'
          }}
        ></div>
      </div>
    </div>
  );
}

function App() {
    const [location] = useLocation();
    const { profile } = tokenStore();
    const isAuthCallbackRoute = location === "/auth/callback";
    const { isLoading: isProfileLoading } = getUserProfile(!isAuthCallbackRoute);

  if (isProfileLoading && !profile && !isAuthCallbackRoute) {
    return (
      <>
        <div className="flex h-screen w-screen items-center justify-center bg-white">
          <img src={logo} alt="OraFi Logo" className="h-16 w-16 rounded-2xl object-contain animate-pulse" />
        </div>
        <Toaster position="top-right" richColors/>
      </>
    );
  }

  if (!isProfileLoading && !profile && !isAuthCallbackRoute) {
    window.location.href = "https://auth.orafi.app/signin";
    return null;
  }
  return (  
    <>
      <GlobalProgressBar />
      <Route>
        <Switch>
          {
            !profile ? (
              <>
              <Route path="/auth/callback" component={Callback}/>
              </>
            ) : (
              <Switch>
                <Route path="/onboarding" component={Onboarding}/>
                <Route path="/" component={Dashboard}/>
                <Route path="/settings" component={Settings}/>
                <Route path="/customers" component={Customers}/>
                <Route path="/settlements" component={Settlements}/>
                <Route path="/transactions" component={Transactions}/>
                <Route path="/webhook" component={Webhook}/>
                <Route path="/payment-links" component={PaymentLink}/>
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
