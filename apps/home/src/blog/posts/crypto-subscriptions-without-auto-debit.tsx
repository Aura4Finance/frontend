import type { BlogPost } from "../types";

const meta: BlogPost = {
  slug: "crypto-subscriptions-without-auto-debit",
  title: "How OraFi Handles Subscriptions Without Charging Your Wallet Directly",
  description:
    "A clear look at OraFi's crypto subscription lifecycle: plans, trial handling, checkout links, renewal reminders, grace periods, and webhook events.",
  date: "2026-05-23",
  author: "ORAFI Engineering",
  authorRole: "Payments Infrastructure",
  readingTime: "10 min read",
  tags: [
    "subscriptions",
    "crypto payments",
    "checkout",
    "billing",
    "webhooks",
    "merchant infrastructure",
  ],
  coverLabel: "Subscriptions Deep Dive",
  content: Content,
};

export default meta;

function Content() {
  return (
    <article className="prose-custom">

      <p className="lede">
        Recurring billing is table stakes for SaaS products. But crypto wallets don't work
        like credit cards, you can't silently debit a wallet every month. Here's how OraFi
        solves that without sacrificing the subscription experience merchants and customers
        expect.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Why crypto subscriptions are different</h2>

      <p>
        Traditional subscription billing relies on card rails. A customer stores their card
        details once, and the merchant's payment processor handles renewals silently in the
        background. The cardholder barely notices, money leaves their account on a schedule
        they agreed to, without any additional action required.
      </p>

      <p>
        Crypto wallets have a fundamentally different trust model. Every transaction requires
        explicit approval from the wallet owner. There is no mechanism for a platform to
        initiate a debit on behalf of a user without that user actively signing and submitting
        the transaction. This is a feature of the technology, not a limitation, and it means
        the entire mental model for subscriptions has to change.
      </p>

      <p>
        Rather than fighting this constraint, OraFi leans into it. Subscriptions on OraFi are
        built around <strong>state, reminders, and checkout links</strong>, not automatic
        debits. The platform orchestrates the billing lifecycle so that merchants get the
        predictability they need, while customers retain full control over wallet approvals.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Plans: the source of truth for billing behavior</h2>

      <p>
        Everything starts with a plan. A plan defines the contract for a recurring billing
        relationship: what's billed, how much, and how often. When a merchant creates a plan,
        they specify a name, cycle duration, amount, currency, and an optional trial period.
      </p>

      <p>
        A plan's billing parameters persist across both live and test modes. This means
        engineering teams can build and verify their integration against the exact same plan
        structure that will go live in production. There's no need to maintain separate billing
        configurations per environment.
      </p>

      <p>
        Think of a plan as a reusable template: create it once, attach subscriptions to it,
        and all billing behavior flows deterministically from those parameters. When a plan
        includes trial days, the billing lifecycle starts differently, more on that below.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">The subscription lifecycle</h2>

      <p>
        Once a subscription is created against a plan, it moves through a well-defined set of
        states. Each transition is triggered either by a completed payment or a time based
        deadline, nothing is ambiguous, and merchants always know exactly where a subscription
        stands.
      </p>

      <h3 className="font-bold text-[#2563eb]">No trial path: Pending to Active or Abandoned</h3>

      <p>
        If the selected plan has no trial days, OraFi generates a checkout URL immediately and
        returns it at creation time. The subscription enters a <strong>PENDING</strong> state
        while awaiting the customer's first payment. Once that payment is confirmed, the
        subscription moves to <strong>ACTIVE</strong>. If the customer does not complete
        checkout within the allowed window, the subscription transitions
        to <strong>ABANDONED</strong>.
      </p>

      <h3 className="font-bold text-[#2563eb]">Trial path: Trailing to Active or Abandoned</h3>

      <p>
        When a plan includes trial days, no checkout is created at subscription creation.
        Instead, the subscription enters a <strong>TRAILING</strong> state for the duration of
        the trial. A background scheduler tracks trial expiration windows and dispatches
        reminder emails, with a checkout link, shortly before the trial ends, giving
        customers the chance to convert before their access is interrupted.
      </p>

      <p>
        This timing is entirely platform managed. Merchants don't need to build their own
        scheduler or calculate trial end dates, OraFi handles it deterministically based on
        the plan's configured trial days.
      </p>

      <h3 className="font-bold text-[#2563eb]">Renewal flow for active subscriptions</h3>

      <p>
        Once a subscription is active, the renewal cycle is driven by timed reminders and
        explicit checkout completion. Three days before the current billing period ends, the
        customer receives an email containing a fresh checkout URL. If they haven't paid by
        the day of expiry, a second reminder goes out. If payment still hasn't been completed
        two days after expiry, the end of the grace period, the customer is notified that
        the subscription will be canceled, and the state transitions accordingly.
      </p>

      <p>
        Every state transition is deterministic. A subscription moves from{" "}
        <strong>Active</strong> to <strong>Not renewing</strong> or{" "}
        <strong>Disabled</strong> based on either a completed payment or an elapsed deadline
        and never based on ambiguous user intent or merchant side polling.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Webhooks: how merchants stay in sync</h2>

      <p>
        Every meaningful state transition emits a webhook event. This is the integration
        surface merchants should treat as the system of record for entitlement decisions,
        not polling an API endpoint for subscription status.
      </p>

      <p>
        When a <code>subscription.active</code> event arrives, grant access. When{" "}
        <code>subscription.disable</code> arrives, revoke it. The events are coarse grained
        enough to map directly to access control logic, but granular enough to support CRM
        updates and analytics pipelines too.
      </p>

      <ul>
        <li>
          <strong>Subscription Created</strong>: <code>subscription.create</code>
          <br />
          Fires immediately after a new subscription is initialized.
        </li>
        <li>
          <strong>Subscription Active</strong>: <code>subscription.active</code>
          <br />
          First payment confirmed. This is the signal to grant product access.
        </li>
        <li>
          <strong>Subscription Abandoned</strong>: <code>subscription.abandonded</code>
          <br />
          First payment not completed within the allowed window.
        </li>
        <li>
          <strong>Subscription Will Not Renew</strong>: <code>subscription.not_renew</code>
          <br />
          Renewal payment not received; grace period has started.
        </li>
        <li>
          <strong>Subscription Disabled</strong>: <code>subscription.disable</code>
          <br />
          Subscription fully canceled. This is the signal to revoke product access.
        </li>
      </ul>

      <p>
        Because webhook delivery is push based, merchants can react to billing events in real
        time without building any polling infrastructure. Connect a webhook endpoint, handle
        the events, and the integration is complete.
      </p>

      <h2 className="font-extrabold text-[#1e3a8a]">Putting it all together</h2>

      <p>
        The design separates two concerns that are often conflated in traditional billing
        systems: <strong>billing state</strong> and <strong>payment execution</strong>.
        Billing state lives in OraFi, maintained by the lifecycle engine, surfaced via
        webhooks. Payment execution happens through checkout links, discrete, user initiated
        transactions that the wallet owner approves explicitly.
      </p>

      <p>
        This separation is what makes crypto subscriptions workable. Customers never feel
        like they've lost control of their wallet. Merchants never have to wonder whether a
        subscription is active or lapsed. And because the entire lifecycle is time driven and
        deterministic, both sides get predictable behavior without needing to trust each
        other's infrastructure.
      </p>

      <p>
        Instead of pretending wallets behave like credit cards, OraFi builds a billing system
        that works with how crypto actually functions, and in the process, ends up with
        something more transparent and auditable than card based subscriptions anyway.
      </p>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          <strong>ORAFI</strong> builds APIs for crypto payments, escrow, and settlement.
          Learn more at{" "}
          <a
            href="https://docs.orafi.app"
            className="text-[#2563eb] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs.orafi.app
          </a>
          .
        </p>
      </div>
    </article>
  );
}