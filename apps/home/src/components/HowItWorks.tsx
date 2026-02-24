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
    step: "1",
    icon: RiCodeSSlashLine,
    title: "Create a payment",
    description:
      "Call our API with the amount and currency. We return a payment object and a checkout URL.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    step: "2",
    icon: RiLinkM,
    title: "Redirect to checkout",
    description:
      "Send your customer to the hosted checkout page. We handle wallets, addresses, and UX.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    step: "3",
    icon: RiWallet3Line,
    title: "Customer pays",
    description:
      "They sign with their wallet or transfer directly. We verify the transaction on-chain.",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    step: "4",
    icon: RiCheckboxCircleLine,
    title: "Payment confirmed",
    description:
      "We redirect back to your app and confirm the status. The whole flow takes seconds.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    step: "5",
    icon: RiNotification3Line,
    title: "Get notified",
    description:
      "Receive real-time webhook events for completed, pending, or failed payments.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    step: "6",
    icon: RiExchangeDollarLine,
    title: "Settlement",
    description:
      "Funds settle to your account. You never touch private keys or blockchain logic.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={sectionRef} className="text-center max-w-2xl mx-auto mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold text-[#635bff] mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          >
            Start accepting payments in minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-500 text-lg"
          >
            Six simple steps. No blockchain expertise required.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100"
    >
      {/* Step header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Step {step.step}
        </span>
        <div
          className={`w-10 h-10 rounded-lg ${step.iconBg} flex items-center justify-center`}
        >
          <step.icon className={step.iconColor} size={18} />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{step.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  );
}
