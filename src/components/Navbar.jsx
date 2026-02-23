import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleNavClick(href) {
    setMenuOpen(false)
    window.location.href = href
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="/" className="logo">
        Scott Hoglund <span>Art</span>
      </a>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        <a className="nav-link" onClick={() => handleNavClick('#gallery')}>Gallery</a>
        <a className="nav-link" onClick={() => handleNavClick('#about')}>About</a>
        <a className="nav-link" onClick={() => handleNavClick('#contact')}>Contact</a>
        <button
          className="nav-admin"
          onClick={() => { setMenuOpen(false); navigate('/admin') }}
        >
          Admin
        </button>
      </div>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}
