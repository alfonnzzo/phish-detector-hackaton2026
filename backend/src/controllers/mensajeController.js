import { Op } from 'sequelize';
import { InstitucionVerificada, CanalOficial } from '../models/associations.js';
import IdentificadorReportado from '../models/IdentificadorReportado.js';
import { analizarLink } from '../helpers/analizarLink.js';
import { evaluarMensaje, extraerIdentificadores } from '../helpers/analizarMensaje.js';

const MAX_TEXTO = 4000;
const MAX_LINKS = 3;

export const verificarMensaje = async (req, res) => {
  try {
    const { texto } = req.body;

    if (typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ error: 'El campo texto es obligatorio' });
    }
    if (texto.length > MAX_TEXTO) {
      return res.status(400).json({ error: 'El texto es demasiado largo' });
    }

    const { urls, identificadores } = extraerIdentificadores(texto);

    const [reportados, instituciones, links] = await Promise.all([
      identificadores.length > 0
        ? IdentificadorReportado.findAll({
          where: { [Op.or]: identificadores.map(({ tipo, valor }) => ({ tipo, valor })) },
        })
        : [],
      InstitucionVerificada.findAll({ include: { model: CanalOficial, as: 'canales' } }),
      Promise.all(urls.slice(0, MAX_LINKS).map((url) => analizarLink(url).catch(() => null))),
    ]);

    return res.status(200).json(
      evaluarMensaje({ texto, reportados, instituciones, links: links.filter(Boolean) })
    );
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar el mensaje' });
  }
};
