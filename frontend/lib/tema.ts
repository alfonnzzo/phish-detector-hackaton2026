import { EstadoAviso } from './analisis';

export const colores = {
  fondo: '#000000',
  superficie: '#151515',
  borde: '#2A2A2A',
  texto: '#FFFFFF',
  textoSuave: '#A1A1AA',
  acento: '#FF6B35',
  apagado: '#3F3F46',
  seguro: '#22C55E',
  sospechoso: '#F59E0B',
  peligroso: '#EF4444',
};

export const colorDeAviso: Record<EstadoAviso, string> = {
  peligroso: colores.peligroso,
  sospechoso: colores.sospechoso,
  sin_verificar: colores.sospechoso,
};

export const fondoDeAviso: Record<EstadoAviso, string> = {
  peligroso: '#2A0707',
  sospechoso: '#2A1B03',
  sin_verificar: '#1C1C1C',
};
