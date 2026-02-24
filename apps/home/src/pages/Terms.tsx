import { Link } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";

export default function Terms() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mb-12">
          Last updated: February 24, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using OraFi's website, API, dashboard, and related
              services (collectively, the "Services"), you agree to be bound by
              these Terms of Service ("Terms"). If you are using the Services on
              behalf of a business, you represent that you have authority to bind
              that business to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Description of Services
            </h2>
            <p>
              OraFi provides a crypto payments infrastructure platform that
              allows businesses to accept cryptocurrency payments from their
              customers. Our Services include a REST API for payment creation
              and management, a hosted checkout experience, webhook
              notifications, a merchant dashboard, and related tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Account Registration
            </h2>
            <p>
              To use our Services, you must create an account and provide
              accurate and complete information. You are responsible for
              maintaining the confidentiality of your API keys and account
              credentials. You must notify us immediately of any unauthorized
              use of your account. We reserve the right to suspend or terminate
              accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Fees and Payments
            </h2>
            <p>
              OraFi is free to use. We charge a fee of{" "}
              <strong>1% per successful transaction</strong> received through
              our platform. There are no setup fees, monthly fees, or hidden
              charges. Transaction fees are automatically deducted from the
              payment amount before settlement to your wallet. We reserve the
              right to update our fee structure with 30 days' prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Acceptable Use
            </h2>
            <p>You agree not to use the Services to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Process payments for illegal goods or services</li>
              <li>Engage in money laundering, terrorist financing, or any other financial crime</li>
              <li>Circumvent or attempt to circumvent our security measures</li>
              <li>Abuse, exploit, or reverse-engineer our API or infrastructure</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Transmit malware, viruses, or other harmful code through our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Settlement and Wallets
            </h2>
            <p>
              Funds from completed transactions are settled to the wallet
              address(es) you configure in your OraFi dashboard. You are solely
              responsible for providing accurate wallet addresses. OraFi is not
              liable for funds sent to incorrect addresses provided by you.
              Settlement times may vary depending on blockchain network
              conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. API Usage
            </h2>
            <p>
              Access to our API is subject to rate limits and usage policies as
              documented at{" "}
              <a
                href="https://docs.orafi.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#635bff] hover:underline"
              >
                docs.orafi.app
              </a>
              . We provide both test and live environments. You must use test
              mode during development and only switch to live mode for
              production transactions. API keys must be kept secure and never
              exposed in client-side code.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Intellectual Property
            </h2>
            <p>
              All content, branding, documentation, and technology comprising
              the Services are owned by OraFi and protected by applicable
              intellectual property laws. You are granted a limited,
              non-exclusive, non-transferable license to use the Services in
              accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, OraFi shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits or revenues, whether incurred
              directly or indirectly. Our total liability for any claim arising
              from or relating to the Services shall not exceed the fees paid by
              you to OraFi in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              10. Disclaimers
            </h2>
            <p>
              The Services are provided "as is" and "as available" without
              warranties of any kind, whether express or implied. OraFi does not
              guarantee uninterrupted access to the Services. Cryptocurrency
              transactions are subject to blockchain network conditions, and
              OraFi is not responsible for delays or failures caused by network
              congestion or other external factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              11. Termination
            </h2>
            <p>
              Either party may terminate the agreement at any time. We may
              suspend or terminate your access to the Services if you breach
              these Terms. Upon termination, your right to use the Services
              ceases immediately, but provisions that by their nature should
              survive termination will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              12. Changes to Terms
            </h2>
            <p>
              We may modify these Terms at any time. Material changes will be
              communicated via email or through the dashboard. Continued use of
              the Services after changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              13. Contact
            </h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@orafi.app"
                className="text-[#635bff] hover:underline"
              >
                legal@orafi.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
