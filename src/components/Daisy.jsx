import { useState, useEffect } from 'react'

/* ───────────────────────────────────────────────────────────
   Daisy — the tiny unofficial gallery curator.
   Shared marks (acorn + squirrel), the hidden "Find Daisy"
   easter egg, and Daisy's note modal.
   Daisy is the thread, not the whole sweater — kept quiet,
   warm, and a little mischievous.
   ─────────────────────────────────────────────────────────── */

// ─── ACORN ───────────────────────────────────────────────────
export function Acorn({ size = 18, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} aria-hidden="true">
      <path d="M12 3.2V1.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 9c0-4 3.6-6 7-6s7 2 7 6c0 1.1-.9 1.6-2 1.6H7C5.9 10.6 5 10.1 5 9Z" fill={color} />
      <path d="M6.6 10.6h10.8C17.4 17 14.5 21 12 21S6.6 17 6.6 10.6Z" fill={color} opacity="0.78" />
    </svg>
  )
}

// A small centered acorn divider — replaces plain rules.
export function AcornDivider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.9rem', margin: '2.5rem auto', maxWidth: '340px', color: 'var(--stone)'
    }}>
      <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #cdc4b6)' }} />
      {label
        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <Acorn size={15} color="var(--terracotta)" /> {label}
          </span>
        : <Acorn size={17} color="var(--terracotta)" />}
      <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #cdc4b6)' }} />
    </div>
  )
}

// ─── DAISY (the squirrel) ────────────────────────────────────
// Elegant single-tone silhouette: bushy curled tail, sitting,
// holding a single acorn. No cartoon eyes, no clipart.
export function DaisyMark({ size = 96, color = 'var(--clay)', style, title = 'Daisy' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={style} role="img" aria-label={title}>
      <g fill={color}>
        {/* bushy curled tail */}
        <path d="M70 108C116 106 128 50 90 27C116 45 116 89 80 98C108 88 108 46 82 42C104 58 96 98 62 97Z" />
        {/* haunch / lower body */}
        <ellipse cx="60" cy="82" rx="27" ry="26" />
        {/* chest, rising to the head */}
        <path d="M45 68C40 50 51 37 63 39C76 41 80 57 73 70Z" />
        {/* head */}
        <circle cx="50" cy="41" r="15.5" />
        {/* ear */}
        <path d="M40 27C37.5 16.5 48.5 18 49.5 28.5Z" />
        {/* front paw */}
        <ellipse cx="60" cy="99" rx="8.5" ry="10.5" />
      </g>
      {/* eye + nose keep it alive but never cartoonish */}
      <circle cx="45.5" cy="40" r="2.4" fill="var(--parchment)" />
      <circle cx="35" cy="44" r="2.1" fill="var(--bark)" />
      {/* the acorn she's guarding */}
      <g transform="translate(46 60) scale(0.42)">
        <path d="M5 9c0-4 3.6-6 7-6s7 2 7 6c0 1.1-.9 1.6-2 1.6H7C5.9 10.6 5 10.1 5 9Z" fill="var(--bark)" />
        <path d="M6.6 10.6h10.8C17.4 17 14.5 21 12 21S6.6 17 6.6 10.6Z" fill="var(--terracotta)" />
      </g>
    </svg>
  )
}

// ─── DAISY'S NOTE (module-level trigger, like Toast) ─────────
let openNoteFn = null
export function showDaisyNote(note) { if (openNoteFn) openNoteFn(note) }

// A tiny Daisy tucked into a corner of a section. Click = a note.
export function HiddenDaisy({ note, size = 34, style }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={() => showDaisyNote(note)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="…is that Daisy?"
      aria-label="Find Daisy"
      style={{
        position: 'absolute', background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', lineHeight: 0,
        opacity: hover ? 0.95 : 0.22,
        transform: hover ? 'translateY(-3px) rotate(-4deg)' : 'none',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        ...style
      }}
    >
      <DaisyMark size={size} color={hover ? 'var(--clay)' : 'var(--bark-light)'} />
    </button>
  )
}

export function DaisyNoteModal() {
  const [note, setNote] = useState(null)
  useEffect(() => {
    openNoteFn = (n) => setNote(n)
    return () => { openNoteFn = null }
  }, [])
  if (!note) return null
  return (
    <div
      onClick={() => setNote(null)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61,43,31,0.55)',
        zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', animation: 'fadeIn 0.25s ease', cursor: 'pointer'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--parchment)', borderRadius: '6px', maxWidth: '420px',
          width: '100%', padding: '2.5rem 2.25rem', textAlign: 'center', cursor: 'default',
          boxShadow: '0 20px 60px rgba(61,43,31,0.4)', position: 'relative',
          animation: 'slideUp 0.35s ease', border: '1px solid #e0d8ca'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <DaisyMark size={70} color="var(--clay)" />
        </div>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '0.72rem',
          letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--terracotta)',
          marginBottom: '1rem'
        }}>
          You found Daisy
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem',
          fontWeight: 300, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--bark)'
        }}>
          “{note}”
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', letterSpacing: '0.14em', color: 'var(--stone)' }}>
          — Daisy
        </p>
        <button
          onClick={() => setNote(null)}
          style={{
            marginTop: '1.75rem', background: 'var(--bark)', color: 'var(--parchment)',
            border: 'none', borderRadius: '3px', padding: '0.6rem 1.6rem', cursor: 'pointer',
            fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            fontFamily: "'Outfit', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Acorn size={14} color="var(--parchment)" /> Back to the gallery
        </button>
      </div>
    </div>
  )
}

// ─── "Daisy is scampering…" loader ───────────────────────────
export function DaisyLoader({ label = 'Daisy is scampering…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--stone)' }}>
      <div style={{ display: 'inline-block', animation: 'daisyScamper 1.1s ease-in-out infinite' }}>
        <DaisyMark size={54} color="var(--terracotta)" />
      </div>
      <p style={{ marginTop: '0.9rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}>
        {label}
      </p>
    </div>
  )
}
