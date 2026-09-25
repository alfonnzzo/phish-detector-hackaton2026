import { ResultadoVerificacion, verificarLink } from './api';

export type OrigenLink = 'enlace' | 'portapapeles';

export type EstadoAviso = 'peligroso' | 'sospechoso' | 'sin_verificar';

export type Analisis = {
  url: string;
  origen: OrigenLink;
  resultado: ResultadoVerificacion | null;
  error: string | null;
};

export const analizarLink = async (url: string, origen: OrigenLink): Promise<Analisis> => {
  try {
    return { url, origen, resultado: await verificarLink(url), error: null };
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return { url, origen, resultado: null, error: mensaje };
  }
};

export const estadoAviso = (analisis: Analisis): EstadoAviso | null => {
  if (!analisis.resultado) return 'sin_verificar';
  if (analisis.resultado.estado === 'seguro') return null;
  return analisis.resultado.estado;
};
