import { IApplicationRepository } from '../repositories/IApplicationRepository';
import { IInterviewRepository } from '../repositories/IInterviewRepository';
import { IInterviewStepRepository } from '../repositories/IInterviewStepRepository';
import { ICandidateRepository } from '../repositories/ICandidateRepository';
import { CandidateKanbanCard, createCandidateKanbanCard } from '../valueObjects/CandidateKanbanCard';
import { Application } from '../models/Application';

export class KanbanDomainService {
  constructor(
    private candidateRepository: ICandidateRepository,
    private interviewStepRepository: IInterviewStepRepository,
    private interviewRepository: IInterviewRepository
  ) {}

  async buildKanbanCard(application: Application): Promise<CandidateKanbanCard> {
    const [candidate, interviewStep, averageScore] = await Promise.all([
      this.candidateRepository.findById(application.candidateId),
      this.interviewStepRepository.findById(application.currentInterviewStep),
      this.interviewRepository.calculateAverageScore(application.id!)
    ]);

    if (!candidate) {
      throw new Error(`Candidate with ID ${application.candidateId} not found`);
    }

    if (!interviewStep) {
      throw new Error(`Interview step with ID ${application.currentInterviewStep} not found`);
    }

    return createCandidateKanbanCard(
      candidate.id!,
      `${candidate.firstName} ${candidate.lastName}`,
      interviewStep.name,
      averageScore,
      application.id!
    );
  }
}

