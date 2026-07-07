import { useState, useEffect } from 'react'
import { fetchAllProducts, createProduct, updateProduct, deleteProduct, getImageUrl } from '../lib/supabase'
import { toast } from '../components/Toast'

/* Admin → Products: turn any artwork into a postcard / print / poster,
   set a price, and it appears in Daisy's Trading Post. */

const KINDS = ['postcard', 'print', 'poster', 'original']
const money = (c) => `$${(c / 100).toFixed(2)}`

export default function AdminProducts({ artworks }) {
  const [products, setProducts] = useState([])
  const [artworkId, setArtworkId] = useState('')
  const [kind, setKind] = useState('print')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [blurb, setBlurb] = useState('')
  const [pfProductId, setPfProductId] = useState('')
  const [pfVariantId, setPfVariantId] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try { setProducts(await fetchAllProducts()) } catch (e) { console.error(e) }
  }

  // When an artwork is chosen, prefill the title.
  function pickArtwork(id) {
    setArtworkId(id)
    const a = artworks.find(x => x.id === id)
    if (a && !title) setTitle(a.title)
  }

  async function handleCreate(e) {
    e.preventDefault()
    const cents = Math.round(parseFloat(price || '0') * 100)
    if (!title || !cents) { toast('Add a title and a price'); return }
    setBusy(true)
    try {
      const a = artworks.find(x => x.id === artworkId)
      await createProduct({
        artwork_id: artworkId || null,
        kind, title,
        price_cents: cents,
        image_path: a ? a.image_path : null,
        blurb: blurb || null,
        printify_product_id: pfProductId.trim() || null,
        printify_variant_id: pfVariantId.trim() ? Number(pfVariantId.trim()) : null,
      })
      toast('🌰 Added to the Trading Post')
      setArtworkId(''); setKind('print'); setTitle(''); setPrice(''); setBlurb('')
      setPfProductId(''); setPfVariantId('')
      await load()
    } catch (err) { toast('Error: ' + err.message) }
    finally { setBusy(false) }
  }

  async function toggleActive(p) {
    try { await updateProduct(p.id, { is_active: !p.is_active }); await load() }
    catch (e) { toast('Error: ' + e.message) }
  }
  async function remove(p) {
    if (!confirm(`Remove "${p.title}" from the Trading Post?`)) return
    try { await deleteProduct(p.id); await load(); toast('Removed') }
    catch (e) { toast('Error: ' + e.message) }
  }

  return (
    <>
      <div style={card}>
        <h2 style={h2}>Add a product</h2>
        <p style={sub}>Turn a piece of art into something to sell.</p>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Use art from the gallery (optional)</label>
            <select value={artworkId} onChange={e => pickArtwork(e.target.value)}>
              <option value="">— none / text-only product —</option>
              {artworks.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Kind</label>
              <select value={kind} onChange={e => setKind(e.target.value)}>
                {KINDS.map(k => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (USD)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="12.00" />
            </div>
          </div>
          <div className="form-group">
            <label>Product title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="“Out of the Shadows” — 5×7 Postcard" />
          </div>
          <div className="form-group">
            <label>Blurb (optional)</label>
            <input value={blurb} onChange={e => setBlurb(e.target.value)} placeholder="Printed on heavy matte stock." />
          </div>

          {/* Printify fulfillment mapping */}
          <div style={{ background: 'var(--warm-cream)', border: '1px solid #e0d8ca', borderRadius: '4px', padding: '1.1rem 1.2rem', marginBottom: '1.2rem' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clay)', marginBottom: '0.3rem', fontWeight: 600 }}>
              Printify fulfillment
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--stone)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Paste the IDs from this item’s page in your Printify dashboard so paid orders auto-print & ship. Leave blank until Printify is set up.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Printify product ID</label>
                <input value={pfProductId} onChange={e => setPfProductId(e.target.value)} placeholder="e.g. 5f5c…" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Variant ID</label>
                <input value={pfVariantId} onChange={e => setPfVariantId(e.target.value)} placeholder="e.g. 43619" inputMode="numeric" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Adding…' : 'Add to Trading Post'}</button>
        </form>
      </div>

      <div style={card}>
        <h2 style={h2}>In the Trading Post</h2>
        {products.length === 0 ? (
          <p style={{ color: 'var(--stone)', fontStyle: 'italic', fontSize: '0.9rem' }}>No products yet. Add your first above.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', padding: '0.6rem', border: '1px solid #e8e2d8', borderRadius: '4px', opacity: p.is_active ? 1 : 0.5 }}>
                <div style={{ width: '48px', height: '48px', flexShrink: 0, background: 'var(--warm-cream)', borderRadius: '3px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_path && <img src={getImageUrl(p.image_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.kind} · {money(p.price_cents)}</div>
                </div>
                <button onClick={() => toggleActive(p)} style={miniBtn}>{p.is_active ? 'Hide' : 'Show'}</button>
                <button onClick={() => remove(p)} style={{ ...miniBtn, background: '#c0392b', color: 'white', borderColor: '#c0392b' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const card = { background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 2px 12px var(--shadow)', marginBottom: '2rem' }
const h2 = { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.3rem' }
const sub = { fontSize: '0.78rem', color: 'var(--stone)', marginBottom: '1.5rem', letterSpacing: '0.05em' }
const miniBtn = { background: 'none', border: '1.5px solid var(--stone)', color: 'var(--bark-light)', padding: '0.35rem 0.7rem', fontSize: '0.72rem', borderRadius: '3px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }
