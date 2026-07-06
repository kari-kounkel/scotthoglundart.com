// ─────────────────────────────────────────────────────────────
//  store-webhook  —  Stripe payment confirmed → submit to Printify
//
//  Stripe calls this on `checkout.session.completed`. We verify the
//  signature, read the paid session (incl. the shipping address
//  Stripe collected), mark our order paid, and POST it to Printify
//  so it prints & ships automatically.
//
//  Secrets required:
//    STRIPE_SECRET_KEY          sk_live_…
//    STRIPE_WEBHOOK_SECRET      whsec_…            (from the Stripe webhook)
//    PRINTIFY_API_TOKEN         Printify personal access token
//    PRINTIFY_SHOP_ID           numeric shop id from Printify
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//
//  Note: this function must be deployed with --no-verify-jwt (Stripe
//  can't send a Supabase JWT). Status: written to spec, not yet
//  live-tested (needs Stripe + Printify accounts).
// ─────────────────────────────────────────────────────────────
import Stripe from 'https://esm.sh/stripe@14?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRINTIFY_BASE = 'https://api.printify.com/v1'

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
  const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // 1. Verify the event really came from Stripe.
  let event: Stripe.Event
  try {
    const sig = req.headers.get('stripe-signature')!
    const body = await req.text()
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (e) {
    return new Response(`Bad signature: ${e.message}`, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') return new Response('ignored', { status: 200 })

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.order_id
  if (!orderId) return new Response('no order_id', { status: 200 })

  const { data: order } = await supa.from('orders').select('*').eq('id', orderId).single()
  if (!order) return new Response('order not found', { status: 200 })
  if (order.status !== 'pending') return new Response('already handled', { status: 200 })

  // 2. Record the buyer + mark paid (idempotent-ish).
  const ship = session.shipping_details ?? session.customer_details
  const addr = ship?.address
  const [firstName, ...rest] = (ship?.name ?? 'Customer').split(' ')
  await supa.from('orders').update({
    buyer_name: ship?.name ?? 'Customer',
    buyer_email: session.customer_details?.email ?? 'unknown',
    ship_address: addr ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} ${addr.postal_code}` : null,
    status: 'paid',
  }).eq('id', orderId)

  // 3. Submit to Printify (only line items that have a Printify mapping).
  const token = Deno.env.get('PRINTIFY_API_TOKEN')
  const shopId = Deno.env.get('PRINTIFY_SHOP_ID')
  const printableItems = (order.items ?? []).filter((i: any) => i.printify_product_id && i.printify_variant_id)

  if (token && shopId && printableItems.length && addr) {
    const payload = {
      external_id: order.id,
      label: `Order ${order.ref}`,
      line_items: printableItems.map((i: any) => ({
        product_id: i.printify_product_id,
        variant_id: Number(i.printify_variant_id),
        quantity: i.qty,
      })),
      shipping_method: 1, // 1 = standard
      send_shipping_notification: true,
      address_to: {
        first_name: firstName || 'Customer',
        last_name: rest.join(' ') || '.',
        email: session.customer_details?.email ?? '',
        phone: session.customer_details?.phone ?? '',
        country: addr.country ?? 'US',
        region: addr.state ?? '',
        address1: addr.line1 ?? '',
        address2: addr.line2 ?? '',
        city: addr.city ?? '',
        zip: addr.postal_code ?? '',
      },
    }
    const res = await fetch(`${PRINTIFY_BASE}/shops/${shopId}/orders.json`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const out = await res.json().catch(() => ({}))
    if (res.ok) {
      await supa.from('orders').update({ printify_order_id: String(out.id ?? ''), status: 'shipped' }).eq('id', orderId)
    } else {
      console.error('Printify order failed', res.status, out) // stays 'paid' → Scott fulfils manually
    }
  }

  return new Response('ok', { status: 200 })
})
