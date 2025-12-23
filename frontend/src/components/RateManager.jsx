import { useState, useEffect } from 'react'
import apiClient from '../api/client'

function RateManager() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    origin_zone: '',
    destination_zone: '',
    mode_of_transport: 'road',
    weight_min: '',
    weight_max: '',
    rate_per_kg: '',
    fuel_surcharge_pct: '0',
    valid_from: '',
    valid_to: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/rates')
      setRates(response.data.data)
    } catch (err) {
      setError('Failed to fetch rates')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      origin_zone: '',
      destination_zone: '',
      mode_of_transport: 'road',
      weight_min: '',
      weight_max: '',
      rate_per_kg: '',
      fuel_surcharge_pct: '0',
      valid_from: '',
      valid_to: ''
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        // Update rate
        await apiClient.put(`/rates/${editingId}`, formData)
      } else {
        // Create new rate
        await apiClient.post('/rates', formData)
      }
      fetchRates()
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rate')
    }
  }

  const handleEdit = (rate) => {
    setFormData({
      origin_zone: rate.origin_zone,
      destination_zone: rate.destination_zone,
      mode_of_transport: rate.mode_of_transport,
      weight_min: rate.weight_min,
      weight_max: rate.weight_max,
      rate_per_kg: rate.rate_per_kg,
      fuel_surcharge_pct: rate.fuel_surcharge_pct,
      valid_from: new Date(rate.valid_from).toISOString().split('T')[0],
      valid_to: new Date(rate.valid_to).toISOString().split('T')[0]
    })
    setEditingId(rate._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
        await apiClient.delete(`/rates/${id}`)
        fetchRates()
      } catch (err) {
        setError('Failed to delete rate')
      }
    }
  }

  const handleToggle = async (id) => {
    try {
      await apiClient.patch(`/rates/${id}/toggle`)
      fetchRates()
    } catch (err) {
      setError('Failed to toggle rate status')
    }
  }

  if (loading && rates.length === 0) {
    return <p>Loading rates...</p>
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Rate Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Rate' : 'Add New Rate'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Origin Zone) *
                </label>
                <input
                  type="text"
                  name="origin_zone"
                  value={formData.origin_zone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Destination Zone) *
                </label>
                <input
                  type="text"
                  name="destination_zone"
                  value={formData.destination_zone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., India"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Transport *
                </label>
                <select
                  name="mode_of_transport"
                  value={formData.mode_of_transport}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="road">Road</option>
                  <option value="air">Air</option>
                  <option value="sea">Sea</option>
                  <option value="rail">Rail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight_min"
                  value={formData.weight_min}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight_max"
                  value={formData.weight_max}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per KG (USD) *
                </label>
                <input
                  type="number"
                  name="rate_per_kg"
                  value={formData.rate_per_kg}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Surcharge (%) *
                </label>
                <input
                  type="number"
                  name="fuel_surcharge_pct"
                  value={formData.fuel_surcharge_pct}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid To *
              </label>
              <input
                type="date"
                name="valid_to"
                value={formData.valid_to}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
              >
                {editingId ? 'Update Rate' : 'Create Rate'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Rate Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          + Add New Rate
        </button>
      )}

      {/* Rates Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">From</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Mode</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Weight Range</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rate/kg</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fuel %</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Valid From</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Valid To</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 text-sm">{rate.origin_zone}</td>
                <td className="px-4 py-4 text-sm">{rate.destination_zone}</td>
                <td className="px-4 py-4 text-sm uppercase">{rate.mode_of_transport}</td>
                <td className="px-4 py-4 text-sm">
                  {rate.weight_min}-{rate.weight_max} kg
                </td>
                <td className="px-4 py-4 text-sm font-semibold">${rate.rate_per_kg}</td>
                <td className="px-4 py-4 text-sm">{rate.fuel_surcharge_pct}%</td>
                <td className="px-4 py-4 text-sm">
                  {new Date(rate.valid_from).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-sm">
                  {new Date(rate.valid_to).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleToggle(rate._id)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      rate.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(rate)}
                    className="text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rate._id)}
                    className="text-red-500 hover:text-red-600 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RateManager
