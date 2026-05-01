import disponibilidadeService from '../services/DisponibilidadeService.js';

class DisponibilidadeController {
  // Cria uma janela para a manicure informada.
  async criarJanela(req, res) {
    try {
      const body = req.body ?? {};
      const manicureId = req.usuario?.id ?? body.manicureId;

      const janela = await disponibilidadeService.criarJanelaDisponibilidade({
        ...body,
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
      const query = req.query ?? {};
      const { data, ativo } = query;
      const manicureId = req.usuario?.id ?? query.manicureId;
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

  // Obtem uma janela com os horarios calculados.
  async obterJanela(req, res) {
    try {
      const query = req.query ?? {};
      const janela = await disponibilidadeService.obterJanelaComHorarios(
        req.params.janelaId,
        req.usuario?.id ?? query.manicureId
      );
      return res.json(janela);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  // Atualiza uma janela e regenera horarios quando necessario.
  async atualizarJanela(req, res) {
    try {
      const body = req.body ?? {};
      const janela = await disponibilidadeService.atualizarJanela(
        req.params.janelaId,
        body,
        req.usuario?.id ?? body.manicureId
      );
      return res.json(janela);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Remove uma janela sem reservas ativas.
  async deletarJanela(req, res) {
    try {
      const body = req.body ?? {};
      await disponibilidadeService.deletarJanela(
        req.params.janelaId,
        req.usuario?.id ?? body.manicureId
      );
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista horarios reservaveis para um servico.
  async listarHorariosPorServico(req, res) {
    try {
      const { servicoId } = req.params;
      const query = req.query ?? {};
      const { data } = query;

      const horarios = data
        ? await disponibilidadeService.obterHorariosDisponivelsPorServico(servicoId, data)
        : await disponibilidadeService.obterTodosHorariosDisponivelsPorServico(servicoId);

      return res.json(horarios);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Reserva um dos horarios oferecidos pelo sistema.
  async reservarHorario(req, res) {
    try {
      const body = req.body ?? {};
      const usuarioId = req.usuario?.id ?? body.usuarioId;

      if (!usuarioId || !body.servicoId) {
        return res.status(400).json({ erro: 'usuarioId e servicoId sao obrigatorios' });
      }

      const pedido = await disponibilidadeService.reservarHorario(
        req.params.horarioId,
        usuarioId,
        body.servicoId
      );

      return res.status(201).json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Cancela uma reserva existente.
  async cancelarReserva(req, res) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario ?? body.usuario;
      const pedido = await disponibilidadeService.cancelarReserva(req.params.pedidoId, usuario);
      return res.json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new DisponibilidadeController();
