import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Stack
} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import './index.css'
import CandidateForm from './components/CandidateForm'
import SuccessPage from './components/SuccessPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { logout } from './store/authSlice'

export default function App() {
  const dispatch = useDispatch()
  const [view, setView] = useState('apply')
  const [latestUniqueId, setLatestUniqueId] = useState('')
  const [latestSubmittedAt, setLatestSubmittedAt] = useState('')

  const isAdminView = view === 'admin' || view === 'adminDashboard'

  function handleApplicationSubmitted(payload) {
    if (!payload) return
    if (typeof payload === 'string') {
      setLatestUniqueId(payload)
    } else if (typeof payload === 'object') {
      setLatestUniqueId(payload.applicationId || '')
      setLatestSubmittedAt(payload.submittedAt || '')
    }
    setView('success')
  }

  const handleBackHome = () => setView('apply')
  const handleAdminLoginSuccess = () => setView('adminDashboard')
  const handleAdminLogout = () => setView('apply')

  function handleHeaderButton() {
    if (view === 'adminDashboard') {
      dispatch(logout())
      setView('apply')
    } else {
      setView(view === 'admin' ? 'apply' : 'admin')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.75)',
          borderBottom: '1px solid rgba(15,23,42,0.06)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1, gap: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                background: 'linear-gradient(135deg, #6c63ff, #8b83ff)',
                width: 44,
                height: 44
              }}
            >
              <WorkspacePremiumIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {isAdminView ? 'KADY Admin Portal' : 'Join the KADY Team'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {isAdminView
                  ? 'Manage applications and review candidate submissions.'
                  : 'Apply for your dream position at KADY.'}
              </Typography>
            </Box>
            <Button
              variant={view === 'adminDashboard' ? 'outlined' : 'contained'}
              color="primary"
              startIcon={view === 'adminDashboard' ? <LogoutIcon /> : <LoginIcon />}
              onClick={handleHeaderButton}
            >
              {view === 'adminDashboard' ? 'Logout' : 'Admin Login'}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {view === 'success' ? (
            <SuccessPage
              uniqueId={latestUniqueId}
              submittedAt={latestSubmittedAt}
              onBackHome={handleBackHome}
            />
          ) : view === 'admin' ? (
            <AdminLogin onBackHome={handleBackHome} onLoginSuccess={handleAdminLoginSuccess} />
          ) : view === 'adminDashboard' ? (
            <AdminDashboard onLogout={handleAdminLogout} />
          ) : (
            <CandidateForm onSubmitSuccess={handleApplicationSubmitted} />
          )}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2.5,
          textAlign: 'center',
          color: 'text.secondary',
          borderTop: '1px solid rgba(15,23,42,0.06)'
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="caption">© {new Date().getFullYear()} KADY Hiring Portal</Typography>
        </Stack>
      </Box>
    </Box>
  )
}
