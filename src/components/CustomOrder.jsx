import { useState, useRef } from 'react'
import { submitCustomRequest } from '../lib/supabase'
import { Acorn, DaisyMark } from './Daisy'

/* Commission a custom piece: upload a reference + say what you want.
   Scott reviews, quotes a timeline + deposit, and takes it from there. */

const TYPES = ['Portrait (person)', 'Pet portrait', 'From a photo', 'Poster / print of my idea', 'Something else']
const MAX_FILES = 5

export default function CustomOrder() {
  const [f, setF] = useState({ name: '', email: '', phone: '', product_type: TYPES[0], description: '', budget: '' })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const fileRef = useRef(null)

  function pickFiles(e) {
    const chosen = Array.from(e.target.files).slice(0, MAX_FILES)
    setFiles(chosen)
    setPreviews(chosen.map(file => URL.createObjectURL(file)))
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitCustomRequest(f, files)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  return (
    <section id="commission" style={{ padding: '6rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <DaisyMark size={62} color="var(--clay)" />
          </div>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '0.8rem' }}>
            <Acorn size={14} color="var(--terracotta)" /> Commission Scott
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 300, marginBottom: '1rem' }}>
            Bring Daisy your idea
          </h2>
          <p style={{ color: 'var(--bark-light)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            Want your own portrait, a beloved pet, or a piece from a photo? Upload what you have in
            mind and tell Scott about it. He’ll look it over personally, then get back to you with a
            price, a timeline, and a small deposit to begin. No payment now — this just starts the conversation.
          </p>
        </div>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', background: 'var(--warm-cream)', borderRadius: '6px', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><DaisyMark size={78} color="var(--clay)" /></div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 300, marginBottom: '0.75rem' }}>
              Daisy’s got your request
            </h3>
            <p style={{ color: 'var(--bark-light)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Thank you, {f.name.split(' ')[0]}. She tucked it away for Scott — he reviews every one
              himself and will email you at <strong>{f.email}</strong> with a price, a timeline, and the
              deposit to get started. (Peek at your spam, just in case.)
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'white', borderRadius: '6px', padding: '2rem', boxShadow: '0 2px 16px var(--shadow)' }}>
            {/* Upload */}
            <div className="form-group">
              <label>Your reference image(s)</label>
              <div onClick={() => fileRef.current?.click()} style={{
                border: '2px dashed #d4cdc0', borderRadius: '4px', padding: '1.6rem', textAlign: 'center', cursor: 'pointer', background: 'var(--parchment)'
              }}>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickFiles} style={{ display: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}><Acorn size={22} color="var(--terracotta)" /></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>
                  {files.length ? `${files.length} image${files.length > 1 ? 's' : ''} chosen` : 'Click to add a photo or sketch (up to 5)'}
                </p>
              </div>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
                  {previews.map((src, i) => <img key={i} src={src} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #e0d8ca' }} />)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Name</label><input required value={f.name} onChange={set('name')} /></div>
              <div className="form-group"><label>Email</label><input type="email" required value={f.email} onChange={set('email')} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Phone (optional)</label><input value={f.phone} onChange={set('phone')} /></div>
              <div className="form-group">
                <label>What kind of piece?</label>
                <select value={f.product_type} onChange={set('product_type')}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
              </div>
            </div>
            <div className="form-group">
              <label>Tell Scott what you’re imagining</label>
              <textarea required value={f.description} onChange={set('description')} placeholder="Who or what is it? Any colors, size, or feeling you want? When do you need it by?" style={{ minHeight: '110px' }} />
            </div>
            <div className="form-group">
              <label>Budget in mind (optional)</label>
              <input value={f.budget} onChange={set('budget')} placeholder="Helps Scott suggest the right size/medium" />
            </div>

            {status === 'error' && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '0.8rem' }}>Daisy dropped that one — please try again.</p>}

            <button type="submit" className="btn-primary" disabled={status === 'sending'}>
              <Acorn size={14} color="var(--parchment)" /> {status === 'sending' ? 'Sending to Scott…' : 'Send my request'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
