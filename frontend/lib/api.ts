import { API_URL } from './config';

const TIEMPO_MAXIMO_MS = 15000;

export type EstadoLink = 'seguro' | 'sospechoso' | 'peligroso';

export type ResultadoVerificacion = {
  url: string;
  urlFinal: string;
  saltos: string[];
  redireccionCompleta: boolean;
  estado: EstadoLink;
  amenazas: string[];
  fuentes: string[];
};

export type TipoCanal = 'telefono' | 'sitio_web' | 'red_social' | 'cbu_cvu_alias';

export type Canal = {
  id: number;
  tipo: TipoCanal;
  valor: string;
  institucionId: number;
};

export type Institucion = {
  id: number;
  nombre: string;
  createdAt: string;
  canales: Canal[];
};

export type CanalNuevo = Pick<Canal, 'tipo' | 'valor'>;

export class ErrorApi extends Error {
  status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
  }
}

type Opciones = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function pedir<T>(ruta: string, { method = 'GET', body, token }: Opciones = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controlador.signal,
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor', 0);
  } finally {
    clearTimeout(temporizador);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.error ?? `El servidor respondio con estado ${respuesta.status}`,
      respuesta.status
    );
  }
  return datos as T;
}

export const estadoServidor = () => pedir<{ estado: string }>('/health');

export const verificarLink = (url: string) =>
  pedir<ResultadoVerificacion>('/links/verificar', { method: 'POST', body: { url } });

// Pendientes de pantalla: login/registro y ABM de instituciones.

export const registrar = (email: string, password: string) =>
  pedir<{ id: number; email: string }>('/auth/registro', {
    method: 'POST',
    body: { email, password },
  });

export const iniciarSesion = (email: string, password: string) =>
  pedir<{ token: string }>('/auth/login', { method: 'POST', body: { email, password } });

export const buscarInstituciones = (nombre = '') =>
  pedir<Institucion[]>(`/instituciones${nombre ? `?nombre=${encodeURIComponent(nombre)}` : ''}`);

export const obtenerInstitucion = (id: number) => pedir<Institucion>(`/instituciones/${id}`);

export const crearInstitucion = (
  token: string,
  datos: { nombre: string; canales?: CanalNuevo[] }
) => pedir<Institucion>('/instituciones', { method: 'POST', body: datos, token });

export const actualizarInstitucion = (
  token: string,
  id: number,
  datos: { nombre?: string; canales?: CanalNuevo[] }
) => pedir<Institucion>(`/instituciones/${id}`, { method: 'PUT', body: datos, token });

export const eliminarInstitucion = (token: string, id: number) =>
  pedir<{ mensaje: string }>(`/instituciones/${id}`, { method: 'DELETE', token });
