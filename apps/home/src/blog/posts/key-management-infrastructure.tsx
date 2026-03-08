import type { BlogPost } from "../types";
import {
  SectionHeader,
  CodeBlock,
  Mermaid,
  Callout,
  IC,
} from "../components";

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
      {/* ── 1. Introduction ── */}
      <SectionHeader number={1} title="Introduction" />

      <p>
        Building payment infrastructure on a blockchain confronts you with a single
        uncomfortable truth: <strong>the hardest problem is not consensus, not throughput, not
        latency — it is key management</strong>.
      </p>
      <p>
        Private keys are bearer instruments. Whoever holds them controls the funds. There is no
        password-reset flow, no chargebacks, no "contact support." A leaked key is an
        irreversible event. And yet, most crypto payment systems still rely on some variation of
        a hot wallet with a plaintext key loaded into memory on an application server — one
        <IC>env</IC> variable away from catastrophe.
      </p>
      <p>
        At ORAFI we build decentralized payment and escrow infrastructure on the Sui blockchain.
        Every day, our system creates wallets, receives customer funds, settles payments to
        merchants, and manages on-chain state. The surface area for key compromise is enormous:
      </p>
      <ul>
        <li><strong>Custodial risk</strong> — a single server storing keys becomes a honey pot.</li>
        <li><strong>Insider threats</strong> — engineers with production access could exfiltrate keys.</li>
        <li><strong>Key leakage</strong> — logs, crash dumps, backups, and swap files can all leak secrets.</li>
        <li><strong>Memory exposure</strong> — private keys left in process memory can be extracted via heap dumps or side-channel attacks.</li>
      </ul>
      <p>
        This post describes the key management infrastructure we built to address these problems.
        We use an <strong>encrypted master seed</strong> with <strong>hierarchical deterministic
        (HD) wallet derivation</strong> so that private keys are never stored. Wallets are derived
        on demand, transactions are signed in memory, and all sensitive buffers are wiped
        immediately after use. There is no external key service, no key shares to distribute, and
        no third-party storage — just deterministic math and disciplined memory hygiene.
      </p>

      <Callout type="info">
        Throughout this post, "key" refers to an Ed25519 private key unless otherwise noted.
        ORAFI uses Ed25519 because it is the native signature scheme on the Sui blockchain
        and is well-supported across modern chains like Solana and Aptos.
      </Callout>

      {/* ── 2. Security Design Goals ── */}
      <SectionHeader number={2} title="Security Design Goals" />

      <p>Before writing a single line of code, we established four non-negotiable constraints:</p>

      <ol>
        <li>
          <strong>No private key storage.</strong> Private keys are never persisted — not in
          environment variables, not in databases, not on disk, and not in long-lived memory.
          The only thing stored is an encrypted master seed. Individual wallet keys are derived
          ephemerally when needed and destroyed immediately after.
        </li>
        <li>
          <strong>Deterministic wallet derivation.</strong> Every wallet is derived from the
          master seed using a deterministic path. Given the same seed and index, the same wallet
          is always produced. This means the system can recreate any wallet on demand without
          storing the key itself.
        </li>
        <li>
          <strong>Minimal memory exposure.</strong> Sensitive material — the decrypted seed,
          derived private keys, and keypair objects — exists in memory for the shortest
          possible duration. After signing, every buffer containing sensitive data is
          explicitly overwritten with zeros.
        </li>
        <li>
          <strong>Stateless signing.</strong> The signing process is fully stateless. It takes
          an encrypted seed and a derivation index as input, produces a signed transaction as
          output, and leaves no residual state. There are no key caches, no session-bound keys,
          and no signing state that persists beyond a single request.
        </li>
      </ol>

      <Callout type="warning">
        These constraints are deliberately strict. They trade some operational convenience for
        a dramatically reduced attack surface. The result is a system where even full database
        access or API server compromise does not expose private keys.
      </Callout>

      {/* ── 3. High-Level Architecture ── */}
      <SectionHeader number={3} title="High-Level Architecture" />

      <p>
        The ORAFI key management architecture is intentionally simple. There are three boundaries:
        the users (merchants and customers), the ORAFI API server, and the Sui blockchain. The
        API server is the sole authority for wallet generation, derivation, and transaction
        signing. There is no external key service, no separate signing enclave, and no
        third-party key custodian.
      </p>

      <Mermaid
        chart={`
flowchart LR
  Users["👤 Users<br/>(Merchants & Customers)"]
  API["ORAFI API<br/>(api.orafi.app)<br/>Node.js + Prisma"]
  Sui["Sui Blockchain"]

  Users -->|"requests"| API
  API -->|"derive wallets<br/>sign transactions"| API
  API -->|"broadcast"| Sui
  Sui -->|"confirmations"| API
  API -->|"responses"| Users
        `}
        caption="Figure 1 — High-level system architecture: Users → API → Sui Network"
      />

      <p>
        The <strong>ORAFI API</strong> is a Node.js service backed by PostgreSQL (via Prisma) and
        Redis. It handles the full payment lifecycle: payment creation, wallet generation,
        transaction signing, settlement, and cleanup. The API server is responsible for:
      </p>
      <ul>
        <li><strong>Wallet generation</strong> — deriving new wallets from the master seed using HD derivation.</li>
        <li><strong>Wallet management</strong> — tracking derivation indices and wallet addresses in the database.</li>
        <li><strong>Transaction signing</strong> — deriving the wallet keypair on demand, signing, and wiping.</li>
        <li><strong>Secure memory management</strong> — ensuring all sensitive buffers are zeroed after use.</li>
      </ul>

      {/* ── 4. Master Seed Management ── */}
      <SectionHeader number={4} title="Master Seed Management" />

      <p>
        The foundation of the entire key management system is a single <strong>master
        seed</strong> — a 64-byte cryptographically random value generated once during system
        initialization. Every wallet in the system is deterministically derived from this seed.
        The seed itself is never stored in plaintext.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Seed generation</h3>
      <p>
        During initial deployment, the system generates a master seed using a cryptographically
        secure random number generator. This seed is immediately encrypted before any persistence
        occurs. The plaintext seed exists in memory only during this brief initialization window.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Encryption at rest</h3>
      <p>
        The master seed is encrypted using <strong>AES-256-GCM</strong> (Galois/Counter Mode),
        which provides both confidentiality and authenticity. The encryption key is derived from
        a secret that is managed outside the application database — typically an environment
        secret injected at deploy time via a secrets manager. The encrypted seed, along with its
        initialization vector (IV) and authentication tag, is stored in the database.
      </p>

      <CodeBlock language="typescript" filename="seed-encryption.ts">
{`import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt the master seed using AES-256-GCM.
 * The encryption key comes from a secrets manager, NOT from the database.
 */
function encryptSeed(
  seed: Buffer,
  encryptionKey: Buffer
): { encrypted: Buffer; iv: Buffer; authTag: Buffer } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(seed),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return { encrypted, iv, authTag };
}

/**
 * Decrypt the master seed.
 * Returns the raw seed buffer — caller must wipe after use.
 */
function decryptSeed(
  encrypted: Buffer,
  iv: Buffer,
  authTag: Buffer,
  encryptionKey: Buffer
): Buffer {
  const decipher = createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
}`}
      </CodeBlock>

      <Callout type="info">
        AES-256-GCM was chosen because it provides authenticated encryption — any tampering
        with the ciphertext or IV will cause decryption to fail. This prevents an attacker
        who gains database access from silently modifying the encrypted seed.
      </Callout>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">What the database stores</h3>
      <p>
        The database stores exactly three pieces of information related to the master seed:
      </p>
      <ul>
        <li>The <strong>encrypted seed</strong> (ciphertext)</li>
        <li>The <strong>initialization vector</strong> (IV) used during encryption</li>
        <li>The <strong>authentication tag</strong> for integrity verification</li>
      </ul>
      <p>
        The encryption key itself is <em>never</em> stored in the database. It is injected via
        environment configuration and exists only in process memory at runtime.
      </p>

      {/* ── 5. Hierarchical Deterministic Wallets ── */}
      <SectionHeader number={5} title="Hierarchical Deterministic Wallets" />

      <p>
        ORAFI uses <strong>Hierarchical Deterministic (HD) wallets</strong> as defined by BIP-32
        and BIP-44. The core idea is simple: from a single master seed, you can derive an
        essentially unlimited number of child wallets. Each child wallet is uniquely identified
        by a <strong>derivation path</strong> — a sequence of indices that deterministically
        maps a seed to a specific keypair.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">The derivation path</h3>
      <p>
        Every ORAFI wallet is derived using the following BIP-44 path:
      </p>

      <CodeBlock language="text" filename="derivation-path">
{`m / 44' / 784' / 0' / 0' / index'

Where:
  m        = master seed root
  44'      = BIP-44 purpose (hardened)
  784'     = Sui coin type (SLIP-44 registered)
  0'       = account (hardened)
  0'       = change (hardened, always 0 for Sui)
  index'   = wallet index (hardened, auto-incremented)`}
      </CodeBlock>

      <p>
        The <IC>index</IC> is the only variable. For the first merchant wallet, <IC>index =
        0</IC>. For the second, <IC>index = 1</IC>. And so on. This means that given the master
        seed and an index, the system can always reconstruct the exact same wallet — without
        ever having stored the private key.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Wallet derivation</h3>

      <CodeBlock language="typescript" filename="derive-wallet.ts">
{`import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

/**
 * Derive a Sui wallet from the master seed and a derivation index.
 *
 * The derivation path follows BIP-44:
 *   m/44'/784'/0'/0'/index'
 *
 * This is fully deterministic — same seed + same index = same wallet.
 */
function deriveWallet(
  seed: Buffer,
  index: number
): { keypair: Ed25519Keypair; address: string } {
  const path = \`m/44'/784'/0'/0'/\${index}'\`;

  const keypair = Ed25519Keypair.deriveKeypairFromSeed(
    seed.toString("hex"),
    path
  );

  return {
    keypair,
    address: keypair.toSuiAddress(),
  };
}`}
      </CodeBlock>

      <Mermaid
        chart={`
flowchart TB
  Seed["🔐 Encrypted Master Seed<br/>(AES-256-GCM)"]
  Decrypt["Decrypt Seed<br/>(in memory)"]

  W0["Wallet 0<br/>m/44'/784'/0'/0'/0'"]
  W1["Wallet 1<br/>m/44'/784'/0'/0'/1'"]
  W2["Wallet 2<br/>m/44'/784'/0'/0'/2'"]
  WN["Wallet N<br/>m/44'/784'/0'/0'/N'"]

  Seed --> Decrypt
  Decrypt --> W0
  Decrypt --> W1
  Decrypt --> W2
  Decrypt --> WN

  style Seed fill:#fef3c7,stroke:#d97706
  style Decrypt fill:#dbeafe,stroke:#2563eb
        `}
        caption="Figure 2 — Hierarchical deterministic wallet derivation from a single encrypted master seed"
      />

      <p>
        The critical property of HD derivation is that <strong>each wallet can be independently
        regenerated</strong>. If Wallet 47 needs to sign a transaction, the system decrypts the
        master seed, derives the keypair at index 47, signs, and immediately destroys the
        keypair and seed buffer. It does not need to derive wallets 0–46 first — each
        derivation is independent.
      </p>

      {/* ── 6. Wallet Index Tracking ── */}
      <SectionHeader number={6} title="Wallet Index Tracking" />

      <p>
        Since private keys are never stored, the system must know <em>which index</em> each
        wallet was derived from. This mapping is maintained in PostgreSQL via Prisma.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Database model</h3>

      <CodeBlock language="prisma" filename="schema.prisma">
{`model Wallet {
  id              String   @id @default(uuid())
  address         String   @unique
  derivationIndex Int      @unique
  ownerId         String
  type            WalletType
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  owner           User     @relation(fields: [ownerId], references: [id])

  @@index([ownerId])
  @@index([derivationIndex])
}

model MasterSeed {
  id            String   @id @default(uuid())
  encryptedSeed Bytes
  iv            Bytes
  authTag       Bytes
  createdAt     DateTime @default(now())
}

enum WalletType {
  MERCHANT
  TRANSACTION
}`}
      </CodeBlock>

      <p>
        When a new wallet is created, the system:
      </p>
      <ol>
        <li>Fetches the current maximum <IC>derivationIndex</IC> from the database.</li>
        <li>Increments it by one to get the next index.</li>
        <li>Derives the wallet at that index (temporarily, in memory).</li>
        <li>Stores only the <IC>address</IC> and <IC>derivationIndex</IC> — not the private key.</li>
        <li>Wipes the seed and keypair from memory.</li>
      </ol>

      <CodeBlock language="typescript" filename="create-wallet.ts">
{`import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new deterministic wallet for a merchant.
 * The private key is NEVER stored — only the address and derivation index.
 */
async function createMerchantWallet(ownerId: string) {
  // 1. Get the next derivation index
  const lastWallet = await prisma.wallet.findFirst({
    orderBy: { derivationIndex: "desc" },
  });
  const nextIndex = (lastWallet?.derivationIndex ?? -1) + 1;

  // 2. Decrypt the master seed
  const masterSeed = await prisma.masterSeed.findFirstOrThrow();
  const seed = decryptSeed(
    masterSeed.encryptedSeed,
    masterSeed.iv,
    masterSeed.authTag,
    getEncryptionKey()
  );

  try {
    // 3. Derive the wallet at this index
    const { address } = deriveWallet(seed, nextIndex);

    // 4. Store address + index (NOT the private key)
    const wallet = await prisma.wallet.create({
      data: {
        address,
        derivationIndex: nextIndex,
        ownerId,
        type: "MERCHANT",
      },
    });

    return wallet;
  } finally {
    // 5. Always wipe the seed buffer
    wipeBuffer(seed);
  }
}`}
      </CodeBlock>

      <Callout type="info">
        The <IC>derivationIndex</IC> column has a unique constraint. This guarantees that no two
        wallets share the same index, preventing accidental key reuse even under concurrent
        wallet creation.
      </Callout>

      {/* ── 7. Transaction Signing ── */}
      <SectionHeader number={7} title="Transaction Signing" />

      <p>
        Transaction signing follows a strict lifecycle:{" "}
        <strong>fetch → decrypt → derive → sign → wipe</strong>. Each step is deliberate, and the
        entire process is wrapped in a <IC>try/finally</IC> block to guarantee cleanup even on
        failure.
      </p>

      <Mermaid
        chart={`
sequenceDiagram
  participant API as ORAFI API
  participant DB as PostgreSQL
  participant Mem as In-Memory
  participant Sui as Sui Blockchain

  API->>DB: Fetch encrypted master seed
  DB-->>API: Encrypted seed + IV + auth tag

  API->>Mem: Decrypt seed (AES-256-GCM)
  Note over Mem: Plaintext seed in memory

  API->>Mem: Derive wallet at index N
  Note over Mem: Ed25519 keypair in memory

  API->>Mem: Sign transaction bytes
  Note over Mem: Signed TX ready

  API->>Sui: Broadcast signed transaction
  Sui-->>API: Transaction digest

  API->>Mem: Wipe seed buffer
  API->>Mem: Wipe private key buffer
  API->>Mem: Wipe keypair secret key
  Note over Mem: All sensitive data destroyed
        `}
        caption="Figure 3 — Complete transaction signing lifecycle"
      />

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Implementation</h3>

      <CodeBlock language="typescript" filename="sign-transaction.ts">
{`import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });

/**
 * Sign and execute a settlement transaction.
 *
 * Lifecycle:
 *   1. Fetch encrypted seed from database
 *   2. Decrypt seed in memory
 *   3. Derive wallet keypair using derivation index
 *   4. Construct Ed25519 keypair
 *   5. Sign transaction
 *   6. Wipe ALL sensitive buffers
 */
async function signSettlement(
  walletId: string,
  merchantAddress: string,
  amount: bigint
) {
  // 1. Fetch wallet metadata (address + derivation index)
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
  });

  // 2. Fetch encrypted master seed
  const masterSeed = await prisma.masterSeed.findFirstOrThrow();

  // 3. Decrypt seed
  const seedBuffer = decryptSeed(
    masterSeed.encryptedSeed,
    masterSeed.iv,
    masterSeed.authTag,
    getEncryptionKey()
  );

  let derivedKey: Buffer | null = null;
  let keypair: Ed25519Keypair | null = null;

  try {
    // 4. Derive wallet keypair at the stored index
    const result = deriveWallet(seedBuffer, wallet.derivationIndex);
    keypair = result.keypair;

    // 5. Build the transaction
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.transferObjects([coin], merchantAddress);

    // 6. Sign and execute
    const response = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });

    return response;
  } finally {
    // 7. ALWAYS wipe sensitive buffers — even if signing fails
    wipeBuffer(seedBuffer);
    if (derivedKey) wipeBuffer(derivedKey);

    // Null out references to aid garbage collection
    derivedKey = null;
    keypair = null;
  }
}`}
      </CodeBlock>

      <p>
        The <IC>try/finally</IC> block is critical. If the Sui RPC call fails, if the transaction
        is rejected, if <em>any</em> exception is thrown — the sensitive buffers are still wiped.
        There is no code path where the seed or private key can survive in memory after the
        signing function returns.
      </p>

      {/* ── 8. Memory Safety ── */}
      <SectionHeader number={8} title="Memory Safety" />

      <p>
        JavaScript and Node.js do not provide native facilities for secure memory management.
        The garbage collector runs non-deterministically, and there is no guarantee that
        memory contents are overwritten when an object is collected. This is a fundamental
        challenge for any application handling cryptographic secrets in a managed runtime.
      </p>
      <p>
        ORAFI addresses this with explicit buffer wiping. Every function that handles sensitive
        data follows a strict protocol: allocate the minimum necessary buffer, use it for the
        shortest possible duration, and overwrite it with zeros before releasing the reference.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Buffer wiping implementation</h3>

      <CodeBlock language="typescript" filename="wipe-buffer.ts">
{`/**
 * Securely overwrite a buffer with zeros.
 *
 * This ensures sensitive data (seeds, private keys, keypair secrets)
 * does not linger in memory waiting for garbage collection.
 *
 * IMPORTANT: This must be called on EVERY buffer that ever contains:
 *   - The decrypted master seed
 *   - A derived private key
 *   - A keypair's secret key bytes
 */
function wipeBuffer(buffer: Buffer | Uint8Array): void {
  if (buffer instanceof Buffer) {
    buffer.fill(0);
  } else if (buffer instanceof Uint8Array) {
    buffer.fill(0);
  }
}

/**
 * Wipe multiple buffers at once.
 * Convenience wrapper for cleanup in finally blocks.
 */
function wipeAll(...buffers: (Buffer | Uint8Array | null)[]): void {
  for (const buf of buffers) {
    if (buf) wipeBuffer(buf);
  }
}`}
      </CodeBlock>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">What gets wiped</h3>
      <p>
        After every signing operation, the following buffers are explicitly zeroed:
      </p>
      <ul>
        <li><strong>Seed buffer</strong> — the decrypted master seed (64 bytes).</li>
        <li><strong>Derived private key</strong> — the Ed25519 private key derived from the seed at the wallet's index (32 bytes).</li>
        <li><strong>Keypair secret key</strong> — the internal representation of the secret key within the <IC>Ed25519Keypair</IC> object.</li>
      </ul>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">The try/finally pattern</h3>
      <p>
        All signing code follows this pattern:
      </p>

      <CodeBlock language="typescript" filename="signing-pattern.ts">
{`async function signTransaction(walletIndex: number, txBytes: Uint8Array) {
  const seed = decryptSeed(/* ... */);
  let privateKey: Buffer | null = null;

  try {
    const { keypair } = deriveWallet(seed, walletIndex);

    // Sign the transaction
    const signature = keypair.sign(txBytes);

    return signature;
  } finally {
    // This block ALWAYS executes — even if an exception is thrown
    wipeBuffer(seed);
    if (privateKey) wipeBuffer(privateKey);

    // Remove references
    privateKey = null;
  }
}`}
      </CodeBlock>

      <Callout type="warning">
        Buffer wiping is a best-effort defense in a garbage-collected runtime. The V8 engine
        may create intermediate copies of data during operations like string conversion or
        concatenation. ORAFI minimizes this risk by working exclusively with <IC>Buffer</IC> and
        <IC>Uint8Array</IC> types for all sensitive data and avoiding any string representation
        of private keys.
      </Callout>

      {/* ── 9. Security Threat Model ── */}
      <SectionHeader number={9} title="Security Threat Model" />

      <p>
        We designed this architecture against a specific threat model. Here we enumerate the
        primary attack vectors and explain how the system mitigates them.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T1: Database compromise</h3>
      <p>
        <strong>Scenario:</strong> An attacker gains read access to the PostgreSQL database.
      </p>
      <p>
        <strong>What they get:</strong> The encrypted master seed (ciphertext), IV, auth tag,
        wallet addresses (public), derivation indices, and payment metadata.
      </p>
      <p>
        <strong>What they cannot do:</strong> Decrypt the master seed. The AES-256-GCM encryption
        key is not stored in the database — it exists only in the application's runtime
        environment. Without the encryption key, the ciphertext is computationally infeasible to
        break. The authentication tag also prevents the attacker from modifying the encrypted
        seed without detection.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T2: API server compromise</h3>
      <p>
        <strong>Scenario:</strong> An attacker gains code execution on the API server.
      </p>
      <p>
        <strong>What they get:</strong> Potentially, the encryption key (from environment
        variables) and the ability to call the signing functions.
      </p>
      <p>
        <strong>Mitigations:</strong> This is the most critical threat. If an attacker controls
        the API server and has the encryption key, they can derive wallets and sign transactions.
        This is mitigated through multiple layers:
      </p>
      <ul>
        <li>
          <strong>Rate limiting</strong> — signing operations are rate-limited per wallet and
          per time window. Bulk exfiltration triggers alerts.
        </li>
        <li>
          <strong>Audit logging</strong> — every signing request is logged with wallet ID,
          timestamp, requesting context, and transaction digest. Anomalous patterns are flagged.
        </li>
        <li>
          <strong>Transaction limits</strong> — individual transaction amounts are capped.
          Large withdrawals require multi-step authorization.
        </li>
        <li>
          <strong>Network isolation</strong> — the API server runs in a private network with
          strict egress rules. The encryption key is injected via a secrets manager with access
          logging.
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T3: Insider threats</h3>
      <p>
        <strong>Scenario:</strong> A malicious or compromised engineer with production access
        attempts to extract private keys.
      </p>
      <p>
        <strong>Mitigations:</strong> Private keys are never materialized in any persistent form.
        An insider with database access sees only encrypted data. An insider with application
        logs sees only wallet addresses and transaction digests — all logging of sensitive
        buffers is explicitly prohibited. Access to the encryption key in the secrets manager
        is restricted to the application service account and audited independently.
      </p>

      <div className="my-8 overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Threat</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Attacker gains</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Protected by</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Residual risk</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">DB compromise</td>
              <td className="px-4 py-3 text-slate-700">Encrypted seed, addresses, indices</td>
              <td className="px-4 py-3 text-slate-700">AES-256-GCM encryption; key not in DB</td>
              <td className="px-4 py-3 text-slate-700">Metadata leakage (addresses, amounts)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">API compromise</td>
              <td className="px-4 py-3 text-slate-700">Encryption key, signing capability</td>
              <td className="px-4 py-3 text-slate-700">Rate limits, audit logs, tx caps</td>
              <td className="px-4 py-3 text-slate-700">Signing abuse within rate limits</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Insider access</td>
              <td className="px-4 py-3 text-slate-700">DB access, application code</td>
              <td className="px-4 py-3 text-slate-700">No plaintext keys; secrets manager audit</td>
              <td className="px-4 py-3 text-slate-700">Social engineering for secrets access</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Memory dump</td>
              <td className="px-4 py-3 text-slate-700">Process heap at a point in time</td>
              <td className="px-4 py-3 text-slate-700">Buffer wiping, short-lived keys</td>
              <td className="px-4 py-3 text-slate-700">Timing-dependent ({"<"}50ms window)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 10. Future Improvements ── */}
      <SectionHeader number={10} title="Future Improvements" />

      <p>
        The architecture described here is our production system as of Q1 2026. It provides a
        strong security baseline with a minimal attack surface. However, we are actively
        evaluating several improvements that would further harden the system:
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Hardware Security Modules (HSM)</h3>
      <p>
        The current system decrypts the master seed in application memory. An HSM would allow
        the seed to remain inside tamper-resistant hardware at all times — derivation and
        signing would happen inside the HSM, and the plaintext seed would never enter
        application process memory. This eliminates the memory-dump attack vector entirely.
        We are evaluating cloud HSM offerings (AWS CloudHSM, GCP Cloud HSM) for enterprise
        merchants who require FIPS 140-2 Level 3 certification.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">MPC wallets</h3>
      <p>
        Multi-Party Computation (MPC) would allow the master seed to be split across multiple
        parties, so that no single server ever holds the complete seed. Signing would be
        performed cooperatively across multiple nodes, each contributing a partial computation.
        This is a significant architectural change that would eliminate single-point-of-compromise
        risk at the seed level.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Threshold signing</h3>
      <p>
        Protocols like <strong>FROST (Flexible Round-Optimized Schnorr Threshold
        Signatures)</strong> enable threshold signing without ever reconstructing a full private
        key. Each signing party holds a key share and produces a partial signature. The partial
        signatures are combined into a valid Ed25519 signature. This is complementary to MPC
        and would be our long-term target architecture for high-value wallets.
      </p>

      <Callout type="info">
        HSM, MPC, and threshold signing are <strong>future improvements</strong> under active
        evaluation. They are not part of the current production system. The current architecture
        uses encrypted master seed with HD derivation and in-memory signing as described in this
        post.
      </Callout>

      <Mermaid
        chart={`
flowchart LR
  Current["Current Architecture<br/>Encrypted Seed + HD Derivation"]
  HSM["Phase 2: HSM Integration<br/>Hardware-bound seed"]
  MPC["Phase 3: MPC Wallets<br/>Distributed seed shares"]
  Threshold["Phase 4: Threshold Signing<br/>No key reconstruction"]

  Current --> HSM --> MPC --> Threshold
        `}
        caption="Figure 4 — Key management evolution roadmap"
      />

      {/* ── Conclusion ── */}
      <SectionHeader number={11} title="Conclusion" />

      <p>
        Key management is the load-bearing wall of any blockchain payment system. Get it wrong,
        and no amount of smart contract auditing or frontend polish matters — an attacker with
        your private key <em>is</em> you.
      </p>
      <p>
        The ORAFI key management infrastructure is designed around a simple principle:{" "}
        <strong>never store private keys</strong>. Instead, we store a single encrypted master
        seed and derive wallets deterministically using hierarchical derivation paths. Every
        signing operation is stateless: decrypt the seed, derive the keypair, sign, wipe
        everything.
      </p>
      <p>
        This approach eliminates entire categories of attacks. A database breach yields only
        ciphertext. A log leak reveals only public addresses. An insider with production
        access finds no private keys to steal because they simply do not exist in any
        persistent form.
      </p>
      <p>
        There is no silver bullet in key management. Every design is a set of trade-offs:
        security vs. operational complexity, defense depth vs. performance overhead. What we've
        built is a system that makes deliberate choices, documents them, and ensures that
        no single failure leads to catastrophic key exposure.
      </p>
      <p>
        As we grow, we will layer additional protections — HSMs for hardware-bound key
        material, MPC for distributed trust, and threshold signing for reconstruction-free
        operations. But even today, the fundamental guarantee holds: <strong>no private key
        is ever stored, and every sensitive buffer is destroyed the moment it is no longer
        needed.</strong>
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
