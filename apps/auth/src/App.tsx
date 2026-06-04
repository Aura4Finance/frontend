import { Route, Switch } from "wouter";
import Auth from "./pages/Auth";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/Verify-email";
import ForgotPassword from "./pages/Forgot-password";
import ResetPassword from "./pages/Reset-password";
import Header from "./layouts/Header";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";


function App() {
  return (
    <>
      <Route>
        <Header />
        <Switch>
        <Route path="/" component={Auth} />
        <Route path="/signup" component={Signup} />
        <Route path="/signin" component={Signin} />
        <Route path="/verify" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route>
          <NotFound/>
        </Route>
        </Switch>
      </Route>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
