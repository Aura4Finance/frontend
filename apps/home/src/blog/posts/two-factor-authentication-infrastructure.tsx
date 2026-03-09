import type { BlogPost } from "../types";
import {
  SectionHeader,
  CodeBlock,
  Mermaid,
  Callout,
  IC,
} from "../components";

const meta: BlogPost = {
  slug: "two-factor-authentication-infrastructure",
  title: "How OraFi Uses Two-Factor Authentication to Protect Every High-Risk Action",
  description:
    "A detailed look at OraFi's TOTP-based 2FA infrastructure — from setup and login to per-action enforcement on payouts, refunds, and API key management.",
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
      {/* ── 1. Introduction ── */}
      <SectionHeader number={1} title="Introduction" />

      <p>
        OraFi is crypto payment infrastructure. Merchants use it to accept crypto payments,
        manage payouts to external wallets, issue refunds, and generate shareable payment links.
        Every one of those operations touches real funds, and the accounts that control them are
        high-value targets.
      </p>
      <p>
        A compromised merchant account is not an inconvenience — it is a direct path to financial
        loss. An attacker with session access could initiate payouts to their own address, drain
        balances through fraudulent refunds, or generate API keys that grant silent, long-lived
        programmatic control over the account.
      </p>
      <p>
        Passwords alone are not sufficient defense. They can be phished, reused from breached
        databases, or intercepted through man-in-the-middle attacks. Two-Factor Authentication
        (2FA) adds a second layer: something the merchant <em>has</em> (a physical authenticator
        device) in addition to something they <em>know</em> (their password). But the way 2FA is
        implemented matters far more than whether it exists at all.
      </p>
      <p>
        Most platforms verify 2FA once at login and then trust the session for everything that
        follows. OraFi does not. It re-verifies 2FA for <strong>every individual high-risk
        write operation</strong> — every payout, every refund, every API key creation. This
        post explains exactly how that works, and why it matters.
      </p>

      {/* ── 2. Why TOTP, Not SMS ── */}
      <SectionHeader number={2} title="Why TOTP, Not SMS" />

      <p>
        OraFi's 2FA system is built on the <strong>Time-Based One-Time Password (TOTP)</strong>{" "}
        standard — the same protocol behind Google Authenticator, Authy, and similar apps. It is
        deliberately not SMS-based. The reasons are straightforward:
      </p>
      <ul>
        <li>
          <strong>SIM-swap resistance.</strong> SMS codes can be intercepted by an attacker who
          convinces a carrier to port the victim's phone number. TOTP codes are generated on the
          device itself and never transit a network.
        </li>
        <li>
          <strong>Offline operation.</strong> TOTP works without cellular service or internet
          connectivity on the authenticator device. The codes are derived from a shared secret and
          the current time — no server round-trip is needed to generate them.
        </li>
        <li>
          <strong>Automatic rotation.</strong> TOTP codes expire every 30 seconds. A code observed
          over someone's shoulder is useless within a minute. There is no window where a static
          code sits in an SMS inbox waiting to be exploited.
        </li>
      </ul>

      <Callout type="info">
        TOTP is defined in RFC 6238. It computes a one-time password by applying an HMAC-based
        algorithm to a shared secret and the current Unix timestamp divided by a 30-second
        interval. The result is truncated to a 6-digit code.
      </Callout>

      {/* ── 3. Setting Up 2FA ── */}
      <SectionHeader number={3} title="Setting Up 2FA" />

      <p>
        During onboarding, a merchant triggers 2FA setup from their dashboard. The setup process
        is designed to be atomic — it either completes fully or leaves zero state behind.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 1: Secret generation</h3>
      <p>
        When the merchant initiates setup, OraFi generates a 20-character TOTP secret tied to
        their account using the <IC>speakeasy</IC> library. This secret is the shared key that
        both OraFi and the merchant's authenticator app will use to generate matching codes.
      </p>
      <p>
        Critically, the secret is <strong>not immediately saved to the database</strong>. Instead,
        it is stored temporarily in Redis with a strict <strong>5-minute time-to-live (TTL)</strong>.
        If the merchant does not complete verification within 5 minutes, the secret expires
        automatically and they must start over. This prevents unverified, stale secrets from ever
        reaching the permanent database.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 2: QR code or manual entry</h3>
      <p>
        The merchant receives two things from the setup response:
      </p>
      <ul>
        <li>
          An <IC>otpauth_url</IC> — a standardized URI that can be rendered as a QR code and
          scanned directly by any TOTP-compatible authenticator app.
        </li>
        <li>
          A <IC>manualCode</IC> — a base32-encoded string of the secret that can be typed into the
          authenticator app manually if QR scanning is not available.
        </li>
      </ul>
      <p>
        Once the merchant scans the QR code or enters the manual code, their authenticator app
        begins generating 6-digit TOTP codes that rotate every 30 seconds.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 3: Verification</h3>
      <p>
        The merchant submits one of these 6-digit codes back to OraFi. OraFi verifies the code
        against the Redis-stored secret using TOTP verification with a <strong>tolerance window
        of 1</strong>. This means OraFi accepts the current 30-second code plus the immediately
        preceding and following codes — a 90-second total window that accommodates minor clock
        drift between the merchant's device and the server.
      </p>
      <p>
        If the code is valid, OraFi persists the secret to PostgreSQL — setting{" "}
        <IC>twoFactorEnabled</IC> to <IC>true</IC> and storing the <IC>twoFactorSecret</IC> on
        the User record via Prisma ORM — then deletes it from Redis. Setup is complete.
      </p>

      <Mermaid
        chart={`
sequenceDiagram
  participant Merchant as Merchant Dashboard
  participant API as OraFi API
  participant Redis as Redis (TTL: 5 min)
  participant DB as PostgreSQL

  Merchant->>API: Initiate 2FA setup
  API->>API: Generate TOTP secret (speakeasy)
  API->>Redis: Store secret (5-min TTL)
  API-->>Merchant: otpauth_url + manualCode

  Note over Merchant: Scan QR code in authenticator app

  Merchant->>API: Submit 6-digit TOTP code
  API->>Redis: Retrieve temporary secret
  API->>API: Verify TOTP (window = 1)

  alt Code valid
    API->>DB: Save twoFactorSecret + set twoFactorEnabled = true
    API->>Redis: Delete temporary secret
    API-->>Merchant: 2FA setup complete
  else Code invalid or expired
    API-->>Merchant: Verification failed — restart setup
  end
        `}
        caption="Figure 1 — 2FA setup flow: secret generation → temporary storage → verification → persistence"
      />

      <Callout type="warning">
        The 5-minute Redis TTL is a deliberate security choice. If a merchant starts 2FA setup
        but gets distracted or abandons the process, the unverified secret vanishes automatically.
        There is no cleanup job, no dangling state, and no half-configured security posture. The
        system either completes setup atomically or rolls back cleanly.
      </Callout>

      {/* ── 4. Two-Factor Login ── */}
      <SectionHeader number={4} title="Two-Factor Login" />

      <p>
        OraFi's login flow is deliberately a <strong>multi-step process</strong>. A correct password
        alone never results in account access.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 1: Password verification</h3>
      <p>
        When a merchant submits their email and password, OraFi validates the credentials. But it
        does <strong>not</strong> issue an access token. The response contains only a confirmation
        message — <em>"User signed in successfully. Verify 2FA to continue"</em> — along with the
        merchant's user ID. No session is created. No cookie is set. The merchant is authenticated
        but not authorized.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 2: TOTP verification</h3>
      <p>
        The merchant must then provide a fresh 6-digit TOTP code from their authenticator app
        alongside their user ID in a second request. OraFi verifies the code against the
        permanent <IC>twoFactorSecret</IC> stored in PostgreSQL.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Step 3: Token exchange</h3>
      <p>
        Only on successful TOTP verification does OraFi generate a one-time authorization code —
        a SHA-256 hash of 32 cryptographically random bytes. This code is then exchanged for a
        JWT access token in a final step. The access token is stored in an HTTP-only cookie and
        supports Redis-backed blacklisting for sign-out.
      </p>

      <Mermaid
        chart={`
sequenceDiagram
  participant Merchant as Merchant
  participant API as OraFi API
  participant DB as PostgreSQL
  participant Redis as Redis

  Merchant->>API: POST /login (email + password)
  API->>DB: Validate credentials
  API-->>Merchant: 200 — "Verify 2FA to continue" + userId

  Note over Merchant: No token issued yet

  Merchant->>API: POST /verify-2fa (userId + TOTP code)
  API->>DB: Fetch twoFactorSecret
  API->>API: Verify TOTP code
  API->>API: Generate authorization code (SHA-256 of 32 random bytes)
  API-->>Merchant: Authorization code

  Merchant->>API: POST /exchange-token (authorization code)
  API->>API: Generate JWT access token
  API-->>Merchant: Set HTTP-only cookie with JWT

  Note over Merchant: Session established — dashboard accessible
        `}
        caption="Figure 2 — Multi-step login flow: password → 2FA → authorization code → JWT"
      />

      <p>
        The critical point: <strong>there is no way to obtain an access token without completing
        the 2FA step</strong>. A stolen password alone is useless. An attacker who phishes or
        brute-forces a merchant's password is stopped at the second step unless they also have
        physical access to the merchant's authenticator device.
      </p>

      {/* ── 5. Per-Action 2FA Enforcement ── */}
      <SectionHeader number={5} title="Per-Action 2FA Enforcement" />

      <p>
        This is OraFi's core security differentiator. After login, most platforms trust the session
        token for all subsequent operations. OraFi does not. Every individual high-risk write
        operation requires a fresh TOTP code, verified in real time.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">The middleware</h3>
      <p>
        OraFi uses a dedicated Express middleware called <IC>verifyActionUsing2FA</IC> that is
        mounted on specific route groups in the API. This middleware is applied to two critical
        route groups:
      </p>
      <ul>
        <li>
          <IC>/transactions</IC> routes — covering payouts and refunds.
        </li>
        <li>
          <IC>/api-keys</IC> routes — covering API key creation and regeneration.
        </li>
      </ul>
      <p>
        The middleware <strong>only activates on POST requests</strong>. Read-only operations —
        viewing transaction history, checking balances, browsing the dashboard — pass through
        without any additional prompt. Only write operations that move funds or create credentials
        are gated.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Verification flow</h3>
      <p>
        For every protected POST request, the merchant must include a <IC>2-fa-key</IC> HTTP header
        containing a fresh 6-digit TOTP code from their authenticator app. The middleware performs
        three sequential checks:
      </p>

      <Mermaid
        chart={`
flowchart TD
  Request["Incoming POST Request"]
  CheckHeader{"Is 2-fa-key<br/>header present?"}
  CheckEnabled{"Does user have 2FA<br/>enabled with stored secret?"}
  CheckCode{"Does TOTP code<br/>verify against secret?"}
  Reject400["❌ Reject (400)"]
  Proceed["✅ Proceed to<br/>business logic"]

  Request --> CheckHeader
  CheckHeader -->|"No"| Reject400
  CheckHeader -->|"Yes"| CheckEnabled
  CheckEnabled -->|"No"| Reject400
  CheckEnabled -->|"Yes"| CheckCode
  CheckCode -->|"No"| Reject400
  CheckCode -->|"Yes"| Proceed
        `}
        caption="Figure 3 — Per-action 2FA middleware verification chain"
      />

      <ol>
        <li>
          <strong>Header presence.</strong> Is the <IC>2-fa-key</IC> header present at all? If not,
          the request is rejected immediately with a 400-level error.
        </li>
        <li>
          <strong>2FA status.</strong> Does the authenticated user have 2FA enabled with a stored
          secret? If not — meaning they somehow bypassed onboarding — the request is rejected.
        </li>
        <li>
          <strong>Code validity.</strong> Does the submitted TOTP code verify against the user's
          stored <IC>twoFactorSecret</IC>? If not, the request is rejected.
        </li>
      </ol>
      <p>
        Only when all three checks pass does the request proceed to the actual route handler and
        its business logic.
      </p>

      <CodeBlock language="typescript" filename="verify-action-2fa.ts">
{`import { Request, Response, NextFunction } from "express";
import speakeasy from "speakeasy";
import { prisma } from "../lib/prisma";

/**
 * Express middleware that enforces per-action TOTP verification
 * on POST requests to protected route groups.
 *
 * Mounted on:
 *   - /transactions (payouts, refunds)
 *   - /api-keys     (creation, regeneration)
 *
 * Expects a fresh 6-digit TOTP code in the "2-fa-key" HTTP header.
 */
export async function verifyActionUsing2FA(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Only gate write operations
  if (req.method !== "POST") return next();

  // 1. Check header presence
  const code = req.headers["2-fa-key"] as string | undefined;
  if (!code) {
    return res.status(400).json({
      error: "Missing 2-fa-key header. A TOTP code is required.",
    });
  }

  // 2. Check user has 2FA enabled
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return res.status(400).json({
      error: "Two-factor authentication is not configured.",
    });
  }

  // 3. Verify TOTP code
  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!isValid) {
    return res.status(400).json({
      error: "Invalid 2FA code. Please try again.",
    });
  }

  next();
}`}
      </CodeBlock>

      {/* ── 6. What Per-Action 2FA Protects ── */}
      <SectionHeader number={6} title="What Per-Action 2FA Protects" />

      <p>
        The <IC>verifyActionUsing2FA</IC> middleware guards three categories of high-risk operations.
        Each represents a distinct threat if an active session were compromised.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">API key creation and regeneration</h3>
      <p>
        API keys grant full programmatic access to a merchant's OraFi account. Creating a new
        key or rotating an existing one is a sensitive credential operation. If an attacker
        gained access to an active session — through XSS, a compromised browser extension, or
        stolen cookies — they could generate an API key and use it to control the account
        externally, even after the session expires. Per-action 2FA prevents this entirely.
        Without the merchant's physical authenticator device, an API key cannot be created.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Crypto payouts and payout retries</h3>
      <p>
        Payout operations move funds out of the merchant's OraFi wallet to external blockchain
        addresses. This is the <strong>most financially dangerous action</strong> on the platform.
        An attacker who controls a session could craft a payout to their own wallet address
        and drain the merchant's balance. Per-action 2FA means that even with a valid session
        token, the attacker cannot execute a single payout without presenting a real-time TOTP
        code from the merchant's device.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Refunds and refund retries</h3>
      <p>
        Refunds reverse completed transactions and send funds back to customers. A compromised
        session could be used to issue fraudulent refunds — effectively draining the merchant's
        balance by "refunding" real transactions to attacker-controlled addresses. Per-action
        2FA closes this vector with the same physical-device requirement.
      </p>

      <Mermaid
        chart={`
flowchart LR
  subgraph Protected["🔒 Per-Action 2FA Required"]
    direction TB
    P1["POST /api-keys<br/>Create or regenerate API keys"]
    P2["POST /transactions/payout<br/>Send crypto to external wallet"]
    P3["POST /transactions/refund<br/>Reverse a completed payment"]
  end

  subgraph Open["✅ Session Token Sufficient"]
    direction TB
    O1["GET /transactions<br/>View transaction history"]
    O2["GET /balance<br/>Check wallet balance"]
    O3["GET /dashboard<br/>Browse merchant dashboard"]
  end
        `}
        caption="Figure 4 — Per-action 2FA is enforced only on write operations that move funds or create credentials"
      />

      {/* ── 7. Why This Architecture Matters ── */}
      <SectionHeader number={7} title="Why This Architecture Matters" />

      <p>
        The combination of 2FA-gated login and per-action 2FA enforcement creates a{" "}
        <strong>defense-in-depth</strong> model with a specific property: <em>no single
        compromised layer is sufficient to cause financial loss</em>.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Session theft is not enough</h3>
      <p>
        Even if an attacker steals a session token — through XSS, a compromised browser
        extension, a man-in-the-middle attack, or any other vector — they gain read-only access.
        They can view the dashboard, see transaction history, and check balances. But they cannot
        execute a payout, issue a refund, or create an API key. Every destructive action requires
        a fresh TOTP code from the merchant's physical device, in real time.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Password theft is not enough</h3>
      <p>
        A stolen password cannot produce a session at all. The login flow requires TOTP
        verification before any token is issued. The attacker is blocked at the login gate.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Session duration is no longer a security tradeoff</h3>
      <p>
        A common tension in web security is session lifetime: short sessions improve security but
        hurt user experience; long sessions are convenient but increase the window of
        exploitation. OraFi's architecture largely dissolves this tension. Because the session
        alone is never sufficient for high-risk operations, a longer-lived session improves
        merchant UX without materially increasing risk. The session controls what you can
        <em> see</em>. The authenticator device controls what you can <em>do</em>.
      </p>

      <div className="my-8 overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Attack vector</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">What attacker gains</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Can view dashboard?</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Can move funds?</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Stolen password</td>
              <td className="px-4 py-3 text-slate-700">Credentials only</td>
              <td className="px-4 py-3 text-slate-700">No — blocked at 2FA login step</td>
              <td className="px-4 py-3 text-slate-700">No</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Stolen session token</td>
              <td className="px-4 py-3 text-slate-700">Active session</td>
              <td className="px-4 py-3 text-slate-700">Yes</td>
              <td className="px-4 py-3 text-slate-700">No — blocked by per-action 2FA</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Password + session</td>
              <td className="px-4 py-3 text-slate-700">Full read access</td>
              <td className="px-4 py-3 text-slate-700">Yes</td>
              <td className="px-4 py-3 text-slate-700">No — still needs authenticator device</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Password + TOTP device</td>
              <td className="px-4 py-3 text-slate-700">Full account control</td>
              <td className="px-4 py-3 text-slate-700">Yes</td>
              <td className="px-4 py-3 text-slate-700">Yes — both factors compromised</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 8. Technical Stack ── */}
      <SectionHeader number={8} title="Technical Stack" />

      <p>
        The 2FA infrastructure is built on a small, focused set of tools — each chosen for a
        specific role in the verification pipeline.
      </p>

      <Mermaid
        chart={`
flowchart TB
  subgraph Generation["Secret Generation"]
    Speakeasy["speakeasy<br/>TOTP secret + verification"]
  end

  subgraph TempStore["Temporary Storage (Setup)"]
    Redis["Redis<br/>5-minute TTL for unverified secrets"]
  end

  subgraph PermStore["Permanent Storage"]
    Prisma["Prisma ORM"]
    PG["PostgreSQL<br/>twoFactorEnabled + twoFactorSecret"]
    Prisma --> PG
  end

  subgraph Transport["Code Transport"]
    Header["2-fa-key HTTP header<br/>(per-action verification)"]
    Body["Request body<br/>(login verification)"]
  end

  subgraph Session["Session Management"]
    JWT["JWT access token<br/>(HTTP-only cookie)"]
    Blacklist["Redis-backed blacklist<br/>(sign-out invalidation)"]
  end

  Generation --> TempStore
  TempStore -->|"verified"| PermStore
  PermStore --> Transport
  Transport --> Session
        `}
        caption="Figure 5 — Technical stack powering OraFi's 2FA infrastructure"
      />

      <ul>
        <li>
          <strong>TOTP generation and verification</strong> — handled by the{" "}
          <IC>speakeasy</IC> library. It generates secrets, produces <IC>otpauth_url</IC> URIs
          for QR codes, and verifies 6-digit codes with configurable tolerance windows.
        </li>
        <li>
          <strong>Temporary secret storage during setup</strong> — Redis with a 5-minute TTL.
          Secrets that are not verified within the window are automatically evicted. No cleanup
          job is needed.
        </li>
        <li>
          <strong>Permanent storage</strong> — PostgreSQL via Prisma ORM. The{" "}
          <IC>twoFactorEnabled</IC> boolean and <IC>twoFactorSecret</IC> string live on the
          User model. The secret is stored in base32 encoding.
        </li>
        <li>
          <strong>Per-action code transport</strong> — the TOTP code travels in the{" "}
          <IC>2-fa-key</IC> HTTP request header over HTTPS. Using a header (rather than the
          request body) keeps the 2FA concern orthogonal to the business payload.
        </li>
        <li>
          <strong>Login code transport</strong> — during the login flow, the TOTP code is sent
          in the request body alongside the user ID.
        </li>
        <li>
          <strong>Session management</strong> — JWT access tokens are stored in HTTP-only cookies
          (inaccessible to JavaScript, mitigating XSS token theft). Sign-out uses Redis-backed
          token blacklisting to force immediate invalidation.
        </li>
      </ul>

      <CodeBlock language="prisma" filename="schema.prisma">
{`model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  twoFactorEnabled  Boolean  @default(false)
  twoFactorSecret   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // ... other relations
}`}
      </CodeBlock>

      {/* ── 9. Conclusion ── */}
      <SectionHeader number={9} title="Conclusion" />

      <p>
        Security in crypto payments is not a feature you ship and forget. It is a continuous
        architectural decision that runs through every layer of the system.
      </p>
      <p>
        OraFi's 2FA infrastructure is built on a simple principle: <strong>the session tells the
        system who you are; the authenticator device proves you intend to act</strong>. Login
        requires both factors. Every high-risk operation after login requires the second factor
        again. There is no trust shortcut, no "remember this device for 30 days," and no silent
        pass-through for destructive actions.
      </p>
      <p>
        The result is a system where password theft, session hijacking, and even combined
        credential leaks cannot cause financial loss unless the attacker also holds the
        merchant's physical authenticator device in their hand, generating fresh codes in real
        time.
      </p>
      <p>
        For merchants, this means their funds are protected by something stronger than any
        password policy or session timeout. For developers integrating with OraFi's API, it
        means including a <IC>2-fa-key</IC> header on write operations — a small addition to
        each request that represents a significant barrier to unauthorized action.
      </p>
      <p>
        Two-factor authentication is only as strong as where and how it is enforced. OraFi
        enforces it everywhere it matters.
      </p>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          <strong>ORAFI</strong> is decentralized payment infrastructure. We build APIs for
          crypto payments, escrow, and settlement.
          Learn more at{" "}
          <a href="https://docs.orafi.app" className="text-[#2563eb] hover:underline" target="_blank" rel="noopener noreferrer">
            docs.orafi.app
          </a>
          .
        </p>
      </div>
    </article>
  );
}
