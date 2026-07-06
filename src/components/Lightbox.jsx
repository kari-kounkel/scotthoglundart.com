import { getImageUrl } from '../lib/supabase'
import { Acorn } from './Daisy'

export default function Lightbox({ art, onClose }) {
  if (!art) return null

  const imageUrl = getImageUrl(art.image_path)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61, 43, 31, 0.92)', zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        cursor: 'pointer', padding: '2rem', animation: 'fadeIn 0.3s ease'
      }}
    >
      <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '80vh' }}>
        <img
          src={imageUrl} alt={art.title}
          style={{
            maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '3px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)', display: 'block'
          }}
        />
        {art.is_daisy_pick && (
          <span style={{
            position: 'absolute', top: '0.9rem', left: '0.9rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(245,240,232,0.94)', color: 'var(--clay)', borderRadius: '20px',
            padding: '0.3rem 0.7rem 0.3rem 0.55rem', fontSize: '0.66rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', fontWeight: 600
          }}>
            <Acorn size={13} color="var(--clay)" /> Daisy’s Pick
          </span>
        )}
      </div>

      <div style={{ color: 'var(--parchment)', textAlign: 'center', marginTop: '1.5rem', opacity: 0.95, maxWidth: '540px' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300 }}>
          {art.title}
        </h3>
        <p style={{ fontSize: '0.8rem', marginTop: '0.3rem', letterSpacing: '0.05em' }}>
          {art.medium || ''}{art.year ? ` · ${art.year}` : ''}
        </p>

        {art.is_adopted ? (
          <p style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.9rem',
            fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--sage-light)', border: '1px solid var(--sage)', borderRadius: '20px', padding: '0.3rem 0.9rem'
          }}>
            <Acorn size={13} color="var(--sage-light)" /> Adopted into New Forests
          </p>
        ) : art.price && (
          <p style={{ marginTop: '0.7rem', fontSize: '0.95rem', color: 'var(--terracotta)', fontWeight: 500 }}>
            {art.price}
          </p>
        )}

        {art.daisy_note && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.05rem',
            marginTop: '1.1rem', lineHeight: 1.6, opacity: 0.9
          }}>
            “{art.daisy_note}” <span style={{ fontStyle: 'normal', fontSize: '0.78rem', opacity: 0.7 }}>— Daisy</span>
          </p>
        )}

        {art.description && (
          <p style={{ fontSize: '0.85rem', marginTop: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
            {art.description}
          </p>
        )}
      </div>
    </div>
  )
}
