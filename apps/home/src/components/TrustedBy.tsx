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
    <section className="py-12 sm:py-16 border-t border-slate-100">
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-8 font-medium">
            Supporting leading cryptocurrencies
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="flex items-center gap-2.5 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <span className="text-xl">{logo.icon}</span>
                <span className="text-sm font-medium">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
