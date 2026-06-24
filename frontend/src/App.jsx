import React from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
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
import ProtectedRoute from './components/ProtectedRoute'

function CandidateFormRoute() {
  const navigate = useNavigate()
  function handleSubmitted(payload) {
    if (!payload) return
    const state = typeof payload === 'string'
      ? { applicationId: payload }
      : { applicationId: payload.applicationId || '', submittedAt: payload.submittedAt || '' }
    navigate('/success', { state })
  }
  return <CandidateForm onSubmitSuccess={handleSubmitted} />
}

function SuccessRoute() {
  const navigate = useNavigate()
  const { state } = useLocation()
  if (!state?.applicationId) {
    return <Navigate to="/" replace />
  }
  return (
    <SuccessPage
      uniqueId={state.applicationId}
      submittedAt={state.submittedAt}
      onBackHome={() => navigate('/')}
    />
  )
}

function AdminLoginRoute() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }
  return (
    <AdminLogin
      onBackHome={() => navigate('/')}
      onLoginSuccess={() => navigate('/admin', { replace: true })}
    />
  )
}

function DashboardRoute() {
  const navigate = useNavigate()
  return <AdminDashboard onLogout={() => navigate('/admin/login', { replace: true })} />
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const isAdminArea = location.pathname.startsWith('/admin')

  function handleHeaderButton() {
    if (isAuthenticated) {
      navigate('/admin')
    } else {
      navigate('/admin/login')
    }
  }

  const headerLabel = isAuthenticated ? 'Dashboard' : 'Admin Login'

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
                {isAdminArea ? 'KADY Admin Portal' : 'Join the KADY Team'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {isAdminArea
                  ? 'Manage applications and review candidate submissions.'
                  : 'Apply for your dream position at KADY.'}
              </Typography>
            </Box>
            <Button
              variant={isAuthenticated ? 'outlined' : 'contained'}
              color="primary"
              startIcon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
              onClick={handleHeaderButton}
            >
              {headerLabel}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<CandidateFormRoute />} />
            <Route path="/success" element={<SuccessRoute />} />
            <Route path="/admin/login" element={<AdminLoginRoute />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
