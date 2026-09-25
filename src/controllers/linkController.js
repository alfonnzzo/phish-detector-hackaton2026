import { verificarUrls } from '../helpers/googleSafeBrowsing.js';
import { normalizarUrl, resolverUrl } from '../helpers/resolverUrl.js';

const tiposDeAmenaza = (coincidencias) =>
  [...new Set(coincidencias.map((coincidencia) => coincidencia.threatType))];

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

    const cadena = resolverUrl(inicial);
    const amenazasOriginal = tiposDeAmenaza(await verificarUrls([inicial.href]));

    if (amenazasOriginal.length > 0) {
      return res.status(200).json({
        url,
        urlFinal: inicial.href,
        saltos: [inicial.href],
        redireccionCompleta: false,
        estado: 'peligroso',
        amenazas: amenazasOriginal,
      });
    }

    const { saltos, completa, interna } = await cadena;
    const resultado = { url, urlFinal: saltos.at(-1), saltos, redireccionCompleta: completa };

    if (interna) {
      return res.status(200).json({ ...resultado, estado: 'peligroso', amenazas: ['DIRECCION_INTERNA'] });
    }

    const siguientes = saltos.slice(1);
    const amenazas = siguientes.length > 0 ? tiposDeAmenaza(await verificarUrls(siguientes)) : [];

    let estado = 'seguro';
    if (amenazas.length > 0) {
      estado = 'peligroso';
    } else if (!completa) {
      estado = 'sospechoso';
    }

    return res.status(200).json({ ...resultado, estado, amenazas });
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar el link' });
  }
};
