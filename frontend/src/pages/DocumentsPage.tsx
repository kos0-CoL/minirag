import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Trash2, Upload, Download, Eye, EyeOff,
  Settings, X, ChevronDown, ChevronUp, Loader
} from 'lucide-react';
import { addDocument, removeDocument, getDocuments, exportChunksJSON, getChunkSize, setChunkSize, DocumentIndex } from '@/utils/chunkEngine';
import { useAppStore } from '@/store/useAppStore';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { setDocumentos, documentos } = useAppStore();
  const [docs, setDocs] = useState<DocumentIndex[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [autor, setAutor] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [tema, setTema] = useState('');
  const [chunkSize, setLocalChunkSize] = useState(getChunkSize());
  const [showConfig, setShowConfig] = useState(false);
  const [inspectDoc, setInspectDoc] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const refresh = () => {
    const all = getDocuments();
    setDocs(all);
    setDocumentos(all);
  };

  useEffect(() => { refresh(); }, []);

  const validateMeta = () => {
    if (!autor.trim()) return 'Autor requerido';
    if (!tema.trim()) return 'Tema requerido';
    return null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateMeta();
    if (err) { setUploadError(err); return; }
    setUploadError('');
    setUploading(true);
    try {
      await addDocument(file, { autor: autor.trim(), fecha, tema: tema.trim() });
      refresh();
      setAutor(''); setTema('');
    } catch (ex: any) {
      setUploadError(ex.message || 'Error al procesar archivo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    removeDocument(id);
    refresh();
  };

  const handleExport = () => {
    const json = exportChunksJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `minirag-chunks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChunkSizeChange = (val: number) => {
    setLocalChunkSize(val);
    setChunkSize(val);
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  const totalChunks = docs.reduce((s, d) => s + d.chunks.length, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Documentos</h1>
          <p className="text-sm text-gray-500">{docs.length} archivos · {totalChunks} chunks</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowConfig(!showConfig)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
          <button type="button" onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition">
            <Download className="w-4 h-4" /> Exportar Chunks
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="mx-4 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Configuración de Chunking</span>
            <button type="button" onClick={() => setShowConfig(false)}><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="text-xs text-gray-500">Tamaño de chunk: <strong>{chunkSize}</strong> caracteres</label>
            <input type="range" min={300} max={3000} step={100} value={chunkSize}
              onChange={e => handleChunkSizeChange(Number(e.target.value))}
              className="w-full accent-primary-600 mt-1" />
            <div className="flex justify-between text-xs text-gray-400"><span>300</span><span>3000</span></div>
            <p className="text-xs text-gray-400 mt-2">Los cambios aplican a <strong>nuevos</strong> documentos.</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Upload form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={autor} onChange={e => setAutor(e.target.value)}
              placeholder="Autor *" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500" />
            <input value={tema} onChange={e => setTema(e.target.value)}
              placeholder="Tema *" className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 transition">
            {uploading ? (
              <Loader className="w-5 h-5 animate-spin text-primary-600" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-500">
              {uploading ? 'Procesando...' : 'PDF, DOCX, TXT, MD, HTML'}
            </span>
            <input type="file" className="hidden" onChange={handleUpload}
              accept=".pdf,.docx,.txt,.md,.html,.htm" disabled={uploading} />
          </label>
          {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
        </div>

        {/* Document list */}
        <div className="space-y-2">
          {docs.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Subí un archivo para comenzar. Los chunks se indexan localmente.
            </div>
          )}

          {docs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <FileText className="w-5 h-5 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.nombre}</p>
                  <p className="text-xs text-gray-400">
                    {formatSize(doc.tamanio)} · {doc.chunks.length} chunks · {doc.metadatos.tema}
                    {doc.metadatos.autor ? ` · ${doc.metadatos.autor}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => setInspectDoc(inspectDoc === doc.id ? null : doc.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Ver contenido">
                  {inspectDoc === doc.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  {expandedDoc === doc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => handleDelete(doc.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {inspectDoc === doc.id && (
                <div className="px-4 pb-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{doc.contenido.slice(0, 2000)}{doc.contenido.length > 2000 ? '...(truncado)' : ''}</pre>
                  </div>
                </div>
              )}

              {expandedDoc === doc.id && (
                <div className="border-t border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 max-h-60 overflow-y-auto">
                  {doc.chunks.map(chunk => (
                    <div key={chunk.id} className="px-4 py-2 text-xs">
                      <span className="text-gray-400 font-mono">#{chunk.indice}</span>
                      <p className="mt-0.5 text-gray-600 dark:text-gray-300 line-clamp-2">{chunk.contenido}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
