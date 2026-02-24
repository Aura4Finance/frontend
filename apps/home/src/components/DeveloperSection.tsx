import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { RiFileCopyLine, RiCheckLine } from "react-icons/ri";

const tabs = [
  {
    label: "Create Payment",
    language: "TypeScript",
    code: `import Orafi from '@orafi/sdk';

const orafi = new Orafi('sk_live_...');

const payment = await orafi.payments.create({
  amount: 5000,
  currency: 'USDC',
  network: 'sui',
  description: 'Premium subscription',
  metadata: {
    orderId: 'order_123',
    customerId: 'cust_456'
  }
});

// Redirect customer to checkout
window.location.href = payment.checkout_url;`,
  },
  {
    label: "Verify Payment",
    language: "TypeScript",
    code: `// Verify payment status after redirect
const payment = await orafi.payments.retrieve(
  'pay_1a2b3c4d5e'
);

if (payment.status === 'completed') {
  // Payment successful!
  console.log('Amount:', payment.amount);
  console.log('Currency:', payment.currency);
  console.log('Tx Hash:', payment.transaction_hash);
  
  // Fulfill the order
  await fulfillOrder(payment.metadata.orderId);
}`,
  },
  {
    label: "Webhook Handler",
    language: "TypeScript",
    code: `// Handle webhook notifications
app.post('/webhooks/orafi', async (req, res) => {
  const event = orafi.webhooks.verify(
    req.body,
    req.headers['orafi-signature'],
    webhookSecret
  );

  switch (event.type) {
    case 'payment.completed':
      await handlePaymentSuccess(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailure(event.data);
      break;
  }

  res.json({ received: true });
});`,
  },
];

function CodeHighlight({ code }: { code: string }) {
  // Simple syntax highlighting
  const highlighted = code
    .replace(
      /(import|from|const|await|if|switch|case|break|async|new|return)(?=\s|$)/g,
      '<span class="text-violet-400">$1</span>'
    )
    .replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      '<span class="text-green-400">$1</span>'
    )
    .replace(
      /(\/\/[^\n]*)/g,
      '<span class="text-gray-600">$1</span>'
    )
    .replace(
      /\b(\d+)\b/g,
      '<span class="text-amber-300">$1</span>'
    );

  return (
    <pre className="p-6 overflow-x-auto text-sm leading-relaxed font-mono">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

export default function DeveloperSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="developers"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4"
            >
              For Developers
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Built for{" "}
              <span className="gradient-text">developers</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-lg mb-8 leading-relaxed"
            >
              OraFi sits between your application and the blockchain networks.
              You never handle private keys or direct blockchain interactions
              — we handle the complexity so you can focus on building.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              {[
                "Three lines to create a payment",
                "Automatic address generation",
                "Real-time webhook events",
                "Comprehensive TypeScript SDK",
                "Test mode for safe development",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              href="https://docs.orafi.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Read the Docs →
            </motion.a>
          </div>

          {/* Right - Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="code-block rounded-2xl overflow-hidden glow-sm">
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-4">
                <div className="flex">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-3 text-xs font-medium transition-colors relative ${
                        activeTab === i
                          ? "text-blue-400"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {tab.label}
                      {activeTab === i && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <RiCheckLine size={16} className="text-green-400" />
                  ) : (
                    <RiFileCopyLine size={16} />
                  )}
                </button>
              </div>

              {/* Language badge */}
              <div className="flex items-center gap-2 px-6 pt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500/60" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {tabs[activeTab].language}
                  </span>
                </div>
              </div>

              {/* Code */}
              <CodeHighlight code={tabs[activeTab].code} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
