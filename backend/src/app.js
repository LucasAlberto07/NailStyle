import express from 'express';
import cookieParser from 'cookie-parser';
import disponibilidadeRoutes from './routes/disponibilidade.js';
import servicoRoutes from './routes/servico.js';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Servidor OK');
});

app.use(disponibilidadeRoutes);
app.use('/servicos', servicoRoutes);

export default app;
