import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/quotes/my-quotes');
      const quotes = response.data.data;

      const stats = {
        pending: quotes.filter((q) => q.quote_status === 'pending').length,
        approved: quotes.filter((q) => q.quote_status === 'approved').length,
        rejected: quotes.filter((q) => q.quote_status === 'rejected').length,
        total: quotes.length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mb-8">
          Get instant freight quotations in seconds
        </p>

        {/* Quick Stats */}
        {!loading && (
          <div className="grid grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
              <div className="text-gray-600">Total Quotes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
              <div className="text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-gray-600">Rejected</div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/quote')}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg transition text-lg"
          >
            + Create New Quote
          </button>
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg transition text-lg"
          >
            View Quote History
          </button>
        </div>
      </div>
    </div>
  );
}
