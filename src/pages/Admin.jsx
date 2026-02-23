import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  supabase, signIn, signOut, getSession,
  fetchAllArtworks, createArtwork, updateArtwork, deleteArtwork as deleteArtworkApi,
  uploadImage, getImageUrl
} from '../lib/supabase'
import Toast, { toast } from '../components/Toast'

export default function Admin() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [artworks, setArtworks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadArtworks()
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
        const updates = { title, medium, year, price, description }

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

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setMedium('')
    setYear('')
    setPrice('')
    setDescription('')
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--stone)' }}>Loading...</div>
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
            Admin Login
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--stone)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
            Sign in to manage the gallery
          </p>

          {loginError && (
            <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.6rem', background: '#fdecea', borderRadius: '3px' }}>
              {loginError}
            </p>
          )}

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
            onClick={() => navigate('/')}
            style={{
              marginTop: '1.5rem',
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
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
          fontWeight: 400,
          marginBottom: '1.5rem'
        }}>
          Collection
        </h2>

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
            {artworks.map(art => (
              <div key={art.id} style={{
                position: 'relative',
                borderRadius: '4px',
                overflow: 'hidden',
                background: 'var(--warm-cream)',
                border: editingId === art.id ? '2px solid var(--clay)' : '1px solid #e8e2d8',
                opacity: art.is_visible ? 1 : 0.5,
                transition: 'all 0.3s'
              }}>
                <img
                  src={getImageUrl(art.image_path)}
                  alt={art.title}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer'
                  }}
                  onClick={() => startEdit(art)}
                />
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
