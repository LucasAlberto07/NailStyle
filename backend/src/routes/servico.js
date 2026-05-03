import { Router } from 'express';
import servicoController from '../controllers/ServicoController.js';
import { authMiddleware, authMiddlewareOpcional } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authorizationMiddleware.js';

const router = Router();

// GET /servicos/admin - Lista todos os serviços (ADMIN)
router.get('/admin', authMiddleware, requireRole('ADMIN'), servicoController.listarAdmin.bind(servicoController));

// POST /servicos - Cria novo serviço (ADMIN)
router.post('/', authMiddleware, requireRole('ADMIN'), servicoController.criar.bind(servicoController));

// GET /servicos - Lista serviços ativos (público)
router.get('/', authMiddlewareOpcional, servicoController.listar.bind(servicoController));

// GET /servicos/:servicoId - Busca serviço por ID (público)
router.get('/:servicoId', authMiddlewareOpcional, servicoController.buscarPorId.bind(servicoController));

// PATCH /servicos/:servicoId - Atualiza serviço (ADMIN)
router.patch('/:servicoId', authMiddleware, requireRole('ADMIN'), servicoController.atualizar.bind(servicoController));

// DELETE /servicos/:servicoId - Desativa serviço (ADMIN)
router.delete('/:servicoId', authMiddleware, requireRole('ADMIN'), servicoController.desativar.bind(servicoController));

export default router;
