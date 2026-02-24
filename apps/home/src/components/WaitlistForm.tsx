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
      <p className="text-sm text-slate-400 mb-3">
        Join the waitlist for early access
      </p>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-lg bg-emerald-50 border border-emerald-200"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <RiCheckLine className="text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-700">{message}</p>
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
              <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-l-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all duration-200"
                disabled={status === "loading"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="px-5 py-3 bg-[#2563eb] text-sm font-semibold text-white rounded-r-lg hover:bg-[#1d4ed8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {status === "loading" ? (
                <RiLoader4Line className="animate-spin" size={18} />
              ) : (
                "Join Waitlist"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-2"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
