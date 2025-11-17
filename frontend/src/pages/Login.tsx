import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏦 EquiChain</h1>
          <p className="text-gray-400">Fractional Equity Trading Platform</p>
        </div>

        <div className="card">
          <div className="flex mb-6 bg-gray-900 rounded-lg p-1">
            <button
              className={`flex-1 py-2 rounded-md transition-colors ${
                isLogin ? 'bg-primary-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 rounded-md transition-colors ${
                !isLogin ? 'bg-primary-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-sm">
                New users start with ₹1,000 balance!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Demo platform for fractional equity trading
          </p>
          <p className="mt-2">
            Buy MRF shares starting from ₹1
          </p>
        </div>
      </div>
    </div>
  );
}
