import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  RiCodeSSlashLine,
  RiLinkM,
  RiWallet3Line,
  RiCheckboxCircleLine,
  RiExchangeDollarLine,
  RiNotification3Line,
} from "react-icons/ri";

const steps = [
  {
    step: "01",
    icon: RiCodeSSlashLine,
    title: "Create Payment",
    description:
      "Your application creates a payment request via OraFi's simple REST API with amount, currency, and network.",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
  },
  {
    step: "02",
    icon: RiLinkM,
    title: "Get Checkout URL",
    description:
      "OraFi generates a unique deposit address, wallet details, and a secure checkout URL for the customer.",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/10",
  },
  {
    step: "03",
    icon: RiWallet3Line,
    title: "Customer Pays",
    description:
      "Customer visits the checkout URL and signs the transaction with their wallet or transfers crypto directly.",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
  },
  {
    step: "04",
    icon: RiCheckboxCircleLine,
    title: "Verify Transaction",
    description:
      "Checkout redirects back to your application. Verify transaction status via the API.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
  },
  {
    step: "05",
    icon: RiNotification3Line,
    title: "Webhook Updates",
    description:
      "Receive real-time webhook notifications about payment status changes — confirmed, completed, or failed.",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
  },
  {
    step: "06",
    icon: RiExchangeDollarLine,
    title: "Settlement",
    description:
      "Funds are settled according to your configuration. You never handle private keys or blockchain interactions.",
    color: "text-pink-400",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-500/10",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={sectionRef} className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4"
          >
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            From zero to{" "}
            <span className="gradient-text">crypto payments</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Six simple steps to start accepting cryptocurrency in your
            application.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.step} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border ${step.borderColor} hover:bg-white/[0.04] transition-all duration-500`}
    >
      {/* Step Number */}
      <div className="flex items-center justify-between mb-6">
        <span className={`text-5xl font-black ${step.color} opacity-20`}>
          {step.step}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center`}
        >
          <step.icon className={step.color} size={20} />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {step.description}
      </p>

      {/* Connector line (hidden on last in each row) */}
      {index % 3 !== 2 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-white/10" />
      )}
    </motion.div>
  );
}
