import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@orafi/ui/card";
import logo from "@orafi/ui/assets/OraFi.png";
import { Button } from "@orafi/ui/button";
import { Link } from "wouter";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        <img
          src={logo}
          alt="Design"
          className="w-48 h-48 mt-8 rounded-full object-cover "
        />
        <Card className="w-full shadow-xl border-b-gray-950 p-4">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold text-gray-900">
              OraFi Finance
            </CardTitle>
            <CardDescription className="text-base text-gray-800 font-semibold">
              Receive seamless crypto payments from on-chain networks.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Link href="/signup">
              <Button
                variant="default"
                asChild={false}
                className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 mb-2"
                size="lg"
              >
                Create Account
              </Button>
            </Link>

            <Link href="/signin">
              <Button
                variant="outline"
                asChild={false}
                className="w-full font-semibold px-6 py-3 rounded-lg hover:opacity-90"
                size="lg"
              >
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
