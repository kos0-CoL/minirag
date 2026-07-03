import MessageBubble from './MessageBubble';

export default function MessageList({ mensajes, loading, onIndexed }: { mensajes: any[]; loading: boolean; onIndexed?: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {mensajes.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Envía un mensaje para empezar. Los documentos cargados se usarán como contexto.
        </div>
      )}
      {mensajes.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onIndexed={onIndexed} />
      ))}
      {loading && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-600">AI</span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
