import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import boardRoutes from './routes/boardRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', message: 'TeamSync API & Database are live.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed.' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);

app.use('/api/workspaces', workspaceRoutes);

app.use('/api/boards', boardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});