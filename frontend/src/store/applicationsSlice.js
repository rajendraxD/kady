import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

const STORAGE_KEY = 'kady_applications'

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocal(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota errors
  }
}

export const fetchApplications = createAsyncThunk('applications/fetch', async () => {
  try {
    const { data: backendApps } = await api.get('/applications')
    if (Array.isArray(backendApps) && backendApps.length > 0) {
      const localApps = loadLocal()
      const localById = new Map(localApps.map(a => [a.uniqueId || a.id, a]))
      const merged = backendApps.map(b => {
        const local = localById.get(b.uniqueId || b.id)
        return local && local.status !== b.status ? { ...b, status: local.status } : b
      })
      return merged.map(a => ({ ...a, status: a.status || 'Applied' }))
    }
  } catch {
    // backend unavailable — fall back to localStorage
  }
  return loadLocal().map(a => ({ ...a, status: a.status || 'Applied' }))
})

export const submitApplication = createAsyncThunk('applications/submit', async (application) => {
  const existing = loadLocal()
  let uniqueId = application.uniqueId
  try {
    const { data: saved } = await api.post('/applications', application)
    uniqueId = String(saved.applicationId || saved.uniqueId || uniqueId)
  } catch {
    // network error — keep the locally generated id
  }
  const stored = { ...application, uniqueId, applicationId: uniqueId }
  existing.push(stored)
  saveLocal(existing)
  return { uniqueId, submittedAt: stored.createdAt }
})

export const changeStatus = createAsyncThunk('applications/changeStatus', async ({ id, status }) => {
  api.patch(`/applications/${id}/status`, { status }).catch(() => {})
  return { id, status }
})

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    deleteApplication(state, action) {
      state.items = state.items.filter(app => app.id !== action.payload)
      saveLocal(state.items)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchApplications.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(changeStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload
        state.items = state.items.map(app => (app.id === id ? { ...app, status } : app))
        saveLocal(state.items)
      })
  }
})

export const { deleteApplication } = applicationsSlice.actions
export default applicationsSlice.reducer
