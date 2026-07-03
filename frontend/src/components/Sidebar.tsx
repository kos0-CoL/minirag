import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Plus, MessageSquare, Trash2, ChevronLeft, FileText, Bot, Sliders, Compass } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const {
    chats, chatActual, setChatActual, crearChat, eliminarChat,
    mostrarSidebar, toggleSidebar, cargarChats,
  } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => { cargarChats(); }, []);

  const handleNewChat = () => { crearChat('Nuevo Chat'); navigate('/chat'); };
  const handleDelete = (e: React.MouseEvent, id: string) => { e.stopPropagation(); eliminarChat(id); };

  return (
    <>
      {mostrarSidebar && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={toggleSidebar} />
      )}
      <aside className={clsx(
        'w-72 h-screen theme-bg-sidebar theme-border border-r flex flex-col transition-all z-30',
        mostrarSidebar ? 'fixed md:relative left-0' : '-translate-x-full md:relative md:translate-x-0 md:w-0 md:overflow-hidden md:border-0'
      )}>
        <div className="p-3 theme-border border-b flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 min-h-[44px] min-w-[44px] transition focus-visible:ring-2 focus-visible:outline-none rounded-lg" style={{ '--tw-ring-color': 'var(--theme-ring)' } as any}>
            <Bot className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
            <span className="font-semibold text-sm">Mini RAG Pro</span>
          </button>
          <button type="button" onClick={toggleSidebar} className="ml-auto p-1 theme-hover rounded md:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button type="button" onClick={handleNewChat}
          className="mx-3 mt-3 p-2.5 theme-btn-primary rounded-lg text-sm font-medium flex items-center gap-2 justify-center transition">
          <Plus className="w-4 h-4" /> Nuevo Chat
        </button>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-center pt-8" style={{ color: 'var(--theme-text-secondary)' }}>Sin chats aún</p>
          )}
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => { setChatActual(chat); navigate('/chat'); }}
              className={clsx(
                'w-full text-left p-2.5 rounded-lg text-sm flex items-center gap-2 group transition',
                chatActual?.id === chat.id ? 'theme-accent-light' : 'theme-hover'
              )}
              style={{ color: chatActual?.id === chat.id ? 'var(--theme-primary)' : 'var(--theme-text)' }}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{chat.titulo}</span>
              <span onClick={(e) => handleDelete(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded cursor-pointer" style={{ color: '#ef4444' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </nav>

        <div className="p-3 theme-border border-t flex gap-2 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
          <button type="button" onClick={() => navigate('/documents')} className="flex items-center gap-1.5 theme-hover-primary px-1.5 py-1 rounded transition">
            <FileText className="w-3.5 h-3.5" /> Docs
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 theme-hover-primary px-1.5 py-1 rounded transition">
            <Sliders className="w-3.5 h-3.5" /> Panel
          </button>
          <button type="button" onClick={() => navigate('/explore')} className="flex items-center gap-1.5 theme-hover-primary px-1.5 py-1 rounded transition">
            <Compass className="w-3.5 h-3.5" /> Explorar
          </button>
        </div>
      </aside>
    </>
  );
}
