import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Developers", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-blue-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <div className="absolute inset-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-white">
                Ora<span className="text-blue-400">Fi</span>
              </span>
            </motion.a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://docs.orafi.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                Docs
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://auth.orafi.app"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
              >
                Sign In
              </a>
              <motion.a
                href="https://dashboard.orafi.app"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl hover:from-blue-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Dashboard
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? (
                <RiCloseLine size={24} />
              ) : (
                <RiMenu3Line size={24} />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-950/98 backdrop-blur-xl pt-20 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-lg text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="https://docs.orafi.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-lg text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                Docs
              </a>
              <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-3">
                <a
                  href="https://auth.orafi.app"
                  className="px-4 py-3 text-center text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </a>
                <a
                  href="https://dashboard.orafi.app"
                  className="px-4 py-3 text-center text-white font-semibold bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
