import { Request, Response } from 'express';
import { KanbanService } from '../../application/services/kanbanService';
import { validateIdParam } from '../../utils/validators';
import { UpdateStageRequestDto } from '../../application/dtos/UpdateStageDto';

export class KanbanController {
  constructor(private kanbanService: KanbanService) {}

  getCandidatesByPosition = async (req: Request, res: Response): Promise<void> => {
    const positionId = validateIdParam(req.params.id, 'position ID');
    const candidates = await this.kanbanService.getCandidatesByPosition(positionId);
    res.json(candidates);
  };

  updateCandidateStage = async (req: Request, res: Response): Promise<void> => {
    const candidateId = validateIdParam(req.params.id, 'candidate ID');
    const updateData: UpdateStageRequestDto = req.body;

    const result = await this.kanbanService.updateCandidateStage(candidateId, updateData);
    res.json(result);
  };
}

