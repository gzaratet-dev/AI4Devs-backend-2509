import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { IInterviewRepository } from '../../domain/repositories/IInterviewRepository';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { KanbanDomainService } from '../../domain/services/KanbanDomainService';
import { StageTransitionValidator } from '../../domain/services/StageTransitionValidator';
import { GetPositionCandidatesResponseDto } from '../dtos/GetPositionCandidatesDto';
import { UpdateStageRequestDto, UpdateStageResponseDto } from '../dtos/UpdateStageDto';
import { NotFoundError, ValidationError } from '../../utils/errors';

export class KanbanService {
  private kanbanDomainService: KanbanDomainService;

  constructor(
    private applicationRepository: IApplicationRepository,
    private interviewRepository: IInterviewRepository,
    private interviewStepRepository: IInterviewStepRepository,
    private candidateRepository: ICandidateRepository
  ) {
    this.kanbanDomainService = new KanbanDomainService(
      candidateRepository,
      interviewStepRepository,
      interviewRepository
    );
  }

  async getCandidatesByPosition(positionId: number): Promise<GetPositionCandidatesResponseDto[]> {
    if (!positionId || positionId <= 0) {
      throw new ValidationError('Invalid position ID');
    }

    const applications = await this.applicationRepository.findByPositionId(positionId);

    if (applications.length === 0) {
      return [];
    }

    const kanbanCards = await Promise.all(
      applications.map(app => this.kanbanDomainService.buildKanbanCard(app))
    );

    return kanbanCards;
  }

  async updateCandidateStage(
    candidateId: number,
    updateData: UpdateStageRequestDto
  ): Promise<UpdateStageResponseDto> {
    const { applicationId, newInterviewStepId } = updateData;

    // Validar entrada
    if (!applicationId || !newInterviewStepId) {
      throw new ValidationError('applicationId and newInterviewStepId are required');
    }

    // Obtener la aplicación
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    // Verificar que la aplicación pertenece al candidato
    if (application.candidateId !== candidateId) {
      throw new ValidationError('Application does not belong to the specified candidate');
    }

    // Obtener los pasos de entrevista
    const [currentStep, newStep] = await Promise.all([
      this.interviewStepRepository.findById(application.currentInterviewStep),
      this.interviewStepRepository.findById(newInterviewStepId)
    ]);

    if (!currentStep) {
      throw new NotFoundError('Current interview step');
    }

    if (!newStep) {
      throw new NotFoundError('New interview step');
    }

    // Validar la transición usando el servicio de dominio
    const interviewFlowId = (application as any).position?.interviewFlowId || currentStep.interviewFlowId;
    StageTransitionValidator.validateTransition(currentStep, newStep, interviewFlowId);

    // Actualizar el paso de entrevista
    await this.applicationRepository.updateInterviewStep(applicationId, newInterviewStepId);

    return {
      message: 'Stage updated successfully',
      application: {
        id: applicationId,
        currentInterviewStep: newInterviewStepId,
        updatedAt: new Date()
      }
    };
  }
}

