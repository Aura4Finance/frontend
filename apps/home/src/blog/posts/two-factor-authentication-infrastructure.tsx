import type { BlogPost } from "../types";

const meta: BlogPost = {
  slug: "two-factor-authentication-infrastructure",
  title: "How OraFi Uses Two-Factor Authentication to Protect Every High-Risk Action",
  description:
    "A detailed look at OraFi's TOTP based 2FA infrastructure, from setup and login to per action enforcement on payouts, refunds, and API key management.",
  date: "2026-03-08",
  author: "ORAFI Engineering",
  authorRole: "Security & Platform",
  readingTime: "12 min read",
  tags: [
    "security",
    "2FA",
    "TOTP",
    "authentication",
    "payments",
    "infrastructure",
  ],
  coverLabel: "Security Deep Dive",
  content: Content,
};

export default meta;

function Content() {
  return (
    <article className="prose-custom">
      <h2 className="font-extrabold text-[#1e3a8a]">Why OraFi enforces two factor authentication</h2>

      <p>
        OraFi helps merchants accept and manage crypto payments. Because these actions move
        real money, accounts on the platform are attractive targets for attackers. Protecting
        those accounts means more than strong passwords: we require a second factor that the
        user possesses, so someone who only has a password cannot cause financial harm.
      </p>

      <p>
        OraFi uses time based authenticator apps to produce short lived codes. These codes are
        generated on the user's device and change every 30 seconds. This approach is safer
        than SMS because it cannot be intercepted by phone number takeover and it works when
        the device is offline. The short lifetime of each code also reduces the chance of
        reuse or replay.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">How setup and login are protected</h2>

      <p>
        When a merchant enables two-factor authentication, the system creates a secret key and
        shows a QR code or a manual code for the merchant's authenticator app. The secret is
        kept only temporarily until the merchant proves they can generate a valid code. Once
        the merchant verifies a code, the secret is stored with their account and setup is
        complete. If the merchant does not verify within a short window, the temporary secret
        is discarded so there is no lingering, unverified state.
      </p>

      <p>
        Logging in requires two steps. First, the merchant provides their password. That step
        only confirms the password; it does not create an active session. Second, the merchant
        must present a fresh code from their authenticator app. Only after both steps succeed
        does the system create a session token. This means a stolen password alone cannot be
        used to access an account.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">How high risk actions are gated in live and test modes</h2>

      <p>
        Many platforms check two-factor authentication only at login and then trust the session
        for everything else. OraFi takes a different approach: for every high-risk operation
        that can change funds or credentials, we require a fresh code in real time. That means
        even if an attacker steals an active session, they can view account data but cannot
        move funds, generate API keys, or issue refunds without the merchant's authenticator
        device.
      </p>

      <p>
        In test mode, developers and QA can perform most non-sensitive actions without completing
        the 2FA flow to speed testing. However, even in test mode the system still requires a
        valid two factor code for high risk operations such as payouts, refunds, and API key
        creation. This ensures tests can exercise normal flows while keeping protections where
        they matter most.
      </p>

      <p>
        Requiring a fresh code for sensitive operations protects three key threats. It prevents
        attackers from creating API keys that grant external control, from sending payouts to
        attacker-controlled wallets, and from performing fraudulent refunds. In each case the
        attacker might have a password or a session token, but without the physical device that
        produces valid codes they cannot complete those operations.
      </p>

      <p>
        This design separates what a session lets a user see from what they can do. Sessions
        can remain convenient without opening a large window for abuse, because destructive
        actions always require the second factor. That balance improves user experience while
        keeping strong protections where they are most needed.
      </p>

      <p>
        Behind the scenes, a small set of components make this work: a TOTP library for code
        generation and verification, temporary storage for unverified secrets during setup,
        and a secure place to store the verified secret on the user's account. Codes are sent
        to the server only when needed, and session tokens are kept separate and stored in a
        way that minimizes exposure to client side attacks.
      </p>

      <p>
        Two-factor authentication is effective when it is enforced at the right moments. OraFi
        enforces it both at login and again for every operation that can move money or create
        credentials. This layered approach keeps merchants' funds safer while still allowing a
        straightforward user experience.
      </p>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          <strong>ORAFI</strong> builds APIs for crypto payments, escrow, and settlement. Learn
          more at <a href="https://docs.orafi.app" className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">docs.orafi.app</a>.
        </p>
      </div>
    </article>
  );
}
