import supabase from '../config/supabase.js'

// Read "Authorization: Bearer <token>" and ask Supabase who it belongs to.
// Returns the user, or null if there's no valid token.
async function getUserFromRequest(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return null
  }
  const token = header.slice('Bearer '.length)
  const { data, error } = await supabase.auth.getUser(token)
  if (error) {
    return null
  }
  return data.user
}

// Only let logged-in users through
export async function requireLogin(req, res, next) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'You must be logged in' })
  }
  req.user = user
  next()
}

// Only let admins through
export async function requireAdmin(req, res, next) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'You must be logged in' })
  }
  if (user.app_metadata.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' })
  }
  req.user = user
  next()
}
