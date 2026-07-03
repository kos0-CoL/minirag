import { BookOpen, Bot, Cpu, Shield } from 'lucide-react';
import Footer from '@/components/Footer';

const FEATURES = [
  { icon: BookOpen, title: 'RAG Inteligente', desc: 'Subí documentos (PDF, DOCX, TXT, HTML) y hace preguntas. La IA responde basándose exclusivamente en tu material, sin alucinaciones.' },
  { icon: Bot, title: 'Agentes', desc: '20+ agentes con prompts optimizados. Elegí el rol: investigador, programador, abogado, científico y más.' },
  { icon: Cpu, title: 'Multi-Modelo', desc: 'Conectá tus API Keys de Gemini, OpenAI, Anthropic, Cohere o Mistral.' },
  { icon: Shield, title: 'Privacidad', desc: 'Tus archivos y API Keys se quedan en tu navegador. Sin servidores, sin tracking.' },
];

const TECHS = ['React 18', 'TypeScript', 'Vite', 'Tailwind', 'Express', 'SQLite', 'PostgreSQL', 'Gemini', 'OpenAI'];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <h1 className="text-xl md:text-3xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
          Sobre Mini RAG Pro
        </h1>
        <p className="text-xs md:text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
          RAG inteligente con control total de tus datos.
        </p>

        <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
          {/* What is RAG */}
          <div className="rounded-xl border p-4 md:p-6" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <h2 className="text-base md:text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>¿Qué es RAG?</h2>
            <p>
              RAG (Retrieval-Augmented Generation) permite a la IA responder basándose en documentos reales que vos subís.
              Primero busca información relevante en tus archivos, luego genera una respuesta condicionada a ese contenido.
              Resultado: respuestas precisas, limitadas a tu contexto, con fuentes visibles.
            </p>
          </div>

          {/* How it works */}
          <div className="rounded-xl border p-4 md:p-6" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <h2 className="text-base md:text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>¿Cómo funciona?</h2>
            <ol className="space-y-2 list-decimal pl-5">
              <li>Subí un documento (PDF, DOCX, TXT, HTML).</li>
              <li>El sistema lo divide en fragmentos (chunks) y los indexa localmente.</li>
              <li>Hacé una pregunta. La IA busca los chunks más relevantes.</li>
              <li>El agente seleccionado genera una respuesta usando solo ese contexto.</li>
              <li>Si la pregunta no tiene relación, la IA lo rechaza explícitamente.</li>
            </ol>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl border p-4 min-h-[120px]" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
                <f.icon className="w-6 h-6 mb-2" style={{ color: 'var(--theme-primary)' }} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text)' }}>{f.title}</h3>
                <p className="text-xs">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Stack */}
          <div className="rounded-xl border p-4 md:p-6" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
            <h2 className="text-base md:text-lg font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>Stack Tecnológico</h2>
            <div className="flex flex-wrap gap-2">
              {TECHS.map(t => (
                <span key={t} className="px-2.5 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--theme-accent-light)', color: 'var(--theme-primary)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center py-4">
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Hecho con ❤️ para la comunidad. Proyecto open-source que prioriza tu privacidad.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
