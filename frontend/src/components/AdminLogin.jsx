import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link as MuiLink
} from '@mui/material'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { login, verifyOtp, resendOtp, forgotPassword, resetPassword } from '../store/authSlice'

const OTP_TIMER_START = 60
const OTP_LENGTH = 4

export default function AdminLogin({ onBackHome, onLoginSuccess }) {
  const dispatch = useDispatch()
  const [step, setStep] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OTP_TIMER_START)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [shakeOtp, setShakeOtp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const otpRefs = useRef([])

  const isOtpStep = step === 'otp' || step === 'forgot-otp'

  useEffect(() => {
    if (!isOtpStep) return
    if (secondsLeft <= 0) {
      setShowTimeoutModal(true)
      return
    }
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [step, secondsLeft, isOtpStep])

  useEffect(() => {
    if (!isOtpStep) return
    otpRefs.current[0]?.focus()
  }, [step, isOtpStep])

  function resetOtpFields() {
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setOtpError('')
    setSecondsLeft(OTP_TIMER_START)
    setShowTimeoutModal(false)
    setShowSuccess(false)
    setShakeOtp(false)
  }

  function resetAllFields() {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setFormError('')
    setForgotEmail('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setResetSuccess(false)
    resetOtpFields()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.')
      return
    }
    setIsSubmitting(true)
    const result = await dispatch(login({ email, password }))
    setIsSubmitting(false)
    if (login.fulfilled.match(result)) {
      resetOtpFields()
      setStep('otp')
    } else {
      setFormError(result.payload || 'Login failed.')
    }
  }

  function handleBackToLogin() {
    setStep('login')
    resetAllFields()
  }

  function handleOtpChange(index, value) {
    if (!/^[0-9]*$/.test(value)) return
    const nextValue = value.slice(-1)
    const updated = [...otpDigits]
    updated[index] = nextValue
    setOtpDigits(updated)
    if (nextValue && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault()
    setOtpError('')
    const enteredOtp = otpDigits.join('')
    if (enteredOtp.length !== OTP_LENGTH) {
      setOtpError('Please enter the 4-digit OTP.')
      return
    }
    const result = await dispatch(verifyOtp({ email, otp: enteredOtp }))
    if (verifyOtp.fulfilled.match(result)) {
      setShowSuccess(true)
      setTimeout(() => onLoginSuccess && onLoginSuccess(), 1000)
    } else {
      setOtpError(result.payload || 'Invalid OTP. Please try again.')
      setShakeOtp(true)
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setTimeout(() => {
        setShakeOtp(false)
        otpRefs.current[0]?.focus()
      }, 500)
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!forgotEmail.trim()) {
      setFormError('Please enter your email address.')
      return
    }
    setIsSubmitting(true)
    const result = await dispatch(forgotPassword({ email: forgotEmail }))
    setIsSubmitting(false)
    if (forgotPassword.fulfilled.match(result)) {
      resetOtpFields()
      setStep('forgot-otp')
    } else {
      setFormError(result.payload || 'Unable to process request.')
    }
  }

  function handleForgotOtpSubmit(e) {
    e.preventDefault()
    setOtpError('')
    const enteredOtp = otpDigits.join('')
    if (enteredOtp.length !== OTP_LENGTH) {
      setOtpError('Please enter the 4-digit OTP.')
      return
    }
    setStep('new-password')
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setFormError('')
    if (!newPassword) {
      setFormError('Please enter a new password.')
      return
    }
    if (newPassword.length < 4) {
      setFormError('Password must be at least 4 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    const enteredOtp = otpDigits.join('')
    if (enteredOtp.length !== OTP_LENGTH) {
      setFormError('Session expired. Please start the forgot password process again.')
      return
    }
    setIsSubmitting(true)
    const result = await dispatch(resetPassword({ email: forgotEmail, otp: enteredOtp, newPassword }))
    setIsSubmitting(false)
    if (resetPassword.fulfilled.match(result)) {
      setResetSuccess(true)
      setTimeout(() => {
        setStep('login')
        resetAllFields()
      }, 2000)
    } else {
      const message = result.payload || 'Unable to reset password.'
      setFormError(message)
      if (message.toLowerCase().includes('otp')) {
        setOtpError(message)
        setOtpDigits(Array(OTP_LENGTH).fill(''))
        setTimeout(() => setStep('forgot-otp'), 500)
      }
    }
  }

  async function handleResendOtp() {
    const targetEmail = step === 'forgot-otp' ? forgotEmail : email
    await dispatch(resendOtp({ email: targetEmail, reset: step === 'forgot-otp' }))
    resetOtpFields()
    setShowTimeoutModal(false)
  }

  const timerColor = secondsLeft > 29 ? 'primary' : secondsLeft > 9 ? 'warning' : 'error'

  const cardSx = {
    maxWidth: 440,
    width: '100%',
    p: { xs: 3, md: 4 },
    border: '1px solid rgba(15,23,42,0.06)'
  }

  const Header = ({ icon, title, subtitle }) => (
    <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <Avatar
        variant="rounded"
        sx={{ background: 'linear-gradient(135deg, #6c63ff, #8b83ff)', width: 52, height: 52 }}
      >
        {icon}
      </Avatar>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {subtitle}
      </Typography>
    </Stack>
  )

  const otpField = (
    <Stack direction="row" spacing={1.5} justifyContent="center" className={shakeOtp ? 'kady-shake' : ''}>
      {otpDigits.map((digit, index) => (
        <TextField
          key={index}
          value={digit}
          onChange={e => handleOtpChange(index, e.target.value)}
          onKeyDown={e => handleOtpKeyDown(index, e)}
          inputRef={el => (otpRefs.current[index] = el)}
          error={Boolean(otpError)}
          inputProps={{
            inputMode: 'numeric',
            maxLength: 1,
            style: { textAlign: 'center', fontSize: 24, fontWeight: 700, width: 28 }
          }}
          sx={{ width: 56 }}
        />
      ))}
    </Stack>
  )

  const otpTimer = (
    <Stack alignItems="center" spacing={0.5} sx={{ my: 2 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={(secondsLeft / OTP_TIMER_START) * 100}
          color={timerColor}
          size={72}
          thickness={4}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="subtitle1" fontWeight={700}>{secondsLeft}s</Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">Enter the code before it expires</Typography>
    </Stack>
  )

  function renderLogin() {
    return (
      <>
        <Header icon={<LockRoundedIcon />} title="Welcome Back" subtitle="Sign in to manage applications." />
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email ID"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockRoundedIcon fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Stack>
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <MuiLink component="button" type="button" underline="hover" onClick={() => { setForgotEmail(email); setStep('forgot') }}>
            Forgot Password?
          </MuiLink>
          <MuiLink component="button" type="button" underline="hover" onClick={onBackHome}>
            Back to Home
          </MuiLink>
        </Stack>
      </>
    )
  }

  function renderOtp(isReset) {
    return (
      <>
        <Header
          icon={<ShieldRoundedIcon />}
          title={isReset ? 'Check Your Email' : 'Verify Your Identity'}
          subtitle={<>We sent a code to <strong>{isReset ? forgotEmail : email}</strong></>}
        />
        {otpTimer}
        <Box component="form" onSubmit={isReset ? handleForgotOtpSubmit : handleOtpSubmit}>
          <Stack spacing={2}>
            {otpField}
            {otpError && <Alert severity="error">{otpError}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={otpDigits.join('').length !== OTP_LENGTH}>
              {isReset ? 'Continue' : 'Verify & Continue'}
            </Button>
            <Button onClick={handleResendOtp} disabled={secondsLeft > 0}>Resend Code</Button>
          </Stack>
        </Box>
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={isReset ? () => setStep('forgot') : handleBackToLogin}>
            {isReset ? 'Change Email' : 'Back to Login'}
          </Button>
        </Box>
      </>
    )
  }

  function renderForgot() {
    return (
      <>
        <Header icon={<LockRoundedIcon />} title="Reset Password" subtitle="Enter your email to receive a reset code." />
        <Box component="form" onSubmit={handleForgotSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email ID"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              autoComplete="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </Stack>
        </Box>
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => setStep('login')}>Back to Login</Button>
        </Box>
      </>
    )
  }

  function renderNewPassword() {
    if (resetSuccess) {
      return (
        <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h5">Password Updated!</Typography>
          <Typography color="text.secondary">Redirecting you to login…</Typography>
        </Stack>
      )
    }
    return (
      <>
        <Header icon={<LockRoundedIcon />} title="Create New Password" subtitle="Choose a new password for your account." />
        <Box component="form" onSubmit={handleResetPassword}>
          <Stack spacing={2}>
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(p => !p)} edge="end" tabIndex={-1}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(p => !p)} edge="end" tabIndex={-1}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
            </Button>
          </Stack>
        </Box>
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => setStep('forgot-otp')}>Back to OTP Entry</Button>
        </Box>
      </>
    )
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 1, md: 4 } }}>
      <Paper elevation={0} className="kady-fade-in" sx={cardSx}>
        {step === 'login' && renderLogin()}
        {step === 'otp' && renderOtp(false)}
        {step === 'forgot' && renderForgot()}
        {step === 'forgot-otp' && renderOtp(true)}
        {step === 'new-password' && renderNewPassword()}
      </Paper>

      {showSuccess && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: theme => theme.zIndex.modal + 1
          }}
        >
          <Avatar sx={{ bgcolor: 'success.main', width: 88, height: 88 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 56 }} />
          </Avatar>
        </Box>
      )}

      <Dialog open={showTimeoutModal} onClose={() => setShowTimeoutModal(false)}>
        <DialogTitle>Session Timed Out</DialogTitle>
        <DialogContent>
          <DialogContentText>You didn't enter the code in time. Please try again.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResendOtp}>Resend Code</Button>
          <Button variant="contained" onClick={() => { setShowTimeoutModal(false); handleBackToLogin() }}>
            Back to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
