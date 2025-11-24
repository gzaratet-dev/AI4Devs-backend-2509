import { PrismaClient } from '@prisma/client';
import { IInterviewRepository } from '../../domain/repositories/IInterviewRepository';
import { Interview } from '../../domain/models/Interview';

export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(private prisma: PrismaClient) {}

  async findByApplicationId(applicationId: number): Promise<Interview[]> {
    const interviews = await this.prisma.interview.findMany({
      where: { applicationId }
    });

    return interviews.map(interview => new Interview(interview));
  }

  async calculateAverageScore(applicationId: number): Promise<number | null> {
    const result = await this.prisma.interview.aggregate({
      where: {
        applicationId,
        score: { not: null }
      },
      _avg: {
        score: true
      }
    });

    return result._avg.score ? Math.round(result._avg.score * 100) / 100 : null;
  }
}

