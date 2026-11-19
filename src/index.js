import 'dotenv/config' // loads the values from .env into process.env
import express from 'express'
import cors from 'cors'
import usersRouter from './routers/usersRouter.js'
import postsRouter from './routers/postsRouter.js'

const app = express()
app.use(cors()) // lets the React app (on a different port) call this API
app.use(express.json()) // lets us read JSON request bodies

// Hand each group of paths to its router
app.use('/users', usersRouter)
app.use('/posts', postsRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
