import { PrismaClient } from '@prisma/client';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';
import { InterviewStep } from '../../domain/models/InterviewStep';

export class PrismaInterviewStepRepository implements IInterviewStepRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<InterviewStep | null> {
    const step = await this.prisma.interviewStep.findUnique({
      where: { id }
    });

    return step ? new InterviewStep(step) : null;
  }

  async findByFlowId(flowId: number): Promise<InterviewStep[]> {
    const steps = await this.prisma.interviewStep.findMany({
      where: { interviewFlowId: flowId },
      orderBy: { orderIndex: 'asc' }
    });

    return steps.map(step => new InterviewStep(step));
  }
}

