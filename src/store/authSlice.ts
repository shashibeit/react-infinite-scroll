import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 
  | 'Internal Admin'
  | 'DD Manager'
  | 'DD Analyst'
  | 'Risk SME Analyst User'
  | 'Risk SME Analyst Viewer'
  | null

interface AuthState {
  isAuthenticated: boolean
  userRole: UserRole
  userName: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  userRole: null,
  userName: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ role: UserRole; userName?: string }>) => {
      state.isAuthenticated = true
      state.userRole = action.payload.role
      state.userName = action.payload.userName || null
      
      // Persist to localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', action.payload.role || '')
      if (action.payload.userName) {
        localStorage.setItem('userName', action.payload.userName)
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.userRole = null
      state.userName = null
      
      // Clear localStorage
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userName')
    },
    restoreAuth: (state, action: PayloadAction<{ role: UserRole; userName?: string }>) => {
      // Restore auth state from localStorage on app load
      state.isAuthenticated = true
      state.userRole = action.payload.role
      state.userName = action.payload.userName || null
    }
  }
})

export const { login, logout, restoreAuth } = authSlice.actions
export default authSlice.reducer
