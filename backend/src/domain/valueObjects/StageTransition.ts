export interface StageTransition {
  applicationId: number;
  fromStepId: number;
  toStepId: number;
  transitionDate: Date;
}

export function createStageTransition(
  applicationId: number,
  fromStepId: number,
  toStepId: number
): StageTransition {
  return {
    applicationId,
    fromStepId,
    toStepId,
    transitionDate: new Date()
  };
}

