import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default server;
