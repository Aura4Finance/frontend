import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { RiCheckLine } from "react-icons/ri";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for testing and small projects",
    features: [
      "Up to 100 transactions/month",
      "Test & Live modes",
      "Email support",
      "Basic webhooks",
      "1 API key",
    ],
    cta: "Get Started",
    href: "https://auth.orafi.app",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "For growing businesses and teams",
    features: [
      "Up to 10,000 transactions/month",
      "All Starter features",
      "Priority support",
      "Advanced webhooks",
      "Multiple API keys",
      "Custom checkout branding",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    href: "https://auth.orafi.app",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations",
    features: [
      "Unlimited transactions",
      "All Growth features",
      "Dedicated support",
      "Custom SLA",
      "On-premise option",
      "Custom integrations",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    href: "https://auth.orafi.app",
    highlighted: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={ref} className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4"
          >
            Pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Simple,{" "}
            <span className="gradient-text">transparent pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Start free, scale as you grow. No hidden fees.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative p-6 sm:p-8 rounded-2xl transition-all duration-500 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-blue-500/10 to-violet-500/5 border-2 border-blue-500/30 glow"
                  : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <RiCheckLine
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-blue-400" : "text-gray-500"
                      }`}
                      size={16}
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href={plan.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block text-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
