import { Router } from 'express';
import disponibilidadeController from '../controllers/DisponibilidadeController.js';

const router = Router();

// POST /disponibilidades/janelas
router.post('/janelas', disponibilidadeController.criarJanela.bind(disponibilidadeController));

// GET /disponibilidades/janelas
router.get('/janelas', disponibilidadeController.listarJanelas.bind(disponibilidadeController));

// GET /disponibilidades/janelas/:janelaId
router.get('/janelas/:janelaId', disponibilidadeController.obterJanela.bind(disponibilidadeController));

// PATCH /disponibilidades/janelas/:janelaId
router.patch('/janelas/:janelaId', disponibilidadeController.atualizarJanela.bind(disponibilidadeController));

// DELETE /disponibilidades/janelas/:janelaId
router.delete('/janelas/:janelaId', disponibilidadeController.deletarJanela.bind(disponibilidadeController));

// GET /disponibilidades/servicos/:servicoId/horarios
router.get('/servicos/:servicoId/horarios', disponibilidadeController.listarHorariosPorServico.bind(disponibilidadeController));

// POST /disponibilidades/horarios/:horarioId/reservar
router.post('/horarios/:horarioId/reservar', disponibilidadeController.reservarHorario.bind(disponibilidadeController));

// DELETE /disponibilidades/reservas/:pedidoId
router.delete('/reservas/:pedidoId', disponibilidadeController.cancelarReserva.bind(disponibilidadeController));

export default router;
