import { describe, expect, it } from 'vitest';
import { getUserErrorMessage } from '../errorMessages';

describe('getUserErrorMessage', () => {
  it('devuelve el mensaje del backend cuando viene en response.data.error', () => {
    const error = { response: { data: { error: 'Token inválido' } } };
    expect(getUserErrorMessage(error)).toBe('Token inválido');
  });

  it('da una guía útil para errores de conexión', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' };
    expect(getUserErrorMessage(error)).toContain('backend');
  });

  it('mantiene un fallback claro cuando no hay detalle', () => {
    expect(getUserErrorMessage({})).toContain('Error al procesar pregunta');
  });
});
