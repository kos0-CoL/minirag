export function getUserErrorMessage(error: any): string {
  const payload = error?.response?.data ?? error?.message ?? '';

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.error) return payload.error;
    if (payload.message) return payload.message;
  }

  if (typeof payload === 'string') {
    if (!payload.trim()) {
      return 'Error al procesar pregunta. Revisá la consola para ver más detalles.';
    }
    if (payload.includes('ERR_NETWORK') || payload.includes('Network Error')) {
      return 'No se pudo conectar con el backend. Revisá que el servidor esté corriendo y que la URL del API sea correcta.';
    }
    if (payload.includes('401') || payload.includes('Unauthorized')) {
      return 'Tu sesión expiró o no estás autorizado. Volvé a iniciar sesión.';
    }
    return payload;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el backend. Revisá que el servidor esté corriendo y que la URL del API sea correcta.';
  }

  return 'Error al procesar pregunta. Revisá la consola para ver más detalles.';
}
