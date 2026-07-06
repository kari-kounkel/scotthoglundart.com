import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  supabase, signIn, signOut, getSession,
  resetPassword, updatePassword,
  fetchAllArtworks, createArtwork, updateArtwork, deleteArtwork as deleteArtworkApi,
  uploadImage, getImageUrl, reorderArtworks, rankByNewest
} from '../lib/supabase'
import Toast, { toast } from '../components/Toast'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'

export default function Admin() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [artworks, setArtworks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('gallery')
  const [dragIndex, setDragIndex] = useState(null)

  // Form state
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [daisyNote, setDaisyNote] = useState('')
  const [isDaisyPick, setIsDaisyPick] = useState(false)
  const [isAdopted, setIsAdopted] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    checkSession()

    // Check if this is a password reset redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset') === 'true') {
      setShowResetPassword(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true)
      }
      if (session && !showResetPassword) loadArtworks()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const s = await getSession()
    setSession(s)
    if (s) await loadArtworks()
    setLoading(false)
  }

  async function loadArtworks() {
    try {
      const data = await fetchAllArtworks()
      setArtworks(data)
    } catch (err) {
      console.error('Error loading:', err)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      await signIn(email, password)
      toast('Welcome back, Scott ✦')
    } catch (err) {
      setLoginError(err.message)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoginError('')
    if (!email) {
      setLoginError('Enter your email address first')
      return
    }
    try {
      await resetPassword(email)
      setForgotSent(true)
      toast('Reset link sent — check your email')
    } catch (err) {
      setLoginError(err.message)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setLoginError('')
    if (newPassword !== confirmPassword) {
      setLoginError('Passwords don\'t match')
      return
    }
    if (newPassword.length < 6) {
      setLoginError('Password must be at least 6 characters')
      return
    }
    try {
      await updatePassword(newPassword)
      setShowResetPassword(false)
      setNewPassword('')
      setConfirmPassword('')
      toast('✦ Password updated successfully')
      // Clean up URL
      window.history.replaceState({}, '', '/admin')
    } catch (err) {
      setLoginError(err.message)
    }
  }

  async function handleSignOut() {
    await signOut()
    setSession(null)
    navigate('/')
  }

  // ─── FILE HANDLING ───
  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  function detectOrientation(file) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.width > img.height ? 'landscape' : 'portrait')
      img.onerror = () => resolve('portrait')
      img.src = URL.createObjectURL(file)
    })
  }

  // ─── SUBMIT (CREATE OR UPDATE) ───
  async function handleSubmit(e) {
    e.preventDefault()
    setUploading(true)

    try {
      if (editingId) {
        // UPDATE existing
        const updates = {
          title, medium, year, price, description,
          daisy_note: daisyNote, is_daisy_pick: isDaisyPick, is_adopted: isAdopted
        }

        // If new file selected, upload it
        if (file) {
          const imagePath = await uploadImage(file)
          const orientation = await detectOrientation(file)
          updates.image_path = imagePath
          updates.orientation = orientation
        }

        await updateArtwork(editingId, updates)
        toast('✦ Artwork updated')
      } else {
        // CREATE new
        if (!file) {
          toast('Please select an image first')
          setUploading(false)
          return
        }

        const imagePath = await uploadImage(file)
        const orientation = await detectOrientation(file)

        await createArtwork({
          title,
          medium,
          year,
          price,
          description,
          daisy_note: daisyNote,
          is_daisy_pick: isDaisyPick,
          is_adopted: isAdopted,
          image_path: imagePath,
          orientation
        })
        toast('✦ Artwork added to gallery')
      }

      resetForm()
      await loadArtworks()
    } catch (err) {
      console.error('Error:', err)
      toast('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // ─── EDIT ───
  function startEdit(art) {
    setEditingId(art.id)
    setTitle(art.title || '')
    setMedium(art.medium || '')
    setYear(art.year || '')
    setPrice(art.price || '')
    setDescription(art.description || '')
    setDaisyNote(art.daisy_note || '')
    setIsDaisyPick(!!art.is_daisy_pick)
    setIsAdopted(!!art.is_adopted)
    setFile(null)
    setPreview(getImageUrl(art.image_path))

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast('Editing: ' + art.title)
  }

  // ─── DELETE ───
  async function handleDelete(id, title) {
    if (!confirm(`Remove "${title}" from the gallery?`)) return
    try {
      await deleteArtworkApi(id)
      if (editingId === id) resetForm()
      await loadArtworks()
      toast('Artwork removed')
    } catch (err) {
      toast('Error: ' + err.message)
    }
  }

  // ─── TOGGLE VISIBILITY ───
  async function toggleVisibility(art) {
    try {
      await updateArtwork(art.id, { is_visible: !art.is_visible })
      await loadArtworks()
      toast(art.is_visible ? 'Hidden from gallery' : 'Now visible in gallery')
    } catch (err) {
      toast('Error: ' + err.message)
    }
  }

  // ─── REORDER (rank) ───
  async function handleDrop(toIndex) {
    if (dragIndex === null || dragIndex === toIndex) { setDragIndex(null); return }
    const next = [...artworks]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(toIndex, 0, moved)
    setArtworks(next)            // optimistic
    setDragIndex(null)
    try {
      await reorderArtworks(next.map(a => a.id))
      toast('✦ New order saved')
    } catch (err) {
      toast('Error saving order: ' + err.message)
      await loadArtworks()
    }
  }

  async function handleRankNewest() {
    if (!confirm('Re-rank the whole gallery newest-first? (You can still drag to fine-tune after.)')) return
    try {
      await rankByNewest()
      await loadArtworks()
      toast('✦ Ranked newest-first')
    } catch (err) {
      toast('Error: ' + err.message)
    }
  }

  // ─── TOGGLE ADOPTED (sold) ───
  async function toggleAdopted(art) {
    try {
      await updateArtwork(art.id, { is_adopted: !art.is_adopted })
      await loadArtworks()
      toast(art.is_adopted ? 'Back on the shelf' : '🌰 Adopted into New Forests')
    } catch (err) {
      toast('Error: ' + err.message)
    }
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setMedium('')
    setYear('')
    setPrice('')
    setDescription('')
    setDaisyNote('')
    setIsDaisyPick(false)
    setIsAdopted(false)
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--stone)' }}>Loading...</div>
  }

  // ─── RESET PASSWORD SCREEN (after clicking email link) ───
  if (showResetPassword) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '4px',
          boxShadow: '0 4px 20px var(--shadow)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.8rem',
            fontWeight: 400,
            marginBottom: '0.3rem'
          }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--stone)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
            Choose a new password for your account
          </p>

          {loginError && (
            <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.6rem', background: '#fdecea', borderRadius: '3px' }}>
              {loginError}
            </p>
          )}

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
        <Toast />
      </div>
    )
  }

  // ─── LOGIN SCREEN ───
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '4px',
          boxShadow: '0 4px 20px var(--shadow)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.8rem',
            fontWeight: 400,
            marginBottom: '0.3rem'
          }}>
            {showForgot ? 'Reset Password' : 'Admin Login'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--stone)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
            {showForgot
              ? forgotSent
                ? 'Check your email for a reset link'
                : 'Enter your email and we\'ll send a reset link'
              : 'Sign in to manage the gallery'
            }
          </p>

          {loginError && (
            <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.6rem', background: '#fdecea', borderRadius: '3px' }}>
              {loginError}
            </p>
          )}

          {showForgot ? (
            forgotSent ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--bark-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  If that email is in our system, you'll receive a reset link shortly. Check your spam folder too.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); setLoginError('') }}
                  className="btn-primary"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="scott@email.com" />
                </div>
                <button type="submit" className="btn-primary">Send Reset Link</button>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setLoginError('') }}
                  style={{
                    marginTop: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--stone)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center'
                  }}
                >
                  ← Back to login
                </button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="scott@email.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                <button type="submit" className="btn-primary">Sign In</button>
              </form>

              <button
                onClick={() => { setShowForgot(true); setLoginError('') }}
                style={{
                  marginTop: '1rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--clay)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                Forgot password?
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--stone)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center'
            }}
          >
            ← Back to gallery
          </button>
        </div>
        <Toast />
      </div>
    )
  }

  // ─── ADMIN DASHBOARD ───
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #d4cdc0'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem',
            fontWeight: 400
          }}>
            Gallery Admin
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--stone)', marginTop: '0.3rem' }}>
            {artworks.length} piece{artworks.length !== 1 ? 's' : ''} in collection
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: '1.5px solid var(--bark)',
              color: 'var(--bark)',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            View Site
          </button>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1.5px solid var(--stone)',
              color: 'var(--stone)',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[['gallery', 'Gallery'], ['products', 'Trading Post'], ['orders', 'Orders']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: tab === key ? 'var(--bark)' : 'transparent',
            color: tab === key ? 'var(--parchment)' : 'var(--bark-light)',
            border: `1.5px solid ${tab === key ? 'var(--bark)' : '#d4cdc0'}`,
            borderRadius: '20px', padding: '0.4rem 1.1rem', cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', transition: 'all 0.25s'
          }}>{label}</button>
        ))}
      </div>

      {tab === 'products' && <AdminProducts artworks={artworks} />}
      {tab === 'orders' && <AdminOrders />}

      {tab === 'gallery' && (<>
      {/* Upload / Edit Form */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '4px',
        boxShadow: '0 2px 12px var(--shadow)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
          fontWeight: 400,
          marginBottom: '0.3rem'
        }}>
          {editingId ? 'Edit Artwork' : 'Upload Artwork'}
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--stone)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
          {editingId ? 'Update this piece\'s details' : 'Add a new piece to the gallery'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Upload zone */}
          {(!editingId || file) ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d4cdc0',
                borderRadius: '4px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'white',
                marginBottom: '1.2rem',
                transition: 'all 0.3s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--clay)'
                e.currentTarget.style.background = 'rgba(198, 122, 75, 0.04)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#d4cdc0'
                e.currentTarget.style.background = 'white'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--terracotta)' }}>⬆</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>
                {file ? file.name : 'Drop your art scan here or click to browse'}
              </p>
            </div>
          ) : null}

          {/* Preview */}
          {preview && (
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '250px',
                  maxHeight: '250px',
                  borderRadius: '3px',
                  border: '1px solid #d4cdc0'
                }}
              />
              {editingId && !file && (
                <p
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '0.78rem', color: 'var(--clay)', marginTop: '0.5rem', cursor: 'pointer' }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  Click to replace image
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Untitled No. 7" />
          </div>
          <div className="form-group">
            <label>Medium</label>
            <input type="text" value={medium} onChange={e => setMedium(e.target.value)} placeholder="Oil on canvas, 24×36" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Year</label>
              <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="2025" />
            </div>
            <div className="form-group">
              <label>Price (optional)</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="$450" />
            </div>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A few words about this piece..." />
          </div>

          {/* ─── Daisy's curation ─── */}
          <div style={{
            background: 'var(--warm-cream)', border: '1px solid #e0d8ca', borderRadius: '4px',
            padding: '1.2rem 1.3rem', marginBottom: '1.2rem'
          }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--clay)', marginBottom: '1rem', fontWeight: 600 }}>
              🌰 Daisy’s Corner
            </p>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Daisy’s Note (optional)</label>
              <textarea
                value={daisyNote}
                onChange={e => setDaisyNote(e.target.value)}
                placeholder="Written as if Daisy chose or protected this piece — e.g. “I sat with this one the longest.”"
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '0.7rem', fontSize: '0.88rem', color: 'var(--bark-light)' }}>
              <input type="checkbox" checked={isDaisyPick} onChange={e => setIsDaisyPick(e.target.checked)} style={{ width: 'auto' }} />
              Mark as <strong>Daisy’s Pick</strong> (shows an acorn seal on the piece)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--bark-light)' }}>
              <input type="checkbox" checked={isAdopted} onChange={e => setIsAdopted(e.target.checked)} style={{ width: 'auto' }} />
              <strong>Adopted into New Forests</strong> (sold — hides the price, adds the ribbon)
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? 'Working...' : editingId ? 'Save Changes' : 'Add to Gallery'}
          </button>

          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Gallery Grid */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '4px',
        boxShadow: '0 2px 12px var(--shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 400 }}>
            Collection
          </h2>
          <button onClick={handleRankNewest} style={{
            background: 'none', border: '1.5px solid var(--clay)', color: 'var(--clay)',
            padding: '0.4rem 0.9rem', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            borderRadius: '3px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif"
          }}>↻ Rank newest-first</button>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--stone)', marginBottom: '1.5rem' }}>
          Drag any piece to rank it — the order here is the order visitors see under “Curated.”
        </p>

        {artworks.length === 0 ? (
          <p style={{ color: 'var(--stone)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            No artwork yet. Upload your first piece above!
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem'
          }}>
            {artworks.map((art, idx) => (
              <div key={art.id}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                style={{
                  position: 'relative',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: 'var(--warm-cream)',
                  border: editingId === art.id ? '2px solid var(--clay)'
                    : dragIndex === idx ? '2px dashed var(--terracotta)' : '1px solid #e8e2d8',
                  opacity: art.is_visible ? 1 : 0.5,
                  transition: 'border 0.2s',
                  cursor: 'grab'
                }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(art.image_path)}
                    alt={art.title}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      display: 'block',
                      cursor: 'pointer',
                      filter: art.is_adopted ? 'saturate(0.8)' : 'none'
                    }}
                    onClick={() => startEdit(art)}
                  />
                  {art.is_daisy_pick && (
                    <span title="Daisy's Pick" style={{
                      position: 'absolute', top: '0.35rem', left: '0.35rem', fontSize: '0.8rem',
                      background: 'rgba(245,240,232,0.92)', borderRadius: '50%', width: '1.5rem', height: '1.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>🌰</span>
                  )}
                  {art.is_adopted && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(74,93,62,0.9)',
                      color: 'var(--parchment)', fontSize: '0.56rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', textAlign: 'center', padding: '0.25rem'
                    }}>Adopted</span>
                  )}
                </div>
                <div style={{ padding: '0.6rem 0.8rem' }}>
                  <p style={{
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {art.title}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <SmallBtn onClick={() => startEdit(art)} title="Edit">✎</SmallBtn>
                    <SmallBtn onClick={() => toggleAdopted(art)} title={art.is_adopted ? 'Mark available' : 'Mark adopted (sold)'}>🌰</SmallBtn>
                    <SmallBtn onClick={() => toggleVisibility(art)} title={art.is_visible ? 'Hide' : 'Show'}>
                      {art.is_visible ? '👁' : '👁‍🗨'}
                    </SmallBtn>
                    <SmallBtn onClick={() => handleDelete(art.id, art.title)} title="Delete" danger>×</SmallBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>)}

      <Toast />
    </div>
  )
}

function SmallBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1,
        padding: '0.3rem',
        background: danger ? '#c0392b' : 'var(--bark)',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        fontSize: '0.7rem',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        fontFamily: "'Outfit', sans-serif"
      }}
      onMouseOver={e => e.target.style.opacity = '0.8'}
      onMouseOut={e => e.target.style.opacity = '1'}
    >
      {children}
    </button>
  )
}
