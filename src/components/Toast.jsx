import { useState, useEffect } from 'react'

let showToastFn = null

export function toast(message) {
  if (showToastFn) showToastFn(message)
}

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    showToastFn = (msg) => {
      setMessage(msg)
      setVisible(true)
      setTimeout(() => setVisible(false), 3000)
    }
    return () => { showToastFn = null }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'var(--bark)',
      color: 'var(--parchment)',
      padding: '1rem 1.8rem',
      borderRadius: '3px',
      fontSize: '0.85rem',
      zIndex: 300,
      transform: visible ? 'translateY(0)' : 'translateY(100px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s ease',
      pointerEvents: 'none'
    }}>
      {message}
    </div>
  )
}
