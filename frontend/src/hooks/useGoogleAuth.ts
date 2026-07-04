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
    console.log('Google auth started, sending credential to backend...');
    setLoading(true);
    setError('');
    try {
      const data: any = await apiClient.googleAuth(credential);
      console.log('Backend response:', data);
      if (!data?.user) throw new Error('Respuesta inválida del servidor');
      setUserProfile(data.user);
      setToken(data.token);
      console.log('Google auth successful, navigating to /chat');
      navigate('/chat');
    } catch (err: any) {
      console.error('Google auth error:', err);
      const errorMsg = err?.error || err?.message || 'Error al autenticar con Google';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [setUserProfile, setToken, navigate]);

  const handleGoogleError = useCallback((error: string) => {
    console.error('Google button error:', error);
    setError(error);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { handleGoogleSuccess, handleGoogleError, loading, error, clearError };
}
