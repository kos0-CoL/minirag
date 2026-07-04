import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAppStore } from '@/store/useAppStore';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { MessageSquare, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserProfile, setToken, setIsGuest } = useAppStore();
  const navigate = useNavigate();
  const { handleGoogleSuccess, handleGoogleError, loading: googleLoading, error: googleError, clearError: clearGoogleError } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data: any = await apiClient.login(email, password);
      setUserProfile(data.user);
      setToken(data.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setIsGuest(true);
    navigate('/chat');
  };

  const displayError = error || googleError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-bg-chat)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl p-8 theme-bg-card" style={{ border: '1px solid var(--theme-border)' }}>
        <div className="text-center mb-8">
          <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Mini RAG Pro</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Inicia sesión para continuar</p>
        </div>

        {displayError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">{displayError}</div>
        )}

        <div className="space-y-3 mb-6">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' ? (
            <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          ) : (
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
              Google Client ID no configurado. Usa email o modo invitado.
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-gray-800 px-2 text-gray-400">o</span></div>
          </div>

          <button onClick={handleGuest}
            className="w-full py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2">
            <User className="w-4 h-4" /> Modo Invitado (sin registro)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition theme-input"
              placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition theme-input"
              placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading || googleLoading}
            className="w-full py-2.5 text-white font-medium rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-primary)' }}>
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Registrarse</Link>
        </p>
      </div>
    </div>
  );
}
