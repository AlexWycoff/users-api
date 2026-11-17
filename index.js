import 'dotenv/config' // loads the values from .env into process.env
import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg

// Connect to the Postgres database on Render
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // Render requires SSL for outside connections
})

const app = express()
app.use(cors()) // lets the React app (on a different port) call this API
app.use(express.json()) // lets us read JSON request bodies

// GET /users: return every user in the database
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// POST /users: add a new user
app.post('/users', async (req, res) => {
  const { first_name, last_name, email, bio, major, graduation_year, profile_picture_url } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, bio, major, graduation_year, profile_picture_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [first_name, last_name, email, bio, major, graduation_year, profile_picture_url]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A user with that email already exists' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// PUT /users/:id: update an existing user
app.put('/users/:id', async (req, res) => {
  const { first_name, last_name, email, bio, major, graduation_year, profile_picture_url } = req.body
  try {
    const result = await pool.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, bio = $4,
           major = $5, graduation_year = $6, profile_picture_url = $7
       WHERE id = $8
       RETURNING *`,
      [first_name, last_name, email, bio, major, graduation_year, profile_picture_url, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A user with that email already exists' })
    }
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// DELETE /users/:id: remove a user
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
