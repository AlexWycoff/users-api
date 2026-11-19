import express from 'express'
import { requireLogin } from '../middleware/auth.js'
import { getPosts, createPost, deletePost } from '../controllers/postsController.js'

// Every path here starts with /posts (set in index.js)
const router = express.Router()

router.get('/', getPosts) // GET /posts (anyone)
router.post('/', requireLogin, createPost) // POST /posts (logged in)
router.delete('/:id', requireLogin, deletePost) // DELETE /posts/:id (author or admin)

export default router
