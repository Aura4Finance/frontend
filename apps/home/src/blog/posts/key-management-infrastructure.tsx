import type { BlogPost } from "../types";

const meta: BlogPost = {
  slug: "key-management-infrastructure",
  title: "Key Management Infrastructure at ORAFI: MPC Wallets, Ephemeral Keys, and Multichain Signing",
  description:
    "A deep technical walkthrough of how ORAFI manages cryptographic keys across ephemeral transaction wallets and persistent merchant wallets using MPC, secure enclaves, and decentralized storage.",
  date: "2026-03-05",
  author: "ORAFI Engineering",
  authorRole: "Infrastructure & Security",
  readingTime: "22 min read",
  tags: [
    "cryptography",
    "MPC",
    "key management",
    "blockchain",
    "security",
    "Sui",
    "distributed systems",
  ],
  coverLabel: "Engineering Deep Dive",
  content: Content,
};

export default meta;

function Content() {
  return (
    <article className="prose-custom">
      <h2 className="font-extrabold text-[#1e3a8a]">Key management model at OraFi</h2>

      <p>
        In crypto infrastructure, private keys are the real authority layer. If a private
        key leaks, funds can be moved instantly and irreversibly. That is why OraFi treats
        key management as a lifecycle problem, not just an encryption problem.
      </p>

      <p>
        Our model is non custodial in practice: we never persist private keys. We persist an
        encrypted master seed, wallet metadata, and derivation indices. Private keys are
        reconstructed in memory only for signing, then immediately wiped.
      </p>

      <p>
        Wallets are derived from a single seed using a deterministic HD path. For Sui, a
        representative path is m/44'/784'/0'/0'/index'. The index is the variable that maps
        to a specific merchant wallet or transaction wallet. This gives us predictable address
        generation while keeping key material out of persistent storage.
      </p>

      <p>
        What is stored long term is intentionally limited: encrypted seed ciphertext, IV,
        auth tag, public addresses, and derivation indexes. What is not stored: plaintext
        seed, derived private keys, or reusable signing key files.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Why private keys cannot be reconstructed from database data</h2>

      <p>
        Reconstructing a private key requires both the encrypted seed payload and the runtime
        decryption key. These two controls are separated by design. The encrypted seed lives
        in the data layer; the decryption key is served by a secrets manager only to specific
        service identities at runtime.
      </p>

      <p>
        That separation is the security boundary. A database snapshot alone is insufficient to
        recover keys. Internal operators do not get direct combined access to seed ciphertext
        plus live decryption key in normal operating paths, and sensitive access events are
        logged and audited.
      </p>

      <p>
        Each signing request follows the same guarded flow: load encrypted seed metadata,
        request runtime secret, decrypt seed in memory, derive key by index, sign payload,
        wipe derived key and seed buffers, release memory. The process is stateless between
        requests and avoids key caching.
      </p>

      <p>
        Cleanup is enforced in success and failure paths. Even when signing throws, the
        cleanup path still executes so sensitive buffers are cleared before request exit.
        This minimizes key residency time in process memory.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Signing lifecycle, controls, and security boundaries</h2>

      <p>
        Cryptographic safety is reinforced with platform controls: secret access policies,
        request level authentication, rate limits for signing endpoints, transaction caps,
        audit logs, and security alerts for abnormal signing behavior. These controls make
        misuse expensive, noisy, and easier to contain.
      </p>

      <p>
        The strongest protections in this model are against persistent data compromise and
        accidental key retention. It is still a software process model, so runtime host
        compromise remains a serious threat class. That is why we pair key hygiene with
        runtime hardening, observability, and least privilege controls.
      </p>

      <p>
        For deeper guarantees, the next layer is hardware backed signing or threshold schemes
        such as MPC. Hardware modules reduce exposure of key material to application memory,
        while threshold signing reduces single node trust. Those options increase complexity,
        but they meaningfully reduce blast radius for high value operations.
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
