import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import QuoteForm from '../components/QuoteForm'
import QuoteResults from '../components/QuoteResults'

export default function QuotationPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [quote, setQuote] = useState(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // If user is not logged in and hasn't been redirected yet
    if (!user && !redirecting) {
      setRedirecting(true)
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { from: '/quote', message: 'Please login to generate freight quotes' }
        })
      }, 500)
    }
  }, [user, navigate, redirecting])

  const handleQuoteSuccess = (newQuote) => {
    setQuote(newQuote)
  }

  const handleNewQuote = () => {
    setQuote(null)
  }

  // Show loading while redirecting
  if (!user && redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Only show page if user is logged in
  if (!user) {
    return null
  }

  return (
    <div>
      {user && <Navbar />}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Get a Freight Quote</h1>
        <p className="text-gray-600 text-sm mb-6">
          Fill in your shipment details to get an instant quote
        </p>

        {!quote ? (
          <QuoteForm onSuccess={handleQuoteSuccess} />
        ) : (
          <div>
            <QuoteResults quote={quote} />
            <button
              onClick={handleNewQuote}
              className="mt-4 text-red-500 hover:text-red-600 font-semibold text-sm"
            >
              ← Create Another Quote
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
