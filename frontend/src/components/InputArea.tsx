import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

export default function InputArea({ onSend, loading }: { onSend: (msg: string) => void; loading: boolean }) {
  const [input, setInput] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <button className="p-2 theme-hover rounded-lg shrink-0" title="Subir archivo">
          <Paperclip className="w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
        </button>
        <textarea
          ref={textRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl resize-none outline-none text-sm transition max-h-[150px] theme-input"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="p-2.5 text-white rounded-xl transition disabled:cursor-not-allowed shrink-0"
          style={{
            backgroundColor: input.trim() && !loading ? 'var(--theme-primary)' : 'var(--theme-border)',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
