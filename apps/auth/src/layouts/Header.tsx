import { Link } from "wouter";
import logo from "@orafi/ui/assets/OraFi.png";
import { BsStars } from "react-icons/bs";

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-b border-blue-800/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={logo}
              alt="OraFi Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-md"
            />
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 shadow">
              <BsStars className="text-white w-3 h-3" />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm tracking-wide">
              OraFi Auth
            </span>
            <span className="text-blue-300 text-xs">
              Secure Access Portal
            </span>
          </div>
        </div>

        {/* Right: Navigation */}
        <nav>
          <Link href="/">
            <a className="text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200">
              What is OraFi?
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
