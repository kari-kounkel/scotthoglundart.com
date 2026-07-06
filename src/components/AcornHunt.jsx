import { useEffect, useRef, useState, useCallback } from 'react'
import { Acorn, DaisyMark } from './Daisy'
import { HuntCtx, useHunt } from './huntContext'

/* ───────────────────────────────────────────────────────────
   The Acorn Hunt — the FUN engine.
   Daisy hides acorns all over the site. Find them all and she
   throws a little party + coughs up a secret Trading Post code.
   (Cousin to Kari's marble jar.)  Progress lives in localStorage.
   ─────────────────────────────────────────────────────────── */

const COUPON = 'DAISY10'
const LS_FOUND = 'daisy.acorns.found'
const LS_DONE = 'daisy.acorns.done'

function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) }
  catch { return new Set() }
}

export function AcornHuntProvider({ children }) {
  const [found, setFound] = useState(() => loadSet(LS_FOUND))
  const [totalCount, setTotalCount] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const totalRef = useRef(new Set())
  const doneRef = useRef(localStorage.getItem(LS_DONE) === '1')

  const register = useCallback((id) => {
    if (!totalRef.current.has(id)) {
      totalRef.current.add(id)
      setTotalCount(totalRef.current.size)
    }
  }, [])

  const collect = useCallback((id) => {
    setFound(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(LS_FOUND, JSON.stringify([...next]))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(LS_FOUND)
    localStorage.removeItem(LS_DONE)
    doneRef.current = false
    setFound(new Set())
    setCelebrate(false)
  }, [])

  // Party time: found them all (and there are enough to count).
  useEffect(() => {
    if (totalCount >= 5 && found.size >= totalCount && !doneRef.current) {
      doneRef.current = true
      localStorage.setItem(LS_DONE, '1')
      localStorage.setItem('daisy.coupon', COUPON)
      setCelebrate(true)
    }
  }, [found, totalCount])

  const value = {
    register, collect, reset, coupon: COUPON,
    foundCount: found.size, totalCount, isFound: (id) => found.has(id),
    complete: doneRef.current, showParty: () => setCelebrate(true)
  }

  return (
    <HuntCtx.Provider value={value}>
      {children}
      <AcornStash />
      {celebrate && <AcornParty onClose={() => setCelebrate(false)} coupon={COUPON} />}
    </HuntCtx.Provider>
  )
}

// ─── The little tally, bottom-left (Ask Kari lives bottom-right) ───
function AcornStash() {
  const { foundCount, totalCount, complete, showParty } = useHunt()
  if (totalCount === 0) return null
  const done = complete || (totalCount >= 5 && foundCount >= totalCount)
  return (
    <button
      onClick={() => done && showParty()}
      title={done ? 'You found every acorn!' : 'Daisy hid acorns all over. Find them.'}
      style={{
        position: 'fixed', left: '1.25rem', bottom: '1.25rem', zIndex: 120,
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: done ? 'var(--moss)' : 'rgba(245,240,232,0.94)',
        color: done ? 'var(--parchment)' : 'var(--clay)',
        border: `1.5px solid ${done ? 'var(--moss)' : '#e0d8ca'}`,
        borderRadius: '22px', padding: '0.4rem 0.8rem 0.4rem 0.6rem',
        fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600,
        letterSpacing: '0.04em', cursor: done ? 'pointer' : 'default',
        boxShadow: '0 2px 10px var(--shadow)'
      }}
    >
      <Acorn size={16} color={done ? 'var(--parchment)' : 'var(--clay)'} />
      {done ? 'Acorns found!' : `${foundCount} / ${totalCount} acorns`}
    </button>
  )
}

// ─── Confetti + reward ───
function AcornParty({ onClose, coupon }) {
  const [copied, setCopied] = useState(false)
  const acorns = Array.from({ length: 26 })
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.6)', zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        overflow: 'hidden', animation: 'fadeIn 0.25s ease', cursor: 'pointer'
      }}
    >
      {acorns.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 1.2
        const dur = 2.4 + Math.random() * 2
        const size = 14 + Math.random() * 16
        return (
          <span key={i} style={{
            position: 'absolute', top: '-6%', left: `${left}%`,
            animation: `acornFall ${dur}s linear ${delay}s infinite`
          }}>
            <Acorn size={size} color={i % 2 ? 'var(--terracotta)' : 'var(--clay)'} />
          </span>
        )
      })}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--parchment)', borderRadius: '8px', maxWidth: '420px', width: '100%',
          padding: '2.5rem 2.25rem', textAlign: 'center', cursor: 'default', position: 'relative', zIndex: 2,
          boxShadow: '0 24px 70px rgba(61,43,31,0.5)', border: '1px solid #e0d8ca', animation: 'slideUp 0.4s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', animation: 'daisyScamper 0.9s ease-in-out infinite' }}>
          <DaisyMark size={82} color="var(--clay)" />
        </div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 300, margin: '0.75rem 0 0.5rem' }}>
          You found every acorn!
        </h3>
        <p style={{ fontSize: '0.94rem', lineHeight: 1.7, color: 'var(--bark-light)', marginBottom: '1.5rem' }}>
          Daisy is <em>extremely</em> impressed — nobody finds them all. She dug up something for you:
          <strong> 10% off</strong> anything in the Trading Post.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'white',
          border: '1.5px dashed var(--terracotta)', borderRadius: '5px', padding: '0.7rem 1.2rem', marginBottom: '1.25rem'
        }}>
          <Acorn size={18} color="var(--terracotta)" />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 600, letterSpacing: '0.18em', color: 'var(--bark)' }}>
            {coupon}
          </span>
        </div>
        <div>
          <button
            onClick={() => { navigator.clipboard?.writeText(coupon); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
            className="btn-primary" style={{ width: 'auto', display: 'inline-flex' }}
          >
            <Acorn size={14} color="var(--parchment)" /> {copied ? 'Copied!' : 'Copy the code'}
          </button>
        </div>
        <button onClick={onClose} style={{
          marginTop: '1rem', background: 'none', border: 'none', color: 'var(--stone)',
          fontSize: '0.78rem', cursor: 'pointer'
        }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Daisy scampers across the screen — catch her for an acorn ───
export function ScamperingDaisy({ id = 'scamper' }) {
  const hunt = useHunt()
  const [caught, setCaught] = useState(false)
  useEffect(() => { hunt?.register(id) }, [])
  useEffect(() => { if (hunt?.isFound(id)) setCaught(true) }, [hunt])

  if (caught) return null

  return (
    <button
      onClick={() => { hunt?.collect(id); setCaught(true) }}
      aria-label="Catch Daisy"
      title="Quick — catch her!"
      style={{
        position: 'fixed', bottom: '0.3rem', left: 0, zIndex: 90,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0,
        animation: 'scamperAcross 17s linear infinite'
      }}
    >
      <span style={{ display: 'inline-block', animation: 'scamperBob 0.32s ease-in-out infinite' }}>
        <DaisyMark size={40} color="var(--clay)" />
      </span>
    </button>
  )
}
