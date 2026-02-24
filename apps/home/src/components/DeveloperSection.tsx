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
  const highlighted = code
    .replace(
      /(import|from|const|await|if|switch|case|break|async|new|return)(?=\s|$)/g,
      '<span class="text-violet-400">$1</span>'
    )
    .replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g,
      '<span class="text-emerald-400">$1</span>'
    )
    .replace(
      /(\/\/[^\n]*)/g,
      '<span class="text-slate-500">$1</span>'
    )
    .replace(
      /\b(\d+)\b/g,
      '<span class="text-amber-300">$1</span>'
    );

  return (
    <pre className="p-5 sm:p-6 overflow-x-auto text-[13px] sm:text-sm leading-relaxed font-mono text-slate-300">
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
    <section id="developers" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left - Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="text-sm font-semibold text-[#635bff] mb-3"
            >
              For Developers
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5"
            >
              Designed for developers
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-slate-500 text-lg mb-8 leading-relaxed"
            >
              OraFi sits between your application and the blockchain.
              You never handle private keys — we manage the complexity
              so you can focus on building your product.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-3.5"
            >
              {[
                "A few lines of code to create a payment",
                "Automatic address generation",
                "Real-time webhook events",
                "Comprehensive TypeScript SDK",
                "Test mode for safe development",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#635bff]/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#635bff]" />
                  </div>
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              href="https://docs.orafi.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 text-sm font-semibold text-[#635bff] bg-[#635bff]/[0.06] rounded-lg hover:bg-[#635bff]/[0.1] transition-colors duration-200"
            >
              Read the docs →
            </motion.a>
          </div>

          {/* Right - Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="code-block rounded-xl shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center justify-between bg-slate-800/50 px-4">
                <div className="flex">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-3 text-xs font-medium transition-colors relative ${
                        activeTab === i
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                      {activeTab === i && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#635bff]"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <RiCheckLine size={16} className="text-emerald-400" />
                  ) : (
                    <RiFileCopyLine size={16} />
                  )}
                </button>
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
