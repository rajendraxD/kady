import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { jwtSecret as JWT_SECRET } from '../config/env.js'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'

// In-memory token blacklist (keyed by token). Tokens stay blacklisted until expiry.
const tokenBlacklist = new Set()

// In-memory store of currently valid refresh tokens. Rotated on refresh and
// removed on logout. Suitable for the single-admin dev setup.
const refreshTokenStore = new Set()

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, email: user.email, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })
}

function generateRefreshToken(user) {
  const token = jwt.sign({ id: user._id, email: user.email, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL })
  refreshTokenStore.add(token)
  return token
}

function verifyRefreshToken(token) {
  if (!token || !refreshTokenStore.has(token)) return null
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.type !== 'refresh') return null
    return decoded
  } catch {
    refreshTokenStore.delete(token)
    return null
  }
}

function revokeRefreshToken(token) {
  refreshTokenStore.delete(token)
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

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  requireAuth,
  blacklistToken,
  JWT_SECRET
}
