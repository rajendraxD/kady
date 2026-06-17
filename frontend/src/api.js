import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach auth token to every request when available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('kady_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Handle 401 responses globally — clear stale tokens
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kady_admin_token')
      localStorage.removeItem('kady_admin_user')
    }
    return Promise.reject(error)
  }
)

export default api
