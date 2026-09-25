// Links con protocolo, que empiezan con www. o dominios con ruta (ej: bit.ly/abc).
const PATRON_URL = /((?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"']*)/i;

export const extraerUrl = (texto: string): string | null => {
  const coincidencia = texto.match(PATRON_URL);
  return coincidencia ? coincidencia[1].replace(/[).,;:!?]+$/, '') : null;
};

export const conProtocolo = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

// Se parsea a mano porque el URL de React Native no implementa hostname en todas las versiones.
// Descarta usuario@ para que "banco.com@estafa.com" muestre el dominio real (estafa.com).
export const dominio = (url: string) => {
  const coincidencia = url.match(/^(?:[a-z][a-z0-9+.-]*:\/\/)?(?:[^@/?#]*@)?([^:/?#]+)/i);
  return (coincidencia?.[1] ?? url).toLowerCase().replace(/^www\./, '');
};
