import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRoutes from './routes/upload';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/', uploadRoutes);

// Rotas de atletas (seu código existente)
// app.use('/athletes', athleteRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
