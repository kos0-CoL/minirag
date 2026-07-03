import { useState } from 'react';
import { Mail, Send, Clock, ShieldCheck } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [err, setErr] = useState('');

  const handleChange = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.asunto.trim() || !form.mensaje.trim()) {
      setErr('Todos los campos son obligatorios'); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setErr('Email inválido'); return; }
    setErr('');
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <h1 className="text-xl md:text-3xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Contacto</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--theme-text-secondary)' }}>¿Preguntas o sugerencias? Escribinos.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: Mail, label: 'Email', value: 'hola@minirag.pro', href: 'mailto:hola@minirag.pro' },
            { icon: Clock, label: 'Respuesta', value: '24-48 h hábiles' },
            { icon: ShieldCheck, label: 'Privacidad', value: 'Tus datos no se comparten' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl border min-h-[56px]" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
              <c.icon className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>{c.label}</p>
                {c.href ? <a href={c.href} className="text-sm" style={{ color: 'var(--theme-primary)' }}>{c.value}</a>
                  : <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{c.value}</p>}
              </div>
            </div>
          ))}
        </div>

        {status === 'sent' && (
          <div className="p-3 rounded-lg text-sm mb-4 text-center" style={{ backgroundColor: '#dcfce7', color: '#166534' }} role="alert">
            ✅ Mensaje enviado con éxito. Te responderemos pronto.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="rounded-xl border p-4 md:p-8 space-y-4" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }}>
          {err && <p className="text-sm" style={{ color: '#dc2626' }} role="alert">{err}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>
                Nombre <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input id="contact-name" value={form.nombre} onChange={handleChange('nombre')}
                required aria-required="true" autoComplete="name"
                className="w-full px-4 rounded-xl outline-none text-sm transition"
                style={{ border: '2px solid var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '48px' }}
                onFocus={e => e.target.style.borderColor = 'var(--theme-ring)'}
                onBlur={e => e.target.style.borderColor = 'var(--theme-border)'}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>
                Email <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input id="contact-email" type="email" value={form.email} onChange={handleChange('email')}
                required aria-required="true" autoComplete="email" inputMode="email"
                className="w-full px-4 rounded-xl outline-none text-sm transition"
                style={{ border: '2px solid var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '48px' }}
                onFocus={e => e.target.style.borderColor = 'var(--theme-ring)'}
                onBlur={e => e.target.style.borderColor = 'var(--theme-border)'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>
              Asunto <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input id="contact-subject" value={form.asunto} onChange={handleChange('asunto')}
              required aria-required="true"
              className="w-full px-4 rounded-xl outline-none text-sm transition"
              style={{ border: '2px solid var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '48px' }}
              onFocus={e => e.target.style.borderColor = 'var(--theme-ring)'}
              onBlur={e => e.target.style.borderColor = 'var(--theme-border)'}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--theme-text)' }}>
              Mensaje <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <textarea id="contact-message" value={form.mensaje} onChange={handleChange('mensaje')}
              required aria-required="true" rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm transition resize-none"
              style={{ border: '2px solid var(--theme-border)', backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)', minHeight: '48px' }}
              onFocus={e => e.target.style.borderColor = 'var(--theme-ring)'}
              onBlur={e => e.target.style.borderColor = 'var(--theme-border)'}
            />
          </div>

          <button type="submit" disabled={status === 'sending'}
            className="w-full min-h-[48px] px-6 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-btn-text, #fff)' }}>
            <Send className="w-4 h-4" />
            {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
