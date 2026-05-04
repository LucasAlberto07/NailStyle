import {
  atualizarServico,
  buscarServicoPorId,
  criarServico,
  desativarServico,
  listarServicos,
  listarServicosAdmin,
} from '../services/ServicoService.js';

class ServicoController {
  // Cria um servico com duracao e tempo de preparacao.
  // Requer: Autenticação + Role ADMIN
  async criar(req, res, next) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario;

      const servico = await criarServico(body, usuario);
      return res.status(201).json(servico);
    } catch (error) {
      next(error);
    }
  }

  // Lista servicos ativos para clientes.
  async listar(req, res, next) {
    try {
      const servicos = await listarServicos(true);
      return res.json(servicos);
    } catch (error) {
      next(error);
    }
  }

  // Lista todos os servicos para administracao.
  // Requer: Autenticação + Role ADMIN
  async listarAdmin(req, res, next) {
    try {
      const usuario = req.usuario;

      const servicos = await listarServicosAdmin(usuario);
      return res.json(servicos);
    } catch (error) {
      next(error);
    }
  }

  // Busca um servico ativo pelo id.
  async buscarPorId(req, res, next) {
    try {
      const servico = await buscarServicoPorId(req.params.servicoId);
      return res.json(servico);
    } catch (error) {
      next(error);
    }
  }

  // Atualiza dados do servico.
  // Requer: Autenticação + Role ADMIN
  async atualizar(req, res, next) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario;

      const servico = await atualizarServico(req.params.servicoId, body, usuario);
      return res.json(servico);
    } catch (error) {
      next(error);
    }
  }

  // Desativa um servico.
  // Requer: Autenticação + Role ADMIN
  async desativar(req, res, next) {
    try {
      const usuario = req.usuario;

      const servico = await desativarServico(req.params.servicoId, usuario);
      return res.json(servico);
    } catch (error) {
      next(error);
    }
  }
}

export default new ServicoController();
