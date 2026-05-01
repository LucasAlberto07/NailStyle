import {
  cadastrarUsuario,
  login,
  logout,
  refreshToken,
} from '../services/AuthService.js';

class AuthController {
  // Cadastra um novo usuario.
  async registrar(req, res) {
    try {
      const usuario = await cadastrarUsuario(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Autentica usuario e retorna tokens.
  async entrar(req, res) {
    try {
      const { email, senha } = req.body;
      const resultado = await login(email, senha, res);
      return res.json(resultado);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // Renova o access token usando refresh token.
  async renovar(req, res) {
    try {
      const token = req.cookies.refreshToken ?? req.body.refreshToken;
      const resultado = await refreshToken(token, res);
      return res.json(resultado);
    } catch (error) {
      return res.status(401).json({ erro: error.message });
    }
  }

  // Encerra sessao e remove refresh token.
  async sair(req, res) {
    try {
      const token = req.cookies.refreshToken ?? req.body.refreshToken;
      await logout(token, res);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new AuthController();
