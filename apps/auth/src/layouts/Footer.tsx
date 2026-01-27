import logo from "@orafi/ui/assets/OraFi.png";

const Footer = () => {
  return (
    <footer className="flex items-center justify-center py-4 border-t bg-white">
      <div className="flex items-center gap-2 text-gray-700 text-sm">
        <img
          src={logo}
          alt="OraFi Logo"
          className="w-5 h-5 rounded-full object-cover"
        />
        <span>© {new Date().getFullYear()} OraFi. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
