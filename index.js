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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
