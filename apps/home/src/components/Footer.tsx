import {
  RiTwitterXLine,
  RiGithubLine,
  RiDiscordLine,
} from "react-icons/ri";
import { Link } from "react-router-dom";
import logo from "@orafi/ui/assets/OraFi.png";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Dashboard", href: "https://dashboard.orafi.app" },
  ],
  Developers: [
    { label: "Documentation", href: "https://docs.orafi.app" },
    { label: "API Reference", href: "https://docs.orafi.app/api-reference/introduction" },
    { label: "Quickstart", href: "https://docs.orafi.app/essentials/quickstart" },
    { label: "GitHub", href: "https://github.com/orafi" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: RiTwitterXLine, href: "https://x.com/ora4finance", label: "X (Twitter)" },
  { icon: RiGithubLine, href: "https://github.com/Aura4Finance", label: "GitHub" },
  { icon: RiDiscordLine, href: "#", label: "Discord" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="OraFi" className="h-10 w-10 rounded-lg object-contain" />
              <span className="text-lg font-bold text-slate-900">
                Ora<span className="text-[#2563eb]">Fi</span>
              </span>
            </a>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Seamless crypto payments
              <br />
              infrastructure for the internet.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} OraFi. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Crypto payments, simplified.
          </p>
        </div>
      </div>
    </footer>
  );
}
