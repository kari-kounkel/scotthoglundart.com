// ─────────────────────────────────────────────────────────────
//  store-checkout  —  Daisy's Trading Post → Stripe Checkout
//
//  Client sends a cart of { product_id, qty }.  We load the real
//  prices from the DB (never trust client prices), stash a pending
//  order, and open a Stripe Checkout Session. Stripe collects the
//  shipping address + payment; store-webhook does Printify fulfilment.
//
//  Secrets required (set with `supabase secrets set ...`):
//    STRIPE_SECRET_KEY          sk_live_…
//    SITE_URL                   https://scotthoglundart.com
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//
//  Status: written to spec, NOT yet live-tested (needs Stripe acct).
// ─────────────────────────────────────────────────────────────
import Stripe from 'https://esm.sh/stripe@14?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Flat shipping for now; refine to Printify's shipping.json once live.
const FLAT_SHIPPING_CENTS = 500

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
    const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://scotthoglundart.com'

    const { items } = await req.json() as { items: { product_id: string; qty: number }[] }
    if (!items?.length) return json({ error: 'Empty cart' }, 400)

    // Load the real products (trusted prices + Printify mapping).
    const ids = items.map(i => i.product_id)
    const { data: products, error } = await supa.from('products').select('*').in('id', ids).eq('is_active', true)
    if (error) throw error

    const lineItems = []
    const snapshot = []
    for (const it of items) {
      const p = products?.find(x => x.id === it.product_id)
      if (!p) continue
      const qty = Math.max(1, Math.min(20, it.qty | 0))
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: 'usd',
          unit_amount: p.price_cents,
          product_data: { name: p.title, ...(p.image_path ? {} : {}) },
        },
      })
      snapshot.push({
        product_id: p.id, title: p.title, kind: p.kind, price_cents: p.price_cents, qty,
        printify_product_id: p.printify_product_id, printify_variant_id: p.printify_variant_id,
      })
    }
    if (!lineItems.length) return json({ error: 'No valid items' }, 400)

    const subtotal = snapshot.reduce((s, i) => s + i.price_cents * i.qty, 0)

    // Stash a pending order; only its id travels through Stripe metadata.
    const { data: order, error: oErr } = await supa.from('orders').insert({
      buyer_name: 'pending', buyer_email: 'pending',
      items: snapshot, subtotal_cents: subtotal, shipping_cents: FLAT_SHIPPING_CENTS, status: 'pending',
    }).select('id').single()
    if (oErr) throw oErr

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency: 'usd' },
          display_name: 'Standard shipping',
        },
      }],
      allow_promotion_codes: true,   // lets DAISY10 (created in Stripe) work
      metadata: { order_id: order.id },
      success_url: `${siteUrl}/?order=success`,
      cancel_url: `${siteUrl}/#trading-post`,
    })

    await supa.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)
    return json({ url: session.url })
  } catch (e) {
    console.error(e)
    return json({ error: String(e?.message ?? e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}
