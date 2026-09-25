import 'dotenv/config';
import jwt from 'jsonwebtoken';

export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
