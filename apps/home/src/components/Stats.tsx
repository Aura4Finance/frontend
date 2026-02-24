import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "99.9%", label: "Uptime SLA", suffix: "" },
  { value: "<2s", label: "Average Confirmation", suffix: "" },
  { value: "5+", label: "Cryptocurrencies", suffix: "" },
  { value: "24/7", label: "Monitoring", suffix: "" },
];

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text mb-2">
        {value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-10 sm:p-16"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <AnimatedCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
