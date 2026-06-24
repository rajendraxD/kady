import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import applicationsReducer from './applicationsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer
  }
})

export default store
