import {
  atualizarStatus,
  buscarPedidos,
  calcularIndicadores,
  cancelarPedido,
  listarPedidosAdmin,
  listarPedidosDoUsuario,
} from '../services/PedidoService.js';

class PedidoController {
  // Lista pedidos do usuario informado.
  async listarMeus(req, res) {
    try {
      const body = req.body ?? {};
      const query = req.query ?? {};
      const usuarioId = req.usuario?.id ?? query.usuarioId ?? body.usuarioId;

      if (!usuarioId) {
        return res.status(400).json({ erro: 'usuarioId e obrigatorio' });
      }

      const pedidos = await listarPedidosDoUsuario(usuarioId);
      return res.json(pedidos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Lista pedidos para administracao.
  async listarAdmin(req, res) {
    try {
      const pedidos = await listarPedidosAdmin(req.query);
      return res.json(pedidos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Busca pedidos por termo.
  async buscar(req, res) {
    try {
      const query = req.query ?? {};
      const pedidos = await buscarPedidos(query.termo);
      return res.json(pedidos);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Retorna indicadores dos pedidos.
  async indicadores(req, res) {
    try {
      const indicadores = await calcularIndicadores();
      return res.json(indicadores);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Atualiza status de um pedido.
  async atualizarStatus(req, res) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario ?? body.usuario;
      const { novoStatus, status, valorFinal } = body;
      const statusPedido = novoStatus ?? status;

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuario e obrigatorio' });
      }

      if (!statusPedido) {
        return res.status(400).json({ erro: 'status e obrigatorio' });
      }

      const pedido = await atualizarStatus(
        req.params.pedidoId,
        statusPedido,
        usuario,
        valorFinal
      );

      return res.json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Cancela um pedido.
  async cancelar(req, res) {
    try {
      const body = req.body ?? {};
      const usuario = req.usuario ?? body.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuario e obrigatorio' });
      }

      const pedido = await cancelarPedido(req.params.pedidoId, usuario);
      return res.json(pedido);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new PedidoController();
