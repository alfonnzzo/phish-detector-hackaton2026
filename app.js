import 'dotenv/config';
import express from 'express';
import { sequelize, connectDB } from './src/config/database.js';
import './src/models/associations.js';
import authRoutes from './src/routes/authRoutes.js';
import institucionRoutes from './src/routes/institucionRoutes.js';
import linkRoutes from './src/routes/linkRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ estado: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/instituciones', institucionRoutes);
app.use('/api/links', linkRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
