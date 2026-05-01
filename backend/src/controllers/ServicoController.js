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
  async criar(req, res) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: 'Autenticacao obrigatoria' });
      }

      const servico = await criarServico(body, usuario);
      return res.status(201).json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista servicos ativos para clientes.
  async listar(req, res) {
    try {
      const servicos = await listarServicos(true);
      return res.json(servicos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista todos os servicos para administracao.
  async listarAdmin(req, res) {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: 'Autenticacao obrigatoria' });
      }

      const servicos = await listarServicosAdmin(usuario);
      return res.json(servicos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Busca um servico ativo pelo id.
  async buscarPorId(req, res) {
    try {
      const servico = await buscarServicoPorId(req.params.servicoId);
      return res.json(servico);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  // Atualiza dados do servico.
  async atualizar(req, res) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: 'Autenticacao obrigatoria' });
      }

      const servico = await atualizarServico(req.params.servicoId, body, usuario);
      return res.json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Desativa um servico.
  async desativar(req, res) {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: 'Autenticacao obrigatoria' });
      }

      const servico = await desativarServico(req.params.servicoId, usuario);
      return res.json(servico);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new ServicoController();
