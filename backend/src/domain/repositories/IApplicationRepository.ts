import { Application } from '../models/Application';

export interface IApplicationRepository {
  findByPositionId(positionId: number): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
  updateInterviewStep(applicationId: number, stepId: number): Promise<void>;
}

