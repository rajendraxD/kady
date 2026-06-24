import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

const ACCESS_KEY = 'kady_access_token'
const REFRESH_KEY = 'kady_refresh_token'
const USER_KEY = 'kady_admin_user'

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

function persistSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email: email.trim(), password })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Unable to connect to server. Please try again later.')
  }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-otp', { email: email.trim(), otp })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Invalid OTP. Please try again.')
  }
})

export const resendOtp = createAsyncThunk('auth/resendOtp', async ({ email, reset }, { rejectWithValue }) => {
  try {
    const endpoint = reset ? '/auth/forgot-password' : '/auth/resend-otp'
    const { data } = await api.post(endpoint, { email: email.trim() })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Could not resend the code.')
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email: email.trim() })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Unable to process request. Please try again.')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, otp, newPassword }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/reset-password', { email: email.trim(), otp, newPassword })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Unable to reset password. Please try again.')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const refreshToken = getState().auth.refreshToken || localStorage.getItem(REFRESH_KEY)
  try {
    await api.post('/auth/logout', { refreshToken })
  } catch {
    // best-effort: clear locally regardless
  }
  clearSession()
})

const initialAccess = localStorage.getItem(ACCESS_KEY)
const initialRefresh = localStorage.getItem(REFRESH_KEY)
const initialUser = loadUser()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: initialAccess,
    refreshToken: initialRefresh,
    user: initialUser,
    isAuthenticated: Boolean(initialAccess && initialUser),
    pendingAuth: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    // Called by the axios interceptor after a successful token refresh
    sessionRefreshed(state, action) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      persistSession(action.payload)
    },
    // Called by the axios interceptor when refresh fails — forces a clean logout
    forceLogout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.isAuthenticated = false
      state.pendingAuth = null
      state.status = 'idle'
      clearSession()
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Hold the tokens until OTP is verified — not authenticated yet
        state.pendingAuth = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(verifyOtp.fulfilled, state => {
        if (state.pendingAuth) {
          state.accessToken = state.pendingAuth.accessToken
          state.refreshToken = state.pendingAuth.refreshToken
          state.user = state.pendingAuth.user
          state.isAuthenticated = true
          persistSession(state.pendingAuth)
          state.pendingAuth = null
        }
      })
      .addCase(logout.fulfilled, state => {
        state.accessToken = null
        state.refreshToken = null
        state.user = null
        state.isAuthenticated = false
        state.pendingAuth = null
        state.status = 'idle'
      })
  }
})

export const { clearAuthError, sessionRefreshed, forceLogout } = authSlice.actions
export default authSlice.reducer
