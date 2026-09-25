import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { listar, crear, eliminar } from '../controllers/reportadoController.js';

const router = Router();

router.get('/', listar);
router.post('/', auth, crear);
router.delete('/:id', auth, eliminar);

export default router;
