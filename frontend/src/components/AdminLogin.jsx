import React, { useEffect, useRef, useState } from 'react'
import api from '../api'

const OTP_TIMER_START = 60
const OTP_LENGTH = 4
const CIRCLE_RADIUS = 34
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export default function AdminLogin({ onBackHome, onLoginSuccess }) {
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [stepDirection, setStepDirection] = useState('forward')

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const otpRefs = useRef([])

  useEffect(() => {
    if (step !== 'otp' && step !== 'forgot-otp') return
    if (secondsLeft <= 0) {
      setShowTimeoutModal(true)
      return
    }
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [step, secondsLeft])

  useEffect(() => {
    if (step !== 'otp' && step !== 'forgot-otp') return
    otpRefs.current[0]?.focus()
  }, [step])

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

  function resetOtpFields() {
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    setOtpError('')
    setSecondsLeft(OTP_TIMER_START)
    setShowTimeoutModal(false)
    setShowSuccess(false)
    setShakeOtp(false)
  }

  function transitionTo(newStep, direction) {
    setIsAnimating(true)
    setStepDirection(direction)
    setTimeout(() => {
      setStep(newStep)
      requestAnimationFrame(() => {
        setIsAnimating(false)
      })
    }, 280)
  }

  // ── LOGIN ──

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.')
      return
    }
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password
      })
      localStorage.setItem('kady_admin_token', data.token)
      localStorage.setItem('kady_admin_user', JSON.stringify(data.user))
      resetOtpFields()
      transitionTo('otp', 'forward')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to connect to server. Please try again later.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBackToLogin() {
    transitionTo('login', 'back')
    setTimeout(() => resetAllFields(), 300)
  }

  // ── OTP (Login) ──

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
    if (event.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
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
    try {
      await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: enteredOtp
      })
      setShowSuccess(true)
      setTimeout(() => {
        onLoginSuccess && onLoginSuccess()
      }, 1000)
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid OTP. Please try again.'
      setOtpError(message)
      setShakeOtp(true)
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setTimeout(() => {
        setShakeOtp(false)
        otpRefs.current[0]?.focus()
      }, 500)
    }
  }

  // ── FORGOT PASSWORD ──

  function handleForgotClick() {
    setForgotEmail(email) // Pre-fill with login email if available
    transitionTo('forgot', 'forward')
  }

  async function handleForgotSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (!forgotEmail.trim()) {
      setFormError('Please enter your email address.')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() })
      resetOtpFields()
      transitionTo('forgot-otp', 'forward')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to process request. Please try again.'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotOtpSubmit(e) {
    e.preventDefault()
    setOtpError('')
    const enteredOtp = otpDigits.join('')
    if (enteredOtp.length !== OTP_LENGTH) {
      setOtpError('Please enter the 4-digit OTP.')
      return
    }
    // OTP is valid format — move to new password step
    // The actual OTP verification will happen in the reset-password API call
    transitionTo('new-password', 'forward')
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
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: enteredOtp,
        newPassword
      })
      setResetSuccess(true)
      setTimeout(() => {
        setForgotEmail('')
        setNewPassword('')
        setConfirmPassword('')
        transitionTo('login', 'back')
        setTimeout(() => resetAllFields(), 300)
      }, 2000)
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to reset password. Please try again.'
      setFormError(message)
      if (message.toLowerCase().includes('otp')) {
        // OTP was invalid — go back to OTP step with error visible
        setOtpError(message)
        setOtpDigits(Array(OTP_LENGTH).fill(''))
        setTimeout(() => {
          transitionTo('forgot-otp', 'back')
        }, 500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── SHARED ──

  async function handleResendOtp() {
    const targetEmail = step === 'forgot-otp' ? forgotEmail.trim() : email.trim()
    const endpoint = step === 'forgot-otp' ? '/auth/forgot-password' : '/auth/resend-otp'
    try {
      await api.post(endpoint, { email: targetEmail })
    } catch (_err) { /* best-effort */ }
    resetOtpFields()
    setShowTimeoutModal(false)
  }

  function handleTimeoutBackToLogin() {
    setShowTimeoutModal(false)
    handleBackToLogin()
  }

  const progress = CIRCLE_CIRCUMFERENCE - (secondsLeft / OTP_TIMER_START) * CIRCLE_CIRCUMFERENCE
  const timerColor =
    secondsLeft > 29 ? 'var(--primary)' : secondsLeft > 9 ? 'var(--accent)' : '#ef4444'

  const animClass = isAnimating
    ? stepDirection === 'forward'
      ? 'step-exit-forward'
      : 'step-exit-back'
    : stepDirection === 'forward'
      ? 'step-enter-forward'
      : 'step-enter-back'

  // ── LOGIN STEP ──
  const renderLogin = () => (
    <div className={`login-step ${isAnimating ? animClass : 'step-visible'}`}>
      <div className="login-head">
        <div className="login-lock-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h2>Welcome Back</h2>
        <p className="muted">Sign in to manage applications.</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field-group">
          <div className="login-input-wrap">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`login-input ${email ? 'has-value' : ''}`}
              placeholder=" "
              autoComplete="email"
            />
            <label htmlFor="login-email" className="login-floating-label">
              <span className="login-label-icon">✉</span>
              Email ID
            </label>
          </div>

          <div className="login-input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`login-input ${password ? 'has-value' : ''}`}
              placeholder=" "
              autoComplete="current-password"
            />
            <label htmlFor="login-password" className="login-floating-label">
              <span className="login-label-icon">🔒</span>
              Password
            </label>
            {password && (
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            )}
          </div>
        </div>

        {formError && (
          <div className="login-error" key={formError}>
            <span className="login-error-icon">⚠</span>
            {formError}
          </div>
        )}

        <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="login-btn-content">
              <svg className="login-spinner" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Signing in…
            </span>
          ) : (
            <span className="login-btn-content">
              Sign In
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" className="login-btn-arrow">
                <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </button>
      </form>

      <div className="login-footer-links">
        <button type="button" className="login-link-btn" onClick={handleForgotClick}>
          Forgot Password?
        </button>
        <button type="button" className="login-link-btn" onClick={onBackHome}>
          Back to Home
        </button>
      </div>
    </div>
  )

  // ── LOGIN OTP STEP ──
  const renderOtp = () => (
    <div className={`login-step ${isAnimating ? animClass : 'step-visible'}`}>
      <div className="otp-step-inner">
        <div className="otp-icon-box">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="otp-icon">
            <path
              fill="currentColor"
              d="M12 2 4 5v5c0 5.5 3.8 10.6 8 12 4.2-1.4 8-6.5 8-12V5l-8-3Zm1 12.5v3h-2v-3H9l3-3 3 3h-2ZM12 6.5c.8 0 1.5.7 1.5 1.5h-3C10.5 7.2 11.2 6.5 12 6.5Z"
            />
          </svg>
        </div>
        <div className="otp-heading">
          <h2>Verify Your Identity</h2>
          <p className="muted otp-subtext">
            We sent a code to <strong>{email}</strong>
          </p>
        </div>

        <div className="otp-timer-block">
          <div className="timer-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none" stroke={timerColor}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
                style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className={`timer-center ${secondsLeft <= 9 ? 'timer-pulse' : ''}`}>
              {secondsLeft}s
            </div>
          </div>
          <p className="timer-note">Enter the code before it expires</p>
        </div>

        <form onSubmit={handleOtpSubmit} className="otp-form">
          <div className={`otp-code-grid ${shakeOtp ? 'otp-shake' : ''}`}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={el => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                className={`otp-digit ${digit ? 'otp-filled' : ''} ${otpError ? 'otp-invalid' : ''}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>
          {otpError && <p className="error-text">{otpError}</p>}

          <div className="otp-actions">
            <button type="submit" className="login-submit-btn" disabled={otpDigits.join('').length !== OTP_LENGTH}>
              Verify &amp; Continue
            </button>
            <button
              type="button"
              className="otp-secondary-btn"
              onClick={handleResendOtp}
              disabled={secondsLeft > 0}
            >
              Resend Code
            </button>
          </div>
        </form>

        <button type="button" className="login-back-link otp-back-btn" onClick={handleBackToLogin}>
          <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
            <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Login
        </button>
      </div>

      {showSuccess && (
        <div className="otp-success-overlay">
          <div className="success-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )

  // ── FORGOT PASSWORD STEP ──
  const renderForgot = () => (
    <div className={`login-step ${isAnimating ? animClass : 'step-visible'}`}>
      <div className="login-head">
        <div className="login-lock-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
            <path d="M15 7a4 4 0 0 0-8 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 17h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14 17h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h2>Reset Password</h2>
        <p className="muted">Enter your email to receive a reset code.</p>
      </div>

      <form onSubmit={handleForgotSubmit} className="login-form">
        <div className="login-input-wrap">
          <input
            id="forgot-email"
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            className={`login-input ${forgotEmail ? 'has-value' : ''}`}
            placeholder=" "
            autoComplete="email"
          />
          <label htmlFor="forgot-email" className="login-floating-label">
            <span className="login-label-icon">✉</span>
            Email ID
          </label>
        </div>

        {formError && (
          <div className="login-error" key={formError}>
            <span className="login-error-icon">⚠</span>
            {formError}
          </div>
        )}

        <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="login-btn-content">
              <svg className="login-spinner" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Sending Code…
            </span>
          ) : (
            <span className="login-btn-content">
              Send Reset Code
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" className="login-btn-arrow">
                <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </button>
      </form>

      <button type="button" className="login-back-link" onClick={() => transitionTo('login', 'back')}>
        <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
          <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Login
      </button>
    </div>
  )

  // ── FORGOT OTP STEP ──
  const renderForgotOtp = () => (
    <div className={`login-step ${isAnimating ? animClass : 'step-visible'}`}>
      <div className="otp-step-inner">
        <div className="otp-icon-box">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="otp-icon">
            <path
              fill="currentColor"
              d="M12 2 4 5v5c0 5.5 3.8 10.6 8 12 4.2-1.4 8-6.5 8-12V5l-8-3Zm1 12.5v3h-2v-3H9l3-3 3 3h-2ZM12 6.5c.8 0 1.5.7 1.5 1.5h-3C10.5 7.2 11.2 6.5 12 6.5Z"
            />
          </svg>
        </div>
        <div className="otp-heading">
          <h2>Check Your Email</h2>
          <p className="muted otp-subtext">
            We sent a reset code to <strong>{forgotEmail}</strong>
          </p>
        </div>

        <div className="otp-timer-block">
          <div className="timer-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none" stroke={timerColor}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
                style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className={`timer-center ${secondsLeft <= 9 ? 'timer-pulse' : ''}`}>
              {secondsLeft}s
            </div>
          </div>
          <p className="timer-note">Enter the code to reset your password</p>
        </div>

        <form onSubmit={handleForgotOtpSubmit} className="otp-form">
          <div className={`otp-code-grid ${shakeOtp ? 'otp-shake' : ''}`}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={el => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                className={`otp-digit ${digit ? 'otp-filled' : ''} ${otpError ? 'otp-invalid' : ''}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>
          {otpError && <p className="error-text">{otpError}</p>}

          <button type="submit" className="login-submit-btn" disabled={otpDigits.join('').length !== OTP_LENGTH}>
            Continue
          </button>
        </form>

        <div className="otp-bottom-links">
          <button type="button" className="login-link-btn" onClick={handleResendOtp} disabled={secondsLeft > 0}>
            Resend Code
          </button>
          <button type="button" className="login-link-btn" onClick={() => transitionTo('forgot', 'back')}>
            Change Email
          </button>
        </div>
      </div>
    </div>
  )

  // ── NEW PASSWORD STEP ──
  const renderNewPassword = () => (
    <div className={`login-step ${isAnimating ? animClass : 'step-visible'}`}>
      <div className="login-head">
        <div className="login-lock-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
            <path d="M12 2 4 5v5c0 5.5 3.8 10.6 8 12 4.2-1.4 8-6.5 8-12V5l-8-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 9v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h2>{resetSuccess ? 'Password Updated!' : 'Create New Password'}</h2>
        <p className="muted">
          {resetSuccess
            ? 'Your password has been changed successfully.'
            : 'Choose a new password for your account.'}
        </p>
      </div>

      {!resetSuccess ? (
        <>
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="login-field-group">
              <div className="login-input-wrap">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={`login-input ${newPassword ? 'has-value' : ''}`}
                  placeholder=" "
                  autoComplete="new-password"
                />
                <label htmlFor="new-password" className="login-floating-label">
                  <span className="login-label-icon">🔒</span>
                  New Password
                </label>
                {newPassword && (
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? '🙈' : '👁'}
                  </button>
                )}
              </div>

              <div className="login-input-wrap">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`login-input ${confirmPassword ? 'has-value' : ''}`}
                  placeholder=" "
                  autoComplete="new-password"
                />
                <label htmlFor="confirm-password" className="login-floating-label">
                  <span className="login-label-icon">🔒</span>
                  Confirm Password
                </label>
                {confirmPassword && (
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? '🙈' : '👁'}
                  </button>
                )}
              </div>
            </div>

            {formError && (
              <div className="login-error" key={formError}>
                <span className="login-error-icon">⚠</span>
                {formError}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="login-btn-content">
                  <svg className="login-spinner" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Updating…
                </span>
              ) : (
                <span className="login-btn-content">
                  Reset Password
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" className="login-btn-arrow">
                    <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <button type="button" className="login-back-link" onClick={() => transitionTo('forgot-otp', 'back')}>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to OTP Entry
          </button>
        </>
      ) : (
        <div className="forgot-success-block">
          <div className="forgot-check-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="48" height="48">
              <path fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="muted">Redirecting you to login…</p>
        </div>
      )}
    </div>
  )

  return (
    <section className="admin-login-shell">
      <div className="login-bg-ornament" aria-hidden="true" />
      <div className="login-bg-ornament login-bg-ornament--2" aria-hidden="true" />

      <div className="login-glass-card">
        <div className="login-glass-glow" aria-hidden="true" />

        {step === 'login' && renderLogin()}
        {step === 'otp' && renderOtp()}
        {step === 'forgot' && renderForgot()}
        {step === 'forgot-otp' && renderForgotOtp()}
        {step === 'new-password' && renderNewPassword()}
      </div>

      {showTimeoutModal && (
        <div className="timeout-overlay">
          <div className="timeout-modal">
            <div className="timeout-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M2 12l10-10 10 10-10 10Z" />
              </svg>
            </div>
            <h3>Session Timed Out</h3>
            <p className="muted timeout-text">
              You didn't enter the code in time. Please try again.
            </p>
            <button onClick={handleTimeoutBackToLogin} className="login-submit-btn timeout-button">
              Back to Login
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
