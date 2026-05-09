import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../firebase/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('Невірний email або пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Волонтемор</h1>
        <p className="text-sm text-gray-500 mt-1">Управління складом</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 active:bg-blue-700 transition-colors"
        >
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </div>
  );
}
