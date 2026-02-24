import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMailLine, RiCheckLine, RiLoader4Line } from "react-icons/ri";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    // Simulate waitlist submission
    // Replace with actual API call when ready
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setMessage("You're on the list! We'll notify you when it's your turn.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-sm text-gray-500 mb-3">
        Join the waitlist for early access
      </p>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <RiCheckLine className="text-green-400" />
            </div>
            <p className="text-sm text-green-300">{message}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <div className="relative flex-1">
              <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-l-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-300"
                disabled={status === "loading"}
              />
            </div>
            <motion.button
              type="submit"
              disabled={status === "loading" || !email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-semibold text-white rounded-r-2xl hover:from-blue-500 hover:to-violet-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {status === "loading" ? (
                <RiLoader4Line className="animate-spin" size={18} />
              ) : (
                "Join Waitlist"
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-2"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
