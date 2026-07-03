import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTheme, applyTheme } from '@/data/themes';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load pages — split bundles by route
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const Layout = lazy(() => import('@/components/Layout'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--theme-primary)', borderRightColor: 'var(--theme-primary)' }} />
        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const tema = useAppStore((s) => s.tema);
  const cargarAgentes = useAppStore((s) => s.cargarAgentes);

  useEffect(() => {
    const old = localStorage.getItem('tema');
    if (old && !localStorage.getItem('minirag_tema')) {
      localStorage.setItem('minirag_tema', old);
    }
    applyTheme(getTheme(tema));
    cargarAgentes();
  }, [tema]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
