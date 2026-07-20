import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';
import { useAppStore } from '@/store/useAppStore';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserProfile, setToken } = useAppStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Manejar el callback de Google OAuth
  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError('Google login was cancelled or failed');
      setSearchParams({});
      return;
    }

    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const data: any = await apiClient.googleAuth(code);
      if (!data?.user) throw new Error('Invalid server response');
      setUserProfile(data.user);
      setToken(data.token);
      // Limpiar los parámetros de la URL
      setSearchParams({});
      navigate('/chat');
    } catch (err: any) {
      const errorMsg = err?.error || err?.message || 'Error authenticating with Google';
      setError(errorMsg);
      setSearchParams({});
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setLoading(true);
    setError('');
    try {
      const data: any = await apiClient.googleAuth(credential);
      if (!data?.user) throw new Error('Invalid server response');
      setUserProfile(data.user);
      setToken(data.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err?.error || 'Error authenticating with Google');
    } finally {
      setLoading(false);
    }
  }, [setUserProfile, setToken, navigate]);

  const handleGoogleError = useCallback((error: string) => {
    setError(error);
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { handleGoogleSuccess, handleGoogleError, loading, error, clearError };
}
