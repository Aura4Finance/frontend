import {
  RiTwitterXLine,
  RiGithubLine,
  RiDiscordLine,
} from "react-icons/ri";

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
    { label: "Quickstart", href: "https://docs.orafi.app/quickstart" },
    { label: "GitHub", href: "https://github.com/orafi" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: RiTwitterXLine, href: "https://x.com/orafi", label: "X (Twitter)" },
  { icon: RiGithubLine, href: "https://github.com/orafi", label: "GitHub" },
  { icon: RiDiscordLine, href: "#", label: "Discord" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">O</span>
              </div>
              <span className="text-lg font-bold text-white">
                Ora<span className="text-blue-400">Fi</span>
              </span>
            </a>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              The Stripe for Web3.
              <br />
              Seamless crypto payments API.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300"
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
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} OraFi. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ for the Web3 community
          </p>
        </div>
      </div>
    </footer>
  );
}
