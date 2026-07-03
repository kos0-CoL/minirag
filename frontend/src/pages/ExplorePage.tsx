import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Compass, RefreshCw, ArrowLeft, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { getRepoItems, type RepoItem } from '@/services/repoService';
import AgentCard from '@/components/AgentCard';
import Footer from '@/components/Footer';

type FilterType = 'all' | 'agent' | 'skill';
type SortBy = 'popular' | 'liked' | 'recent';

const CATEGORIES = [
  'AI Specialists', 'Development Team', 'Core Engine', 'Data & Analytics',
  'Content Creation', 'Infrastructure', 'Security', 'Design', 'Research',
  'Business & Finance', 'File Processing', 'Data Collection', 'General',
];

export default function ExplorePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setTimeout(() => {
      setItems(getRepoItems());
      setLoading(false);
    }, 400);
  }, []);

  const filtered = useMemo(() => {
    let result = [...items];
    if (typeFilter !== 'all') result = result.filter(i => i.tipo === typeFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q));
    }
    if (selectedCats.size > 0) result = result.filter(i => selectedCats.has(i.categoria));
    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.copyCount - a.copyCount); break;
      case 'liked': result.sort((a, b) => b.likes - a.likes); break;
      case 'recent': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return result;
  }, [items, typeFilter, debouncedSearch, selectedCats, sortBy]);

  const toggleCat = useCallback((cat: string) => {
    setSelectedCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }, []);

  const clearFilters = useCallback(() => { setSearch(''); setTypeFilter('all'); setSelectedCats(new Set()); setSortBy('popular'); }, []);

  if (loading) {
    return (
      <div className="h-screen overflow-y-auto" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <TopBar navigate={navigate} />
        <div className="p-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="theme-card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <TopBar navigate={navigate} />
      <StickyHeader search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeChange={setTypeFilter}
        sortBy={sortBy} onSortChange={setSortBy}
        totalResults={filtered.length}
        clearFilters={clearFilters} />

      <div className="flex max-w-6xl mx-auto">
        <aside className="hidden md:block w-48 shrink-0 p-4 pt-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Categorías</p>
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-1.5 cursor-pointer text-xs py-0.5 theme-hover rounded px-1" style={{ color: 'var(--theme-text)' }}>
              <input type="checkbox" checked={selectedCats.has(cat)} onChange={() => toggleCat(cat)}
                style={{ accentColor: 'var(--theme-primary)' }} className="w-3 h-3" />
              {cat}
            </label>
          ))}
          <button type="button" onClick={clearFilters} className="text-[10px] mt-2 flex items-center gap-1 theme-hover-primary px-1.5 py-1 rounded w-full" style={{ color: 'var(--theme-primary)' }}>
            <RefreshCw className="w-3 h-3" /> Limpiar filtros
          </button>
        </aside>

        <div className="flex-1 p-4 pt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--theme-text-secondary)' }}>
              <Compass className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Sin resultados</p>
              <p className="text-sm mt-1">Probá con otros filtros o creá tu propio agente.</p>
              <button type="button" onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 text-white text-sm rounded-lg" style={{ backgroundColor: 'var(--theme-primary)' }}>
                Ir al Panel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item => <AgentCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TopBar({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="sticky top-0 z-20 border-b" style={{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm font-medium theme-hover-primary px-2 py-1.5 rounded-lg transition"
            style={{ color: 'var(--theme-primary)' }}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <span className="font-semibold text-sm" style={{ color: 'var(--theme-text)' }}>Explorar</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => navigate('/profile/me')}
            className="text-xs px-2.5 py-1.5 rounded-lg" style={{ color: 'var(--theme-primary)' }}>
            Mi Perfil
          </button>
          <button type="button" onClick={() => navigate('/')}
            className="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1" style={{ color: 'var(--theme-text-secondary)' }}>
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
        </div>
      </div>
    </div>
  );
}

function StickyHeader({ search, onSearchChange, typeFilter, onTypeChange, sortBy, onSortChange, totalResults, clearFilters }: {
  search: string; onSearchChange: (v: string) => void;
  typeFilter?: FilterType; onTypeChange?: (v: FilterType) => void;
  sortBy?: SortBy; onSortChange?: (v: SortBy) => void;
  totalResults?: number; clearFilters?: () => void;
}) {
  const chips: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' }, { label: 'Agentes', value: 'agent' }, { label: 'Skills', value: 'skill' },
  ];

  return (
    <div className="sticky top-12 z-10 border-b" style={{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
      <div className="flex items-center gap-3 p-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text-secondary)' }} />
          <input value={search} onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg theme-input" />
          {search && (
            <button type="button" onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 theme-hover rounded">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {onTypeChange && (
          <div className="hidden sm:flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: 'var(--theme-bg-chat)' }}>
            {chips.map(chip => (
              <button key={chip.value} onClick={() => onTypeChange(chip.value)}
                className="px-2.5 py-1 text-xs font-medium rounded-md transition"
                style={{
                  backgroundColor: typeFilter === chip.value ? 'var(--theme-bg-card)' : 'transparent',
                  color: typeFilter === chip.value ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                  boxShadow: typeFilter === chip.value ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}>
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {onSortChange && (
          <select value={sortBy} onChange={e => onSortChange(e.target.value as SortBy)}
            className="px-2 py-1.5 text-xs rounded-lg theme-input outline-none">
            <option value="popular">Más populares</option>
            <option value="liked">Mejor valorados</option>
            <option value="recent">Más recientes</option>
          </select>
        )}

        {totalResults !== undefined && (
          <span className="text-[11px] shrink-0" style={{ color: 'var(--theme-text-secondary)' }}>{totalResults} resultados</span>
        )}

        <button type="button" onClick={clearFilters} className="md:hidden p-2 theme-hover rounded-lg" style={{ color: 'var(--theme-text-secondary)' }}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
