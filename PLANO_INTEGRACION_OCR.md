# Plan de integración de OCR para MiniRAG

## Objetivo
Permitir que los documentos PDF escaneados o con imágenes puedan ser procesados de forma más robusta, evitando que se queden sin texto legible para indexación y búsqueda.

## Etapas

### Etapa 1 — Detección y diagnóstico de PDFs no legibles (Completada)
Objetivo: detectar cuando el texto extraído de un PDF parece ruido, está vacío o no es útil.

Acciones realizadas:
- Se añadió una función para detectar texto sospechoso o demasiado corto.
- El flujo de extracción ahora marca como candidato a OCR los PDFs que devuelven contenido no legible.
- Se añadió una prueba de regresión para cubrir esta lógica.

Archivos impactados:
- frontend/src/utils/chunkEngine.ts
- frontend/src/__tests__/chunkEngine.test.ts

### Etapa 2 — Preparación del flujo de OCR (En curso)
Objetivo: preparar el motor para ejecutar OCR cuando la extracción tradicional falle.

Acciones previstas:
- Añadir soporte para OCR en el flujo de extracción de PDFs.
- Implementar un fallback que convierta páginas del PDF a imágenes y ejecute OCR.
- Mantener el procesamiento compatible con el navegador.

### Etapa 3 — Integración con la experiencia de usuario
Objetivo: informar al usuario cuándo el documento requiere OCR y mostrar un estado claro del proceso.

Acciones previstas:
- Mostrar mensajes de progreso o fallback al cargar documentos.
- Mantener el flujo de chunks y búsqueda sin romperse.

### Etapa 4 — Validación y mejora continua
Objetivo: comprobar que los PDFs escaneados generan chunks utilizables.

Acciones previstas:
- Probar con PDFs escaneados reales.
- Medir la calidad del texto extraído.
- Ajustar thresholds y limpieza de texto si es necesario.

## Estado actual
- Etapa 1: Completada.
- Etapa 2: Preparación en marcha.
- Etapa 3 y 4: Pendientes de implementación y validación.
