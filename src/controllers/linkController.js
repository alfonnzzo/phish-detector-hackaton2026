import { verificarUrls } from '../helpers/googleSafeBrowsing.js';
import { buscarEnListas } from '../helpers/listasAmenazas.js';
import { normalizarUrl, resolverUrl } from '../helpers/resolverUrl.js';

const unicos = (valores) => [...new Set(valores)];

const consultarGoogle = async (urls) => {
  try {
    const coincidencias = await verificarUrls(urls);
    return coincidencias.map((coincidencia) => ({ fuente: 'GOOGLE_SAFE_BROWSING', amenaza: coincidencia.threatType }));
  } catch (error) {
    console.error('Google Safe Browsing no respondio:', error.message);
    return null;
  }
};

const resumir = (coincidencias) => ({
  amenazas: unicos(coincidencias.map((coincidencia) => coincidencia.amenaza)),
  fuentes: unicos(coincidencias.map((coincidencia) => coincidencia.fuente)),
});

export const verificarLink = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'El campo url es obligatorio' });
    }

    const inicial = normalizarUrl(url);
    if (!inicial) {
      return res.status(400).json({ error: 'La url no es valida' });
    }

    const peligrosaDirecta = (coincidencias) =>
      res.status(200).json({
        url,
        urlFinal: inicial.href,
        saltos: [inicial.href],
        redireccionCompleta: false,
        estado: 'peligroso',
        ...resumir(coincidencias),
      });

    const enListas = buscarEnListas([inicial.href]);
    if (enListas.length > 0) {
      return peligrosaDirecta(enListas);
    }

    const cadena = resolverUrl(inicial);
    const enGoogle = await consultarGoogle([inicial.href]);
    if (enGoogle?.length > 0) {
      return peligrosaDirecta(enGoogle);
    }

    const { saltos, completa, interna } = await cadena;
    const resultado = { url, urlFinal: saltos.at(-1), saltos, redireccionCompleta: completa };

    if (interna) {
      return res.status(200).json({ ...resultado, estado: 'peligroso', amenazas: ['DIRECCION_INTERNA'], fuentes: [] });
    }

    const siguientes = saltos.slice(1);
    const enGoogleSiguientes = siguientes.length > 0 ? await consultarGoogle(siguientes) : [];
    const coincidencias = [...buscarEnListas(siguientes), ...(enGoogleSiguientes || [])];
    const googleFallo = enGoogle === null || enGoogleSiguientes === null;

    let estado = 'seguro';
    if (coincidencias.length > 0) {
      estado = 'peligroso';
    } else if (!completa || googleFallo) {
      estado = 'sospechoso';
    }

    return res.status(200).json({ ...resultado, estado, ...resumir(coincidencias) });
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar el link' });
  }
};
