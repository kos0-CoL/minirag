import { useAppStore } from '@/store/useAppStore';
import { Navigate, useLocation } from 'react-router-dom';

// Routes that require full authentication (none currently — guests have full access)
const AUTH_ONLY_ROUTES: string[] = [];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isGuest = useAppStore((s) => s.isGuest);
  const location = useLocation();

  // Guest users can access chat, but not dashboard/documents/settings
  if (isGuest && AUTH_ONLY_ROUTES.some(r => location.pathname.startsWith(r))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
