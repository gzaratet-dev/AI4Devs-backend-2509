import { Router } from 'express';
import { asyncHandler } from '../presentation/middlewares/asyncHandler';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function createPositionRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // GET /positions/:id/candidates
  router.get(
    '/:id/candidates',
    asyncHandler(kanbanController.getCandidatesByPosition)
  );

  return router;
}

