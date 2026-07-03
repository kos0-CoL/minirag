import { useRef } from 'react';
import clsx from 'clsx';
import { Download, BookmarkPlus, FileText } from 'lucide-react';
import { addDocumentFromText } from '@/utils/chunkEngine';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/** Convert structured JSON response to HTML */
function jsonToHtml(data: any): string {
  const parts: string[] = [];
  if (data.titulo) parts.push(`<h3>${data.titulo}</h3>`);
  if (data.resumen) parts.push(`<p>${data.resumen}</p>`);
  if (data.puntosClave?.length > 0) {
    parts.push('<h4>Puntos Clave</h4><ul>');
    for (const p of data.puntosClave) parts.push(`<li>${p}</li>`);
    parts.push('</ul>');
  }
  if (data.detalles) parts.push(`<h4>Detalles</h4><p>${data.detalles}</p>`);
  if (data.fuentes?.length > 0) {
    parts.push('<ul>');
    for (const f of data.fuentes) parts.push(`<li><span class="source">(Fuente: ${f})</span></li>`);
    parts.push('</ul>');
  }
  return parts.join('\n');
}

/** Normalize AI response: JSON → HTML, Markdown → HTML, text → <p> */
function renderResponse(text: string): string {
  if (!text) return '';
  const s = text.trim();

  // 1. Try JSON: extract { } block from anywhere in text
  let json: any = null;
  const braceStart = s.indexOf('{');
  const braceEnd = s.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    const raw = s.slice(braceStart, braceEnd + 1);
    if (raw.includes('"titulo"') || raw.includes('"resumen"') || raw.includes('"puntosClave"')) {
      try { json = JSON.parse(raw); } catch {}
    }
  }
  if (json?.titulo !== undefined || json?.puntosClave !== undefined || json?.resumen) {
    // If resumen is the fallback message, render as simple text
    if (json.titulo === '' && json.puntosClave?.length === 0) {
      return `<p>${json.resumen || 'No hay información disponible.'}</p>`;
    }
    return jsonToHtml(json);
  }

  // 2. HTML detected — has block-level tags
  if (/<(h[1-6]|p|ul|ol|li|blockquote|div|table)/i.test(s)) return s;
  // 3. Markdown detected — headings, bold, lists
  if (/^#{1,6}\s/m.test(s) || /\*\*|__|\[.+\]\(.+\)|^[-*+]\s/m.test(s)) {
    return marked.parse(s, { async: false }) as string;
  }
  // 4. plain text — wrap in <p>, preserve double line breaks as paragraph breaks
  return s.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
}

interface Props {
  message: any;
  onIndexed?: () => void;
}

export default function MessageBubble({ message, onIndexed }: Props) {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    const doc = new jsPDF('p', 'pt', 'a4');
    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const M = 40;

    const hexRgb = (hex: string) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
    };

    // header
    const root = getComputedStyle(document.documentElement);
    const prim = hexRgb(root.getPropertyValue('--theme-primary').trim() || '#2563eb');
    const sec = hexRgb(root.getPropertyValue('--theme-text-secondary').trim() || '#666');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(prim[0], prim[1], prim[2]);
    doc.text('Mini RAG Pro — Respuesta', M, M);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(sec[0], sec[1], sec[2]);
    doc.text(`Generado: ${new Date().toLocaleString()}`, M, M + 16);
    if (message.documentosUtilizados?.length > 0) {
      doc.text(`Fuentes: ${message.documentosUtilizados.join(', ')}`, M, M + 30);
    }
    doc.setDrawColor(210, 210, 210);
    doc.line(M, M + 40, PAGE_W - M, M + 40);

    // capture content via html2canvas
    const el = contentRef.current;
    if (!el) return;
    const origMaxW = el.style.maxWidth;
    el.style.maxWidth = '100%';
    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff',
      width: el.scrollWidth, height: el.scrollHeight,
    });
    el.style.maxWidth = origMaxW;

    const imgData = canvas.toDataURL('image/png');
    const contentY = M + 48;
    const availW = PAGE_W - M * 2;
    const availH = PAGE_H - contentY - M;
    const scale = availW / canvas.width;
    const imgW = canvas.width * scale;
    const imgH = canvas.height * scale;

    if (imgH <= availH) {
      doc.addImage(imgData, 'PNG', M, contentY, imgW, imgH);
    } else {
      const pagePx = availH / scale;
      let srcY = 0;
      let pageNum = 0;
      while (srcY < canvas.height) {
        if (pageNum > 0) doc.addPage();
        const h = Math.min(pagePx, canvas.height - srcY);
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = h;
        const ctx = tmp.getContext('2d');
        if (ctx) ctx.drawImage(canvas, 0, srcY, canvas.width, h, 0, 0, canvas.width, h);
        const chunk = tmp.toDataURL('image/png');
        const renderH = (h / canvas.height) * imgH;
        doc.addImage(chunk, 'PNG', M, contentY, imgW, renderH);
        srcY += h;
        pageNum++;
      }
    }
    doc.save(`minirag-respuesta-${Date.now()}.pdf`);
  };

  const indexAsSource = () => {
    const htmlContent = renderResponse(message.contenido || '');
    const cleanText = htmlContent.replace(/<[^>]+>/g, '') || '';
    addDocumentFromText(cleanText, `Respuesta-${Date.now()}`, {
      tema: 'Respuesta generada',
      autor: 'Sistema'
    });
    onIndexed?.();
  };

  return (
    <div className={clsx('flex items-start gap-3', isUser ? 'flex-row-reverse' : '')}>
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
        isUser ? 'theme-accent-light' : 'theme-border'
      )}
        style={{ color: isUser ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={clsx('max-w-[80%] rounded-2xl px-4 py-2.5', isUser ? 'rounded-tr-sm' : 'rounded-tl-sm')}
        style={{
          backgroundColor: isUser ? 'var(--theme-primary)' : 'var(--theme-bg-chat)',
          color: isUser ? '#fff' : 'var(--theme-text)',
        }}
      >
        <div
          ref={isUser ? undefined : contentRef}
          className={clsx('text-sm leading-relaxed', isUser ? '' : 'markdown-content')}
          dangerouslySetInnerHTML={isUser ? undefined : { __html: DOMPurify.sanitize(renderResponse(message.contenido || '')) }}
        >
          {isUser ? message.contenido : null}
        </div>

        {message.desdeCache && (
          <span className="text-[10px] text-yellow-500 mt-1 block">🔄 Desde caché</span>
        )}

        {message.rechazado && (
          <span className="text-[10px] text-orange-500 mt-1 block">⚠️ Sin información relevante en los documentos</span>
        )}

        {message.documentosUtilizados?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.documentosUtilizados.map((docId: string) => (
              <span key={docId} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-accent-light)', color: 'var(--theme-text-secondary)' }}>
                <FileText className="w-3 h-3 inline mr-0.5" />
                {docId.slice(0, 10)}
              </span>
            ))}
          </div>
        )}

        {!isUser && !message.rechazado && (
          <div className="mt-2 flex gap-1 pt-1.5" style={{ borderTop: '1px solid var(--theme-border)' }}>
            <button onClick={downloadPDF}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded theme-hover transition"
              style={{ color: 'var(--theme-text-secondary)' }}>
              <Download className="w-3 h-3" /> PDF
            </button>
            <button onClick={indexAsSource}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded theme-hover transition"
              style={{ color: 'var(--theme-text-secondary)' }}>
              <BookmarkPlus className="w-3 h-3" /> Indexar
            </button>
          </div>
        )}

        <span className="text-[10px] mt-1 block" style={{ opacity: 0.6, color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--theme-text-secondary)' }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
