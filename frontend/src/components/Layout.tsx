import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/apiClient';
import { Menu, LogOut, UserCircle, LogIn } from 'lucide-react';
import { useEffect } from 'react';

export default function Layout() {
  const { setUser, logout, user, toggleSidebar, isGuest } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGuest) {
      apiClient.profile().then((d: any) => setUser(d)).catch(() => {});
    }
  }, [isGuest]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="h-screen flex" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 shrink-0" style={{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
          <button type="button" onClick={toggleSidebar} className="p-2 hover:opacity-70 rounded-lg" style={{ color: 'var(--theme-text)' }} aria-label="Abrir menú">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {isGuest ? (
              <>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
                  Invitado
                </span>
                <button type="button" onClick={() => navigate('/login')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition"
                  style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}>
                  <LogIn className="w-3.5 h-3.5" /> Ingresar
                </button>
              </>
            ) : (
              <>
                {user && <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{user.nombre}</span>}
                <button type="button" onClick={() => navigate('/profile/me')} className="p-1.5 hover:opacity-70 rounded-lg" style={{ color: 'var(--theme-text-secondary)' }} aria-label="Mi Perfil">
                  <UserCircle className="w-5 h-5" />
                </button>
                <button type="button" onClick={handleLogout} className="p-1.5 hover:opacity-70 rounded-lg" style={{ color: 'var(--theme-primary)' }} aria-label="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <main className="flex-1" role="main">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
