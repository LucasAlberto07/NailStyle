import { Router } from 'express';
import servicoController from '../controllers/ServicoController.js';

const router = Router();

// GET /admin
router.get('/admin', servicoController.listarAdmin.bind(servicoController));

// POST /
router.post('/', servicoController.criar.bind(servicoController));

// GET /
router.get('/', servicoController.listar.bind(servicoController));

// GET /:servicoId
router.get('/:servicoId', servicoController.buscarPorId.bind(servicoController));

// PATCH /:servicoId
router.patch('/:servicoId', servicoController.atualizar.bind(servicoController));

// DELETE /:servicoId
router.delete('/:servicoId', servicoController.desativar.bind(servicoController));

export default router;
