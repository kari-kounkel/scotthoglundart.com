import { useState, useEffect } from 'react'
import { fetchOrders, updateOrderStatus } from '../lib/supabase'
import { toast } from '../components/Toast'

/* Admin → Orders: every order placed in the Trading Post lands here. */

const STATUSES = ['new', 'paid', 'shipped', 'done']
const STATUS_COLOR = { new: 'var(--terracotta)', paid: 'var(--sage)', shipped: 'var(--clay)', done: 'var(--stone)' }
const money = (c) => `$${((c || 0) / 100).toFixed(2)}`

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    try { setOrders(await fetchOrders()) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function setStatus(o, status) {
    try { await updateOrderStatus(o.id, status); await load(); toast(`Marked ${status}`) }
    catch (e) { toast('Error: ' + e.message) }
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 2px 12px var(--shadow)' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        Orders {orders.length > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>({orders.length})</span>}
      </h2>

      {loading ? (
        <p style={{ color: 'var(--stone)', fontStyle: 'italic' }}>Loading…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--stone)', fontStyle: 'italic', fontSize: '0.9rem' }}>No orders yet. When someone buys from the Trading Post, it shows up here.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map(o => (
            <div key={o.id} style={{ border: '1px solid #e8e2d8', borderRadius: '5px', padding: '1.1rem 1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    #{o.ref} <span style={{ fontWeight: 400, color: 'var(--stone)' }}>· {fmtDate(o.created_at)}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--bark-light)', marginTop: '0.2rem' }}>
                    {o.buyer_name} · <a href={`mailto:${o.buyer_email}`} style={{ color: 'var(--clay)' }}>{o.buyer_email}</a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: STATUS_COLOR[o.status] || 'var(--stone)', fontWeight: 700 }}>
                    {o.status}
                  </span>
                  <select value={o.status} onChange={e => setStatus(o, e.target.value)} style={{ padding: '0.3rem 0.5rem', borderRadius: '3px', border: '1px solid #d4cdc0', fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0.8rem 0', padding: 0, fontSize: '0.85rem', color: 'var(--bark)' }}>
                {(o.items || []).map((it, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0' }}>
                    <span>{it.qty}× {it.title} <span style={{ color: 'var(--stone)', textTransform: 'uppercase', fontSize: '0.7rem' }}>({it.kind})</span></span>
                    <span>{money(it.price_cents * it.qty)}</span>
                  </li>
                ))}
              </ul>

              {o.ship_address && <div style={{ fontSize: '0.8rem', color: 'var(--bark-light)', whiteSpace: 'pre-wrap', marginBottom: '0.4rem' }}><strong>Ship to:</strong> {o.ship_address}</div>}
              {o.note && <div style={{ fontSize: '0.8rem', color: 'var(--stone)', fontStyle: 'italic' }}>“{o.note}”</div>}

              <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--clay)', marginTop: '0.5rem' }}>Total {money(o.subtotal_cents)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
