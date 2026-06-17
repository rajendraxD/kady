import React, { useState } from 'react'
import './index.css'
import CandidateForm from './components/CandidateForm'
import SuccessPage from './components/SuccessPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [view, setView] = useState('apply')
  const [latestUniqueId, setLatestUniqueId] = useState('')
  const [latestSubmittedAt, setLatestSubmittedAt] = useState('')

  function handleApplicationSubmitted(payload) {
    // payload can be string id or object { applicationId, submittedAt }
    if (!payload) return
    if (typeof payload === 'string') {
      setLatestUniqueId(payload)
    } else if (typeof payload === 'object') {
      setLatestUniqueId(payload.applicationId || '')
      setLatestSubmittedAt(payload.submittedAt || '')
    }
    setView('success')
  }

  function handleBackHome() {
    setView('apply')
  }

  function handleAdminLoginSuccess() {
    setView('adminDashboard')
  }

  function handleAdminLogout() {
    setView('apply')
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>{view === 'admin' || view === 'adminDashboard' ? 'KADY Admin Portal' : 'Join KADY Team'}</h1>
          <p className="header-subtitle">
            {view === 'admin' || view === 'adminDashboard'
              ? 'Manage applications and review candidate submissions.'
              : 'Apply for your dream position at KADY'}
          </p>
        </div>
        <button
          className="admin-login-btn"
          onClick={() => setView(view === 'adminDashboard' ? 'apply' : 'admin')}
        >
          {view === 'adminDashboard' ? 'Logout' : 'Admin Login'}
        </button>
      </header>
      <main>
        {view === 'success' ? (
          <SuccessPage uniqueId={latestUniqueId} submittedAt={latestSubmittedAt} onBackHome={handleBackHome} />
        ) : view === 'admin' ? (
          <AdminLogin onBackHome={handleBackHome} onLoginSuccess={handleAdminLoginSuccess} />
        ) : view === 'adminDashboard' ? (
          <AdminDashboard onLogout={handleAdminLogout} />
        ) : (
          <CandidateForm onSubmitSuccess={handleApplicationSubmitted} />
        )}
      </main>
    </div>
  )
}
