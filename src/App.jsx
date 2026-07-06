import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Gallery from './components/Gallery'
import Lightbox from './components/Lightbox'
import Toast from './components/Toast'
import Dispatch from './components/Dispatch'
import TradingPost from './components/TradingPost'
import { fetchArtworks } from './lib/supabase'
import {
  Acorn, AcornDivider, DaisyMark, DaisyLoader,
  HiddenDaisy, DaisyNoteModal
} from './components/Daisy'
import { AcornHuntProvider, ScamperingDaisy } from './components/AcornHunt'

export default function App() {
  const [artworks, setArtworks] = useState([])
  const [selectedArt, setSelectedArt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadArtworks() }, [])

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
    <AcornHuntProvider>
      <Navbar />

      {/* ─── HERO / GALLERY ─── */}
      <section id="gallery" className="hero-section" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start', alignItems: 'center', padding: '8rem 2rem 5rem',
        position: 'relative'
      }}>
        <p style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
          fontSize: 'clamp(0.62rem, 1.7vw, 0.74rem)', color: 'var(--terracotta)',
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
          marginBottom: '1.1rem', animation: 'fadeUp 1s ease 0.1s both'
        }}>
          <Acorn size={15} color="var(--terracotta)" /> Curated by Daisy
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 6vw, 5rem)',
          fontWeight: 300, textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.04em',
          animation: 'fadeUp 1s ease 0.2s both'
        }}>
          Original Works
        </h1>
        <p style={{
          fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', color: 'var(--stone)', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 300, marginBottom: '1.5rem',
          animation: 'fadeUp 1s ease 0.5s both', textAlign: 'center'
        }}>
          Paintings · Drawings · Prints
        </p>

        <div style={{ animation: 'fadeUp 1s ease 0.8s both', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {loading
            ? <DaisyLoader />
            : <Gallery artworks={artworks} onSelect={setSelectedArt} />}
        </div>

        <HiddenDaisy
          id="hero"
          note="He didn’t reach for me. That’s why I came."
          size={30}
          style={{ left: '4vw', bottom: '3rem' }}
        />
      </section>

      {/* ─── ABOUT + THE DAISY STORY ─── */}
      <section id="about" style={{ background: 'var(--warm-cream)', position: 'relative' }}>
        {/* Artist */}
        <div className="about-section" style={{
          padding: '6rem 3rem 3rem', maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'center'
        }}>
          <img src="/scott.jpeg" alt="Scott Hoglund"
            style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '3px' }} />
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 300, marginBottom: '1.5rem', lineHeight: 1.2
            }}>
              About the Artist
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--bark-light)', marginBottom: '1rem' }}>
              Scott Hoglund is a visual artist working across painting, drawing, and mixed media.
              His work lingers on texture, memory, and the quiet moments that shape us — the beauty
              that turns up in unlikely places, if you sit still long enough to notice it.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--bark-light)' }}>
              Each piece is hand-scanned from the original to preserve the grain, the imperfections,
              and the honesty of the work as it was made.
            </p>
          </div>
        </div>

        <AcornDivider label="A word on the curator" />

        {/* Daisy's origin story — the thread, not the whole sweater */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 2rem 6rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <DaisyMark size={104} color="var(--clay)" />
          </div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 300, marginBottom: '1.5rem'
          }}>
            Meet Daisy
          </h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.9, color: 'var(--bark)', marginBottom: '1.25rem' }}>
            Every gallery has a curator. This one has a squirrel.
          </p>
          <p style={{ fontSize: '0.96rem', lineHeight: 1.9, color: 'var(--bark-light)', marginBottom: '1.25rem' }}>
            Not long ago, in a hard and unlikely place, Scott made an improbable friend. A wild squirrel
            he named Daisy began coming close — closer than wild things usually do — until one afternoon
            she climbed right up and settled onto his lap. She chose him. In a season with very little
            softness in it, something small and wild decided he was safe.
          </p>
          <p style={{ fontSize: '0.96rem', lineHeight: 1.9, color: 'var(--bark-light)', marginBottom: '1.25rem' }}>
            Scott came home in February. Daisy stayed wild — but she still knows him, and he still
            looks for her. So in her honor she was made the unofficial curator of this gallery: the one
            who decides which pieces get watched over, which are worth guarding like a good acorn.
            When you spot her little mark on a work, that’s <em>Daisy’s Pick</em> — she picked it.
          </p>
          <p style={{ fontSize: '0.96rem', lineHeight: 1.9, color: 'var(--bark-light)' }}>
            The art here is Scott’s. Daisy just keeps an eye on it — and tucks a few notes away for
            anyone patient enough to find her.
          </p>

          <HiddenDaisy
            id="about"
            note="Everything worth keeping, I keep twice."
            size={32}
            style={{ right: '2vw', bottom: '1.5rem' }}
          />
        </div>
      </section>

      {/* ─── DAISY'S TRADING POST (shop) ─── */}
      <TradingPost />

      {/* ─── DAISY'S DISPATCH ─── */}
      <div style={{ background: 'var(--warm-cream)', position: 'relative' }}>
        <Dispatch />
        <HiddenDaisy
          id="dispatch"
          note="I never send junk. Only the good acorns."
          size={28}
          style={{ left: '5vw', bottom: '2rem' }}
        />
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: '3.5rem 2rem 3rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Acorn size={20} color="var(--stone)" />
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--bark-light)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", marginBottom: '1.25rem' }}>
          Curated, guarded, and occasionally hidden by Daisy.
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--stone)', letterSpacing: '0.08em', lineHeight: 1.8 }}>
          © 2026 Scott Hoglund Art &nbsp;·&nbsp; Site by{' '}
          <a href="https://caresmn.com" style={{ color: 'var(--clay)' }}>CARES Consulting Inc</a>{' '}&amp;{' '}
          <span style={{ color: 'var(--clay)' }}>Kari Hoglund Kounkel LLC</span>
        </p>

        <HiddenDaisy
          id="footer"
          note="Psst — the good stuff is never on the top shelf. Keep looking."
          size={28}
          style={{ right: '4vw', bottom: '1.25rem' }}
        />
      </footer>

      {/* ─── OVERLAYS + FUN ─── */}
      {selectedArt && <Lightbox art={selectedArt} onClose={() => setSelectedArt(null)} />}
      <DaisyNoteModal />
      <ScamperingDaisy />
      <Toast />
    </AcornHuntProvider>
  )
}
