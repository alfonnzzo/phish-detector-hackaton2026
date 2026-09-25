import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
} from '../controllers/institucionController.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obtenerPorId);
router.post('/', auth, crear);
router.put('/:id', auth, actualizar);
router.delete('/:id', auth, eliminar);

export default router;
