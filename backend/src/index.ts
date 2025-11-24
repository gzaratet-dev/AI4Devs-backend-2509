import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import { uploadFile } from './application/services/fileUploadService';
import cors from 'cors';

// Kanban imports
import { setupRoutes } from './routes';
import { errorHandler } from './presentation/middlewares/errorHandler';
import { PrismaApplicationRepository } from './infrastructure/repositories/PrismaApplicationRepository';
import { PrismaInterviewRepository } from './infrastructure/repositories/PrismaInterviewRepository';
import { PrismaInterviewStepRepository } from './infrastructure/repositories/PrismaInterviewStepRepository';
import { PrismaCandidateRepository } from './infrastructure/repositories/PrismaCandidateRepository';
import { KanbanService } from './application/services/kanbanService';
import { KanbanController } from './presentation/controllers/kanbanController';

// Extender la interfaz Request para incluir prisma
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default app;

// Middleware para parsear JSON. Asegúrate de que esto esté antes de tus rutas.
app.use(express.json());

// Middleware para permitir CORS desde http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware para adjuntar prisma al objeto de solicitud
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Dependency Injection Setup
const applicationRepository = new PrismaApplicationRepository(prisma);
const interviewRepository = new PrismaInterviewRepository(prisma);
const interviewStepRepository = new PrismaInterviewStepRepository(prisma);
const candidateRepository = new PrismaCandidateRepository(prisma);

const kanbanService = new KanbanService(
  applicationRepository,
  interviewRepository,
  interviewStepRepository,
  candidateRepository
);

const kanbanController = new KanbanController(kanbanService);

// Routes
const routes = setupRoutes(kanbanController);
app.use('/api', routes);

// Legacy routes (keeping for backward compatibility)
app.use('/candidates', candidateRoutes);
app.post('/upload', uploadFile);

const port = 3010;

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Error handler (debe ir al final)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
