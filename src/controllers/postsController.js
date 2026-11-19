import supabase from '../config/supabase.js'

// Find the row in our users table that belongs to the logged-in account (matched by email)
async function findUserByEmail(email) {
  const { data } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
  return data
}

// GET /posts: every post, newest first, with its author's name
export async function getPosts(req, res) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(first_name, last_name)')
    .order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch posts' })
  }
  res.json(data)
}

// POST /posts: create a post as the logged-in user
export async function createPost(req, res) {
  const { content } = req.body
  if (!content) {
    return res.status(400).json({ error: 'Post content is required' })
  }

  const author = await findUserByEmail(req.user.email)
  if (!author) {
    return res.status(400).json({ error: 'No user profile for this account' })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: author.id, content })
    .select()
    .single()
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create post' })
  }
  res.status(201).json(data)
}

// DELETE /posts/:id: only the post's author or an admin may delete it
export async function deletePost(req, res) {
  const { data: post } = await supabase.from('posts').select('*').eq('id', req.params.id).maybeSingle()
  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }

  const isAdmin = req.user.app_metadata.role === 'admin'
  const author = await findUserByEmail(req.user.email)
  const isAuthor = author && author.id === post.user_id
  if (!isAdmin && !isAuthor) {
    return res.status(403).json({ error: 'You can only delete your own posts' })
  }

  const { error } = await supabase.from('posts').delete().eq('id', post.id)
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete post' })
  }
  res.status(204).send()
}
