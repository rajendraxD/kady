import express from 'express'
import User from '../models/User.js'
import { generateToken, requireAuth, blacklistToken } from '../middleware/auth.js'
import { sendOtpEmail } from '../lib/email.js'

const router = express.Router()

// In‑memory OTP store (keyed by user email). Suitable for single‑admin dev.
const otpStore = new Map()

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate OTP and store it
    const otp = generateOtp()
    otpStore.set(user.email.toLowerCase(), { otp, expiresAt: Date.now() + 5 * 60 * 1000 })
    // Send OTP via email
    const emailResult = await sendOtpEmail(user.email, otp)
    if (!emailResult.success) {
      console.warn(`⚠️  OTP email delivery failed for ${user.email}, OTP is ${otp}`)
    }

    const token = generateToken(user)
    res.json({ token, user: user.toPublicJSON() })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }

    const stored = otpStore.get(email.toLowerCase())
    if (!stored) {
      return res.status(400).json({ error: 'No OTP was requested. Please login again.' })
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase())
      return res.status(400).json({ error: 'OTP has expired. Please login again.' })
    }

    if (stored.otp !== otp.trim()) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' })
    }

    // OTP verified — clean up
    otpStore.delete(email.toLowerCase())
    res.json({ verified: true, message: 'OTP verified successfully' })
  } catch (err) {
    console.error('OTP verify error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/logout — invalidate the current token
router.post('/logout', requireAuth, async (req, res) => {
  try {
    blacklistToken(req.token)
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/forgot-password — send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' })
    }

    const otp = generateOtp()
    // Use a separate prefix in the OTP store to distinguish from login OTPs
    otpStore.set(`reset:${user.email.toLowerCase()}`, { otp, expiresAt: Date.now() + 5 * 60 * 1000 })

    const emailResult = await sendOtpEmail(user.email, otp)
    if (!emailResult.success) {
      console.warn(`⚠️  Password reset OTP email failed for ${user.email}, OTP is ${otp}`)
    }

    res.json({ message: 'OTP sent to your email for password reset' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/reset-password — verify OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' })
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' })
    }

    const stored = otpStore.get(`reset:${email.toLowerCase()}`)
    if (!stored) {
      return res.status(400).json({ error: 'No OTP was requested. Please start the forgot password process again.' })
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`reset:${email.toLowerCase()}`)
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }

    if (stored.otp !== otp.trim()) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' })
    }

    // OTP verified — update the password
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.password = newPassword
    await user.save()

    // Clean up
    otpStore.delete(`reset:${email.toLowerCase()}`)

    res.json({ message: 'Password updated successfully. Please login with your new password.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const otp = generateOtp()
    otpStore.set(user.email.toLowerCase(), { otp, expiresAt: Date.now() + 5 * 60 * 1000 })

    const emailResult = await sendOtpEmail(user.email, otp)
    if (!emailResult.success) {
      console.warn(`⚠️  Resend OTP email failed for ${user.email}, OTP is ${otp}`)
    }

    res.json({ message: 'OTP resent successfully' })
  } catch (err) {
    console.error('Resend OTP error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }
})

export default router
