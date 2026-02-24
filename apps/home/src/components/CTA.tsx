import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import WaitlistForm from "./WaitlistForm";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-28">
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-slate-900 px-6 sm:px-12 lg:px-20 py-16 sm:py-20 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Start accepting crypto payments today
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-400 text-lg max-w-xl mx-auto mb-10"
          >
            Integrate OraFi in minutes and accept cryptocurrency from customers
            worldwide. Free to start, 1% per transaction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            <a
              href="https://dashboard.orafi.app"
              className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              Get started
              <RiArrowRightLine className="group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="https://docs.orafi.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              Read the docs
            </a>
          </motion.div>

          {/* Waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <WaitlistForm />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
