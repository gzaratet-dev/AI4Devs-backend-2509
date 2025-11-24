export interface UpdateStageRequestDto {
  applicationId: number;
  newInterviewStepId: number;
}

export interface UpdateStageResponseDto {
  message: string;
  application: {
    id: number;
    currentInterviewStep: number;
    updatedAt: Date;
  };
}

