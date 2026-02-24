import { motion } from "framer-motion";
import { RiArrowRightLine, RiFlashlightLine } from "react-icons/ri";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden radial-hero grid-bg">
      {/* Animated orbs */}
      <motion.div
        className="orb w-[500px] h-[500px] bg-blue-600/20 top-[-10%] left-[-10%]"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb w-[400px] h-[400px] bg-violet-600/15 bottom-[10%] right-[-5%]"
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb w-[300px] h-[300px] bg-cyan-500/10 top-[40%] left-[50%]"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <RiFlashlightLine className="text-blue-400" />
            <span>Now accepting payments on Sui Network</span>
            <RiArrowRightLine className="text-blue-400/60" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-white">The </span>
            <span className="gradient-text">Stripe</span>
            <br />
            <span className="text-white">for Web3</span>
          </motion.h1>

          {/* Sub heading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Accept crypto payments in minutes, not months. OraFi gives you a
            simple, powerful API to integrate blockchain payments into any
            application — no Web3 expertise required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.a
              href="https://dashboard.orafi.app"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Go to Dashboard
              <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
            </motion.a>

            <motion.a
              href="https://auth.orafi.app"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 text-base font-semibold text-gray-300 border border-white/10 rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Create Account
            </motion.a>
          </motion.div>

          {/* Waitlist Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <WaitlistForm />
          </motion.div>

          {/* Hero Visual - Code Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-20 relative"
          >
            <div className="code-block rounded-2xl p-1 glow max-w-3xl mx-auto">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-gray-500 font-mono">
                  create-payment.ts
                </span>
              </div>
              <pre className="p-6 text-left overflow-x-auto">
                <code className="text-sm sm:text-base font-mono leading-relaxed">
                  <span className="text-violet-400">const</span>{" "}
                  <span className="text-blue-300">payment</span>{" "}
                  <span className="text-gray-500">=</span>{" "}
                  <span className="text-violet-400">await</span>{" "}
                  <span className="text-cyan-300">orafi</span>
                  <span className="text-gray-400">.</span>
                  <span className="text-yellow-300">payments</span>
                  <span className="text-gray-400">.</span>
                  <span className="text-green-300">create</span>
                  <span className="text-gray-400">{"({"}</span>
                  {"\n"}
                  {"  "}
                  <span className="text-blue-300">amount</span>
                  <span className="text-gray-400">:</span>{" "}
                  <span className="text-amber-300">5000</span>
                  <span className="text-gray-400">,</span>
                  {"\n"}
                  {"  "}
                  <span className="text-blue-300">currency</span>
                  <span className="text-gray-400">:</span>{" "}
                  <span className="text-green-400">"USDC"</span>
                  <span className="text-gray-400">,</span>
                  {"\n"}
                  {"  "}
                  <span className="text-blue-300">network</span>
                  <span className="text-gray-400">:</span>{" "}
                  <span className="text-green-400">"sui"</span>
                  <span className="text-gray-400">,</span>
                  {"\n"}
                  {"  "}
                  <span className="text-blue-300">description</span>
                  <span className="text-gray-400">:</span>{" "}
                  <span className="text-green-400">
                    "Premium subscription"
                  </span>
                  <span className="text-gray-400">,</span>
                  {"\n"}
                  <span className="text-gray-400">{"})"}</span>
                  <span className="text-gray-500">;</span>
                  {"\n\n"}
                  <span className="text-gray-500">
                    {"// => { id: 'pay_1a2b3c', checkout_url: '...' }"}
                  </span>
                </code>
              </pre>
            </div>

            {/* Gradient blur below code block */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-blue-500/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
