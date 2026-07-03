import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Shield, Scale } from 'lucide-react';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    id: 'aviso', icon: FileText, title: 'Aviso Legal',
    content: `Mini RAG Pro es una herramienta de inteligencia artificial que permite a los usuarios procesar sus propios documentos y obtener respuestas basadas en ellos.

El usuario es el unico responsable del contenido que sube. No nos hacemos responsables del uso indebido ni de las decisiones tomadas basandose en las respuestas generadas por IA, las cuales pueden contener errores. Siempre verifique la informacion critica con fuentes adicionales.

El usuario conserva todos los derechos sobre sus documentos. No reclamamos propiedad sobre el contenido subido.`,
  },
  {
    id: 'privacidad', icon: Shield, title: 'Politica de Privacidad',
    content: `Ultima actualizacion: junio 2026

1. DATOS QUE RECOPILAMOS
Al registrarse con Google: nombre, email e imagen de perfil. Al registrarse con email: nombre y correo electronico.

2. API KEYS
Las claves de API (Gemini, OpenAI, Anthropic, Cohere, Mistral) se almacenan en el navegador (localStorage) y se envian directamente al proveedor de IA correspondiente desde el frontend. El servidor puede usar una clave de fallback configurada por el administrador. Las claves nunca se comparten con terceros no relacionados con el servicio.

3. ARCHIVOS
Los documentos subidos se procesan localmente en el navegador para chunking. No almacenamos archivos en servidores externos.

4. COOKIES
Solo cookies de sesion para mantener autenticacion (JWT). Sin cookies de rastreo ni publicitarias.

5. TUS DERECHOS
Puede solicitar la eliminacion de su cuenta contactandonos a hola@minirag.pro.

6. CONTACTO
Para consultas sobre privacidad: hola@minirag.pro`,
  },
  {
    id: 'terminos', icon: Scale, title: 'Terminos de Uso',
    content: `Al usar Mini RAG Pro, acepta:

1. USO RESPONSABLE
No use la plataforma para actividades ilegales. No suba contenido que infrinja derechos de terceros.

2. LIMITACION DE RESPONSABILIDAD
El servicio se proporciona "tal cual". No garantizamos precision o integridad de las respuestas generadas por IA. Las respuestas no constituyen asesoramiento profesional (medico, legal, financiero).

3. PROPIEDAD INTELECTUAL
El codigo de la plataforma es propiedad de Mini RAG Pro. Las configuraciones creadas por usuarios pertenecen a sus creadores.

4. MODIFICACIONES
Nos reservamos el derecho de modificar estos terminos. Los cambios se notificaran en la plataforma.

5. CONTACTO LEGAL
hola@minirag.pro`,
  },
];

export default function LegalPage() {
  const [open, setOpen] = useState('aviso');

  useEffect(() => {
    const h = window.location.hash.replace('#', '');
    if (h) setOpen(h);
  }, []);

  const toggle = (id: string) => setOpen(o => o === id ? '' : id);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <h1 className="text-xl md:text-3xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Informacion Legal</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>Aviso Legal, Privacidad y Terminos de Uso</p>

        <div className="space-y-2">
          {SECTIONS.map(s => {
            const isOpen = open === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} id={s.id} className="rounded-xl border" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
                <button onClick={() => toggle(s.id)} aria-expanded={isOpen} aria-controls={`section-${s.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left transition focus-visible:ring-2 focus-visible:outline-none rounded-xl"
                  style={{ '--tw-ring-color': 'var(--theme-ring)' } as any}>
                  <Icon className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-sm md:text-base font-semibold" style={{ color: 'var(--theme-text)' }}>{s.title}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 ml-auto" style={{ color: 'var(--theme-text-secondary)' }} />
                    : <ChevronDown className="w-4 h-4 ml-auto" style={{ color: 'var(--theme-text-secondary)' }} />}
                </button>
                {isOpen && (
                  <div id={`section-${s.id}`} className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="text-sm leading-relaxed whitespace-pre-line mt-3" style={{ color: 'var(--theme-text-secondary)' }}>
                      {s.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
