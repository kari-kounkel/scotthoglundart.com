# Trading Post → Printify + Stripe (own-stack checkout)

The fun Trading Post stays on scotthoglundart.com. Payment runs through
Stripe; fulfilment runs through Printify. Two edge functions do the work:

- **store-checkout** — builds a Stripe Checkout Session from real DB prices.
- **store-webhook** — on payment, submits the order to Printify (auto print + ship).

> Status: written to spec, **not yet live-tested** — needs the accounts below.

## One-time setup

### 1. Printify
1. Create a Printify account, connect it to an "API" store (Printify → Manage stores → Add → API).
2. Upload Scott's art and create products (postcard / poster / print). Publish them.
3. Get the **Personal Access Token**: Printify → My Account → Connections → Generate token.
4. Note the **Shop ID** (numeric) — `GET https://api.printify.com/v1/shops.json` returns it.
5. For each product, copy its **product id** + the **variant id** you're selling, and paste
   them into that product in Scott's `/admin` → Trading Post form.

### 2. Stripe
1. Create a Stripe account (live mode) for Scott; grab the **Secret key** (`sk_live_…`).
2. (Optional) Create a coupon `DAISY10` = 10% off, so the acorn-hunt reward works.

### 3. Secrets + deploy
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SITE_URL=https://scotthoglundart.com
supabase secrets set PRINTIFY_API_TOKEN=...
supabase secrets set PRINTIFY_SHOP_ID=...
supabase functions deploy store-checkout
supabase functions deploy store-webhook --no-verify-jwt   # Stripe can't send a Supabase JWT
```
Then in Stripe → Developers → Webhooks, add an endpoint to the deployed
`store-webhook` URL for event `checkout.session.completed`, copy its signing
secret, and:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Flip the site to Stripe checkout
Once the above works, the Trading Post cart's "Place order" swaps from
order-capture to calling `store-checkout` and redirecting to Stripe. (Small
frontend change — done together after a live smoke test.)

## Notes / TODO
- Shipping is a flat $5 for now → refine to Printify's `orders/shipping.json`.
- Live test uses a real card + refund (no sandbox), per Kari's rule.
