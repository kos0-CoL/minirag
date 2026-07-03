import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { getActiveAgents } from '@/data/agentsSkills';
import { ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    kResultados, setKResultados,
    agenteActual, setAgenteActual, agentes,
    mensajeError, setMensajeError, actualizarAgenteInstrucciones,
  } = useAppStore();

  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const activeAgents = getActiveAgents(agentes);
  const currentAgent = agentes.find(a => a.id === agenteActual);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/chat'); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleEditPrompt = (id: string) => {
    const agent = agentes.find(a => a.id === id);
    if (!agent) return;
    setEditingAgent(id);
    setEditPrompt(agent.instrucciones);
  };

  const handleSavePrompt = (id: string) => {
    actualizarAgenteInstrucciones(id, editPrompt);
    setEditingAgent(null);
  };

  return (
    <div style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="p-4 theme-border border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Configuración</h1>
        <button type="button" onClick={() => navigate('/chat')}
          className="p-1.5 theme-hover rounded-lg" style={{ color: 'var(--theme-text-secondary)' }}
          title="Cerrar (Esc)">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 max-w-lg space-y-6">
        {mensajeError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex justify-between items-center">
            <span>{mensajeError}</span>
            <button type="button" onClick={() => setMensajeError(null)} className="font-bold">&times;</button>
          </div>
        )}

        <ThemeSwitcher />

        {/* Agent selector with prompt */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
            Agente activo
          </label>

          {activeAgents.length === 0 && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--theme-accent-light)', color: 'var(--theme-text-secondary)' }}>
              No hay agentes activos. Actívalos en <strong>Panel de Control</strong>.
            </div>
          )}

          <select value={agenteActual} onChange={e => setAgenteActual(e.target.value)}
            className="w-full px-3 py-2 theme-input rounded-lg text-sm outline-none mb-2">
            {activeAgents.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>

          {currentAgent && (
            <div className="p-3 rounded-lg text-xs space-y-2"
              style={{ backgroundColor: 'var(--theme-bg-chat)', border: '1px solid var(--theme-border)' }}>
              <p style={{ color: 'var(--theme-text-secondary)' }}>{currentAgent.descripcion}</p>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowPrompt(!showPrompt)}
                  className="flex items-center gap-1 px-2 py-1 rounded transition theme-hover"
                  style={{ color: 'var(--theme-primary)' }}>
                  {showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showPrompt ? 'Ocultar prompt' : 'Ver prompt'}
                </button>
              </div>

              {showPrompt && (
                <div>
                  {editingAgent === currentAgent.id ? (
                    <div className="space-y-2">
                      <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)}
                        rows={5}
                        className="w-full p-2 text-xs font-mono rounded theme-input outline-none resize-none" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleSavePrompt(currentAgent.id)}
                          className="px-3 py-1 text-xs rounded text-white"
                          style={{ backgroundColor: 'var(--theme-primary)' }}>Guardar</button>
                        <button type="button" onClick={() => setEditingAgent(null)}
                          className="px-3 py-1 text-xs rounded theme-hover"
                          style={{ color: 'var(--theme-text-secondary)' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <pre className="flex-1 p-2 rounded text-xs font-mono whitespace-pre-wrap"
                        style={{ backgroundColor: 'var(--theme-bg-sidebar)', color: 'var(--theme-text-secondary)' }}>
                        {currentAgent.instrucciones}
                      </pre>
                      <button type="button" onClick={() => handleEditPrompt(currentAgent.id)}
                        className="p-1 rounded theme-hover shrink-0" title="Editar prompt">
                        <Pencil className="w-3 h-3" style={{ color: 'var(--theme-text-secondary)' }} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>
                <span>Temp: {currentAgent.configuracionModelo?.temperatura ?? 0.7}</span>
                <span>TopP: {currentAgent.configuracionModelo?.topP ?? 0.9}</span>
                {currentAgent.configuracionModelo?.maxOutputTokens && (
                  <span>Max: {currentAgent.configuracionModelo.maxOutputTokens}</span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
            {activeAgents.length} de {agentes.length} agentes activos. Gestiona los agentes en <strong>Panel de Control</strong>.
          </p>
        </div>


        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
            Documentos a recuperar (k): <span className="font-bold">{kResultados}</span>
          </label>
          <input type="range" min={1} max={10} value={kResultados}
            onChange={e => setKResultados(Number(e.target.value))}
            className="w-full" style={{ accentColor: 'var(--theme-primary)' }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>1</span><span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
