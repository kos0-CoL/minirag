import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAppStore } from '@/store/useAppStore';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserProfile, setToken } = useAppStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setLoading(true);
    setError('');
    try {
      const data: any = await apiClient.googleAuth(credential);
      if (!data?.user) throw new Error('Respuesta inválida');
      setUserProfile(data.user);
      setToken(data.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err?.error || 'Error al autenticar con Google');
    } finally {
      setLoading(false);
    }
  }, [setUserProfile, setToken, navigate]);

  const clearError = useCallback(() => setError(''), []);

  return { handleGoogleSuccess, loading, error, clearError };
}
