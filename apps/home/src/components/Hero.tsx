import { motion } from "framer-motion";
import { RiArrowRightLine } from "react-icons/ri";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Subtle top gradient like Stripe */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-50 to-white -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635bff]/[0.08] text-[#635bff] text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#635bff]" />
            Free to start · 1% per transaction
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Payments infrastructure
            <br />
            <span className="text-[#635bff]">for crypto</span>
          </motion.h1>

          {/* Sub heading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            OraFi is the easiest way to accept crypto payments. A simple API,
            beautiful checkout, and real-time webhooks — so you can focus on
            your product, not the blockchain.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <a
              href="https://dashboard.orafi.app"
              className="group px-7 py-3.5 text-[15px] font-semibold text-white bg-[#635bff] rounded-lg hover:bg-[#5851db] transition-colors duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start now
              <RiArrowRightLine className="group-hover:translate-x-0.5 transition-transform duration-200" size={16} />
            </a>

            <a
              href="https://auth.orafi.app"
              className="px-7 py-3.5 text-[15px] font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto text-center"
            >
              Create account
            </a>
          </motion.div>

          {/* Waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <WaitlistForm />
          </motion.div>

          {/* Code Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-16 sm:mt-20"
          >
            <div className="code-block rounded-xl shadow-2xl shadow-slate-900/10 max-w-2xl mx-auto overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50">
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <span className="ml-3 text-xs text-slate-500 font-mono">
                  create-payment.ts
                </span>
              </div>
              <pre className="p-5 sm:p-6 text-left overflow-x-auto">
                <code className="text-[13px] sm:text-sm font-mono leading-relaxed">
                  <span className="text-violet-400">const</span>{" "}
                  <span className="text-sky-300">response</span>{" "}
                  <span className="text-slate-500">=</span>{" "}
                  <span className="text-violet-400">await</span>{" "}
                  <span className="text-emerald-400">fetch</span>
                  <span className="text-slate-500">(</span>
                  {"\n"}
                  {"  "}
                  <span className="text-emerald-400">'https://api.orafi.app/transactions/payment/create'</span>
                  <span className="text-slate-500">,</span>{" "}
                  <span className="text-slate-500">{"{ "}</span>
                  {"\n"}
                  {"    "}
                  <span className="text-sky-300">method</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-emerald-400">'POST'</span>
                  <span className="text-slate-500">,</span>
                  {"\n"}
                  {"    "}
                  <span className="text-sky-300">headers</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-slate-500">{"{ "}</span>
                  <span className="text-emerald-400">'x-api-key'</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-emerald-400">API_KEY</span>
                  <span className="text-slate-500">{" },"}</span>
                  {"\n"}
                  {"    "}
                  <span className="text-sky-300">body</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-sky-300">JSON</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-emerald-400">stringify</span>
                  <span className="text-slate-500">(</span>
                  <span className="text-slate-500">{"{ "}</span>
                  {"\n"}
                  {"      "}
                  <span className="text-sky-300">amount</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-amber-300">10000</span>
                  <span className="text-slate-500">,</span>
                  {"\n"}
                  {"      "}
                  <span className="text-sky-300">type</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-emerald-400">'HOSTED_CHECKOUT'</span>
                  <span className="text-slate-500">,</span>
                  {"\n"}
                  {"      "}
                  <span className="text-sky-300">txRef</span>
                  <span className="text-slate-500">:</span>{" "}
                  <span className="text-emerald-400">'order_12345'</span>
                  {"\n"}
                  {"    "}
                  <span className="text-slate-500">{"})"}</span>
                  {"\n"}
                  <span className="text-slate-500">{"})"}</span>
                  <span className="text-slate-600">;</span>
                  {"\n\n"}
                  <span className="text-slate-600">
                    {"// => { checkout_url: 'https://checkout.orafi.app/...' }"}
                  </span>
                </code>
              </pre>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              REST API available now · SDK coming soon
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
