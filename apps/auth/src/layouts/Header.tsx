import { Link } from 'wouter';
import logo from "@orafi/ui/assets/OraFi.png";
import { BsStars } from 'react-icons/bs';


const Header = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-blue-950">
      <div className='flex justify-center gap-2'>
      <img
          src={logo}
          alt="OraFi Logo"
          className="w-8 h-8 rounded-full object-cover"
        />
      <div className="flex items-center gap-2">
        <span className="text-2xl text-white font-semibold">rafi.app</span>
        <BsStars className="text-white"/>
      </div>
      </div>


      {/* Right: Navigation Link */}
      <nav>
        <Link href="/">
          <a className="text-gray-200 hover:text-white hover:underline text-sm font-medium transition-colors">
            What is Orafi?
          </a>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
