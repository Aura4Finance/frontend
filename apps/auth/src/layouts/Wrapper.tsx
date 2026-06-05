import { FaArrowAltCircleLeft } from 'react-icons/fa';
import { Link } from "wouter";
import { Button } from "@orafi/ui";

const Wrapper = ({children}: any) => {
  return (
      <div className="min-h-screen relative overflow-hidden m-4">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-black hover:bg-amber-50"
              size='sm'
              asChild={false}
            >
              <FaArrowAltCircleLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
           {children}
          </div>
        </div>
    </div>
  )
}

export default Wrapper