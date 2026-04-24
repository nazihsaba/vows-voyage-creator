## Add Promo Code to Publish Event Payment

### Promo codes (case-insensitive)
- `A-HOST` → 40% off → final price **$60 USD**
- `NK-20` → 20% off → final price **$80 USD**
- No code → **$100 USD** (current behavior unchanged)

### 1. Update payment dialog UI (`src/pages/MyEvents.tsx`)

In the dialog (around line 614-625), add a promo code input section with:
- An input field labeled "Promo code (optional)" + an "Apply" button next to it
- On apply: validate against the two known codes locally (for instant UX feedback) and show the discounted price in the breakdown
- Show updated price breakdown:
  - `Publishing fee` → `$100 USD`
  - `Discount (A-HOST -40%)` → `-$40 USD` (only if applied, in green)
  - `Total` → final price (bold)
- "Remove" button next to an applied code to clear it
- Inline error message if code is invalid ("Invalid promo code")

State to add:
- `promoCode` (string — input value)
- `appliedPromo` ({ code: string; discountPercent: number } | null)
- `promoError` (string | null)

### 2. Update `handlePaymentProceed`

Send `promoCode` in the request body to the edge function. The amount/invoice are computed server-side based on the validated code (do not trust client-computed amounts).

```ts
body: {
  weddingId: publishingWeddingId,
  currency: "USD",
  promoCode: appliedPromo?.code ?? null,
}
```

### 3. Update `whish-pay-collect` edge function (`supabase/functions/whish-pay-collect/index.ts`)

This is the security-critical part — the discount must be enforced server-side so users can't tamper with the price client-side.

- Define a server-side promo table:
  ```ts
  const PROMO_CODES: Record<string, number> = {
    "A-HOST": 40,
    "NK-20": 20,
  };
  const BASE_PUBLISH_FEE = 100;
  ```
- Replace the client-supplied `amount` for `type === "publish"` with a computed value:
  - Read `promoCode` from request body (uppercased, trimmed)
  - If present and valid → `amount = BASE_PUBLISH_FEE * (1 - discount/100)`
  - If present and invalid → return 400 "Invalid promo code"
  - If absent → `amount = BASE_PUBLISH_FEE`
- Update the invoice string to mention the promo (e.g. `Event publishing fee for X & Y (promo A-HOST -40%)`)
- Keep the `venue` payment type behavior unchanged — it still uses the client-supplied amount

### Technical notes
- Promo validation happens in two places: client-side for UX feedback, server-side for security. The server is the source of truth.
- Codes are matched case-insensitively (uppercased before comparison) so users can type `a-host` or `A-Host`.
- No new database table — promo codes are hardcoded since there are only two.
- No tracking of promo usage is added (not requested). Can be added later via a `promo_code` column on `weddings` if needed.
