import { useNavigate } from 'react-router-dom';

const year = new Date().getFullYear();

const LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Explorar', path: '/explore' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Legal', path: '/legal' },
  { label: 'Contacto', path: '/contact' },
  { label: 'Acerca', path: '/about' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: 'var(--theme-surface, #f8fafc)', borderTop: '1px solid var(--theme-border)' }}>
      <div className="flex flex-col items-center py-1.5 px-3 md:flex-row md:justify-between md:py-2 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          {LINKS.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="text-xs leading-none px-1.5 min-h-[44px] flex items-center rounded transition focus-visible:ring-2 focus-visible:outline-none"
              style={{ color: 'var(--theme-text-secondary)', '--tw-ring-color': 'var(--theme-ring)' } as any}>
              {l.label}
            </button>
          ))}
          <span className="text-xs leading-none px-1.5 flex items-center" style={{ color: 'var(--theme-text-secondary)' }}>
            &copy; {year}
          </span>
        </div>
      </div>
    </footer>
  );
}
