---
name: wire-a-new-payment-provider
description: >
 [Scope: builders-stack monorepo — payment provider integrations behind the @geo/payment adapter]
 Add or swap a payment provider (Stripe, Paddle, Lemon Squeezy, …) alongside or in place of the default Creem adapter by writing a new implementation of the PaymentProvider interface: the impl file, webhook signature verification, env config, an env-flag factory, and keeping the checkout contract (Bruno collection) stable. The whole point of the adapter: apps and the API never change — only the adapter implementation does.
 Use for: replacing Creem with another provider, supporting a second provider (e.g. Creem as Merchant-of-Record + Stripe for a region), adding a provider implementation.
 Not for: checkout copy or button changes (app-side, touches no payment code), general service scaffolding (use add-a-service), storing payment data models (design-a-schema).
 Activate: "add Stripe", "swap payment provider", "integrate Paddle/Lemon Squeezy", "second payment provider", "payment webhook verification".
---

# Wire a new payment provider

Payments in this repo go through **one adapter interface** in `@geo/payment`. Apps and `@geo/api` call the interface, never a provider SDK. Swapping or adding a provider means writing a new implementation of that interface — nothing upstream changes. That's the entire reason the adapter exists.

## Critical Rules

- **The invariant:**

  ```
  apps/web ──▶ @geo/api  /checkout ──▶ @geo/payment (interface) ──▶ <provider impl>
                                              ▲ everything left of here NEVER changes
  ```

  If your change edits an app or an API route to call a provider SDK directly, stop — you've broken the adapter. Route it through the interface.
- **Never trust an unverified webhook body** — verify the provider's signature and throw on mismatch. This is a trust boundary; do not simplify it away.
- **Keep the provider SDK import confined to the impl file.** Callers see the normalized `PaymentEvent` type only.
- **The Bruno request `api-collection/payment/checkout.bru` must pass unchanged** — that's the contract test.

## Core Instructions

### The interface (shape to conform to)

`@geo/payment` exposes a single door. Every provider implements the same contract:

```ts
export interface PaymentProvider {
  createCheckout(input: {
    priceId: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ checkoutUrl: string; sessionId: string }>;

  // Verify the signature, then return a normalized event. Throw on bad signature.
  verifyWebhook(rawBody: string, signature: string): Promise<PaymentEvent>;
}

export type PaymentEvent =
  | {
      type: "checkout.completed";
      sessionId: string;
      customerEmail?: string;
      metadata?: Record<string, string>;
    }
  | { type: "subscription.updated"; customerId: string; status: string }
  | { type: "unknown"; raw: unknown };
```

### Steps

1. **Add the impl** in `services/payment/src/providers/<provider>.ts`, implementing `PaymentProvider`. Keep the provider SDK import confined to this file.

2. **Config, not hardcoding.** Read keys/secrets from env. Add them to `.env.example` with empty values and a comment:

   ```
   # services/payment — <Provider>
   <PROVIDER>_API_KEY=
   <PROVIDER>_WEBHOOK_SECRET=
   ```

3. **Verify webhook signatures** in `verifyWebhook` using the provider's documented scheme and `<PROVIDER>_WEBHOOK_SECRET`.

4. **Select the provider** in one place (a factory reading an env flag like `PAYMENT_PROVIDER=creem|stripe`), so switching is a config change, not a code change.

5. **Keep the routes stable.** `POST /checkout` returns `{ checkoutUrl }`; the webhook route calls `verifyWebhook` then handles the normalized `PaymentEvent`.

6. **Normalize, don't leak.** Map provider-specific payloads into `PaymentEvent` inside the adapter.

### Verify

- `bun run typecheck` passes.
- `POST /checkout` (via `api-collection/payment/checkout.bru`) returns a `checkoutUrl` unchanged from before.
- A tampered webhook body is rejected by `verifyWebhook` (bad-signature path throws). Add one small assertion/test for that path — it's a money/security boundary.

## Examples

- User: "Add Stripe for EU customers alongside Creem."
  Output: New `providers/stripe.ts` implementing the interface, env keys in `.env.example`, factory selects by flag/region — no app or API route changes; checkout.bru still green.
- User: "The checkout button should say 'Subscribe'."
  Output: App-side copy change — touches no payment code; not this skill.

## Boundaries

- In scope: provider implementations behind `@geo/payment`, webhook verification, provider selection, contract stability.
- Out of scope: checkout UI (apps), new services (add-a-service), payment data schema (design-a-schema).
- When unclear: if the diff touches anything left of the interface in the invariant diagram, the approach is wrong.
