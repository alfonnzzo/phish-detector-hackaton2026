import 'dotenv/config';
import express from 'express';
import { sequelize, connectDB } from './src/config/database.js';
import './src/models/associations.js';
import authRoutes from './src/routes/authRoutes.js';
import institucionRoutes from './src/routes/institucionRoutes.js';
import linkRoutes from './src/routes/linkRoutes.js';
import mensajeRoutes from './src/routes/mensajeRoutes.js';
import reportadoRoutes from './src/routes/reportadoRoutes.js';
import { iniciarListas } from './src/helpers/listasAmenazas.js';

const TIEMPO_PASO_MS = 15000;

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ estado: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/instituciones', institucionRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/reportados', reportadoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON valido' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo es demasiado grande' });
  }
  console.error('Error no controlado:', error);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

const paso = async (nombre, tarea) => {
  console.log(`${nombre}...`);
  let temporizador;
  const limite = new Promise((_, reject) => {
    temporizador = setTimeout(
      () => reject(new Error(`${nombre} tardo mas de ${TIEMPO_PASO_MS / 1000} s`)),
      TIEMPO_PASO_MS
    );
  });
  try {
    return await Promise.race([tarea(), limite]);
  } finally {
    clearTimeout(temporizador);
  }
};

const startServer = async () => {
  try {
    await paso(`Conectando a MySQL en ${process.env.DB_HOST}:${process.env.DB_PORT}`, connectDB);
    await paso('Sincronizando tablas', () => sequelize.sync());
    iniciarListas();
    const servidor = app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
    servidor.on('error', (error) => {
      console.error('No se pudo abrir el puerto:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;