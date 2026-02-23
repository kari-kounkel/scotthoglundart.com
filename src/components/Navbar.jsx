import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 3rem',
      background: scrolled ? 'rgba(245, 240, 232, 0.95)' : 'linear-gradient(to bottom, var(--parchment), transparent)',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      boxShadow: scrolled ? '0 1px 0 var(--shadow)' : 'none',
      transition: 'all 0.4s'
    }}>
      <a href="/" style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.6rem',
        fontWeight: 300,
        letterSpacing: '0.08em',
        color: 'var(--bark)',
        textDecoration: 'none'
      }}>
        Scott Hoglund <span style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Art</span>
      </a>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <NavLink href="#gallery">Gallery</NavLink>
        <NavLink href="#about">About</NavLink>
        <NavLink href="#contact">Contact</NavLink>
        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'var(--bark)',
            color: 'var(--parchment)',
            border: 'none',
            padding: '0.5rem 1.2rem',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }}
          onMouseOver={e => e.target.style.background = 'var(--clay)'}
          onMouseOut={e => e.target.style.background = 'var(--bark)'}
        >
          Admin
        </button>
      </div>
    </nav>
  )
}

function NavLink({ href, children }) {
  return (
    <a href={href} style={{
      textDecoration: 'none',
      color: 'var(--bark-light)',
      fontSize: '0.85rem',
      fontWeight: 400,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      transition: 'color 0.3s'
    }}
    onMouseOver={e => e.target.style.color = 'var(--clay)'}
    onMouseOut={e => e.target.style.color = 'var(--bark-light)'}
    >
      {children}
    </a>
  )
}
