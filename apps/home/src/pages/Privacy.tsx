import { Link } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-10"
        >
          <RiArrowLeftLine size={16} />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mb-12">
          Last updated: February 24, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Introduction
            </h2>
            <p>
              OraFi ("we", "our", or "us") operates a crypto payments
              infrastructure platform that enables businesses to accept
              cryptocurrency payments through a simple REST API. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our website, API, dashboard, and related
              services (collectively, the "Services").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Information We Collect
            </h2>
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              Account Information
            </h3>
            <p>
              When you create an OraFi account, we collect your name, email
              address, business name, and wallet address(es) you provide for
              settlement purposes.
            </p>

            <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">
              Transaction Data
            </h3>
            <p>
              We process transaction-related data including payment amounts,
              cryptocurrency types, blockchain transaction hashes, customer
              information you submit via the API (such as customer name and
              email), and transaction reference identifiers.
            </p>

            <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">
              Usage Data
            </h3>
            <p>
              We automatically collect information about how you interact with
              our Services, including IP addresses, browser type, pages visited,
              API call logs, and timestamps.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide, operate, and maintain our crypto payments infrastructure</li>
              <li>To process transactions and settle funds to your designated wallet(s)</li>
              <li>To send webhook notifications and transaction status updates</li>
              <li>To detect and prevent fraud, unauthorized access, and other security issues</li>
              <li>To comply with legal obligations and respond to lawful requests</li>
              <li>To communicate with you about your account, including service updates and support</li>
              <li>To improve and develop new features for our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Blockchain networks:</strong> Transaction data is
                inherently recorded on public blockchains as part of processing
                payments.
              </li>
              <li>
                <strong>Service providers:</strong> Trusted third parties that
                help us operate our infrastructure (e.g., hosting, analytics,
                monitoring).
              </li>
              <li>
                <strong>Legal authorities:</strong> When required by law, legal
                process, or to protect our rights and the safety of our users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including
              encryption at rest and in transit, API key authentication,
              webhook signature verification, and regular security audits. Your
              API keys are stored securely and should never be shared publicly.
              We do not store private keys — all blockchain interactions are
              managed through our secure infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your account information for as long as your account is
              active. Transaction records are retained as required by applicable
              financial regulations. You may request deletion of your account
              data by contacting us, subject to our legal obligations to retain
              certain records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have the right to access,
              correct, delete, or export your personal data. You may also object
              to or restrict certain processing. To exercise any of these
              rights, please contact us at{" "}
              <a
                href="mailto:privacy@orafi.app"
                className="text-[#2563eb] hover:underline"
              >
                privacy@orafi.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the updated policy
              on our website and updating the "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@orafi.app"
                className="text-[#2563eb] hover:underline"
              >
                privacy@orafi.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
