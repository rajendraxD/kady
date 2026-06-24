import axios from 'axios'
import { sessionRefreshed, forceLogout } from './store/authSlice'

const ACCESS_KEY = 'kady_access_token'
const REFRESH_KEY = 'kady_refresh_token'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Bare client for the refresh call so it doesn't trigger the interceptor below.
const refreshClient = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

// Store is injected from main.jsx to avoid a circular import (store -> slices -> api).
let store = null
export function attachStore(s) {
  store = s
}

// Attach the access token to every request when available.
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(ACCESS_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

let isRefreshing = false
let pendingQueue = []

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  pendingQueue = []
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) throw new Error('No refresh token')
  const { data } = await refreshClient.post('/auth/refresh', { refreshToken })
  localStorage.setItem(ACCESS_KEY, data.accessToken)
  localStorage.setItem(REFRESH_KEY, data.refreshToken)
  store?.dispatch(sessionRefreshed({ accessToken: data.accessToken, refreshToken: data.refreshToken }))
  return data.accessToken
}

// On a 401, transparently refresh the access token once and replay the request.
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    const status = error.response?.status

    const isAuthCall = original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/verify-otp')

    if (status !== 401 || original?._retry || isAuthCall) {
      return Promise.reject(error)
    }

    if (!localStorage.getItem(REFRESH_KEY)) {
      store?.dispatch(forceLogout())
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshAccessToken()
      resolveQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      resolveQueue(refreshError, null)
      store?.dispatch(forceLogout())
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
