import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import ParticipantList from './pages/ParticipantList'
import ParticipantDetails from './pages/ParticipantDetails'
import QuestionBank from './pages/QuestionBank'
import QuestionBankList from './pages/QuestionBankList'
import CreateQuestion from './pages/CreateQuestion'
import QuestionOrder from './pages/QuestionOrder'
import QuestionApproval from './pages/QuestionApproval'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { restoreAuth, type UserRole } from './store/authSlice'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Restore auth state from localStorage on app load
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated')
    const storedRole = localStorage.getItem('userRole') as UserRole
    const storedName = localStorage.getItem('userName')
    
    if (storedAuth === 'true' && storedRole) {
      dispatch(restoreAuth({ role: storedRole, userName: storedName || undefined }))
    }
  }, [dispatch])

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirect root based on auth status */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/participants" element={
          <ProtectedRoute>
            <ParticipantList />
          </ProtectedRoute>
        } />
        
        <Route path="/participants/:id" element={
          <ProtectedRoute>
            <ParticipantDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/question-bank" element={
          <ProtectedRoute>
            <QuestionBank />
          </ProtectedRoute>
        }>
          <Route path="list" element={<QuestionBankList />} />
          <Route path="ordering" element={<QuestionOrder />} />
          <Route path="approval" element={<QuestionApproval />} />
          <Route path="create" element={<CreateQuestion />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
