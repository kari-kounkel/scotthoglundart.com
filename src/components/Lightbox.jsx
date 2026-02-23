import { getImageUrl } from '../lib/supabase'

export default function Lightbox({ art, onClose }) {
  if (!art) return null

  const imageUrl = getImageUrl(art.image_path)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61, 43, 31, 0.92)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
        padding: '2rem',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <img
        src={imageUrl}
        alt={art.title}
        style={{
          maxWidth: '90%',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: '3px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
        }}
      />
      <div style={{
        color: 'var(--parchment)',
        textAlign: 'center',
        marginTop: '1.5rem',
        opacity: 0.9
      }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
          fontWeight: 300
        }}>
          {art.title}
        </h3>
        <p style={{ fontSize: '0.8rem', marginTop: '0.3rem', letterSpacing: '0.05em' }}>
          {art.medium || ''}{art.year ? ` · ${art.year}` : ''}
        </p>
        {art.description && (
          <p style={{ fontSize: '0.85rem', marginTop: '0.8rem', maxWidth: '500px', lineHeight: 1.6, opacity: 0.8 }}>
            {art.description}
          </p>
        )}
      </div>
    </div>
  )
}
