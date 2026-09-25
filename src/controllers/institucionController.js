import { Op } from 'sequelize';
import { InstitucionVerificada, CanalOficial } from '../models/associations.js';

export const listar = async (req, res) => {
  try {
    const { nombre } = req.query;
    const where = nombre ? { nombre: { [Op.like]: `%${nombre}%` } } : {};

    const instituciones = await InstitucionVerificada.findAll({
      where,
      include: { model: CanalOficial, as: 'canales' },
    });

    return res.status(200).json(instituciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar instituciones' });
  }
};

export const obtenerPorId = async (req, res) => {
  try {
    const institucion = await InstitucionVerificada.findByPk(req.params.id, {
      include: { model: CanalOficial, as: 'canales' },
    });

    if (!institucion) {
      return res.status(404).json({ error: 'Institucion no encontrada' });
    }

    return res.status(200).json(institucion);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener institucion' });
  }
};

export const crear = async (req, res) => {
  try {
    const { nombre, canales } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const institucion = await InstitucionVerificada.create({ nombre });

    if (Array.isArray(canales) && canales.length > 0) {
      await CanalOficial.bulkCreate(
        canales.map((canal) => ({
          tipo: canal.tipo,
          valor: canal.valor,
          institucionId: institucion.id,
        }))
      );
    }

    const institucionCreada = await InstitucionVerificada.findByPk(institucion.id, {
      include: { model: CanalOficial, as: 'canales' },
    });

    return res.status(201).json(institucionCreada);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear institucion' });
  }
};

export const actualizar = async (req, res) => {
  try {
    const institucion = await InstitucionVerificada.findByPk(req.params.id);

    if (!institucion) {
      return res.status(404).json({ error: 'Institucion no encontrada' });
    }

    const { nombre, canales } = req.body;

    if (nombre) {
      institucion.nombre = nombre;
      await institucion.save();
    }

    if (Array.isArray(canales)) {
      await CanalOficial.destroy({ where: { institucionId: institucion.id } });
      if (canales.length > 0) {
        await CanalOficial.bulkCreate(
          canales.map((canal) => ({
            tipo: canal.tipo,
            valor: canal.valor,
            institucionId: institucion.id,
          }))
        );
      }
    }

    const institucionActualizada = await InstitucionVerificada.findByPk(institucion.id, {
      include: { model: CanalOficial, as: 'canales' },
    });

    return res.status(200).json(institucionActualizada);
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar institucion' });
  }
};

export const eliminar = async (req, res) => {
  try {
    const institucion = await InstitucionVerificada.findByPk(req.params.id);

    if (!institucion) {
      return res.status(404).json({ error: 'Institucion no encontrada' });
    }

    await institucion.destroy();
    return res.status(200).json({ mensaje: 'Institucion eliminada' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar institucion' });
  }
};
