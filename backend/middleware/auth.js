import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { jwtSecret as JWT_SECRET } from '../config/env.js'

// In-memory token blacklist (keyed by token). Tokens stay blacklisted until expiry.
const tokenBlacklist = new Set()

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
}

function blacklistToken(token) {
  tokenBlacklist.add(token)
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = header.split(' ')[1]

    // Check if token has been blacklisted (logged out)
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token has been invalidated. Please login again.' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    req.token = token
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export { generateToken, requireAuth, blacklistToken, JWT_SECRET }
