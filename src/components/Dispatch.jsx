import { useState } from 'react'
import { subscribeToDispatch } from '../lib/supabase'
import { Acorn, DaisyMark } from './Daisy'

/* Daisy's Dispatch — signups land in the Nut Cache (dispatch_subscribers) */
export default function Dispatch() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    try {
      await subscribeToDispatch(email)
      setStatus('done')
      setEmail('')
    } catch (err) {
      console.error('Dispatch signup error:', err)
      setStatus('error')
    }
  }

  return (
    <section id="dispatch" style={{ padding: '5.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <DaisyMark size={62} color="var(--sage)" />
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)',
          fontWeight: 300, marginBottom: '0.6rem'
        }}>
          Daisy’s Dispatch
        </h2>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--bark-light)', marginBottom: '1.75rem' }}>
          Daisy keeps a little cache of news — new work, pieces newly adopted, and the
          occasional field note from the studio. Drop your email in the <em>Nut Cache</em> and
          she’ll dig one up for you now and then. No noise. She forgets nothing, but she rarely writes.
        </p>

        {status === 'done' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'var(--warm-cream)', border: '1px solid #ddd3c2',
            borderRadius: '4px', padding: '1rem 1.6rem', color: 'var(--moss)', fontSize: '0.9rem'
          }}>
            <Acorn size={18} color="var(--moss)" />
            Tucked into the Nut Cache. Thank you — Daisy’s got you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            display: 'flex', gap: '0.6rem', maxWidth: '440px', margin: '0 auto', flexWrap: 'wrap'
          }}>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" aria-label="Email for Daisy's Dispatch"
              style={{
                flex: '1 1 220px', padding: '0.85rem 1rem', border: '1.5px solid #d4cdc0',
                borderRadius: '3px', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem',
                background: 'white', color: 'var(--bark)'
              }}
            />
            <button
              type="submit" className="btn-primary" disabled={status === 'sending'}
              style={{ width: 'auto', flex: '0 0 auto' }}
            >
              <Acorn size={15} color="var(--parchment)" />
              {status === 'sending' ? 'Caching…' : 'Join the Nut Cache'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p style={{ marginTop: '0.9rem', fontSize: '0.82rem', color: '#c0392b' }}>
            Daisy dropped that one. Try again in a moment?
          </p>
        )}
      </div>
    </section>
  )
}
