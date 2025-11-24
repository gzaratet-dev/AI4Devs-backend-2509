import { Router } from 'express';
import { asyncHandler } from '../presentation/middlewares/asyncHandler';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function createCandidateKanbanRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // PUT /candidates/:id/stage
  router.put(
    '/:id/stage',
    asyncHandler(kanbanController.updateCandidateStage)
  );

  return router;
}

