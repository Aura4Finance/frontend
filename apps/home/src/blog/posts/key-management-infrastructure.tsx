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
        If you operate blockchain infrastructure long enough, you arrive at a single uncomfortable
        truth: <strong>the hardest problem is not consensus, not throughput, not latency — it is key
        management</strong>.
      </p>
      <p>
        Private keys are bearer instruments. Whoever holds them controls the funds. There is no
        password-reset flow, no chargebacks, no "contact support." A leaked key is an
        irreversible event. And yet, most crypto payment systems still rely on some variation of
        a hot wallet with a plaintext key loaded into memory on an application server — one
        <IC>env</IC> variable away from catastrophe.
      </p>
      <p>
        At ORAFI we build decentralized payment and escrow infrastructure. Every day, our system
        creates wallets, receives customer funds, settles payments to merchants, and destroys
        temporary state — all on-chain. The surface area for key compromise is enormous:
      </p>
      <ul>
        <li><strong>Custodial risk</strong> — a single server storing keys becomes a honey pot.</li>
        <li><strong>Insider threats</strong> — engineers with production access could exfiltrate keys.</li>
        <li><strong>Key leakage</strong> — logs, crash dumps, backups, and swap files can all leak secrets.</li>
        <li><strong>Transaction-level security</strong> — each payment creates state that must be isolated and short-lived.</li>
      </ul>
      <p>
        This post describes the key management infrastructure we built to address these problems.
        We use <strong>multi-party computation (MPC)</strong> to split keys so that no single system
        ever holds a complete private key. We use <strong>ephemeral wallets</strong> per transaction
        so that long-term custody windows shrink to minutes. And we designed the architecture to be
        <strong> multichain from day one</strong>, even though we launched on Sui.
      </p>

      <Callout type="info">
        Throughout this post, "key" refers to an Ed25519 private key unless otherwise noted.
        ORAFI uses Ed25519 because it is the native signature scheme on Sui and
        is well-supported across Solana, Aptos, and other modern chains.
      </Callout>

      {/* ── 2. Security Design Goals ── */}
      <SectionHeader number={2} title="Security Design Goals" />

      <p>Before writing a single line of code, we established six non-negotiable constraints:</p>

      <ol>
        <li>
          <strong>Engineers cannot access private keys.</strong> No key material may appear in
          environment variables, application logs, debugging sessions, or database tables in any
          recoverable form. This applies to every engineer with production access, including SREs.
        </li>
        <li>
          <strong>Keys are never stored in plaintext.</strong> At rest, in transit, or in memory on
          any general-purpose compute node. The only place a full key may be reconstructed is
          inside a secure enclave during signing, and it must be zeroized immediately after.
        </li>
        <li>
          <strong>Transaction wallets must self-destruct.</strong> Every ephemeral wallet has a
          bounded lifetime. After settlement, all key shares, encrypted blobs, and database
          references are deleted. There is no archeological recovery path.
        </li>
        <li>
          <strong>Merchant wallets must support recovery.</strong> A merchant must be able to
          recover access to their persistent wallet even if they lose their device, as long as they
          can authenticate and retrieve their encrypted recovery share.
        </li>
        <li>
          <strong>Infrastructure must be multichain-ready.</strong> The key management layer must
          abstract over specific blockchains. Adding a new chain should not require redesigning the
          share distribution model.
        </li>
        <li>
          <strong>Minimize long-term custody risk.</strong> The total value held in ORAFI-managed
          wallets at any given time should be as small as possible. Ephemeral wallets hold funds
          for the duration of a transaction; merchant wallets hold settlement until withdrawal.
        </li>
      </ol>

      {/* ── 3. High-Level System Architecture ── */}
      <SectionHeader number={3} title="High-Level System Architecture" />

      <p>
        At the highest level, a payment flows through four boundaries: the customer, a temporary
        escrow wallet, the merchant's persistent wallet, and the merchant themselves. The
        infrastructure that manages keys sits between these boundaries.
      </p>

      <Mermaid
        chart={`
flowchart LR
  Customer["🧑 Customer"]
  API["ORAFI API<br/>(Node.js)"]
  Signing["Signing Service<br/>(Secure Enclave)"]
  Walrus["Walrus<br/>Decentralized Storage"]
  TxWallet["Transaction Wallet<br/>(Ephemeral)"]
  MerchWallet["Merchant Wallet<br/>(Persistent)"]
  Sui["Sui Blockchain"]
  Merchant["🏪 Merchant"]

  Customer -->|"pay"| API
  API -->|"create ephemeral wallet"| Signing
  Signing -->|"store share B"| Walrus
  Signing -->|"derive address"| TxWallet
  Customer -->|"send funds"| TxWallet
  TxWallet -->|"settle"| MerchWallet
  MerchWallet -->|"withdraw"| Merchant
  API -->|"broadcast tx"| Sui
  Signing -->|"sign tx"| Sui
        `}
        caption="Figure 1 — High-level payment flow through ORAFI's key management infrastructure"
      />

      <p>
        The <strong>ORAFI API</strong> is a Node.js service backed by PostgreSQL and Redis. It
        orchestrates payment lifecycle events but never touches raw key material. The
        <strong> Signing Service</strong> runs inside a secure enclave (we use Nautilus as the TEE framework).
        Key shares are stored either on the merchant's device or in <strong>Walrus</strong>, a
        decentralized storage network in the Sui ecosystem. The <strong>Seal encryption
        framework</strong> handles envelope encryption before data reaches Walrus.
      </p>

      {/* ── 4. The Two Wallet Models ── */}
      <SectionHeader number={4} title="The Two Wallet Models" />

      <p>
        ORAFI uses two distinct wallet types because merchants and transactions have fundamentally
        different security profiles.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Why two wallet types?</h3>
      <p>
        A merchant needs a <em>stable address</em> — one that persists across hundreds of
        transactions, can receive settlements, and supports recovery if a device is lost.
        A transaction needs an <em>isolated address</em> — one that exists only for the duration
        of a single payment, minimizes the blast radius of compromise, and leaves no residual
        key material after settlement.
      </p>
      <p>
        If we used a single persistent wallet for everything, every transaction would increase the
        custody risk of that wallet. If we used only ephemeral wallets, merchants would have no
        stable identity on-chain and recovery would be meaningless.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Why ephemeral wallets improve security</h3>
      <p>
        Ephemeral wallets bound the <em>exposure window</em>. A transaction wallet exists for the
        duration of a payment (typically 5–15 minutes). Even if an attacker compromises the wallet's
        key material, the window in which funds are available is extremely short, and the value at
        risk is limited to a single transaction. After settlement, the wallet is destroyed —
        shares are deleted, encrypted blobs are removed from Walrus, and the database record is
        tombstoned.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Why merchants need persistent wallets</h3>
      <p>
        Merchants need a durable on-chain identity for settlement. Their wallet address is
        published, bookmarked by their accounting systems, and used across many transactions.
        Recovery is critical: a merchant who loses access to their wallet cannot receive funds.
        This is why the merchant wallet uses a 3-share MPC model with a decentralized recovery
        share.
      </p>

      <Mermaid
        chart={`
flowchart TB
  subgraph MW["Merchant Wallet"]
    direction TB
    M1["Share 1 — Merchant Device"]
    M2["Share 2 — ORAFI Signing Service"]
    M3["Share 3 — Encrypted Recovery via Walrus"]
    MK["Merchant Key — never assembled outside enclave"]
    M1 -.->|"2-of-3 threshold"| MK
    M2 -.->|"2-of-3 threshold"| MK
    M3 -.->|"2-of-3 threshold"| MK
  end

  subgraph TW["Transaction Wallet"]
    direction TB
    T1["Share A — ORAFI Secure Enclave"]
    T2["Share B — Encrypted via Walrus"]
    TK["Transaction Key — assembled in enclave, destroyed after use"]
    T1 -.->|"2-of-2"| TK
    T2 -.->|"2-of-2"| TK
  end
        `}
        caption="Figure 2 — Key share architecture for merchant (persistent) and transaction (ephemeral) wallets"
      />

      {/* ── 5. Merchant Wallet MPC Architecture ── */}
      <SectionHeader number={5} title="Merchant Wallet MPC Architecture" />

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Share generation</h3>
      <p>
        When a merchant onboards, the signing service generates an Ed25519 keypair inside the
        secure enclave. The 32-byte private key scalar is immediately split into three shares
        using XOR-based secret sharing. The full private key is zeroized from enclave memory
        before any share leaves the enclave.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Share distribution</h3>
      <ol>
        <li>
          <strong>Share 1 → Merchant device.</strong> Encrypted with a device-bound key derived
          from the merchant's authentication credential. Stored in the merchant's app or browser
          secure storage (e.g., IndexedDB with a non-extractable CryptoKey).
        </li>
        <li>
          <strong>Share 2 → ORAFI signing service.</strong> Stored in the enclave's encrypted
          memory segment. Never persisted to disk. On enclave restart, the share is re-sealed
          from the enclave's attestation-bound storage.
        </li>
        <li>
          <strong>Share 3 → Encrypted recovery share (Walrus).</strong> Encrypted using the Seal
          framework with an access policy that requires the merchant's authenticated identity.
          Uploaded to Walrus as an immutable blob. The blob ID is stored in PostgreSQL.
        </li>
      </ol>

      <Mermaid
        chart={`
sequenceDiagram
  participant Enclave as Secure Enclave
  participant Device as Merchant Device
  participant ORAFI as ORAFI Signing Service
  participant Seal as Seal Encryption
  participant Walrus as Walrus Storage

  Note over Enclave: Generate Ed25519 keypair
  Enclave->>Enclave: Split key → Share 1, Share 2, Share 3
  Enclave->>Enclave: Zeroize full private key

  Enclave->>Device: Share 1 (encrypted with device key)
  Enclave->>ORAFI: Share 2 (sealed in enclave memory)
  Enclave->>Seal: Share 3 (plaintext)
  Seal->>Seal: Encrypt with merchant identity policy
  Seal->>Walrus: Upload encrypted blob
  Walrus-->>ORAFI: Return blob ID
  ORAFI->>ORAFI: Store blob ID in PostgreSQL
        `}
        caption="Figure 3 — Merchant wallet key generation and share distribution"
      />

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Recovery flow</h3>
      <p>
        If a merchant loses their device, they can recover their wallet using Share 2 (held by the
        signing service) and Share 3 (retrieved from Walrus after re-authenticating). The recovery
        flow:
      </p>

      <Mermaid
        chart={`
sequenceDiagram
  participant Merchant as Merchant (new device)
  participant API as ORAFI API
  participant Enclave as Secure Enclave
  participant Walrus as Walrus Storage
  participant Seal as Seal Decryption

  Merchant->>API: Authenticate + request recovery
  API->>Enclave: Fetch Share 2
  API->>Walrus: Fetch encrypted Share 3 (blob ID)
  Walrus-->>Seal: Encrypted blob
  Seal->>Seal: Verify merchant identity policy
  Seal-->>Enclave: Decrypted Share 3

  Enclave->>Enclave: Reconstruct key from Share 2 + Share 3
  Enclave->>Enclave: Re-split into new Share 1', Share 2', Share 3'
  Enclave->>Merchant: New Share 1' (encrypted with new device key)
  Enclave->>Enclave: Store Share 2'
  Enclave->>Walrus: Upload new encrypted Share 3'
  Enclave->>Enclave: Zeroize old shares
        `}
        caption="Figure 4 — Merchant wallet recovery flow"
      />

      <Callout type="warning">
        During recovery, the full private key exists momentarily inside the secure enclave. This is
        the only context in which reconstruction occurs. The enclave's attestation guarantees that
        no external process can inspect its memory.
      </Callout>

      {/* ── 6. Transaction Wallet Architecture ── */}
      <SectionHeader number={6} title="Transaction Wallet Architecture" />

      <p>
        Transaction wallets follow a strict lifecycle:{" "}
        <strong>creation → funding → settlement → destruction</strong>. No step is optional.
      </p>

      <Mermaid
        chart={`
sequenceDiagram
  participant Merchant as Merchant App
  participant API as ORAFI API
  participant Enclave as Secure Enclave
  participant Walrus as Walrus Storage
  participant Customer as Customer
  participant Sui as Sui Blockchain

  Merchant->>API: POST /payments (amount, currency)
  API->>Enclave: Generate ephemeral keypair

  Note over Enclave: Generate Ed25519 keypair<br/>Split into Share A + Share B

  Enclave->>Enclave: Retain Share A (memory only)
  Enclave->>Walrus: Encrypt + store Share B
  Enclave-->>API: Return wallet address + payment ID

  API-->>Merchant: Payment link / address
  Merchant-->>Customer: Share payment link

  Customer->>Sui: Send funds to ephemeral address
  Sui-->>API: Webhook / event: funds received

  API->>Enclave: Request settlement signing
  Enclave->>Walrus: Retrieve + decrypt Share B
  Enclave->>Enclave: Reconstruct key (A ⊕ B)
  Enclave->>Sui: Sign + broadcast transfer to merchant wallet
  Enclave->>Enclave: Zeroize key + Share A

  API->>Walrus: Delete Share B blob
  API->>API: Tombstone DB record
  Note over Enclave,Walrus: Wallet destroyed — no recoverable state
        `}
        caption="Figure 5 — Complete ephemeral transaction wallet lifecycle"
      />

      <p>
        The critical property: after the settlement transaction is broadcast, <em>all three
        representations of the key</em> (Share A in enclave memory, Share B in Walrus, and the
        momentarily reconstructed full key) are destroyed. The wallet address still exists on-chain
        as a historical artifact, but no entity can sign transactions from it.
      </p>

      {/* ── 7. MPC Key Splitting ── */}
      <SectionHeader number={7} title="MPC Key Splitting" />

      <p>
        For our initial implementation, we use XOR-based secret sharing. This is a simple,
        information-theoretically secure scheme: given <IC>n</IC> shares produced by XOR,
        knowledge of <IC>n-1</IC> shares reveals <em>zero information</em> about the secret.
      </p>
      <p>
        Below is a simplified demonstration of the 2-share splitting used for transaction wallets.
        In production, this code runs inside the secure enclave — not on a general-purpose
        application server.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Ed25519 keypair generation</h3>

      <CodeBlock language="typescript" filename="keygen.ts">
{`import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { randomBytes } from "crypto";

/**
 * Generate an Ed25519 keypair for a new ephemeral wallet.
 * In production this runs inside a TEE (Trusted Execution Environment).
 */
function generateEphemeralKeypair() {
  const keypair = Ed25519Keypair.generate();
  const secretKey = keypair.getSecretKey();   // 32-byte Uint8Array
  const publicKey = keypair.getPublicKey();

  return { secretKey, publicKey, address: keypair.toSuiAddress() };
}`}
      </CodeBlock>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">XOR key splitting</h3>

      <CodeBlock language="typescript" filename="split.ts">
{`import { randomBytes } from "crypto";

/**
 * Split a 32-byte secret into two shares using XOR.
 *
 * share_a = random 32 bytes
 * share_b = secret XOR share_a
 *
 * Reconstruction: secret = share_a XOR share_b
 *
 * This is information-theoretically secure:
 * knowing only share_a reveals nothing about the secret.
 */
function splitKey(secret: Uint8Array): {
  shareA: Uint8Array;
  shareB: Uint8Array;
} {
  if (secret.length !== 32) throw new Error("Expected 32-byte key");

  const shareA = new Uint8Array(randomBytes(32));
  const shareB = new Uint8Array(32);

  for (let i = 0; i < 32; i++) {
    shareB[i] = secret[i] ^ shareA[i];
  }

  // Zeroize the original secret from this scope
  secret.fill(0);

  return { shareA, shareB };
}

/**
 * For 3-share splitting (merchant wallets):
 * share_a = random(32)
 * share_b = random(32)
 * share_c = secret XOR share_a XOR share_b
 *
 * Any 2 of 3 shares cannot reconstruct the secret.
 * All 3 are needed — or we use a 2-of-3 threshold scheme.
 */
function splitKeyThreeWay(secret: Uint8Array): {
  shareA: Uint8Array;
  shareB: Uint8Array;
  shareC: Uint8Array;
} {
  if (secret.length !== 32) throw new Error("Expected 32-byte key");

  const shareA = new Uint8Array(randomBytes(32));
  const shareB = new Uint8Array(randomBytes(32));
  const shareC = new Uint8Array(32);

  for (let i = 0; i < 32; i++) {
    shareC[i] = secret[i] ^ shareA[i] ^ shareB[i];
  }

  secret.fill(0);

  return { shareA, shareB, shareC };
}`}
      </CodeBlock>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Key reconstruction</h3>

      <CodeBlock language="typescript" filename="reconstruct.ts">
{`/**
 * Reconstruct the key from two shares (transaction wallets).
 */
function reconstructKey(shareA: Uint8Array, shareB: Uint8Array): Uint8Array {
  if (shareA.length !== 32 || shareB.length !== 32) {
    throw new Error("Shares must be 32 bytes");
  }

  const secret = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    secret[i] = shareA[i] ^ shareB[i];
  }

  return secret;
}

/**
 * Reconstruct from three shares (merchant wallets).
 */
function reconstructKeyThreeWay(
  shareA: Uint8Array,
  shareB: Uint8Array,
  shareC: Uint8Array
): Uint8Array {
  const secret = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    secret[i] = shareA[i] ^ shareB[i] ^ shareC[i];
  }
  return secret;
}`}
      </CodeBlock>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Signing a transaction</h3>

      <CodeBlock language="typescript" filename="sign.ts">
{`import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";

/**
 * Reconstruct the key inside the enclave,
 * sign a settlement transaction, then zeroize.
 */
async function signSettlement(
  shareA: Uint8Array,
  shareB: Uint8Array,
  merchantAddress: string,
  amount: bigint
) {
  // 1. Reconstruct key
  const secret = reconstructKey(shareA, shareB);

  // 2. Reconstitute the keypair
  const keypair = Ed25519Keypair.fromSecretKey(secret);

  // 3. Immediately zeroize the raw secret
  secret.fill(0);

  // 4. Build the transaction
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [amount]);
  tx.transferObjects([coin], merchantAddress);

  // 5. Sign and execute
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  // 6. The keypair object is now eligible for GC.
  // In the enclave, we also explicitly scrub the signer memory.

  return result;
}`}
      </CodeBlock>

      <Callout type="info">
        In production, the signing code runs inside a Nautilus TEE. The code snippets above are
        simplified for clarity. The real implementation includes additional safeguards: nonce
        verification, gas estimation, retry logic, and transaction finality checks.
      </Callout>

      {/* ── 8. Secure Storage with Walrus and Seal ── */}
      <SectionHeader number={8} title="Secure Storage with Walrus and Seal" />

      <p>
        Walrus is a decentralized storage protocol in the Sui ecosystem. We use it to store
        encrypted key shares off-chain, ensuring that no single infrastructure provider holds the
        data. Seal is an encryption framework that provides <strong>policy-based envelope
        encryption</strong>: data is encrypted with a symmetric key, and access to that key is
        gated by an on-chain policy (e.g., "only the merchant with this Sui address can decrypt").
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Encryption workflow</h3>

      <Mermaid
        chart={`
flowchart LR
  Share["Key Share<br/>(plaintext)"]
  Seal["Seal Encryption<br/>(AES-256-GCM)"]
  Blob["Encrypted Blob"]
  Walrus["Walrus Network<br/>(decentralized)"]
  Policy["Access Policy<br/>(on-chain)"]

  Share -->|"encrypt"| Seal
  Policy -->|"bind policy"| Seal
  Seal -->|"upload"| Blob
  Blob -->|"store"| Walrus
        `}
        caption="Figure 6 — Envelope encryption flow: plaintext share → Seal encryption → Walrus storage"
      />

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Storage benefits</h3>
      <ul>
        <li>
          <strong>No single point of failure.</strong> Walrus distributes data across multiple
          storage nodes using erasure coding. Even if several nodes go offline, the blob remains
          retrievable.
        </li>
        <li>
          <strong>Policy-gated decryption.</strong> Seal's access policies are enforced by
          on-chain smart contracts. The decryption key is only released if the requester satisfies
          the policy (e.g., holds the correct Sui address, passes a time-lock, etc.).
        </li>
        <li>
          <strong>Immutability.</strong> Once stored, a Walrus blob is content-addressed and
          immutable. This provides an audit trail — we can prove when a share was stored and
          verify it hasn't been tampered with.
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Retrieval and decryption</h3>

      <Mermaid
        chart={`
sequenceDiagram
  participant Enclave as Secure Enclave
  participant API as ORAFI API
  participant Walrus as Walrus Network
  participant Seal as Seal Decryption

  Enclave->>API: Request Share B (blob ID)
  API->>Walrus: Fetch blob by ID
  Walrus-->>API: Encrypted blob
  API->>Seal: Decrypt with enclave attestation
  Seal->>Seal: Verify policy (enclave identity)
  Seal-->>Enclave: Decrypted Share B
  Note over Enclave: Share B now in enclave memory
        `}
        caption="Figure 7 — Share retrieval and decryption flow"
      />

      {/* ── 9. Signing Infrastructure ── */}
      <SectionHeader number={9} title="Signing Infrastructure" />

      <p>
        The signing infrastructure is the most security-critical component. It is the only place
        where a full private key is ever reconstructed, and it runs exclusively inside a secure
        enclave.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Architecture</h3>
      <p>
        The signing service is built on Nautilus, a framework for deploying smart-contract-like
        logic inside Trusted Execution Environments (TEEs). The enclave provides:
      </p>
      <ul>
        <li><strong>Memory isolation.</strong> The enclave's memory is encrypted by the CPU. Not even the host OS can read it.</li>
        <li><strong>Attestation.</strong> Remote parties can verify that the enclave is running the expected code, on genuine hardware, with no modifications.</li>
        <li><strong>Sealed storage.</strong> Data can be encrypted to a specific enclave identity, so it can only be decrypted by the same enclave (or a verified successor).</li>
      </ul>

      <Mermaid
        chart={`
sequenceDiagram
  participant Client as ORAFI API
  participant Gateway as Enclave Gateway
  participant Enclave as Secure Enclave (TEE)
  participant Sui as Sui RPC

  Client->>Gateway: Sign request (payment ID, shares metadata)
  Gateway->>Gateway: Validate request, rate-limit, audit log

  Gateway->>Enclave: Forward sign request
  Enclave->>Enclave: Retrieve Share A (sealed storage)
  Enclave->>Enclave: Decrypt Share B (from Walrus via Seal)
  Enclave->>Enclave: Reconstruct key = A ⊕ B
  Enclave->>Enclave: Sign transaction bytes
  Enclave->>Enclave: Zeroize key + shares

  Enclave-->>Gateway: Signed transaction bytes
  Gateway->>Sui: Broadcast transaction
  Sui-->>Client: Transaction digest
        `}
        caption="Figure 8 — Signing request flow through the enclave"
      />

      <p>
        Notice that the ORAFI API never sees the signed transaction bytes in a way that would
        allow replay. The gateway broadcasts directly to the Sui RPC endpoint. The API receives
        only the transaction digest (hash) as confirmation.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Rate limiting and audit</h3>
      <p>
        Every signing request passes through an audit layer that logs the payment ID, timestamp,
        requesting service identity, and result status. The audit log is append-only and stored
        separately from the signing service. The gateway also enforces rate limits per merchant
        and per payment to prevent abuse even in the event of an API-layer compromise.
      </p>

      {/* ── 10. Ephemeral Key Destruction ── */}
      <SectionHeader number={10} title="Ephemeral Key Destruction" />

      <p>
        Destruction is not optional — it is a first-class operation in the transaction lifecycle.
        After a settlement transaction is confirmed on-chain, the system executes a deterministic
        cleanup sequence:
      </p>

      <ol>
        <li>
          <strong>Memory wiping.</strong> Share A is overwritten with random bytes, then zeroed, in
          enclave memory. The reconstructed full key is also zeroized immediately after signing (it
          typically exists for {"<"}50ms).
        </li>
        <li>
          <strong>Walrus blob deletion.</strong> The encrypted Share B blob is deleted from Walrus.
          Because Walrus uses content-addressed storage, deleting the blob removes the only
          accessible copy of that ciphertext. Even if a storage node retains fragments (erasure
          coding shards), they cannot be reassembled without the blob metadata, and they cannot be
          decrypted without the Seal decryption key (which is also revoked).
        </li>
        <li>
          <strong>Database cleanup.</strong> The payment record in PostgreSQL is updated:
          <ul>
            <li>Wallet address field is retained (for audit/history)</li>
            <li>Blob ID is set to <IC>NULL</IC></li>
            <li>A <IC>destroyed_at</IC> timestamp is written</li>
            <li>The record's <IC>status</IC> transitions to <IC>SETTLED</IC></li>
          </ul>
        </li>
        <li>
          <strong>Expiry mechanisms.</strong> As a safety net, a background worker runs every 5
          minutes and identifies ephemeral wallets that are older than their maximum TTL (default:
          30 minutes) but have not yet been destroyed. These are force-destroyed regardless of
          settlement status. If funds were never received, they remain on-chain in the ephemeral
          address — but no entity can access them since the key is gone.
        </li>
      </ol>

      <Callout type="danger">
        The expiry mechanism is a deliberate trade-off. If a customer sends funds after the TTL,
        those funds are effectively burned. We mitigate this with clear expiry timestamps in the
        payment UI and by monitoring the on-chain address for late deposits (triggering a manual
        recovery flow involving threshold re-signing with the security team — a process that
        requires HSM-backed approvals and is intentionally high-friction).
      </Callout>

      {/* ── 11. Security Threat Analysis ── */}
      <SectionHeader number={11} title="Security Threat Analysis" />

      <p>
        We designed this architecture against a specific threat model. Here we enumerate the
        primary attack vectors and explain why they are mitigated.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T1: Database compromise</h3>
      <p>
        <strong>Scenario:</strong> An attacker gains read access to the PostgreSQL database.
      </p>
      <p>
        <strong>Impact:</strong> None. The database stores blob IDs (pointers to Walrus), wallet
        addresses (public), and payment metadata. No key shares or encrypted key material are
        stored in the database. The blob ID alone is useless without the Seal decryption key and
        the access policy.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T2: Insider engineer access</h3>
      <p>
        <strong>Scenario:</strong> A malicious or compromised engineer with production access
        attempts to extract private keys.
      </p>
      <p>
        <strong>Impact:</strong> None. Key shares are never present on general-purpose compute.
        Share A lives only in enclave memory (encrypted by the CPU). Share B lives in Walrus
        (encrypted by Seal). The engineer would need to compromise the enclave's TEE, which
        requires a hardware-level attack. Even with root access to the host machine, the enclave
        memory is opaque.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T3: Walrus storage leak</h3>
      <p>
        <strong>Scenario:</strong> An attacker gains access to raw Walrus storage blobs.
      </p>
      <p>
        <strong>Impact:</strong> None. All shares stored in Walrus are encrypted with Seal. The
        decryption key is gated by an on-chain access policy. Even with the raw ciphertext, the
        attacker cannot decrypt it without satisfying the policy, which requires either the
        merchant's authenticated identity (for merchant wallets) or the enclave's attestation
        (for transaction wallets).
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">T4: Enclave / node compromise</h3>
      <p>
        <strong>Scenario:</strong> An attacker compromises the host running the enclave.
      </p>
      <p>
        <strong>Impact:</strong> Limited. The enclave's memory is hardware-encrypted. The
        attacker could potentially disrupt availability (denial of service) but cannot read
        enclave memory. If they tamper with the enclave binary, attestation will fail, and Seal
        will refuse to release decryption keys. The blast radius is limited to availability, not
        confidentiality.
      </p>

      <div className="my-8 overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Threat</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Data at risk</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Mitigated by</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 border-b border-slate-200">Residual risk</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">DB compromise</td>
              <td className="px-4 py-3 text-slate-700">Blob IDs, metadata</td>
              <td className="px-4 py-3 text-slate-700">No key material in DB</td>
              <td className="px-4 py-3 text-slate-700">Metadata leaks (addresses, amounts)</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Insider access</td>
              <td className="px-4 py-3 text-slate-700">Application code, configs</td>
              <td className="px-4 py-3 text-slate-700">TEE memory isolation</td>
              <td className="px-4 py-3 text-slate-700">Social engineering of merchant</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">Walrus leak</td>
              <td className="px-4 py-3 text-slate-700">Encrypted blobs</td>
              <td className="px-4 py-3 text-slate-700">Seal policy-gated encryption</td>
              <td className="px-4 py-3 text-slate-700">None (ciphertext only)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-700">Node compromise</td>
              <td className="px-4 py-3 text-slate-700">Host-level access</td>
              <td className="px-4 py-3 text-slate-700">Hardware-encrypted enclave memory</td>
              <td className="px-4 py-3 text-slate-700">Availability (DoS)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 12. Multichain Expansion ── */}
      <SectionHeader number={12} title="Multichain Expansion" />

      <p>
        ORAFI launched on Sui, but the key management architecture was designed to support
        multiple blockchains from day one. The core insight: <strong>key management is
        chain-agnostic; transaction construction and signing are chain-specific</strong>.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Chain abstraction layer</h3>
      <p>
        The system separates key management (share generation, splitting, storage, reconstruction)
        from chain-specific operations (address derivation, transaction building, signing, and
        broadcasting). This separation is enforced at the code level through a chain adapter
        interface:
      </p>

      <CodeBlock language="typescript" filename="chain-adapter.ts">
{`interface ChainAdapter {
  /** Derive a chain-specific address from a public key */
  deriveAddress(publicKey: Uint8Array): string;

  /** Build an unsigned transaction for a settlement transfer */
  buildSettlementTx(params: {
    fromAddress: string;
    toAddress: string;
    amount: bigint;
    token?: string;
  }): Promise<Uint8Array>; // unsigned tx bytes

  /** Sign transaction bytes with a raw Ed25519 private key */
  signTransaction(
    txBytes: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array>; // signed tx bytes

  /** Broadcast signed transaction to the network */
  broadcast(signedTx: Uint8Array): Promise<{ txHash: string }>;
}

// Implementations
class SuiAdapter implements ChainAdapter { /* ... */ }
class SolanaAdapter implements ChainAdapter { /* ... */ }
class AptosAdapter implements ChainAdapter { /* ... */ }
class EthereumAdapter implements ChainAdapter { /* ... */ }`}
      </CodeBlock>

      <Mermaid
        chart={`
flowchart TB
  Core["ORAFI Key Management Core<br/>(MPC, Shares, Enclave)"]

  SuiA["Sui Adapter"]
  SolA["Solana Adapter"]
  AptA["Aptos Adapter"]
  EthA["Ethereum Adapter<br/>(secp256k1 bridge)"]

  SuiC["Sui Network"]
  SolC["Solana Network"]
  AptC["Aptos Network"]
  EthC["Ethereum Network"]

  Core --> SuiA --> SuiC
  Core --> SolA --> SolC
  Core --> AptA --> AptC
  Core --> EthA --> EthC
        `}
        caption="Figure 9 — Multichain architecture: core key management with chain-specific adapters"
      />

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Chain-specific considerations</h3>

      <p><strong>Sui and Move-based chains (Aptos, Movement).</strong> Ed25519 is natively supported.
        The same keypair can be used directly. Address derivation differs between Sui and Aptos
        (Sui uses a BLAKE2b hash, Aptos uses SHA3-256), but the underlying key material is
        compatible.
      </p>

      <p><strong>Solana.</strong> Also uses Ed25519 natively. The Solana address <em>is</em> the
        public key (base58-encoded). Transaction formats differ significantly, but the signing
        primitive is identical.
      </p>

      <p><strong>Ethereum.</strong> Uses secp256k1, not Ed25519. Supporting Ethereum requires
        either: (a) maintaining a separate secp256k1 key management path, or (b) using a
        bridge layer like deterministic key derivation from a master seed that can produce both
        Ed25519 and secp256k1 keys. We're evaluating both approaches. The MPC share architecture
        remains the same — only the key generation and signing primitives change.
      </p>

      {/* ── 13. Future Improvements ── */}
      <SectionHeader number={13} title="Future Improvements" />

      <p>
        The architecture described here is our production system as of Q1 2026. We are actively
        working on several improvements:
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Threshold signing (FROST)</h3>
      <p>
        Our current XOR-based splitting requires reconstructing the full private key in a single
        location (the enclave) before signing. <strong>FROST (Flexible Round-Optimized Schnorr
        Threshold Signatures)</strong> enables <em>threshold signing without ever reconstructing
        the key</em>. Each share holder computes a partial signature, and the partial signatures
        are combined into a valid Ed25519 signature. This eliminates the brief window where the
        full key exists in enclave memory.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Hardware enclaves (HSM integration)</h3>
      <p>
        While TEEs provide strong isolation, they are still software-managed. Hardware Security
        Modules (HSMs) offer tamper-resistant, FIPS 140-2 Level 3+ certified key storage. We plan
        to offer HSM-backed signing as an option for enterprise merchants who require compliance
        certifications.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Distributed signing nodes</h3>
      <p>
        Currently, our signing infrastructure runs in a single enclave (with hot standby). Future
        iterations will distribute signing across multiple geographically separated enclave nodes.
        This improves availability and further reduces the blast radius of any single-node
        compromise.
      </p>

      <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Decentralized custody</h3>
      <p>
        The long-term vision is to move toward a fully decentralized custody model where ORAFI
        acts as a coordinator rather than a custodian. Merchants would hold their own signing
        shares (or delegate to a custody provider of their choice), and the ORAFI protocol
        would orchestrate multi-party signing without any single entity holding enough shares to
        unilaterally move funds.
      </p>

      {/* ── 14. Conclusion ── */}
      <SectionHeader number={14} title="Conclusion" />

      <p>
        Key management is the load-bearing wall of any blockchain payment system. Get it wrong,
        and no amount of smart contract auditing or frontend polish matters — an attacker with
        your private key <em>is</em> you.
      </p>
      <p>
        The ORAFI key management infrastructure is designed around a simple principle:{" "}
        <strong>no single system, person, or process should ever hold a complete private
        key</strong>. We enforce this through MPC key splitting, ephemeral transaction wallets,
        secure enclaves, and decentralized storage.
      </p>
      <p>
        Merchant wallets use a 3-share model for durability and recovery. Transaction wallets use
        a 2-share model for simplicity and speed, with mandatory destruction after settlement.
        The architecture is multichain-ready, with a clean separation between key management and
        chain-specific operations.
      </p>
      <p>
        There is no silver bullet in key management. Every design is a set of trade-offs:
        security vs. usability, decentralization vs. performance, recovery vs. minimizing custody.
        What we've described here is a system that makes deliberate trade-offs, documents them, and
        builds in defense-in-depth so that no single failure leads to catastrophic loss.
      </p>
      <p>
        We'll continue publishing technical deep-dives as the infrastructure evolves. If you're
        building on Sui or working on crypto payment infrastructure, we'd love to hear from you.
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
