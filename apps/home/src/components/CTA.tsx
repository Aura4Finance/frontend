import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import WaitlistForm from "./WaitlistForm";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-cyan-600/20" />
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Floating orbs */}
          <motion.div
            className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -top-20 -left-20"
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 bg-violet-500/20 rounded-full blur-[80px] -bottom-10 -right-10"
            animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 px-6 sm:px-12 lg:px-20 py-16 sm:py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Ready to accept{" "}
              <span className="gradient-text">crypto payments</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-400 text-lg max-w-xl mx-auto mb-10"
            >
              Join the future of payments. Start integrating OraFi today and
              accept cryptocurrency from customers worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            >
              <motion.a
                href="https://dashboard.orafi.app"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
              >
                Get Started Now
                <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="https://docs.orafi.app"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 text-base font-semibold text-gray-300 border border-white/10 rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300"
              >
                View Documentation
              </motion.a>
            </motion.div>

            {/* Waitlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <WaitlistForm />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
