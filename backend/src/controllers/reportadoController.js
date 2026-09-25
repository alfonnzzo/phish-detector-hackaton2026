import IdentificadorReportado, { TIPOS_IDENTIFICADOR } from '../models/IdentificadorReportado.js';
import { normalizarIdentificador } from '../helpers/analizarMensaje.js';

export const listar = async (req, res) => {
  try {
    const { tipo } = req.query;
    const where = TIPOS_IDENTIFICADOR.includes(tipo) ? { tipo } : {};

    const reportados = await IdentificadorReportado.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.status(200).json(reportados);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar reportados' });
  }
};

export const crear = async (req, res) => {
  try {
    const { tipo, valor, motivo } = req.body;

    if (!TIPOS_IDENTIFICADOR.includes(tipo)) {
      return res.status(400).json({ error: `El tipo debe ser uno de: ${TIPOS_IDENTIFICADOR.join(', ')}` });
    }

    const normalizado = normalizarIdentificador(tipo, valor);
    if (!normalizado) {
      return res.status(400).json({ error: 'El valor es obligatorio' });
    }

    const existente = await IdentificadorReportado.findOne({ where: { tipo, valor: normalizado } });
    if (existente) {
      return res.status(409).json({ error: 'El identificador ya esta reportado' });
    }

    const reportado = await IdentificadorReportado.create({
      tipo,
      valor: normalizado,
      motivo: motivo || null,
    });
    return res.status(201).json(reportado);
  } catch (error) {
    return res.status(500).json({ error: 'Error al reportar identificador' });
  }
};

export const eliminar = async (req, res) => {
  try {
    const reportado = await IdentificadorReportado.findByPk(req.params.id);

    if (!reportado) {
      return res.status(404).json({ error: 'Identificador no encontrado' });
    }

    await reportado.destroy();
    return res.status(200).json({ mensaje: 'Identificador eliminado' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar identificador' });
  }
};
