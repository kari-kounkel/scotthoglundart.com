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

// ─── GALLERY ORDER (ranking) ───

// Persist a new manual rank order (array of ids, top → bottom).
export async function reorderArtworks(orderedIds) {
  const updates = orderedIds.map((id, i) =>
    supabase.from('artworks').update({ sort_order: i }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find(r => r.error)
  if (failed) throw failed.error
}

// One-click: rank everything newest-first.
export async function rankByNewest() {
  const all = await fetchAllArtworks()
  const byNewest = [...all].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  await reorderArtworks(byNewest.map(a => a.id))
}

// ─── PRODUCTS (Daisy's Trading Post) ───

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products').select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products').select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── ORDERS ───

export async function placeOrder(order) {
  // no .select(): buyers have insert-only rights (no read policy) by design
  const { error } = await supabase.from('orders').insert(order)
  if (error) throw error
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── DAISY'S DISPATCH (newsletter → the Nut Cache) ───

export async function subscribeToDispatch(email) {
  // upsert on the unique email so a repeat signup is a no-op, not an error.
  // No .select() chained: anon has insert-only rights (no read policy) by design.
  const { error } = await supabase
    .from('dispatch_subscribers')
    .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true })

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

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/admin?reset=true'
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
