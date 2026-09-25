import { Router } from 'express';
import limitePedidos from '../middlewares/limitePedidos.js';
import { verificarMensaje } from '../controllers/mensajeController.js';

const router = Router();

router.post('/verificar', limitePedidos, verificarMensaje);

export default router;
