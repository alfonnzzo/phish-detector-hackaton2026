import Usuario from '../models/Usuario.js';
import { hashPassword, comparePassword } from '../helpers/bcrypt.js';
import { generarToken } from '../helpers/jwt.js';

export const registro = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const passwordHasheado = await hashPassword(password);
    const usuario = await Usuario.create({ email, password: passwordHasheado });

    return res.status(201).json({ id: usuario.id, email: usuario.email });
  } catch (error) {
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const passwordValido = await comparePassword(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = generarToken({ id: usuario.id, email: usuario.email });
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Error al iniciar sesion' });
  }
};
