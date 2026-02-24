import { motion } from "framer-motion";
import { useInView } from "framer-motion";
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
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: RiCoinLine,
    title: "Multiple Cryptocurrencies",
    description:
      "Accept USDC, USDT, SUI, ETH, BTC and more. Support for various blockchains out of the box.",
    color: "from-violet-500 to-purple-500",
    bgGlow: "bg-violet-500/10",
  },
  {
    icon: RiWebhookLine,
    title: "Webhook Notifications",
    description:
      "Real-time updates on payment status. Get instant notifications for every payment event.",
    color: "from-emerald-500 to-green-500",
    bgGlow: "bg-emerald-500/10",
  },
  {
    icon: RiShieldCheckLine,
    title: "Enterprise Security",
    description:
      "Never handle private keys. OraFi manages blockchain interactions while you maintain full control.",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
  },
  {
    icon: RiTestTubeLine,
    title: "Test & Live Modes",
    description:
      "Safe testing environment before going live. Switch between test and production with a single toggle.",
    color: "from-pink-500 to-rose-500",
    bgGlow: "bg-pink-500/10",
  },
  {
    icon: RiFlashlightLine,
    title: "Instant Settlement",
    description:
      "Funds settle according to your configuration. Fast, reliable, and transparent settlement process.",
    color: "from-cyan-500 to-teal-500",
    bgGlow: "bg-cyan-500/10",
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 card-shine"
    >
      {/* Icon */}
      <div
        className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
      >
        <feature.icon className="text-white" size={22} />
        <div
          className={`absolute inset-0 rounded-xl ${feature.bgGlow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {feature.description}
      </p>

      {/* Hover glow */}
      <div
        className={`absolute -inset-px rounded-2xl ${feature.bgGlow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`}
      />
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={ref} className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4"
          >
            Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Everything you need to{" "}
            <span className="gradient-text">accept crypto</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Powerful tools for developers. Simple experience for your customers.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
