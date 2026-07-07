import { useState, useMemo } from 'react'
import { getImageUrl } from '../lib/supabase'
import { Acorn } from './Daisy'

/* The gallery wall — a real grid (no more scrolling window), with
   sort tabs so pieces can be seen "newest first" or in Scott's own
   curated rank. */

const SORTS = [
  { key: 'curated', label: 'Curated' },
  { key: 'newest', label: 'Newest' },
  { key: 'picks', label: "Daisy’s Picks" },
  { key: 'available', label: 'Available' },
]

export default function Gallery({ artworks, onSelect }) {
  const [sort, setSort] = useState('curated')
  const [cat, setCat] = useState('all')

  // Categories the gallery discovers on its own from whatever Scott tagged.
  const categories = useMemo(
    () => [...new Set((artworks || []).map(a => a.category).filter(Boolean))].sort(),
    [artworks]
  )

  const shown = useMemo(() => {
    let list = [...(artworks || [])]
    if (cat !== 'all') list = list.filter(a => a.category === cat)
    switch (sort) {
      case 'newest':
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'picks':
        return list.filter(a => a.is_daisy_pick)
      case 'available':
        return list.filter(a => !a.is_adopted)
      default: // curated — as delivered (sort_order, then newest)
        return list
    }
  }, [artworks, sort, cat])

  if (!artworks || artworks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--stone)', fontStyle: 'italic' }}>
        Daisy hasn’t hung anything here just yet. Check back soon.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: '1180px' }}>
      {/* Sort tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {SORTS.map(s => {
          const active = sort === s.key
          return (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: active ? 'var(--bark)' : 'transparent',
                color: active ? 'var(--parchment)' : 'var(--bark-light)',
                border: `1.5px solid ${active ? 'var(--bark)' : '#d4cdc0'}`,
                borderRadius: '20px', padding: '0.4rem 1rem', cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', transition: 'all 0.25s'
              }}
            >
              {s.key === 'picks' && <Acorn size={12} color={active ? 'var(--parchment)' : 'var(--clay)'} />}
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Category filters — one appears automatically for each category Scott uses */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', margin: '-0.75rem 0 2rem' }}>
          {['all', ...categories].map(c => {
            const active = cat === c
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  background: active ? 'var(--clay)' : 'transparent',
                  color: active ? 'var(--parchment)' : 'var(--stone)',
                  border: `1px solid ${active ? 'var(--clay)' : '#d9d1c4'}`,
                  borderRadius: '16px', padding: '0.28rem 0.85rem', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontSize: '0.7rem', letterSpacing: '0.04em',
                  transition: 'all 0.2s'
                }}
              >
                {c === 'all' ? 'All' : c}
              </button>
            )
          })}
        </div>
      )}

      {shown.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--stone)', fontStyle: 'italic', padding: '2rem' }}>
          {sort === 'picks' ? 'Daisy hasn’t picked a favorite yet.' : 'Nothing here right now.'}
        </p>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.6rem', padding: '0 0.5rem'
        }}>
          {shown.map(art => <GalleryCard key={art.id} art={art} onClick={() => onSelect(art)} />)}
        </div>
      )}
    </div>
  )
}

function GalleryCard({ art, onClick }) {
  const imageUrl = getImageUrl(art.image_path)
  const isLandscape = art.orientation === 'landscape'

  return (
    <div
      className="art-card"
      onClick={onClick}
      style={{
        background: 'white', borderRadius: '3px', overflow: 'hidden',
        boxShadow: '0 4px 20px var(--shadow), 0 1px 3px var(--shadow)', cursor: 'pointer',
        transition: 'transform 0.35s ease, box-shadow 0.35s ease', position: 'relative'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 12px 40px var(--shadow-deep), 0 2px 6px var(--shadow)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow), 0 1px 3px var(--shadow)'
      }}
    >
      {art.is_daisy_pick && (
        <span title="Daisy’s Pick" style={{
          position: 'absolute', top: '0.6rem', left: '0.6rem', zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(245,240,232,0.94)', color: 'var(--clay)', borderRadius: '20px',
          padding: '0.24rem 0.55rem 0.24rem 0.45rem', fontSize: '0.6rem', letterSpacing: '0.08em',
          textTransform: 'uppercase', fontWeight: 600, boxShadow: '0 1px 6px var(--shadow)'
        }}>
          <Acorn size={12} color="var(--clay)" /> Pick
        </span>
      )}

      <div style={{
        width: '100%', aspectRatio: isLandscape ? '4/3' : '3/4', background: 'var(--warm-cream)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
      }}>
        <img
          src={imageUrl} alt={art.title} loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'contain', padding: '0.9rem', display: 'block',
            filter: art.is_adopted ? 'saturate(0.85)' : 'none'
          }}
        />
        {art.is_adopted && (
          <span style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(74,93,62,0.95), rgba(74,93,62,0.82))',
            color: 'var(--parchment)', fontSize: '0.6rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', textAlign: 'center', padding: '0.45rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
          }}>
            <Acorn size={12} color="var(--parchment)" /> Adopted into New Forests
          </span>
        )}
      </div>

      <div style={{ padding: '1rem 1.15rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.2rem' }}>
          {art.title}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--stone)', letterSpacing: '0.04em' }}>
          {art.medium || 'Mixed media'}{art.year ? ` · ${art.year}` : ''}
        </div>
        {art.daisy_note && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.86rem',
            color: 'var(--bark-light)', lineHeight: 1.45, marginTop: '0.6rem',
            paddingLeft: '0.6rem', borderLeft: '2px solid var(--terracotta)'
          }}>
            {art.daisy_note} <span style={{ color: 'var(--stone)', fontStyle: 'normal', fontSize: '0.68rem' }}>— Daisy</span>
          </p>
        )}
        {art.price && !art.is_adopted && (
          <span style={{ display: 'inline-block', marginTop: '0.55rem', fontSize: '0.8rem', color: 'var(--clay)', fontWeight: 500 }}>
            {art.price}
          </span>
        )}
      </div>
    </div>
  )
}
