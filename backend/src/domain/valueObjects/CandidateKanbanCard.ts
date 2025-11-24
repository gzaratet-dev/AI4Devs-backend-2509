export interface CandidateKanbanCard {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number | null;
  applicationId: number;
}

export function createCandidateKanbanCard(
  candidateId: number,
  fullName: string,
  currentInterviewStep: string,
  averageScore: number | null,
  applicationId: number
): CandidateKanbanCard {
  return {
    candidateId,
    fullName,
    currentInterviewStep,
    averageScore,
    applicationId
  };
}

