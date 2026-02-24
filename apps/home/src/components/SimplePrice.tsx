import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function SimplePrice() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold text-[#2563eb] mb-3"
          >
            Simple Pricing
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5"
          >
            Free to start. Pay as you grow.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-500 text-lg mb-12 leading-relaxed"
          >
            No setup fees, no monthly fees, no hidden charges. You only pay when
            you earn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm"
          >
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-6xl sm:text-7xl font-bold text-slate-900">
                1
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                %
              </span>
            </div>
            <p className="text-slate-500 text-base mb-8">
              per successful transaction
            </p>

            <div className="h-px bg-slate-100 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "No setup fees",
                  description:
                    "Start accepting crypto payments in minutes, completely free.",
                },
                {
                  title: "No monthly fees",
                  description:
                    "No subscriptions or recurring charges. Only pay per transaction.",
                },
                {
                  title: "Instant settlement",
                  description:
                    "Funds are settled directly to your wallet with no hold period.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
