import disponibilidadeService from '../services/DisponibilidadeService.js';

class DisponibilidadeController {
  // Cria uma janela para a manicure informada.
  async criarJanela(req, res) {
    try {
      const manicureId = req.usuario?.id ?? req.body.manicureId;

      const janela = await disponibilidadeService.criarJanelaDisponibilidade({
        ...req.body,
        manicureId,
      });
      return res.status(201).json(janela);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista janelas da manicure informada.
  async listarJanelas(req, res) {
    try {
      const { data, ativo } = req.query;
      const manicureId = req.usuario?.id ?? req.query.manicureId;
      const filtros = {};

      if (!manicureId) {
        return res.status(400).json({ erro: 'manicureId é obrigatório' });
      }

      if (data) filtros.data = data;
      if (ativo !== undefined) filtros.ativo = ativo === 'true';

      const janelas = await disponibilidadeService.listarJanelasDisponibilidade(
        manicureId,
        filtros
      );

      return res.json(janelas);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Obtém uma janela com os horários calculados.
  async obterJanela(req, res) {
    try {
      const janela = await disponibilidadeService.obterJanelaComHorarios(
        req.params.janelaId,
        req.usuario?.id ?? req.query.manicureId
      );
      return res.json(janela);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  // Atualiza uma janela e regenera horários quando necessário.
  async atualizarJanela(req, res) {
    try {
      const janela = await disponibilidadeService.atualizarJanela(
        req.params.janelaId,
        req.body,
        req.usuario?.id ?? req.body.manicureId
      );
      return res.json(janela);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Remove uma janela sem reservas ativas.
  async deletarJanela(req, res) {
    try {
      await disponibilidadeService.deletarJanela(
        req.params.janelaId,
        req.usuario?.id ?? req.body.manicureId
      );
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista horários reserváveis para um serviço.
  async listarHorariosPorServico(req, res) {
    try {
      const { servicoId } = req.params;
      const { data } = req.query;

      const horarios = data
        ? await disponibilidadeService.obterHorariosDisponivelsPorServico(servicoId, data)
        : await disponibilidadeService.obterTodosHorariosDisponivelsPorServico(servicoId);

      return res.json(horarios);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Reserva um dos horários oferecidos pelo sistema.
  async reservarHorario(req, res) {
    try {
      const usuarioId = req.usuario?.id ?? req.body.usuarioId;

      const pedido = await disponibilidadeService.reservarHorario(
        req.params.horarioId,
        usuarioId,
        req.body.servicoId
      );

      return res.status(201).json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Cancela uma reserva existente.
  async cancelarReserva(req, res) {
    try {
      const usuario = req.usuario ?? req.body.usuario;
      const pedido = await disponibilidadeService.cancelarReserva(req.params.pedidoId, usuario);
      return res.json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new DisponibilidadeController();
