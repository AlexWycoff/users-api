import supabase from '../config/supabase.js'

// GET /users: return every user
export async function getUsers(req, res) {
  const { data, error } = await supabase.from('users').select('*').order('id')
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
  res.json(data)
}

// GET /users/profiles: every user joined with their profile
export async function getUserProfiles(req, res) {
  const { data, error } = await supabase.from('users').select('*, user_profiles(*)').order('id')
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch user profiles' })
  }
  res.json(data)
}

// POST /users: add a new user and their profile
export async function createUser(req, res) {
  const { first_name, last_name, email, major, graduation_year } = req.body
  const { bio, date_of_birth, profile_picture_url } = req.body

  const { data: user, error } = await supabase
    .from('users')
    .insert({ first_name, last_name, email, major, graduation_year })
    .select()
    .single()

  if (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A user with that email already exists' })
    }
    return res.status(500).json({ error: 'Failed to create user' })
  }

  // The profile uses the same id as the user (one-to-one)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({ id: user.id, bio, date_of_birth, profile_picture_url })

  if (profileError) {
    console.error(profileError)
    return res.status(500).json({ error: 'User created, but failed to create profile' })
  }

  res.status(201).json(user)
}

// PUT /users/:id: update a user and their profile
export async function updateUser(req, res) {
  const id = req.params.id
  const { first_name, last_name, email, major, graduation_year } = req.body
  const { bio, date_of_birth, profile_picture_url } = req.body

  const { data, error } = await supabase
    .from('users')
    .update({ first_name, last_name, email, major, graduation_year })
    .eq('id', id)
    .select()

  if (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A user with that email already exists' })
    }
    return res.status(500).json({ error: 'Failed to update user' })
  }
  if (data.length === 0) {
    return res.status(404).json({ error: 'User not found' })
  }

  // upsert = update the profile if it exists, otherwise create it
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({ id, bio, date_of_birth, profile_picture_url })

  if (profileError) {
    console.error(profileError)
    return res.status(500).json({ error: 'User updated, but failed to update profile' })
  }

  res.json(data[0])
}

// DELETE /users/:id: remove a user (their profile and posts are removed too, by ON DELETE CASCADE)
export async function deleteUser(req, res) {
  const { data, error } = await supabase.from('users').delete().eq('id', req.params.id).select()
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to delete user' })
  }
  if (data.length === 0) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.status(204).send()
}
