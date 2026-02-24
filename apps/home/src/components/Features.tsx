import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  RiCodeSSlashLine,
  RiShieldCheckLine,
  RiFlashlightLine,
  RiCoinLine,
  RiWebhookLine,
  RiTestTubeLine,
} from "react-icons/ri";

const features = [
  {
    icon: RiCodeSSlashLine,
    title: "Simple API",
    description:
      "Clean RESTful API designed for developers. Integrate crypto payments with just a few lines of code.",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: RiCoinLine,
    title: "Multiple Cryptocurrencies",
    description:
      "Accept USDC, USDT, SUI, ETH, BTC and more. Support for various networks out of the box.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: RiWebhookLine,
    title: "Webhook Notifications",
    description:
      "Real-time updates on payment status. Get instant notifications for every payment event.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: RiShieldCheckLine,
    title: "Enterprise Security",
    description:
      "Never handle private keys. OraFi manages all blockchain interactions while you maintain full control.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: RiTestTubeLine,
    title: "Test & Live Modes",
    description:
      "Safe testing environment before going live. Switch between test and production with a single toggle.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: RiFlashlightLine,
    title: "Instant Settlement",
    description:
      "Funds settle according to your configuration. Fast, reliable, and transparent settlement process.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
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
      className="group p-6 sm:p-8 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-lg ${feature.iconBg} flex items-center justify-center mb-5`}
      >
        <feature.icon className={feature.iconColor} size={20} />
      </div>

      {/* Content */}
      <h3 className="text-[15px] font-semibold text-slate-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={ref} className="text-center max-w-2xl mx-auto mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold text-[#2563eb] mb-3"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          >
            Everything you need to accept payments
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-slate-500 text-lg"
          >
            Powerful tools for developers. Simple experience for your customers.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
