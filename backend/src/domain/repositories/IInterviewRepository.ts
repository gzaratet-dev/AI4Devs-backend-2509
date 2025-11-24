import { Interview } from '../models/Interview';

export interface IInterviewRepository {
  findByApplicationId(applicationId: number): Promise<Interview[]>;
  calculateAverageScore(applicationId: number): Promise<number | null>;
}

