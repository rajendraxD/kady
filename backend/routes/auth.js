const express = require('express')
const User = require('../models/User')
const { generateToken } = require('../middleware/auth')
const { sendOtpEmail } = require('../lib/email')

const router = express.Router()

// In‑memory OTP store (keyed by user email). Suitable for single‑admin dev.
const otpStore = new Map()

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, mobile } = req.body

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

    // Validate mobile against the stored user record
    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, '')
      const cleanStored = user.mobile.replace(/\D/g, '')
      if (cleanMobile !== cleanStored) {
        return res.status(401).json({ error: 'This mobile number is not registered with our organisation.' })
      }
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

module.exports = router
