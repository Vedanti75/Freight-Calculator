import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import QuotationPage from './pages/QuotationPage'
import HistoryPage from './pages/HistoryPage'
import AdminPanel from './pages/AdminPanel'

// Protected Route for authenticated users only
function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore()
  
  if (!token || !user) {
    return <Navigate to="/login" />
  }
  
  return children
}

// Admin Route - only for admins
function AdminRoute({ children }) {
  const { user, token } = useAuthStore()
  
  if (!token || !user) {
    return <Navigate to="/login" />
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />
  }
  
  return children
}

export default function App() {
  const { checkAuth } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setIsReady(true)
    }
    initAuth()
  }, [checkAuth])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/quote" element={<QuotationPage />} />

        {/* Protected Routes */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
