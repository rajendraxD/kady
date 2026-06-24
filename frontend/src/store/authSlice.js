import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

const TOKEN_KEY = 'kady_admin_token'
const USER_KEY = 'kady_admin_user'

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email: email.trim(), password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
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

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout')
  } catch {
    // best-effort: clear locally regardless
  }
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: loadUser(),
    status: 'idle',
    error: null
  },
  reducers: {
    clearAuthError(state) {
      state.error = null
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
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logout.fulfilled, state => {
        state.token = null
        state.user = null
        state.status = 'idle'
      })
  }
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
