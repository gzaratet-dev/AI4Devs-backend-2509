import { InterviewStep } from '../models/InterviewStep';

export interface IInterviewStepRepository {
  findById(id: number): Promise<InterviewStep | null>;
  findByFlowId(flowId: number): Promise<InterviewStep[]>;
}

