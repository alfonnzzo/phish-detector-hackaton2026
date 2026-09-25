import { analizarLink } from '../helpers/analizarLink.js';

export const verificarLink = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'El campo url es obligatorio' });
    }

    const resultado = await analizarLink(url);
    if (!resultado) {
      return res.status(400).json({ error: 'La url no es valida' });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar el link' });
  }
};
