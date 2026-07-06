import { useState, useEffect } from 'react'
import { fetchCustomRequests, updateCustomRequest, getCustomUploadUrl } from '../lib/supabase'
import { toast } from '../components/Toast'

/* Admin → Requests: custom commission intake. Scott reviews the
   reference, sets a quote/timeline/deposit, and emails the customer. */

const STATUSES = ['new', 'reviewing', 'quoted', 'approved', 'deposit_paid', 'in_progress', 'done', 'declined']
const STATUS_COLOR = {
  new: 'var(--terracotta)', reviewing: 'var(--clay)', quoted: 'var(--clay)', approved: 'var(--sage)',
  deposit_paid: 'var(--moss)', in_progress: 'var(--clay)', done: 'var(--stone)', declined: '#c0392b',
}
const dollars = (c) => (c || c === 0) ? (c / 100).toFixed(2) : ''

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [urls, setUrls] = useState({})     // path -> signed url
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const data = await fetchCustomRequests()
      setRequests(data)
      // resolve signed urls for every reference image
      const map = {}
      for (const r of data) for (const p of (r.image_paths || [])) map[p] = await getCustomUploadUrl(p)
      setUrls(map)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (loading) return <div style={card}><p style={{ color: 'var(--stone)', fontStyle: 'italic' }}>Loading…</p></div>

  return (
    <div style={card}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.25rem' }}>
        Commission Requests {requests.length > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>({requests.length})</span>}
      </h2>
      {requests.length === 0 ? (
        <p style={{ color: 'var(--stone)', fontStyle: 'italic', fontSize: '0.9rem' }}>No requests yet. When someone commissions a piece, it shows up here.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {requests.map(r => <RequestCard key={r.id} r={r} urls={urls} onSaved={load} />)}
        </div>
      )}
    </div>
  )
}

function RequestCard({ r, urls, onSaved }) {
  const [status, setStatus] = useState(r.status)
  const [quote, setQuote] = useState(dollars(r.quote_cents))
  const [deposit, setDeposit] = useState(dollars(r.deposit_cents))
  const [timeline, setTimeline] = useState(r.timeline || '')
  const [notes, setNotes] = useState(r.admin_notes || '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await updateCustomRequest(r.id, {
        status,
        quote_cents: quote ? Math.round(parseFloat(quote) * 100) : null,
        deposit_cents: deposit ? Math.round(parseFloat(deposit) * 100) : null,
        timeline: timeline || null,
        admin_notes: notes || null,
      })
      toast('✦ Request saved')
      onSaved()
    } catch (e) { toast('Error: ' + e.message) } finally { setBusy(false) }
  }

  const mailto = () => {
    const subject = `Your commission request #${r.ref} — Scott Hoglund Art`
    const body = [
      `Hi ${r.name.split(' ')[0]},`, '',
      `Thanks for your request! Here's where things stand:`, '',
      quote ? `Price: $${quote}` : '',
      deposit ? `Deposit to begin: $${deposit}` : '',
      timeline ? `Timeline: ${timeline}` : '',
      '', `— Scott`,
    ].filter(Boolean).join('\n')
    window.location.href = `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div style={{ border: '1px solid #e8e2d8', borderRadius: '6px', padding: '1.2rem 1.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
            #{r.ref} · {r.name} <span style={{ fontWeight: 400, color: 'var(--stone)' }}>· {r.product_type}</span>
          </div>
          <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
            <a href={`mailto:${r.email}`} style={{ color: 'var(--clay)' }}>{r.email}</a>{r.phone ? ` · ${r.phone}` : ''}
          </div>
        </div>
        <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: STATUS_COLOR[r.status] || 'var(--stone)', fontWeight: 700 }}>
          {r.status.replace('_', ' ')}
        </span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--bark)', lineHeight: 1.6, margin: '0.8rem 0', whiteSpace: 'pre-wrap' }}>{r.description}</p>
      {r.budget && <p style={{ fontSize: '0.8rem', color: 'var(--stone)' }}>Budget in mind: {r.budget}</p>}

      {(r.image_paths || []).length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.8rem 0' }}>
          {r.image_paths.map(p => urls[p]
            ? <a key={p} href={urls[p]} target="_blank" rel="noreferrer"><img src={urls[p]} alt="reference" style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #e0d8ca' }} /></a>
            : <div key={p} style={{ width: '84px', height: '84px', background: 'var(--warm-cream)', borderRadius: '3px' }} />)}
        </div>
      )}

      {/* Scott's working panel */}
      <div style={{ background: 'var(--warm-cream)', borderRadius: '4px', padding: '1rem', marginTop: '0.6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.8rem' }}>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>{STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
          </Field>
          <Field label="Quote $"><input value={quote} onChange={e => setQuote(e.target.value)} style={inp} inputMode="decimal" /></Field>
          <Field label="Deposit $"><input value={deposit} onChange={e => setDeposit(e.target.value)} style={inp} inputMode="decimal" /></Field>
          <Field label="Timeline"><input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="3–4 weeks" style={inp} /></Field>
        </div>
        <div style={{ marginTop: '0.7rem' }}>
          <Field label="Private notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inp, minHeight: '50px' }} /></Field>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
          <button onClick={save} disabled={busy} className="btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>{busy ? 'Saving…' : 'Save'}</button>
          <button onClick={mailto} style={{ background: 'none', border: '1.5px solid var(--clay)', color: 'var(--clay)', padding: '0.6rem 1.1rem', borderRadius: '3px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.05em' }}>
            ✉ Email {r.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bark-light)', marginBottom: '0.3rem' }}>{label}</span>
      {children}
    </label>
  )
}

const card = { background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 2px 12px var(--shadow)' }
const inp = { width: '100%', padding: '0.5rem 0.6rem', border: '1px solid #d4cdc0', borderRadius: '3px', fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', background: 'white', color: 'var(--bark)' }
