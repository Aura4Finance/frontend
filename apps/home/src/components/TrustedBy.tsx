import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const logos = [
  { name: "Sui", icon: "◆" },
  { name: "USDC", icon: "$" },
  { name: "USDT", icon: "₮" },
  { name: "Ethereum", icon: "Ξ" },
  { name: "Bitcoin", icon: "₿" },
];

export default function TrustedBy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="relative py-16 overflow-hidden">
      <div
        ref={ref}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-8">
            Supporting leading cryptocurrencies
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors duration-300"
              >
                <span className="text-2xl">{logo.icon}</span>
                <span className="text-sm font-medium">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
