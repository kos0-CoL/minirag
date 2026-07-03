import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Key, Bot, Cpu, Download, Upload, Share2, Check, ChevronDown, ChevronUp, Search, CpuIcon, X, RefreshCw } from 'lucide-react';
import { AGENTES_PREDEFINIDOS, SKILLS_PREDEFINIDAS, loadAgents, saveAgents } from '@/data/agentsSkills';
import { PROVIDER_MODELS, PROVIDER_LABELS, ProviderModel } from '@/data/models';
import { useAppStore } from '@/store/useAppStore';

const API_KEY_NAMES = ['GEMINI', 'OPENAI', 'ANTHROPIC', 'COHERE', 'MISTRAL'];
const API_KEY_LABELS: Record<string, string> = {
  GEMINI: 'Gemini API Key', OPENAI: 'OpenAI API Key', ANTHROPIC: 'Anthropic API Key',
  COHERE: 'Cohere API Key', MISTRAL: 'Mistral API Key',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [agents, setAgents] = useState(AGENTES_PREDEFINIDOS);
  const [skills, setSkills] = useState(SKILLS_PREDEFINIDAS);
  const [searchAgent, setSearchAgent] = useState('');
  const [searchSkill, setSearchSkill] = useState('');
  const [showAgents, setShowAgents] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');
  const [newAgentId, setNewAgentId] = useState('');
  const [createStatus, setCreateStatus] = useState('');
  const [dynamicModels, setDynamicModels] = useState<Record<string, ProviderModel[]>>({});
  const [fetching, setFetching] = useState<Record<string, boolean>>({});

  const modelo = useAppStore(s => s.modelo);
  const setModelo = useAppStore(s => s.setModelo);
  const cargarAgentes = useAppStore(s => s.cargarAgentes);

  const fetchModels = async (provider: string, apiKey: string) => {
    if (provider !== 'GEMINI' || !apiKey) return;
    setFetching(p => ({ ...p, GEMINI: true }));
    try {
      const res = await axios.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        { params: { key: apiKey }, timeout: 5000 }
      );
      const data = res.data;
      if (data.models && data.models.length > 0) {
        const geminiModels = data.models
          .filter((m: any) => m.name && m.name.includes('gemini') && (m.supportedGenerationMethods || []).includes('generateContent'))
          .map((m: any) => ({
            id: m.name.split('/').pop(),
            nombre: m.displayName || m.name.split('/').pop(),
            provider: 'GEMINI',
          }));
        setDynamicModels({ GEMINI: geminiModels });
        localStorage.setItem('minirag_dynamic_models', JSON.stringify({ GEMINI: geminiModels }));
        if (geminiModels.length > 0 && !geminiModels.find((m: any) => m.id === modelo)) {
          setModelo(geminiModels[0].id);
        }
      }
    } catch (err: any) {
      console.warn('No se pudieron obtener modelos:', err.message);
    }
    setFetching(p => ({ ...p, GEMINI: false }));
  };

  const refreshModels = (provider: string) => {
    const key = apiKeys[provider];
    if (key) fetchModels(provider, key);
  };

  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/chat'); };
    window.addEventListener('keydown', escHandler);

    const savedKeys = localStorage.getItem('minirag_apikeys');
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      setApiKeys(parsed);
      if (parsed.GEMINI) fetchModels('GEMINI', parsed.GEMINI);
    }

    const savedModels = localStorage.getItem('minirag_dynamic_models');
    if (savedModels) setDynamicModels(JSON.parse(savedModels));

    const savedAgents = loadAgents();
    if (savedAgents) setAgents(savedAgents);
    const savedSkills = localStorage.getItem('minirag_skills');
    if (savedSkills) setSkills(JSON.parse(savedSkills));
    return () => window.removeEventListener('keydown', escHandler);
  }, []);

  const saveApiKey = (key: string, value: string) => {
    const next = { ...apiKeys, [key]: value };
    setApiKeys(next);
    localStorage.setItem('minirag_apikeys', JSON.stringify(next));
    if (key === 'GEMINI' && value.length > 5) fetchModels('GEMINI', value);
  };

  const toggleAgent = (id: string) => {
    const next = agents.map(a => a.id === id ? { ...a, activo: !a.activo } : a);
    saveAgents(next); setAgents(next); cargarAgentes();
  };

  const toggleSkill = (id: string) => {
    const next = skills.map(s => s.id === id ? { ...s, activo: !s.activo } : s);
    setSkills(next); localStorage.setItem('minirag_skills', JSON.stringify(next));
  };

  const handleCreateAgent = () => {
    if (!newAgentName.trim() || !newAgentPrompt.trim()) {
      setCreateStatus('❌ Nombre y prompt son requeridos'); setTimeout(() => setCreateStatus(''), 3000); return;
    }
    const id = newAgentId.trim() || newAgentName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const saved = JSON.parse(localStorage.getItem('minirag_agents') || '[]');
    if (saved.find((a: any) => a.id === id)) {
      setCreateStatus('❌ Agente con ese ID ya existe'); setTimeout(() => setCreateStatus(''), 3000); return;
    }
    saved.push({ id, nombre: newAgentName.trim(), descripcion: newAgentDesc.trim() || 'Agente custom', instrucciones: newAgentPrompt.trim(), activo: true, configuracionModelo: { temperatura: 0.7, topP: 0.9 } });
    localStorage.setItem('minirag_agents', JSON.stringify(saved));
    setAgents(saved); cargarAgentes();
    setNewAgentName(''); setNewAgentDesc(''); setNewAgentPrompt(''); setNewAgentId('');
    setCreateStatus('✅ Agente creado'); setTimeout(() => setCreateStatus(''), 3000);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify({ apiKeys, agents, skills }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `minirag-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target?.result as string);
        if (config.apiKeys) { setApiKeys(config.apiKeys); localStorage.setItem('minirag_apikeys', JSON.stringify(config.apiKeys)); if (config.apiKeys.GEMINI) fetchModels('GEMINI', config.apiKeys.GEMINI); }
        if (config.agents) { setAgents(config.agents); saveAgents(config.agents); cargarAgentes(); }
        if (config.skills) { setSkills(config.skills); localStorage.setItem('minirag_skills', JSON.stringify(config.skills)); }
        setImportStatus('✅ Importado'); setTimeout(() => setImportStatus(''), 3000);
      } catch { setImportStatus('❌ Inválido'); }
    };
    reader.readAsText(file);
  };

  const shareConfig = () => {
    navigator.clipboard.writeText(JSON.stringify({ apiKeys: { GEMINI: '••••', OPENAI: '••••', ANTHROPIC: '••••', COHERE: '••••', MISTRAL: '••••' }, agents, skills }));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const activeApiKeys = API_KEY_NAMES.filter(k => apiKeys[k] && apiKeys[k].length > 5);
  const activeAgentCount = agents.filter(a => a.activo).length;
  const activeSkillCount = skills.filter(s => s.activo).length;

  return (
    <div style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="p-4 theme-border border-b flex items-center justify-between" style={{ backgroundColor: 'var(--theme-bg-card)' }}>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Panel de Control</h1>
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Configura tu perfil de RAG</p>
        </div>
        <div className="flex items-center justify-end gap-2 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
          <span className="theme-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>{activeApiKeys.length} API Keys</span>
          <span className="theme-badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>{activeAgentCount} agentes</span>
          <span className="theme-badge" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>{activeSkillCount} skills</span>
          <button type="button" onClick={() => navigate('/chat')} className="p-1.5 theme-hover rounded-lg ml-2" style={{ color: 'var(--theme-text-secondary)' }} title="Cerrar (Esc)"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="p-4 max-w-3xl space-y-6">
        {/* API KEYS + MODELS */}
        <section className="theme-card p-4">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: 'var(--theme-text)' }}><Key className="w-4 h-4" /> API Keys y Modelos</h2>
          <div className="space-y-3">
            {API_KEY_NAMES.map(k => {
              const hasKey = apiKeys[k] && apiKeys[k].length > 5;
              const isGemini = k === 'GEMINI';
              const models = isGemini && dynamicModels.GEMINI?.length
                ? dynamicModels.GEMINI
                : PROVIDER_MODELS.filter(m => m.provider === k);
              return (
                <div key={k} className="p-3 rounded-lg" style={{
                  backgroundColor: hasKey ? 'var(--theme-accent-light)' : 'var(--theme-bg-chat)',
                  border: '1px solid var(--theme-border)',
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <input type={showKeys[k] ? 'text' : 'password'} value={apiKeys[k] || ''}
                      onChange={e => saveApiKey(k, e.target.value)} placeholder={API_KEY_LABELS[k]}
                      className="flex-1 px-3 py-2 text-sm rounded-lg outline-none font-mono theme-input" />
                    <button type="button" onClick={() => setShowKeys(p => ({ ...p, [k]: !p[k] }))}
                      className="p-2 theme-hover rounded text-xs shrink-0" style={{ color: 'var(--theme-text-secondary)' }}>
                      {showKeys[k] ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {hasKey && (
                    <div className="flex items-center gap-2 pt-1">
                      <CpuIcon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                      <select value={models.find(m => m.id === modelo) ? modelo : models[0]?.id || ''}
                        onChange={e => setModelo(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs rounded-lg theme-input outline-none">
                        {models.map(m => <option key={m.id} value={m.id}>{m.nombre}{m.provider === 'GEMINI' && dynamicModels.GEMINI?.length ? '' : ` (${m.provider})`}</option>)}
                      </select>
                      {isGemini && (
                        <button type="button" onClick={() => refreshModels('GEMINI')} disabled={fetching.GEMINI}
                          className="p-1.5 theme-hover rounded shrink-0" title="Actualizar modelos desde Google API"
                          style={{ color: 'var(--theme-text-secondary)' }}>
                          <RefreshCw className={`w-3.5 h-3.5 ${fetching.GEMINI ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  )}
                  {isGemini && hasKey && dynamicModels.GEMINI && (
                    <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                      {dynamicModels.GEMINI.length} modelos obtenidos de la API de Google
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* AGENTES */}
        <section className="theme-card p-4">
          <button type="button" onClick={() => setShowAgents(!showAgents)} className="w-full flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--theme-text)' }}><Bot className="w-4 h-4 inline" /> Agentes ({activeAgentCount}/{agents.length})</h2>
            {showAgents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAgents && (
            <><div className="relative mb-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text-secondary)' }} />
              <input value={searchAgent} onChange={e => setSearchAgent(e.target.value)} placeholder="Buscar agente..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none theme-input" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                {agents.filter(a => a.nombre.toLowerCase().includes(searchAgent.toLowerCase())).map(a => (
                  <label key={a.id} className="flex items-center gap-2 p-2 theme-hover rounded-lg cursor-pointer text-sm">
                    <input type="checkbox" checked={a.activo} onChange={() => toggleAgent(a.id)} style={{ accentColor: 'var(--theme-primary)' }} />
                    <div className="min-w-0"><span className="font-medium block truncate" style={{ color: 'var(--theme-text)' }}>{a.nombre}</span>{a.activo && <span className="text-[10px] block truncate" style={{ color: 'var(--theme-text-secondary)' }}>{a.descripcion}</span>}</div>
                  </label>
                ))}
              </div>
            </>
          )}
        </section>

        {/* SKILLS */}
        <section className="theme-card p-4">
          <button type="button" onClick={() => setShowSkills(!showSkills)} className="w-full flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--theme-text)' }}><Cpu className="w-4 h-4 inline" /> Skills ({activeSkillCount}/{skills.length})</h2>
            {showSkills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showSkills && (
            <><div className="relative mb-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text-secondary)' }} />
              <input value={searchSkill} onChange={e => setSearchSkill(e.target.value)} placeholder="Buscar skill..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none theme-input" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
                {skills.filter(s => s.nombre.toLowerCase().includes(searchSkill.toLowerCase())).map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 theme-hover rounded-lg cursor-pointer text-sm">
                    <input type="checkbox" checked={s.activo} onChange={() => toggleSkill(s.id)} style={{ accentColor: 'var(--theme-primary)' }} />
                    <div className="min-w-0"><span className="font-medium block truncate" style={{ color: 'var(--theme-text)' }}>{s.nombre}</span>{s.activo && <span className="text-[10px] block truncate" style={{ color: 'var(--theme-text-secondary)' }}>{s.descripcion}</span>}</div>
                  </label>
                ))}
              </div>
            </>
          )}
        </section>

        {/* CREAR AGENTE CUSTOM */}
        <section className="theme-card p-4">
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--theme-text)' }}><Bot className="w-4 h-4 inline" /> Crear Agente Custom</h2>
          <div className="space-y-2">
            <input value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder="Nombre del agente" className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none" />
            <input value={newAgentDesc} onChange={e => setNewAgentDesc(e.target.value)} placeholder="Descripción corta" className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none" />
            <textarea value={newAgentPrompt} onChange={e => setNewAgentPrompt(e.target.value)} placeholder="Instrucciones / System Prompt..." rows={4} className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none resize-none font-mono" />
            <div className="flex items-center gap-2">
              <input value={newAgentId} onChange={e => setNewAgentId(e.target.value)} placeholder="ID único" className="w-full px-3 py-2 text-sm rounded-lg theme-input outline-none font-mono" />
              <button type="button" onClick={handleCreateAgent} className="shrink-0 px-4 py-2 text-white text-sm font-medium rounded-lg transition" style={{ backgroundColor: 'var(--theme-primary)' }}>Crear</button>
            </div>
            {createStatus && <p className="text-xs" style={{ color: createStatus.includes('✅') ? '#15803d' : '#dc2626' }}>{createStatus}</p>}
          </div>
        </section>

        {/* IMPORT / EXPORT */}
        <section className="theme-card p-4">
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--theme-text)' }}>Importar / Exportar Configuración</h2>
          {importStatus && <div className="mb-3 text-sm text-center">{importStatus}</div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportConfig} className="flex items-center gap-1.5 px-3 py-2 theme-btn-ghost rounded-lg text-sm"><Download className="w-4 h-4" /> Exportar JSON</button>
            <label className="flex items-center gap-1.5 px-3 py-2 theme-btn-ghost rounded-lg text-sm cursor-pointer"><Upload className="w-4 h-4" /> Importar JSON <input type="file" accept=".json" className="hidden" onChange={importConfig} /></label>
            <button type="button" onClick={shareConfig} className="flex items-center gap-1.5 px-3 py-2 theme-btn-ghost rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}{copied ? 'Copiado' : 'Compartir'}</button>
          </div>
        </section>
      </div>
    </div>
  );
}
