import { Router } from 'express';
import servicoController from '../controllers/ServicoController.js';

const router = Router();

// GET /servicos/admin
router.get('/admin', servicoController.listarAdmin.bind(servicoController));

// POST /servicos
router.post('/', servicoController.criar.bind(servicoController));

// GET /servicos
router.get('/', servicoController.listar.bind(servicoController));

// GET /servicos/:servicoId
router.get('/:servicoId', servicoController.buscarPorId.bind(servicoController));

// PATCH /servicos/:servicoId
router.patch('/:servicoId', servicoController.atualizar.bind(servicoController));

// DELETE /servicos/:servicoId
router.delete('/:servicoId', servicoController.desativar.bind(servicoController));

export default router;
