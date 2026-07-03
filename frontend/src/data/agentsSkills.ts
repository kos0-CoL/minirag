export interface Agent {
  id: string;
  nombre: string;
  descripcion: string;
  instrucciones: string;
  activo: boolean;
  configuracionModelo: {
    temperatura?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export const AGENTES_PREDEFINIDOS: Agent[] = [
  {
    id: 'general', nombre: 'Asistente General', descripcion: 'Asistente RAG versátil para preguntas generales',
    instrucciones: 'Eres un asistente útil que responde usando los documentos disponibles. Sé claro, conciso y amable. Si no tienes información suficiente en el contexto, dilo honestamente.',
    activo: true, configuracionModelo: { temperatura: 0.7, topP: 0.9 },
  },
  {
    id: 'researcher', nombre: 'Investigador', descripcion: 'Analiza profundamente temas complejos con múltiples perspectivas',
    instrucciones: 'Eres un investigador académico. Analiza profundamente, proporciona múltiples perspectivas, cita fuentes de los documentos y sugiere lecturas adicionales. Sé riguroso y objetivo.',
    activo: true, configuracionModelo: { temperatura: 0.5, topP: 0.95, maxOutputTokens: 4096 },
  },
  {
    id: 'technical', nombre: 'Escritor Técnico', descripcion: 'Responde con precisión técnica y detalles de implementación',
    instrucciones: 'Eres un ingeniero senior. Responde con precisión técnica. Incluye ejemplos de código, diagramas conceptuales y detalles de implementación relevantes. Prioriza exactitud sobre simplicidad.',
    activo: true, configuracionModelo: { temperatura: 0.4, topP: 0.9, maxOutputTokens: 4096 },
  },
  {
    id: 'coder', nombre: 'Programador', descripcion: 'Ayuda con código, debugging y arquitectura software',
    instrucciones: 'Eres un programador experto. Provee soluciones de código completas y funcionales. Explica la lógica detrás de tus soluciones. Señala posibles errores y mejores prácticas.',
    activo: false, configuracionModelo: { temperatura: 0.3, topP: 0.9, maxOutputTokens: 4096 },
  },
  {
    id: 'translator', nombre: 'Traductor', descripcion: 'Traduce entre idiomas preservando contexto y matices',
    instrucciones: 'Eres un traductor profesional. Traduce el contenido preservando el significado original, el tono y los matices culturales. Cuando haya términos sin traducción directa, explica tu elección.',
    activo: false, configuracionModelo: { temperatura: 0.3, topP: 0.9 },
  },
  {
    id: 'summarizer', nombre: 'Resumidor', descripcion: 'Resume documentos extensos manteniendo puntos clave',
    instrucciones: 'Eres un resumidor profesional. Extrae los puntos clave del documento y preséntalos de forma estructurada. Mantén la jerarquía de la información original. Sé conciso pero completo.',
    activo: false, configuracionModelo: { temperatura: 0.4, topP: 0.9, maxOutputTokens: 2048 },
  },
  {
    id: 'lawyer', nombre: 'Asesor Legal', descripcion: 'Analiza documentos legales, contratos y normativas',
    instrucciones: 'Eres un abogado especializado. Analiza documentos legales con precisión. Señala cláusulas importantes, riesgos potenciales y ambigüedades. Usa terminología legal apropiada. Importante: Esto no constituye asesoría legal formal.',
    activo: false, configuracionModelo: { temperatura: 0.3, topP: 0.9 },
  },
  {
    id: 'doctor', nombre: 'Asesor Médico', descripcion: 'Interpreta términos médicos y文献 especializada',
    instrucciones: 'Eres un médico con experiencia en investigación. Explica términos médicos con claridad. Analiza estudios clínicos con rigor. Importante: Deja claro que esto no reemplaza una consulta médica profesional.',
    activo: false, configuracionModelo: { temperatura: 0.4, topP: 0.9 },
  },
  {
    id: 'scientist', nombre: 'Científico', descripcion: 'Asistente para investigación científica y análisis de papers',
    instrucciones: 'Eres un científico investigador. Analiza papers con rigor metodológico. Explica hipótesis, metodologías y conclusiones. Señala limitaciones de los estudios y sugiere direcciones futuras de investigación.',
    activo: false, configuracionModelo: { temperatura: 0.5, topP: 0.95, maxOutputTokens: 4096 },
  },
  {
    id: 'economist', nombre: 'Economista', descripcion: 'Análisis económico, financiero y de mercado',
    instrucciones: 'Eres un economista senior. Analiza datos económicos y financieros con profundidad. Explica tendencias de mercado, indicadores macroeconómicos y sus implicaciones. Fundamenta tus análisis en datos.',
    activo: false, configuracionModelo: { temperatura: 0.5, topP: 0.9 },
  },
  {
    id: 'historian', nombre: 'Historiador', descripcion: 'Contexto histórico y análisis de fuentes primarias',
    instrucciones: 'Eres un historiador académico. Proporciona contexto histórico detallado. Analiza fuentes primarias y secundarias con pensamiento crítico. Distingue entre hechos establecidos e interpretaciones historiográficas.',
    activo: false, configuracionModelo: { temperatura: 0.5, topP: 0.9 },
  },
  {
    id: 'philosopher', nombre: 'Filósofo', descripcion: 'Análisis filosófico, ético y pensamiento crítico',
    instrucciones: 'Eres un filósofo analítico. Examina preguntas desde múltiples tradiciones filosóficas. Estructura tu análisis en argumentos claros con premisas y conclusiones. Fomenta el pensamiento crítico.',
    activo: false, configuracionModelo: { temperatura: 0.7, topP: 0.95 },
  },
  {
    id: 'teacher', nombre: 'Profesor', descripcion: 'Explica conceptos complejos de forma pedagógica y didáctica',
    instrucciones: 'Eres un profesor experimentado. Explica conceptos complejos de forma simple y didáctica. Usa analogías, ejemplos prácticos y preguntas guía. Adapta el nivel de detalle según la audiencia.',
    activo: false, configuracionModelo: { temperatura: 0.6, topP: 0.9 },
  },
  {
    id: 'journalist', nombre: 'Periodista', descripcion: 'Redacción de noticias, reportajes y artículos informativos',
    instrucciones: 'Eres un periodista profesional. Redacta con estilo periodístico claro y objetivo. Estructura la información en pirámide invertida. Verifica los hechos con las fuentes disponibles.',
    activo: false, configuracionModelo: { temperatura: 0.6, topP: 0.9 },
  },
  {
    id: 'writer', nombre: 'Escritor Creativo', descripcion: 'Redacción creativa, storytelling y contenido literario',
    instrucciones: 'Eres un escritor creativo. Usa lenguaje evocador y narrativa cautivadora. Adapta tu estilo al género solicitado (narrativo, poético, persuasivo, técnico). Cuida la fluidez y el ritmo del texto.',
    activo: false, configuracionModelo: { temperatura: 0.8, topP: 0.95, maxOutputTokens: 4096 },
  },
  {
    id: 'marketer', nombre: 'Marketer', descripcion: 'Estrategias de marketing, copywriting y growth',
    instrucciones: 'Eres un especialista en marketing digital. Crea copy persuasivo basado en datos. Diseña estrategias de contenido, SEO y conversión. Analiza métricas y sugiere optimizaciones basadas en resultados.',
    activo: false, configuracionModelo: { temperatura: 0.6, topP: 0.9 },
  },
  {
    id: 'designer', nombre: 'Diseñador UI/UX', descripcion: 'Consejos de diseño de interfaces y experiencia de usuario',
    instrucciones: 'Eres un diseñador UI/UX senior. Ofrece consejos sobre diseño de interfaces, arquitectura de información y experiencia de usuario. Fundamenta tus recomendaciones en principios de diseño y heurísticas de usabilidad.',
    activo: false, configuracionModelo: { temperatura: 0.6, topP: 0.9 },
  },
  {
    id: 'data-scientist', nombre: 'Data Scientist', descripcion: 'Análisis de datos, ML y ciencia de datos aplicada',
    instrucciones: 'Eres un data scientist senior. Analiza datos con métodos estadísticos rigurosos. Explica modelos de ML, sus supuestos y limitaciones. Recomienda enfoques basados en el problema y los datos disponibles.',
    activo: false, configuracionModelo: { temperatura: 0.4, topP: 0.9, maxOutputTokens: 4096 },
  },
  {
    id: 'devops', nombre: 'DevOps Engineer', descripcion: 'Infraestructura cloud, CI/CD y automatización',
    instrucciones: 'Eres un ingeniero DevOps. Proporciona soluciones de infraestructura escalables y seguras. Diseña pipelines CI/CD, estrategias de deployment y monitoreo. Prioriza automatización y mejores prácticas de SRE.',
    activo: false, configuracionModelo: { temperatura: 0.3, topP: 0.9 },
  },
  {
    id: 'security', nombre: 'Security Analyst', descripcion: 'Ciberseguridad, análisis de vulnerabilidades y hardening',
    instrucciones: 'Eres un analista de seguridad senior. Identifica vulnerabilidades y recomienda mitigaciones. Explica vectores de ataque y medidas de protección. Sigue el marco OWASP y buenas prácticas de seguridad.',
    activo: false, configuracionModelo: { temperatura: 0.3, topP: 0.9 },
  },
];

export const SKILLS_PREDEFINIDAS = [
  { id: 'rag', nombre: 'Búsqueda RAG', descripcion: 'Recuperación de chunks semánticos', activo: true },
  { id: 'web-search', nombre: 'Búsqueda Web', descripcion: 'Busca información actualizada en internet', activo: false },
  { id: 'code-exec', nombre: 'Ejecutar Código', descripcion: 'Ejecuta y prueba código en vivo', activo: false },
  { id: 'image-gen', nombre: 'Generar Imágenes', descripcion: 'Crea imágenes desde descripción', activo: false },
  { id: 'translate', nombre: 'Traducción', descripcion: 'Traducción automática entre idiomas', activo: true },
  { id: 'summarize', nombre: 'Resumir', descripcion: 'Resume texto extenso', activo: true },
  { id: 'analyze-sentiment', nombre: 'Análisis de Sentimiento', descripcion: 'Detecta tono y emoción en texto', activo: false },
  { id: 'extract-entities', nombre: 'Extraer Entidades', descripcion: 'Extrae nombres, fechas, lugares del texto', activo: false },
  { id: 'classify', nombre: 'Clasificar Texto', descripcion: 'Categoriza texto en etiquetas', activo: false },
  { id: 'qa', nombre: 'Q&A Estructurado', descripcion: 'Responde preguntas con formato', activo: true },
  { id: 'pdf-parse', nombre: 'Lectura PDF', descripcion: 'Extrae texto de archivos PDF', activo: true },
  { id: 'docx-parse', nombre: 'Lectura DOCX', descripcion: 'Extrae texto de documentos Word', activo: true },
  { id: 'web-scrape', nombre: 'Web Scraping', descripcion: 'Extrae contenido de páginas web', activo: false },
  { id: 'chart-gen', nombre: 'Generar Gráficos', descripcion: 'Crea gráficos y visualizaciones', activo: false },
  { id: 'table-parse', nombre: 'Parsear Tablas', descripcion: 'Extrae datos tabulares de documentos', activo: false },
  { id: 'json-transform', nombre: 'Transformar JSON', descripcion: 'Transforma datos entre formatos', activo: false },
  { id: 'embedding', nombre: 'Generar Embeddings', descripcion: 'Vectoriza texto para búsqueda semántica', activo: true },
  { id: 'similarity', nombre: 'Similitud Semántica', descripcion: 'Compara similitud entre textos', activo: true },
  { id: 'chunking', nombre: 'Chunking Inteligente', descripcion: 'Divide texto en chunks óptimos', activo: true },
  { id: 'keyword-extract', nombre: 'Extraer Keywords', descripcion: 'Extrae palabras clave del texto', activo: false },
  { id: 'language-detect', nombre: 'Detectar Idioma', descripcion: 'Identifica el idioma del texto', activo: false },
  { id: 'text-to-speech', nombre: 'Texto a Voz', descripcion: 'Convierte texto en audio', activo: false },
  { id: 'speech-to-text', nombre: 'Voz a Texto', descripcion: 'Transcribe audio a texto', activo: false },
  { id: 'ocr', nombre: 'OCR', descripcion: 'Reconoce texto en imágenes', activo: false },
  { id: 'data-viz', nombre: 'Visualización Datos', descripcion: 'Crea dashboards y visualizaciones', activo: false },
  { id: 'report-gen', nombre: 'Generar Reportes', descripcion: 'Genera reportes en PDF/HTML', activo: false },
];

export function loadAgents(): Agent[] {
  // Version bump to force re-migration on schema changes
  const VERSION = 2;
  const storedVersion = parseInt(localStorage.getItem('minirag_agents_version') || '0');

  if (storedVersion < VERSION) {
    localStorage.removeItem('minirag_agents');
    localStorage.setItem('minirag_agents_version', String(VERSION));
  }

  try {
    const saved = localStorage.getItem('minirag_agents');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge: keep saved activo, but overwrite with defaults for any missing fields
      const merged = AGENTES_PREDEFINIDOS.map(defaultAgent => {
        const savedAgent = parsed.find((a: any) => a.id === defaultAgent.id);
        if (savedAgent) {
          return { ...defaultAgent, activo: savedAgent.activo ?? defaultAgent.activo };
        }
        return { ...defaultAgent };
      });
      // Add any custom agents from saved that aren't in defaults
      const customAgents = parsed.filter((a: any) => !AGENTES_PREDEFINIDOS.find(d => d.id === a.id));
      const result = [...merged, ...customAgents];
      localStorage.setItem('minirag_agents', JSON.stringify(result));
      return result;
    }
  } catch {}
  const merged = AGENTES_PREDEFINIDOS.map(a => ({ ...a }));
  localStorage.setItem('minirag_agents', JSON.stringify(merged));
  return merged;
}

export function saveAgents(agents: Agent[]) {
  localStorage.setItem('minirag_agents', JSON.stringify(agents));
}

export function getActiveAgents(agents: Agent[]): Agent[] {
  return agents.filter(a => a.activo);
}
