import { Link } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
import { Helmet } from "react-helmet-async";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>Cookie Policy | OraFi</title>
        <meta name="description" content="Learn how OraFi uses cookies and similar technologies to enhance your experience." />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-10"
        >
          <RiArrowLeftLine size={16} />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Cookie Policy
        </h1>
        <p className="text-sm text-slate-400 mb-12">
          Last updated: February 24, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They help websites remember your preferences and improve
              your experience. OraFi uses cookies and similar technologies across
              our website and dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Cookies We Use
            </h2>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">
                      Purpose
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      Essential
                    </td>
                    <td className="px-4 py-3">
                      Required for the website and dashboard to function. These
                      handle authentication, session management, and security
                      features like CSRF protection.
                    </td>
                    <td className="px-4 py-3 text-slate-500">Session / 30 days</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      Functional
                    </td>
                    <td className="px-4 py-3">
                      Remember your preferences such as theme settings,
                      dashboard layout, and selected environment (test/live
                      mode).
                    </td>
                    <td className="px-4 py-3 text-slate-500">1 year</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      Analytics
                    </td>
                    <td className="px-4 py-3">
                      Help us understand how visitors use our website so we can
                      improve it. We use privacy-friendly analytics that do not
                      track individuals across sites.
                    </td>
                    <td className="px-4 py-3 text-slate-500">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Third-Party Cookies
            </h2>
            <p>
              We minimize the use of third-party cookies. Where we do use them
              (for example, for analytics), we choose privacy-respecting
              providers. We do not use cookies for advertising or tracking
              across other websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Managing Cookies
            </h2>
            <p>
              Most browsers allow you to control cookies through their settings.
              You can choose to block or delete cookies, but this may affect
              your ability to use certain features of our Services — for
              example, you may need to log in again or lose saved preferences.
            </p>
            <p className="mt-3">
              Common browser cookie settings:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and Security →
                Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy & Security →
                Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and Site Permissions
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. API and Cookies
            </h2>
            <p>
              Our REST API does not use cookies. API authentication is handled
              through API keys passed in request headers. Cookies are only used
              in our web-based dashboard and this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes
              will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Contact Us
            </h2>
            <p>
              If you have questions about our use of cookies, please contact us
              at{" "}
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
