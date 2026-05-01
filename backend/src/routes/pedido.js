import { Router } from 'express';
import pedidoController from '../controllers/PedidoController.js';

const router = Router();

// GET /pedidos/meus
router.get('/meus', pedidoController.listarMeus.bind(pedidoController));

// GET /pedidos/admin
router.get('/admin', pedidoController.listarAdmin.bind(pedidoController));

// GET /pedidos/buscar
router.get('/buscar', pedidoController.buscar.bind(pedidoController));

// GET /pedidos/indicadores
router.get('/indicadores', pedidoController.indicadores.bind(pedidoController));

// PATCH /pedidos/:pedidoId/status
router.patch('/:pedidoId/status', pedidoController.atualizarStatus.bind(pedidoController));

// DELETE /pedidos/:pedidoId
router.delete('/:pedidoId', pedidoController.cancelar.bind(pedidoController));

export default router;
