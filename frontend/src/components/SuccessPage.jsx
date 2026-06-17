import React, { useState, useEffect } from 'react'

export default function SuccessPage({ uniqueId, submittedAt, onBackHome }) {
  const [copied, setCopied] = useState(false)
  const appId = uniqueId || ''

  useEffect(() => {
    let t
    if (copied) {
      t = setTimeout(() => setCopied(false), 2000)
    }
    return () => clearTimeout(t)
  }, [copied])

  function copyToClipboard() {
    if (!appId) return
    navigator.clipboard?.writeText(appId)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  function formatSubmitted(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const options = { day: '2-digit', month: 'long', year: 'numeric' }
    const date = d.toLocaleDateString(undefined, options)
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return `${date}, ${time}`
  }

  return (
    <div className="success-wrap">
      <section className="card success-card">
        <div className="success-top">
          <div className="success-check">
            <svg viewBox="0 0 64 64" className="check-svg" aria-hidden>
              <circle cx="32" cy="32" r="30" className="check-circle" />
              <path d="M18 34l8 8 20-20" className="check-mark" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Application Submitted Successfully!</h2>
          <p className="muted success-subtext">Thank you for applying! We will review your application and get back to you soon.</p>
        </div>

        <div className="app-id-row">
          <div className="app-id-box">#{appId}</div>
          <button className="copy-btn" onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <p className="small-note muted">Please save this ID for future reference</p>

        <p className="submitted-on muted">Submitted on: {formatSubmitted(submittedAt || new Date().toISOString())}</p>

        <div style={{ marginTop: 22 }}>
          <button onClick={onBackHome} className="btn btn-primary back-home-btn">Back to Home</button>
        </div>
      </section>
    </div>
  )
}
