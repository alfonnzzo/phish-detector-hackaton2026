import { Router } from 'express';
import limitePedidos from '../middlewares/limitePedidos.js';
import { verificarLink } from '../controllers/linkController.js';

const router = Router();

router.post('/verificar', limitePedidos, verificarLink);

export default router;
