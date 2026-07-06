import { useState, useEffect } from 'react'
import { fetchProducts, placeOrder, getImageUrl } from '../lib/supabase'
import { Acorn, DaisyMark, HiddenDaisy } from './Daisy'

/* Daisy's Trading Post — Scott's art turned into things (postcards,
   prints, posters). Cart lives in localStorage; checkout captures a
   real order into Supabase. The hunt coupon auto-applies here. */

const KIND_LABEL = { postcard: 'Postcard', print: 'Print', poster: 'Poster', original: 'Original' }
const money = (cents) => `$${(cents / 100).toFixed(2)}`
const LS_CART = 'daisy.cart'
const COUPON = 'DAISY10'

// Flip to true only once Printify + Stripe are wired and live-tested.
// Until then the shop is a preview (no checkout); commissions are the live path.
const SHOP_LIVE = false

export default function TradingPost() {
  const [products, setProducts] = useState(null)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_CART) || '[]') } catch { return [] }
  })
  const [open, setOpen] = useState(false)        // cart drawer
  const [checking, setChecking] = useState(false) // in checkout form
  const [placed, setPlaced] = useState(null)      // order confirmation
  const [couponOn, setCouponOn] = useState(false)

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]))
    setCouponOn(localStorage.getItem('daisy.coupon') === COUPON)
  }, [])

  useEffect(() => { localStorage.setItem(LS_CART, JSON.stringify(cart)) }, [cart])

  function add(p) {
    setCart(prev => {
      const found = prev.find(i => i.product_id === p.id)
      if (found) return prev.map(i => i.product_id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product_id: p.id, title: p.title, kind: p.kind, price_cents: p.price_cents, image_path: p.image_path, qty: 1 }]
    })
    setOpen(true)
  }
  function setQty(id, qty) {
    setCart(prev => prev.flatMap(i => i.product_id === id ? (qty <= 0 ? [] : [{ ...i, qty }]) : [i]))
  }

  const subtotal = cart.reduce((s, i) => s + i.price_cents * i.qty, 0)
  const discount = couponOn ? Math.round(subtotal * 0.1) : 0
  const total = subtotal - discount
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <section id="trading-post" style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem',
          letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '1rem'
        }}>
          <Acorn size={14} color="var(--terracotta)" /> Daisy’s Trading Post
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 300, marginBottom: '1rem' }}>
          Take a little of it home
        </h2>
        <p style={{ color: 'var(--bark-light)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 1.5rem' }}>
          Scott’s work, turned into things you can keep — postcards, prints, and posters.
          Daisy runs the register (she works for acorns).
        </p>

        {!SHOP_LIVE && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center',
            background: 'var(--warm-cream)', border: '1px solid #e0d8ca', borderRadius: '24px',
            padding: '0.55rem 1.2rem', margin: '0 auto 2.5rem', fontSize: '0.85rem', color: 'var(--bark-light)'
          }}>
            <Acorn size={15} color="var(--clay)" />
            The print shop opens soon — here’s a peek.
            <a href="#commission" style={{ color: 'var(--clay)', fontWeight: 600 }}>Want a piece now? Commission Scott →</a>
          </div>
        )}

        {products === null ? (
          <p style={{ color: 'var(--stone)', fontStyle: 'italic' }}>Daisy is scampering to the shelves…</p>
        ) : products.length === 0 ? (
          <div style={{ background: 'var(--warm-cream)', borderRadius: '6px', padding: '2.5rem', maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <DaisyMark size={64} color="var(--clay)" />
            </div>
            <p style={{ color: 'var(--bark-light)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Daisy is still stocking the Trading Post. Prints and postcards are on the way — in the
              meantime, ask Scott about a specific piece or a commission:
            </p>
            <a href="mailto:scott@scotthoglundart.com" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--clay)' }}>
              scott@scotthoglundart.com
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem', textAlign: 'left'
          }}>
            {products.map(p => (
              <div key={p.id} style={{
                background: 'white', borderRadius: '4px', overflow: 'hidden',
                boxShadow: '0 4px 18px var(--shadow)', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ aspectRatio: '4/3', background: 'var(--warm-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.image_path
                    ? <img src={getImageUrl(p.image_path)} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.8rem' }} />
                    : <DaisyMark size={54} color="var(--sage)" />}
                </div>
                <div style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: 600 }}>
                    {KIND_LABEL[p.kind] || p.kind}
                  </span>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem' }}>{p.title}</div>
                  {p.blurb && <p style={{ fontSize: '0.78rem', color: 'var(--stone)', lineHeight: 1.5 }}>{p.blurb}</p>}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.7rem' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--clay)', fontWeight: 600 }}>{money(p.price_cents)}</span>
                    {SHOP_LIVE ? (
                      <button onClick={() => add(p)} style={addBtn}>
                        <Acorn size={13} color="var(--parchment)" /> Add
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)', border: '1px solid #d4cdc0', borderRadius: '20px', padding: '0.3rem 0.7rem' }}>
                        Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <HiddenDaisy id="trading" note="Adopted doesn’t mean gone. It means it found its forest."
          size={30} style={{ right: '3vw', bottom: '1.5rem' }} />
      </div>

      {/* Floating cart button */}
      {SHOP_LIVE && count > 0 && !open && (
        <button onClick={() => setOpen(true)} style={cartFab}>
          <Acorn size={18} color="var(--parchment)" />
          <span style={{ marginLeft: '0.4rem' }}>{count}</span>
        </button>
      )}

      {/* Cart drawer */}
      {SHOP_LIVE && open && (
        <CartDrawer
          cart={cart} setQty={setQty} money={money}
          subtotal={subtotal} discount={discount} total={total} couponOn={couponOn}
          checking={checking} setChecking={setChecking} placed={placed}
          onClose={() => { setOpen(false); setChecking(false); if (placed) { setPlaced(null); setCart([]) } }}
          onPlace={async (buyer) => {
            await placeOrder({
              buyer_name: buyer.name, buyer_email: buyer.email,
              ship_address: buyer.address, note: buyer.note,
              items: cart, subtotal_cents: total
            })
            setPlaced({ name: buyer.name })
          }}
        />
      )}
    </section>
  )
}

function CartDrawer({ cart, setQty, money, subtotal, discount, total, couponOn, checking, setChecking, placed, onClose, onPlace }) {
  const [buyer, setBuyer] = useState({ name: '', email: '', address: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await onPlace(buyer) }
    catch (e2) { setErr('Daisy fumbled that. Try again?'); console.error(e2) }
    finally { setBusy(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.5)', zIndex: 200, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'min(420px, 100%)', height: '100%', background: 'var(--parchment)', boxShadow: '-8px 0 30px rgba(61,43,31,0.35)',
        padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Acorn size={18} color="var(--clay)" /> Your Cache
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--stone)' }}>×</button>
        </div>

        {placed ? (
          <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><DaisyMark size={80} color="var(--clay)" /></div>
            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.75rem' }}>
              Order tucked away!
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--bark-light)', lineHeight: 1.7 }}>
              Thank you, {placed.name}. Daisy buried your order safely — Scott will email you a secure
              payment link to finish up. Check your inbox (and your spam, squirrels are sneaky).
            </p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: '1.5rem', width: 'auto', display: 'inline-flex' }}>Back to the gallery</button>
          </div>
        ) : cart.length === 0 ? (
          <p style={{ color: 'var(--stone)', fontStyle: 'italic', marginTop: '1rem' }}>Your cache is empty. Go bury some acorns.</p>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              {cart.map(i => (
                <div key={i.product_id} style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid #e0d8ca' }}>
                  <div style={{ width: '54px', height: '54px', flexShrink: 0, background: 'var(--warm-cream)', borderRadius: '3px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i.image_path ? <img src={getImageUrl(i.image_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} /> : <Acorn size={20} color="var(--sage)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{i.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{KIND_LABEL[i.kind] || i.kind}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <button onClick={() => setQty(i.product_id, i.qty - 1)} style={qtyBtn}>–</button>
                      <span style={{ fontSize: '0.85rem', minWidth: '1.2rem', textAlign: 'center' }}>{i.qty}</span>
                      <button onClick={() => setQty(i.product_id, i.qty + 1)} style={qtyBtn}>+</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--clay)', fontWeight: 600 }}>{money(i.price_cents * i.qty)}</div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '1rem' }}>
              <Row label="Subtotal" value={money(subtotal)} />
              {couponOn && <Row label={`Daisy’s 10% (${COUPON})`} value={`– ${money(discount)}`} accent />}
              <Row label="Total" value={money(total)} bold />

              {!couponOn && (
                <p style={{ fontSize: '0.72rem', color: 'var(--stone)', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                  Psst — find all Daisy’s acorns for 10% off.
                </p>
              )}

              {!checking ? (
                <button onClick={() => setChecking(true)} className="btn-primary" style={{ marginTop: '1rem' }}>
                  <Acorn size={14} color="var(--parchment)" /> Checkout
                </button>
              ) : (
                <form onSubmit={submit} style={{ marginTop: '1rem' }}>
                  {err && <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{err}</p>}
                  <div className="form-group"><label>Name</label><input required value={buyer.name} onChange={e => setBuyer({ ...buyer, name: e.target.value })} /></div>
                  <div className="form-group"><label>Email</label><input type="email" required value={buyer.email} onChange={e => setBuyer({ ...buyer, email: e.target.value })} /></div>
                  <div className="form-group"><label>Shipping address</label><textarea required value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} placeholder="Where should Daisy send it?" /></div>
                  <div className="form-group"><label>Note (optional)</label><textarea value={buyer.note} onChange={e => setBuyer({ ...buyer, note: e.target.value })} /></div>
                  <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Burying your order…' : 'Place order'}</button>
                  <p style={{ fontSize: '0.72rem', color: 'var(--stone)', marginTop: '0.6rem', textAlign: 'center', lineHeight: 1.5 }}>
                    No payment now — Scott emails you a secure payment link to finish.
                  </p>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: bold ? '1rem' : '0.85rem', fontWeight: bold ? 600 : 400, color: accent ? 'var(--moss)' : 'var(--bark)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

const addBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bark)', color: 'var(--parchment)',
  border: 'none', borderRadius: '3px', padding: '0.45rem 0.8rem', fontSize: '0.72rem', letterSpacing: '0.06em',
  textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
}
const cartFab = {
  position: 'fixed', right: '1.25rem', top: '50%', zIndex: 130, background: 'var(--clay)', color: 'var(--parchment)',
  border: 'none', borderRadius: '30px', padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
  fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 16px var(--shadow-deep)'
}
const qtyBtn = {
  width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #d4cdc0', background: 'white',
  cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, color: 'var(--bark)'
}
