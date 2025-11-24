import { Router } from 'express';
import candidateRoutes from './candidateRoutes';
import { createPositionRoutes } from './positionRoutes';
import { createCandidateKanbanRoutes } from './candidateKanbanRoutes';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function setupRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // Rutas existentes
  router.use('/candidates', candidateRoutes);

  // Nuevas rutas Kanban
  router.use('/positions', createPositionRoutes(kanbanController));
  
  // Ruta para actualizar stage (puede ir en /candidates o separada)
  const candidateKanbanRoutes = createCandidateKanbanRoutes(kanbanController);
  router.use('/candidates', candidateKanbanRoutes);

  return router;
}

