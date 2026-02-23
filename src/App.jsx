import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Carousel from './components/Carousel'
import Lightbox from './components/Lightbox'
import Toast from './components/Toast'
import { fetchArtworks } from './lib/supabase'

export default function App() {
  const [artworks, setArtworks] = useState([])
  const [selectedArt, setSelectedArt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArtworks()
  }, [])

  async function loadArtworks() {
    try {
      const data = await fetchArtworks()
      setArtworks(data)
    } catch (err) {
      console.error('Error loading artworks:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      {/* HERO / GALLERY */}
      <section id="gallery" className="hero-section" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '6rem 2rem 4rem'
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 6vw, 5rem)',
          fontWeight: 300,
          textAlign: 'center',
          marginBottom: '0.5rem',
          letterSpacing: '0.04em',
          animation: 'fadeUp 1s ease 0.2s both'
        }}>
          Original Works
        </h1>
        <p style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
          color: 'var(--stone)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 300,
          marginBottom: '2rem',
          animation: 'fadeUp 1s ease 0.5s both',
          textAlign: 'center'
        }}>
          Paintings · Drawings · Prints
        </p>

        <div style={{ animation: 'fadeUp 1s ease 0.8s both', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {loading ? (
            <p style={{ color: 'var(--stone)', fontStyle: 'italic' }}>Loading gallery...</p>
          ) : (
            <Carousel artworks={artworks} onSelect={setSelectedArt} />
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-section" style={{
        padding: '6rem 3rem',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: '4rem',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          aspectRatio: '4/5',
          background: 'var(--warm-cream)',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--stone)',
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          border: '1px dashed var(--stone)'
        }}>
          ARTIST PHOTO
        </div>
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 300,
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            About the Artist
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--bark-light)', marginBottom: '1rem' }}>
            Scott Hoglund is a visual artist working across painting, drawing, and mixed media. His work explores the interplay of texture, memory, and the quiet moments that shape us.
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--bark-light)' }}>
            Each piece is hand-scanned from the original to preserve the grain, the imperfections, and the honesty of the work as it was made.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section" style={{
        padding: '6rem 3rem',
        textAlign: 'center',
        background: 'var(--warm-cream)'
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          fontWeight: 300,
          marginBottom: '1rem'
        }}>
          Interested in a Piece?
        </h2>
        <p style={{
          color: 'var(--stone)',
          fontSize: '0.9rem',
          marginBottom: '2rem',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Originals and prints coming soon. For inquiries about available work, commissions, or to say hello:
        </p>
        <a
          className="contact-email"
          href="mailto:scott@scotthoglundart.com"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.3rem',
            color: 'var(--clay)',
            textDecoration: 'none',
            borderBottom: '1.5px solid transparent',
            transition: 'border-color 0.3s',
            letterSpacing: '0.02em'
          }}
          onMouseOver={e => e.target.style.borderBottomColor = 'var(--clay)'}
          onMouseOut={e => e.target.style.borderBottomColor = 'transparent'}
        >
          scott@scotthoglundart.com
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '3rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--stone)',
        letterSpacing: '0.08em'
      }}>
        <p>© 2026 Scott Hoglund Art &nbsp;·&nbsp; Site by <a href="#" style={{ color: 'var(--clay)' }}>CARES Consulting Inc</a> & <a href="#" style={{ color: 'var(--clay)' }}>Kari Hoglund Kounkel LLC</a></p>
      </footer>

      {/* LIGHTBOX */}
      {selectedArt && <Lightbox art={selectedArt} onClose={() => setSelectedArt(null)} />}

      <Toast />
    </>
  )
}
