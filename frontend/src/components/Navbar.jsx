import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLogoClick = () => {
    // If user is admin, go to admin panel
    if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      // Otherwise go to home
      navigate('/')
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
        >
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Freight Quotation</span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <button
                onClick={() => navigate('/quote')}
                className="text-gray-700 hover:text-red-500 font-medium transition"
              >
                New Quote
              </button>
              <button
                onClick={() => navigate('/history')}
                className="text-gray-700 hover:text-red-500 font-medium transition"
              >
                History
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-gray-700 hover:text-red-500 font-medium transition bg-yellow-100 px-3 py-1 rounded"
                >
                  Admin
                </button>
              )}
              <div className="flex items-center gap-3 border-l pl-6">
                <span className="text-sm text-gray-600">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-red-500 font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
