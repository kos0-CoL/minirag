import { THEMAS, getTheme, applyTheme } from '@/data/themes';
import { useAppStore } from '@/store/useAppStore';
import { Check } from 'lucide-react';
import clsx from 'clsx';

export default function ThemeSwitcher() {
  const { tema, setTema } = useAppStore();
  const current = getTheme(tema);

  const handleChange = (id: string) => {
    setTema(id);
    applyTheme(getTheme(id));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium block mb-1">Tema Visual</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {THEMAS.map((th) => {
          const active = th.id === tema;
          return (
            <button
              key={th.id}
              onClick={() => handleChange(th.id)}
              className={clsx(
                'relative p-3 rounded-xl border-2 text-left transition-all',
                active
                  ? 'border-[var(--theme-primary)] shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
              style={{
                backgroundColor: th.colors.bg,
                color: th.colors.text,
                fontFamily: th.font,
              }}
            >
              {active && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: th.colors.primary, color: '#fff' }}>
                  <Check className="w-3 h-3" />
                </span>
              )}
              <span className="text-lg block mb-1">{th.icono}</span>
              <span className="text-sm font-semibold block">{th.nombre}</span>
              <span className="text-[10px] block mt-0.5" style={{ color: th.colors['text-secondary'] }}>
                {th.descripcion}
              </span>
              <div className="flex gap-1 mt-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.colors.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.colors.accent }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: th.colors['accent-light'] }} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Tema actual: <span className="font-semibold" style={{ color: current.colors.primary }}>{current.nombre}</span> ({current.descripcion})
      </p>
    </div>
  );
}
