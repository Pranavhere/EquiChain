import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Status() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const info = {
          clientInfo: {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            fullUrl: window.location.href,
            apiUrl: api.defaults.baseURL,
          },
          backendConfig: {
            baseURL: api.defaults.baseURL,
            headers: api.defaults.headers,
          },
          localStorage: {
            token: !!localStorage.getItem('token'),
            user: !!localStorage.getItem('user'),
          },
        };

        // Try to reach backend
        const response = await api.get('/health');
        setStatus({
          ...info,
          backendStatus: response.data,
          connected: true,
        });
      } catch (err: any) {
        setError(err.message);
        setStatus({
          clientInfo: {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            fullUrl: window.location.href,
            apiUrl: api.defaults.baseURL,
          },
          error: {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
          },
          connected: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">EquiChain Status</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 EquiChain Diagnostic Status</h1>

        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Client Info</h2>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(status?.clientInfo, null, 2)}
          </pre>
        </div>

        {status?.connected ? (
          <div className="mb-8 p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">✅ Backend Connected</h2>
            <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(status?.backendStatus, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-400">❌ Backend Connection Failed</h2>
            <pre className="bg-gray-900 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(status?.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>localStorage token:</strong> {status?.localStorage?.token ? '✅ exists' : '❌ missing'}
            </p>
            <p>
              <strong>localStorage user:</strong> {status?.localStorage?.user ? '✅ exists' : '❌ missing'}
            </p>
            <p>
              <strong>API URL:</strong> <code className="bg-gray-900 px-2 py-1 rounded">{api.defaults.baseURL}</code>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => (window.location.href = '/login')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Login
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
