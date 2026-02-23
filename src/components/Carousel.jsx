import { useRef } from 'react'
import { getImageUrl } from '../lib/supabase'

export default function Carousel({ artworks, onSelect }) {
  const trackRef = useRef(null)

  const scroll = (dir) => {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.art-card')
    const width = card ? card.offsetWidth + 24 : 364
    trackRef.current.scrollBy({ left: dir * width, behavior: 'smooth' })
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'var(--stone)',
        fontStyle: 'italic'
      }}>
        Gallery coming soon...
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', position: 'relative' }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          padding: '2rem 1rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {artworks.map(art => (
          <ArtCard key={art.id} art={art} onClick={() => onSelect(art)} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <CarouselBtn onClick={() => scroll(-1)}>←</CarouselBtn>
        <CarouselBtn onClick={() => scroll(1)}>→</CarouselBtn>
      </div>
    </div>
  )
}

function ArtCard({ art, onClick }) {
  const imageUrl = getImageUrl(art.image_path)
  const isLandscape = art.orientation === 'landscape'

  return (
    <div
      className="art-card"
      onClick={onClick}
      style={{
        flex: '0 0 min(340px, 80vw)',
        scrollSnapAlign: 'center',
        background: 'white',
        borderRadius: '3px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px var(--shadow), 0 1px 3px var(--shadow)',
        cursor: 'pointer',
        transition: 'transform 0.4s ease, box-shadow 0.4s ease'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
        e.currentTarget.style.boxShadow = '0 12px 40px var(--shadow-deep), 0 2px 6px var(--shadow)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow), 0 1px 3px var(--shadow)'
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: isLandscape ? '4/3' : '3/4',
        background: 'var(--warm-cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img
          src={imageUrl}
          alt={art.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '1rem',
            display: 'block'
          }}
          loading="lazy"
        />
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.3rem',
          fontWeight: 400,
          marginBottom: '0.3rem'
        }}>
          {art.title}
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--stone)',
          letterSpacing: '0.05em'
        }}>
          {art.medium || 'Mixed media'}{art.year ? ` · ${art.year}` : ''}
        </div>
        {art.price && (
          <span style={{
            display: 'inline-block',
            marginTop: '0.6rem',
            fontSize: '0.82rem',
            color: 'var(--clay)',
            fontWeight: 500
          }}>
            {art.price}
          </span>
        )}
      </div>
    </div>
  )
}

function CarouselBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '48px',
        height: '48px',
        border: '1.5px solid var(--bark)',
        background: 'transparent',
        color: 'var(--bark)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: '1.2rem',
        transition: 'all 0.3s'
      }}
      onMouseOver={e => {
        e.target.style.background = 'var(--bark)'
        e.target.style.color = 'var(--parchment)'
      }}
      onMouseOut={e => {
        e.target.style.background = 'transparent'
        e.target.style.color = 'var(--bark)'
      }}
    >
      {children}
    </button>
  )
}
