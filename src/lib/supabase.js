import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── ARTWORK FUNCTIONS ───

export async function fetchArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchAllArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createArtwork(artwork) {
  const { data, error } = await supabase
    .from('artworks')
    .insert(artwork)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateArtwork(id, updates) {
  const { data, error } = await supabase
    .from('artworks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteArtwork(id) {
  // First get the image path so we can delete from storage
  const { data: artwork } = await supabase
    .from('artworks')
    .select('image_path')
    .eq('id', id)
    .single()

  if (artwork?.image_path) {
    await supabase.storage.from('artwork').remove([artwork.image_path])
  }

  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── IMAGE UPLOAD ───

export async function uploadImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  const filePath = `scans/${fileName}`

  const { error } = await supabase.storage
    .from('artwork')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return filePath
}

export function getImageUrl(path) {
  if (!path) return null
  const { data } = supabase.storage.from('artwork').getPublicUrl(path)
  return data.publicUrl
}

// ─── AUTH ───

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
