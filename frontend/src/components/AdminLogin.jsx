import React, { useEffect, useRef, useState } from 'react'
import api from '../api'

const OTP_TIMER_START = 60
const OTP_LENGTH = 4
const CIRCLE_RADIUS = 34
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export default function AdminLogin({ onBackHome, onLoginSuccess }) {
  const [step, setStep] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OTP_TIMER_START)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [shakeOtp, setShakeOtp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const otpRefs = useRef([])

  useEffect(() => {
    if (step !== 'otp') {
      return
    }

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
    if (step !== 'otp') {
      return
    }
    otpRefs.current[0]?.focus()
  }, [step])

  function resetAllFields() {
    setFullName('')
    setEmail('')
    setPassword('')
    setMobile('')
    setShowPassword(false)
    setFormError('')
    setMobileError('')
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

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setMobileError('')
    setIsSubmitting(true)

    // Authenticate with backend — it validates email, password AND mobile
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
        mobile: mobile.trim()
      })

      // Store token for subsequent API calls
      localStorage.setItem('kady_admin_token', data.token)
      localStorage.setItem('kady_admin_user', JSON.stringify(data.user))

      // Proceed to OTP step
      resetOtpFields()
      setStep('otp')
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to connect to server. Please try again later.'
      setFormError(message)
      // Route mobile-specific errors to the mobile field
      if (err.response?.data?.error?.toLowerCase().includes('mobile')) {
        setMobileError(err.response.data.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBackToLogin() {
    setStep('login')
    resetAllFields()
  }

  function handleForgotPassword() {
    if (!email.trim()) {
      setForgotPasswordNotice('Please enter your registered Email ID to reset your password.')
      return
    }

    setForgotPasswordNotice(
      `Password reset instructions have been sent to ${email.trim()}. Please check your inbox.`
    )
  }

  function handleOtpChange(index, value) {
    if (!/^[0-9]*$/.test(value)) {
      return
    }

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

  async function handleResendOtp() {
    try {
      await api.post('/auth/resend-otp', { email: email.trim() })
    } catch (_err) {
      // silently ignore — resend is best-effort
    }
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

  return (
    <section className="admin-login-shell">
      <div className="card admin-card"> 
        {step === 'login' ? (
          <>
            <div className="login-head">
              <h2>Admin Login</h2>
              <p className="muted">Enter admin credentials to manage applications.</p>
            </div>
            <form onSubmit={handleSubmit} className="candidate-form login-form-grid">
              <label className="field-label">
                Full Name
                <input
                  placeholder="Full Name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input-field"
                />
              </label>
              <label className="field-label">
                Email ID
                <input
                  placeholder="Email ID"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                />
              </label>
              <label className="field-label password-label full-width">
                Password
                <div className="password-field">
                  <input
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <label className="field-label full-width">
                Mobile Number
                <input
                  placeholder="Mobile Number"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="input-field"
                />
              </label>
              {mobileError && <p className="error-text">{mobileError}</p>}
              {formError && <p className="error-text">{formError}</p>}
              {forgotPasswordNotice && <p className="muted forgot-password-notice">{forgotPasswordNotice}</p>}
              <div className="actions">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Login'}
                </button>
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
            <button onClick={onBackHome} className="back-home-link">Back to Home</button>
          </>
        ) : (
          <div className="otp-card">
            <div className="otp-card-inner">
              <div className="otp-card-inner">
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
                    OTP sent to your registered mobile number ******7607
                  </p>
                </div>
                <div className="otp-timer-block">
                  <div className="timer-ring">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke={timerColor}
                        strokeWidth="6"
                        strokeLinecap="round"
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
                  <p className="timer-note">Time remaining to enter OTP</p>
                </div>
                <form onSubmit={handleOtpSubmit} className="otp-form">
                  <div className={`otp-code-grid ${shakeOtp ? 'otp-shake' : ''}`}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-digit-${index}`}
                        ref={el => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className={`input-field otp-digit ${digit ? 'otp-filled' : ''} ${otpError ? 'otp-invalid' : ''}`}
                      />
                    ))}
                  </div>
                  {otpError && <p className="error-text">{otpError}</p>}
                  <div className="otp-actions">
                    <button type="submit" className="submit-btn" disabled={otpDigits.join('').length !== OTP_LENGTH}>Verify OTP</button>
                    <button
                      type="button"
                      className="otp-secondary-btn"
                      onClick={handleResendOtp}
                      disabled={secondsLeft > 0}
                    >
                      Resend OTP
                    </button>
                  </div>
                  <p className="small-note">
                    {secondsLeft > 0
                      ? `Resend OTP available after ${secondsLeft}s`
                      : 'Tap Resend OTP to request a new code.'}
                  </p>
                </form>
                <button type="button" className="otp-back-link" onClick={handleBackToLogin}>
                  ← Back to Login
                </button>
              </div>
              {showSuccess && (
                <div className="otp-success-overlay">
                  <div className="success-badge">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showTimeoutModal && (
        <div className="timeout-overlay">
          <div className="timeout-modal">
            <div className="timeout-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4M12 17h.01M2 12l10-10 10 10-10 10Z"
                />
              </svg>
            </div>
            <h3>Session Timed Out!</h3>
            <p className="muted timeout-text">
              You did not enter the OTP in time. Please login again.
            </p>
            <button onClick={handleTimeoutBackToLogin} className="submit-btn timeout-button">
              Back to Login
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
