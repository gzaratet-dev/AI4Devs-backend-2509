import { PrismaClient } from '@prisma/client';
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { Application } from '../../domain/models/Application';

export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByPositionId(positionId: number): Promise<Application[]> {
    const applications = await this.prisma.application.findMany({
      where: { positionId },
      include: {
        candidate: true,
        interviewStep: true,
        interviews: true
      }
    });

    return applications.map(app => new Application(app));
  }

  async findById(id: number): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        interviewStep: true,
        position: {
          include: { interviewFlow: true }
        }
      }
    });

    return application ? new Application(application) : null;
  }

  async updateInterviewStep(applicationId: number, stepId: number): Promise<void> {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentInterviewStep: stepId }
    });
  }
}

