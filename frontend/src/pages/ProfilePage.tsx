import { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, UserCircle, Pencil, Check, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { getRepoItems } from '@/services/repoService';
import { apiClient } from '@/services/apiClient';
import AgentCard from '@/components/AgentCard';
import Footer from '@/components/Footer';
import { useAppStore } from '@/store/useAppStore';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, setUserProfile, isGuest, token } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (username === 'me' && token) {
        try {
          const p = await apiClient.profile();
          setProfile(p);
          setEditName(p.nombre || '');
          setEditAvatar(p.preferences?.avatar || '');
          setEditBio(p.preferences?.bio || '');
          setEditWebsite(p.preferences?.website || '');
        } catch {
          const local = JSON.parse(localStorage.getItem('user_profile') || '{}');
          setProfile(local);
          setEditName(local.nombre || 'Usuario');
        }
      } else {
        const local = JSON.parse(localStorage.getItem('user_profile') || '{}');
        setProfile(local);
      }
      setLoading(false);
    };
    load();
  }, [username, token]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const updated = await apiClient.updateProfile({
        nombre: editName,
        preferences: { avatar: editAvatar, bio: editBio, website: editWebsite },
      });
      setProfile(updated);
      setUserProfile({ ...updated, preferences: updated.preferences });
      localStorage.setItem('user_profile', JSON.stringify(updated));
      setEditing(false);
      setSaveSuccess('Perfil actualizado');
      setTimeout(() => setSaveSuccess(''), 2500);
    } catch (err: any) {
      setSaveError(err?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profile?.nombre || '');
    setEditAvatar(profile?.preferences?.avatar || '');
    setEditBio(profile?.preferences?.bio || '');
    setEditWebsite(profile?.preferences?.website || '');
    setEditing(false);
    setSaveError('');
  };

  const displayUsername = username === 'me'
    ? (profile?.nombre || 'Usuario').replace(/\s+/g, '_').toLowerCase()
    : username;

  const userItems = useMemo(() => {
    return getRepoItems().filter(i =>
      i.autorId === displayUsername || i.autor.replace(/\s+/g, '_').toLowerCase() === displayUsername
    );
  }, [displayUsername]);

  const ownProfile = username === 'me';
  const avatarUrl = profile?.preferences?.avatar || '';

  if (!loading && ownProfile && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--theme-bg-chat)' }}>
        <div className="text-center max-w-sm theme-card p-8 rounded-2xl">
          <UserCircle className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--theme-text-secondary)' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Inicia sesión para ver tu perfil</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>Registrate para crear un perfil público y compartir tus agentes.</p>
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: 'var(--theme-primary)' }}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate('/explore')}
            className="flex items-center gap-1 text-sm font-medium theme-hover-primary px-2 py-1.5 rounded-lg transition"
            style={{ color: 'var(--theme-primary)' }}>
            <ArrowLeft className="w-4 h-4" /> Explorar
          </button>
          <div className="flex items-center gap-2">
            {ownProfile && !editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}>
                <Pencil className="w-3 h-3" /> Editar Perfil
              </button>
            )}
            <button onClick={() => navigate('/')}
              className="text-xs px-2.5 py-1.5 rounded-lg" style={{ color: 'var(--theme-text-secondary)' }}>
              Ir al Chat
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6 p-4 theme-card">
          {editing && ownProfile ? (
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              {editAvatar ? (
                <img src={editAvatar} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}>
                  {(editName?.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}>
                  {(profile?.nombre?.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {editing && ownProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Nombre</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Avatar URL</label>
                  <input value={editAvatar} onChange={e => setEditAvatar(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Biografía</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none resize-none" placeholder="Contá algo sobre vos..." />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Sitio web / redes</label>
                  <input value={editWebsite} onChange={e => setEditWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--theme-primary)' }}>
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={handleCancel}
                    className="flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg"
                    style={{ backgroundColor: '#e5e5e5', color: '#666' }}>
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                {saveSuccess && <p className="text-xs text-green-500">{saveSuccess}</p>}
              </div>
            ) : (
              <>
                <h1 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  @{displayUsername}
                  {ownProfile && <span className="text-xs ml-2 font-normal" style={{ color: 'var(--theme-text-secondary)' }}>(tu perfil)</span>}
                </h1>
                {profile?.preferences?.bio && (
                  <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{profile.preferences.bio}</p>
                )}
                {profile?.preferences?.website && (
                  <a href={profile.preferences.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs mt-1 hover:underline"
                    style={{ color: 'var(--theme-primary)' }}>
                    <LinkIcon className="w-3 h-3" /> {profile.preferences.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  {userItems.length} {userItems.length === 1 ? 'contribución' : 'contribuciones'}
                </p>
                {ownProfile && userItems.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Creá agentes desde el <button onClick={() => navigate('/dashboard')} className="underline" style={{ color: 'var(--theme-primary)' }}>Panel de Control</button> y compartilos.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Contributions */}
        {userItems.length === 0 && !ownProfile ? (
          <div className="text-center py-16" style={{ color: 'var(--theme-text-secondary)' }}>
            <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Sin contribuciones</p>
            <p className="text-sm mt-1">Este usuario aún no ha creado agentes públicos.</p>
          </div>
        ) : userItems.length > 0 ? (
          <>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>Contribuciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userItems.map(item => <AgentCard key={item.id} item={item} />)}
            </div>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
