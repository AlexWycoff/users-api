import express from 'express'
import { requireLogin, requireAdmin } from '../middleware/auth.js'
import {
  getUsers,
  getUserProfiles,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js'

// Every path here starts with /users (set in index.js)
const router = express.Router()

router.get('/', getUsers) // GET /users (anyone)
router.get('/profiles', requireLogin, getUserProfiles) // GET /users/profiles (logged in)
router.post('/', requireAdmin, createUser) // POST /users (admin)
router.put('/:id', requireAdmin, updateUser) // PUT /users/:id (admin)
router.delete('/:id', requireAdmin, deleteUser) // DELETE /users/:id (admin)

export default router
