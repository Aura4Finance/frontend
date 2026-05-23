import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { RiFileCopyLine, RiCheckLine } from "react-icons/ri";

const tabs = [
  {
    label: "Create Payment",
    language: "TypeScript",
    code: `// Create a checkout for the customer
const response = await fetch('https://api.orafi.app/transactions/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key'
  },
  body: JSON.stringify({
    amount: 10000,
    currency: 'USD',
    txRef: 'order_12345',
    customerId: 'cust_abc123',
    redirectUrl: 'https://yourapp.com/success',
    network: 'sui'
  })
});

const { checkout_url } = await response.json();
// Redirect customer to checkout
window.location.href = checkout_url;`,
  },
  {
    label: "Verify Payment",
    language: "TypeScript",
    code: `// Verify payment by txRef
const res = await fetch('https://api.orafi.app/transactions/payment/verify?txRef=order_12345', {
  headers: { 'x-api-key': 'your_api_key' }
});

const payment = await res.json();

if (payment.status === 'completed') {
  // Payment successful
  console.log('Amount:', payment.amount);
  console.log('Tx Hash:', payment.transactionHash);
  await fulfillOrder(payment.txRef);
}`,
  },
  {
    label: "Webhook Handler",
    language: "TypeScript",
    code: `// Express webhook handler (ensure raw body is available for signature verification)
app.post('/webhooks/orafi', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), async (req, res) => {
  try {
    const signature = req.headers['x-orafi-signature'];

    // Verify the webhook signature using the raw request body
    if (!verifySignature(req.rawBody, signature, webhookSecret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.type === 'payment.completed') {
      await handlePaymentSuccess(event.data);
    } else if (event.type === 'payment.failed') {
      await handlePaymentFailure(event.data);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).json({ error: 'internal_error' });
  }
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
              className="text-sm font-semibold text-[#2563eb] mb-3"
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
                "Simple REST API — start in minutes",
                "Automatic address generation",
                "Real-time webhook events",
                "TypeScript SDK coming soon",
                "Test mode for safe development",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
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
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 text-sm font-semibold text-[#2563eb] bg-[#2563eb]/[0.06] rounded-lg hover:bg-[#2563eb]/[0.1] transition-colors duration-200"
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb]"
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
