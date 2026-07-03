import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Heart, CopyPlus, Copy, AlertCircle } from 'lucide-react';
import type { RepoItem } from '@/services/repoService';
import { getUserImports, addUserImport, toggleLike, hasUserLiked } from '@/services/repoService';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  item: RepoItem;
}

const AgentCard = memo(function AgentCard({ item }: Props) {
  const navigate = useNavigate();
  const token = useAppStore(s => s.token);
  const isGuest = useAppStore(s => s.isGuest);
  const cargarAgentes = useAppStore(s => s.cargarAgentes);
  const [liked, setLiked] = useState(hasUserLiked(item.id));
  const [likeCount, setLikeCount] = useState(item.likes);
  const [imported, setImported] = useState(getUserImports().includes(item.id));
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState('');

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) { navigate('/login'); return; }
    const nowLiked = toggleLike(item.id);
    setLiked(nowLiked);
    setLikeCount(c => nowLiked ? c + 1 : c - 1);
  };

  const handleImport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) { setToast('Los invitados no pueden importar agentes'); setTimeout(() => setToast(''), 2500); return; }
    if (!token) { navigate('/login'); return; }
    setImporting(true);
    const ok = addUserImport(item.id);
    if (ok) {
      setImported(true);
      setToast(`${item.tipo === 'agent' ? 'Agente' : 'Skill'} importado con éxito`);
      cargarAgentes();
      setTimeout(() => setToast(''), 2500);
    }
    setImporting(false);
  };

  const badgeColor = item.isSystem
    ? { bg: '#dbeafe', text: '#1e40af', label: 'Sistema' }
    : { bg: '#fef3c7', text: '#92400e', label: 'Comunidad' };

  const catColor: Record<string, string> = {
    'AI Specialists': '#1e40af', 'Development Team': '#15803d', 'Core Engine': '#7c3aed',
    'Data & Analytics': '#0d9488', 'Content Creation': '#c026d3', 'Infrastructure': '#ea580c',
    'Security': '#dc2626', 'Design': '#d97706', 'Marketing': '#db2777',
    'Education': '#2563eb', 'Research': '#4338ca', 'Business & Finance': '#059669',
    'Legal': '#4f46e5', 'Healthcare': '#0891b2', 'Creative': '#9333ea',
    'File Processing': '#6366f1', 'Data Collection': '#0ea5e9', 'Data Analysis': '#0891b2',
    'Audio/Video': '#a21caf', 'General': '#6b7280',
  };

  return (
    <div className="theme-card overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5">
      {toast && (
        <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="p-3.5 pb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--theme-text)' }}>
              {item.nombre}
            </span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
              {badgeColor.label}
            </span>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#f3f4f6', color: catColor[item.categoria] || '#6b7280' }}>
            {item.categoria}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0"
          style={{ backgroundColor: item.tipo === 'agent' ? '#ede9fe' : '#dbeafe', color: item.tipo === 'agent' ? '#7c3aed' : '#1e40af' }}>
          {item.tipo === 'agent' ? 'AI' : 'Skill'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3.5 flex-1">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
          {item.descripcion.length > 110
            ? item.descripcion.slice(0, 110) + '...'
            : item.descripcion}
        </p>

        {/* Author */}
        <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.autorId}`); }}
          className="flex items-center gap-1 mt-2 text-[11px] font-medium theme-hover-primary px-1.5 py-0.5 rounded transition"
          style={{ color: 'var(--theme-primary)' }}>
          @{item.autor.replace(/\s+/g, '_').toLowerCase()}
          <span className="text-[9px]" style={{ color: 'var(--theme-text-secondary)' }}>
            {item.copyCount > 5 ? '⭐⭐⭐' : item.copyCount > 2 ? '⭐⭐' : '⭐'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 flex items-center justify-between theme-border border-t mt-2">
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handleLike}
            className="flex items-center gap-1 text-xs transition"
            style={{ color: liked ? '#ef4444' : 'var(--theme-text-secondary)' }}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
            {likeCount}
          </button>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            <Copy className="w-3.5 h-3.5" />
            {item.copyCount}
          </span>
        </div>

        <button type="button" onClick={handleImport} disabled={imported || importing}
          className="flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg transition disabled:cursor-not-allowed"
          style={{
            backgroundColor: imported ? '#e5e5e5' : 'var(--theme-primary)',
            color: imported ? '#999' : '#fff',
          }}>
          {imported ? <Check className="w-3 h-3" /> : <CopyPlus className="w-3 h-3" />}
          {imported ? 'Agregado' : 'Agregar'}
        </button>
      </div>
    </div>
  );
});

export default AgentCard;
