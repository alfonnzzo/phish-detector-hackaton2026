const INTERVALO_MS = 3600000;
const TIEMPO_DESCARGA_MS = 180000;
const REINTENTO_MS = 120000;

const FUENTES = [
  { fuente: 'OPENPHISH', amenaza: 'SOCIAL_ENGINEERING', url: 'https://openphish.com/feed.txt' },
  { fuente: 'URLHAUS', amenaza: 'MALWARE', url: 'https://urlhaus.abuse.ch/downloads/text_online/' },
];

const listas = new Map();

const normalizar = (texto, conConsulta = true) => {
  try {
    const url = new URL(texto.trim());
    url.hash = '';
    if (!conConsulta) url.search = '';
    return url.href;
  } catch {
    return null;
  }
};

export const cargarLista = (fuente, texto) => {
  const urls = new Set(texto.split('\n').map((linea) => normalizar(linea)).filter(Boolean));
  listas.set(fuente, urls);
  return urls.size;
};

export const buscarEnListas = (urls) =>
  FUENTES.filter(({ fuente }) => {
    const lista = listas.get(fuente);
    return lista && urls.some((url) => lista.has(normalizar(url)) || lista.has(normalizar(url, false)));
  }).map(({ fuente, amenaza }) => ({ fuente, amenaza }));

const descargar = async ({ fuente, url }) => {
  try {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(TIEMPO_DESCARGA_MS) });
    if (!respuesta.ok) {
      throw new Error(`respondio con estado ${respuesta.status}`);
    }
    const cantidad = cargarLista(fuente, await respuesta.text());
    console.log(`Lista ${fuente} cargada: ${cantidad} urls`);
  } catch (error) {
    console.error(`No se pudo actualizar la lista ${fuente}, reintento en 2 minutos:`, error.message);
    setTimeout(() => descargar({ fuente, url }), REINTENTO_MS).unref();
  }
};

export const iniciarListas = () => {
  const actualizar = () => FUENTES.forEach(descargar);
  actualizar();
  setInterval(actualizar, INTERVALO_MS).unref();
};
