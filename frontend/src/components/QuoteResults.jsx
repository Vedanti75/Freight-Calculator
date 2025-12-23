import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'

export default function QuoteResults({ quote: initialQuote }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [quote, setQuote] = React.useState(initialQuote)

  if (!quote) return null

  const downloadPDF = async () => {
  if (!user) {
    navigate('/login')
    return
  }

  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('Authentication required')
      return
    }

    // Use the correct API URL from environment
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const downloadUrl = `${apiBaseUrl}/quotes/${quote._id}/download`

    console.log('Downloading from:', downloadUrl)

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/pdf'
      }
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    // Get the blob and create download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quote_${quote._id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert('✅ PDF downloaded successfully!')
  } catch (error) {
    console.error('Download error:', error)
    alert('❌ Failed to download PDF: ' + error.message)
  }
}


  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quote Summary</h2>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <span className="text-xs text-gray-500">From:</span>
          <p className="text-sm font-semibold text-gray-900">
            {quote.origin_city}, {quote.origin_country}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">To:</span>
          <p className="text-sm font-semibold text-gray-900">
            {quote.destination_city}, {quote.destination_country}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Weight:</span>
          <p className="text-sm font-semibold text-gray-900">{quote.weight} kg</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Mode:</span>
          <p className="text-sm font-semibold text-gray-900 uppercase">{quote.mode_of_transport}</p>
        </div>
      </div>

      {/* Pricing Breakdown - Compact */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Base Cost:</span>
            <span className="font-semibold">${quote.base_cost?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Fuel Surcharge:</span>
            <span className="font-semibold">${quote.surcharges?.fuel?.toFixed(2) || '0.00'}</span>
          </div>
          {quote.surcharges?.urgency > 0 && (
            <div className="flex justify-between">
              <span>Urgency:</span>
              <span className="font-semibold">${quote.surcharges.urgency.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 mt-1 font-bold text-base">
            <span>Total:</span>
            <span className="text-red-500">${quote.total_price?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {user ? (
        <button
          onClick={downloadPDF}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition text-sm"
        >
          ⬇ Download PDF
        </button>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition text-sm"
        >
          Login to Download
        </button>
      )}
    </div>
  )
}
