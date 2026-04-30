import { Router } from 'express';
import disponibilidadeController from '../controllers/DisponibilidadeController.js';

const router = Router();

// POST /janelas
router.post('/janelas', disponibilidadeController.criarJanela.bind(disponibilidadeController));

// GET /janelas
router.get('/janelas', disponibilidadeController.listarJanelas.bind(disponibilidadeController));

// GET /janelas/:janelaId
router.get('/janelas/:janelaId', disponibilidadeController.obterJanela.bind(disponibilidadeController));

// PATCH /janelas/:janelaId
router.patch('/janelas/:janelaId', disponibilidadeController.atualizarJanela.bind(disponibilidadeController));

// DELETE /janelas/:janelaId
router.delete('/janelas/:janelaId', disponibilidadeController.deletarJanela.bind(disponibilidadeController));

// GET /servicos/:servicoId/horarios
router.get('/servicos/:servicoId/horarios', disponibilidadeController.listarHorariosPorServico.bind(disponibilidadeController));

// POST /horarios/:horarioId/reservar
router.post('/horarios/:horarioId/reservar', disponibilidadeController.reservarHorario.bind(disponibilidadeController));

// DELETE /reservas/:pedidoId
router.delete('/reservas/:pedidoId', disponibilidadeController.cancelarReserva.bind(disponibilidadeController));

export default router;
