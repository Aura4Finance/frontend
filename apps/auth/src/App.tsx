import { Route, Switch } from "wouter";
import Auth from "./components/Auth";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import VerifyEmail from "./components/Verify-email";
import ForgotPassword from "./components/Forgot-password";
import ResetPassword from "./components/Reset-password";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import NotFound from "./components/NotFound";
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
        <Footer />
      </Route>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
