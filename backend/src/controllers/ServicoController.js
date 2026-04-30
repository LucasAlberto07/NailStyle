import {
  atualizarServico,
  buscarServicoPorId,
  criarServico,
  desativarServico,
  listarServicos,
  listarServicosAdmin,
} from '../services/ServicoService.js';

class ServicoController {
  // Cria um serviço com duração e tempo de preparação.
  async criar(req, res) {
    try {
      const servico = await criarServico(req.body, req.usuario ?? req.body.usuario);
      return res.status(201).json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista serviços ativos para clientes.
  async listar(req, res) {
    try {
      const servicos = await listarServicos(true);
      return res.json(servicos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista todos os serviços para administração.
  async listarAdmin(req, res) {
    try {
      const servicos = await listarServicosAdmin(req.usuario ?? req.body.usuario);
      return res.json(servicos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Busca um serviço ativo pelo id.
  async buscarPorId(req, res) {
    try {
      const servico = await buscarServicoPorId(req.params.servicoId);
      return res.json(servico);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  // Atualiza dados do serviço.
  async atualizar(req, res) {
    try {
      const servico = await atualizarServico(req.params.servicoId, req.body, req.usuario ?? req.body.usuario);
      return res.json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Desativa um serviço.
  async desativar(req, res) {
    try {
      const servico = await desativarServico(req.params.servicoId, req.usuario ?? req.body.usuario);
      return res.json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new ServicoController();
