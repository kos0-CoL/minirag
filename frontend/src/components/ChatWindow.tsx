import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/apiClient';
import { searchChunks, getDocuments } from '@/utils/chunkEngine';
import { toggleDocumentSelection } from '@/utils/documentSelection';
import { buildContextForQuestion } from '@/utils/contextBuilder';
import { getActiveAgents } from '@/data/agentsSkills';
import { getAvailableModels, getProviderForModel } from '@/data/models';
import axios from 'axios';
import MessageList from './MessageList';
import InputArea from './InputArea';
import {
  Bot, Settings, BookOpen, Zap, Sparkles, MessageSquare, FileText, Check, Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatWindow() {
  const {
    chatActual, agregarMensaje, loading, setLoading,
    modelo, setModelo, kResultados, agenteActual, setAgenteActual, setMensajeError,
    isGuest, documentos, setDocumentos,
    modoRespuesta, setModoRespuesta, followUp, setFollowUp,
    historialContexto, agregarHistorial, agentes,
  } = useAppStore();
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const [docsCount, setDocsCount] = useState(0);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [showDocPanel, setShowDocPanel] = useState(false);

  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev => toggleDocumentSelection(prev, id));
  };

  useEffect(() => { setDocsCount(getDocuments().length); }, [documentos]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatActual?.mensajes]);

  const callProviderDirect = async (query: string, contexto: string) => {
    const allKeys = JSON.parse(localStorage.getItem('minirag_apikeys') || '{}');
    const { provider, apiKey } = getProviderForModel(modelo, allKeys);

    if (!apiKey) {
      return Promise.reject(new Error(`⚠️ Configurá tu API Key de ${provider === 'GEMINI' ? 'Gemini' : provider} en el Panel de Control`));
    }

    if (provider === 'GEMINI') {
      const prompt = `Eres un asistente de IA especializado. Usa el contexto para responder.

CONTEXTO:
${contexto || 'No hay documentos disponibles.'}

INSTRUCCIONES DE FORMATO:
Respondé SOLO con un bloque JSON dentro de \`\`\`json \`\`\`. NO uses HTML, NO uses Markdown, NO empieces con saludos.

Schema JSON obligatorio:
{
  "titulo": "string — título principal del resumen",
  "resumen": "string — 1-2 párrafos de resumen",
  "puntosClave": ["string — cada punto clave"],
  "detalles": "string opcional — información adicional",
  "fuentes": ["string — nombres de archivo citados"]
}

Ejemplo:
\`\`\`json
{
  "titulo": "Resumen: Impacto de IA en Educación",
  "resumen": "El documento analiza cómo la inteligencia artificial está transformando la educación.",
  "puntosClave": [
    "La IA permite adaptar contenidos al ritmo de cada estudiante",
    "Tareas administrativas se reducen hasta un 40%"
  ],
  "detalles": "Brecha digital significativa entre escuelas.",
  "fuentes": ["informe-educacion-2025.pdf"]
}
\`\`\`

REGLAS:
- "puntosClave" mínimo 2 items si hay contexto.
- Sin contexto o contenido no relacionado: { "titulo": "", "resumen": "No puedo contestarte con la información proporcionada.", "puntosClave": [], "detalles": "", "fuentes": [] }
- NO incluyas texto fuera del bloque JSON.
- NO uses saludos.
PREGUNTA:
${query}

RESPUESTA:`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        { contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: modoRespuesta === 'quick' ? 0.3 : 0.7, maxOutputTokens: modoRespuesta === 'quick' ? 1024 : 2048 }
        },
        { params: { key: apiKey } }
      );
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (provider === 'MISTRAL') {
      const prompt = `Responde de forma útil y breve. Usa el contexto si existe.\n\nCONTEXTO:\n${contexto || 'No hay documentos disponibles.'}\n\nPREGUNTA:\n${query}\n\nRESPUESTA:`;

      const res = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: modelo,
          messages: [
            { role: 'system', content: 'Eres un asistente útil.' },
            { role: 'user', content: prompt },
          ],
          temperature: modoRespuesta === 'quick' ? 0.3 : 0.7,
          max_tokens: modoRespuesta === 'quick' ? 1024 : 2048,
        },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
      );

      return res.data.choices?.[0]?.message?.content || '';
    }

    return Promise.reject(new Error(`Proveedor no soportado: ${provider}`));
  };

  const handleSend = async (query: string) => {
    if (!query.trim() || !chatActual) return;

    agregarMensaje(chatActual.id, {
      id: crypto.randomUUID(), role: 'user', contenido: query, timestamp: new Date(),
    });
    setLoading(true);

    try {
      const results = searchChunks(query, kResultados || 3);
      const allDocs = getDocuments();
      const { context: contexto, docsUsados } = buildContextForQuestion(results, selectedDocIds, allDocs);

      const agenteInfo = agentes.find(a => a.id === agenteActual);
      const allKeys = JSON.parse(localStorage.getItem('minirag_apikeys') || '{}');
      const modeloApiKey = allKeys.GEMINI || allKeys.OPENAI || allKeys.ANTHROPIC || '';

      let result: any;

      if (isGuest) {
        const texto = await callProviderDirect(query, contexto);
        result = {
          respuesta: texto,
          documentosUtilizados: docsUsados,
          desdeCache: false,
          rechazado: !contexto && texto.includes('No puedo contestarte'),
        };
      } else {
        // Logged in: use backend
        result = await apiClient.hacerPregunta(
          chatActual.id, query,
          {
            modelo, k: kResultados, agente: agenteActual,
            instrucciones: agenteInfo?.instrucciones || '',
            apiKey: modeloApiKey,
            modoRespuesta, followUp,
            historial: followUp ? historialContexto : [],
          },
          contexto || undefined
        );
      }

      agregarMensaje(chatActual.id, {
        id: crypto.randomUUID(), role: 'assistant',
        contenido: result.respuesta,
        documentosUtilizados: result.documentosUtilizados || docsUsados,
        desdeCache: result.desdeCache,
        rechazado: result.rechazado,
        timestamp: new Date(),
      });

      agregarHistorial(query, result.respuesta?.replace(/<[^>]+>/g, '') || '');
    } catch (err: any) {
      setMensajeError(err?.message || 'Error al procesar pregunta');
    } finally {
      setLoading(false);
    }
  };

  const getModelosDisponibles = () => {
    const raw = localStorage.getItem('minirag_apikeys');
    const keys = raw ? JSON.parse(raw) : {};
    return getAvailableModels(keys);
  };

  if (!chatActual) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div>
          <Bot className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--theme-accent)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Mini RAG Pro</h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Creá un chat nuevo para empezar.</p>
        </div>
      </div>
    );
  }

  const modelos = getModelosDisponibles();

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {isGuest && (
        <div className="text-xs text-center py-1.5 px-3" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
          Modo invitado — los datos se guardan localmente.
          <button type="button" onClick={() => navigate('/login')} className="underline ml-1 font-medium">Iniciar sesión</button> para sincronizar.
        </div>
      )}

      {/* Header */}
      <div className="shrink-0" style={{ borderBottom: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
            <span className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>{chatActual.titulo}</span>
            <span className="text-[10px] shrink-0" style={{ color: 'var(--theme-text-secondary)' }}>({chatActual.modo})</span>
            {docsCount > 0 && (
              <div className="relative">
                <button type="button" onClick={() => setShowDocPanel(!showDocPanel)}
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 transition"
                  style={{
                    backgroundColor: selectedDocIds.size > 0 ? 'var(--theme-primary)' : 'var(--theme-accent-light)',
                    color: selectedDocIds.size > 0 ? '#fff' : 'var(--theme-primary)',
                  }}>
                  <BookOpen className="w-3 h-3" />
                  {selectedDocIds.size > 0 ? selectedDocIds.size : docsCount}
                </button>
                {showDocPanel && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDocPanel(false)} />
                    <div className="absolute top-full left-0 mt-1 w-72 z-20 theme-card rounded-xl shadow-xl border p-2 max-h-72 overflow-y-auto"
                      style={{ borderColor: 'var(--theme-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1" style={{ color: 'var(--theme-text-secondary)' }}>
                        Documentos indexados
                      </p>
                      {getDocuments().length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: 'var(--theme-text-secondary)' }}>
                          No hay documentos. Subí archivos desde Documentos.
                        </p>
                      )}
                      {getDocuments().map(doc => (
                        <label key={doc.id} className="flex items-center gap-2 p-2 rounded-lg theme-hover cursor-pointer text-xs">
                          <input type="checkbox" checked={selectedDocIds.has(doc.id)} onChange={() => toggleDoc(doc.id)}
                            style={{ accentColor: 'var(--theme-primary)' }} className="w-3.5 h-3.5 shrink-0" />
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium" style={{ color: 'var(--theme-text)' }}>{doc.nombre}</span>
                            <span className="text-[9px]" style={{ color: 'var(--theme-text-secondary)' }}>{doc.chunks.length} chunks</span>
                          </div>
                          {selectedDocIds.has(doc.id) && <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--theme-primary)' }} />}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={() => navigate('/settings')}
            className="p-1.5 theme-hover rounded-lg shrink-0" style={{ color: 'var(--theme-text-secondary)' }}>
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Control bar */}
        <div className="flex items-center gap-2 px-4 pb-2.5 overflow-x-auto text-xs" style={{ color: 'var(--theme-text)' }}>
          <select value={modelo} onChange={e => setModelo(e.target.value)}
            className="px-2 py-1 rounded-md text-xs outline-none theme-input">
            {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>

          <select value={agenteActual} onChange={e => setAgenteActual(e.target.value)}
            className="px-2 py-1 rounded-md text-xs outline-none theme-input" title={agentes.find(a => a.id === agenteActual)?.descripcion}>
            {getActiveAgents(agentes).map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ backgroundColor: 'var(--theme-bg-chat)' }}>
            <button type="button" onClick={() => setModoRespuesta('quick')}
              className="px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
              style={{ backgroundColor: modoRespuesta === 'quick' ? 'var(--theme-bg-card)' : 'transparent', color: 'var(--theme-text)' }}>
              <Zap className="w-3 h-3" /> Rápido
            </button>
            <button type="button" onClick={() => setModoRespuesta('detailed')}
              className="px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
              style={{ backgroundColor: modoRespuesta === 'detailed' ? 'var(--theme-bg-card)' : 'transparent', color: 'var(--theme-text)' }}>
              <Sparkles className="w-3 h-3" /> Detallado
            </button>
          </div>

          <button type="button" onClick={() => setFollowUp(!followUp)}
            className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition"
            style={{ backgroundColor: followUp ? 'var(--theme-accent-light)' : 'var(--theme-bg-chat)', color: followUp ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}>
            <MessageSquare className="w-3 h-3" /> Follow-up
          </button>

          {kResultados > 1 && (
            <span className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>K={kResultados}</span>
          )}
        </div>

        {/* Active Context Indicator */}
        {selectedDocIds.size > 0 && (() => {
          const selectedDocNames = getDocuments()
            .filter(doc => selectedDocIds.has(doc.id))
            .map(doc => ({ name: doc.nombre, chunks: doc.chunks.length }));

          return (
            <div className="px-4 py-2 flex items-center gap-2 text-xs"
              style={{
                backgroundColor: 'var(--theme-accent-light)',
                borderTop: '1px solid var(--theme-border)',
              }}>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                <span className="font-medium" style={{ color: 'var(--theme-primary)' }}>
                  Documento activo:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedDocNames.map((doc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                      color: '#fff',
                    }}>
                    {doc.name} ({doc.chunks} chunks)
                  </span>
                ))}
              </div>
              <span className="text-[10px] ml-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                ✦ Prioridad total
              </span>
            </div>
          );
        })()}

        {selectedDocIds.size === 0 && docsCount > 0 && (
          <div className="px-4 py-2 flex items-center gap-2 text-xs"
            style={{
              backgroundColor: 'var(--theme-bg-chat)',
              borderTop: '1px solid var(--theme-border)',
            }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-secondary)' }} />
            <span style={{ color: 'var(--theme-text-secondary)' }}>
              Modo búsqueda automática — se usarán los {kResultados || 3} chunks más relevantes
            </span>
          </div>
        )}
      </div>

      <MessageList mensajes={chatActual.mensajes || []} loading={loading} onIndexed={() => setDocsCount(getDocuments().length)} />
      <div ref={endRef} />
      <InputArea onSend={handleSend} loading={loading} />
    </div>
  );
}
