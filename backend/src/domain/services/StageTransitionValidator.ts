import { InterviewStep } from '../models/InterviewStep';
import { BusinessRuleError } from '../../utils/errors';

export class StageTransitionValidator {
  static validateTransition(
    currentStep: InterviewStep,
    newStep: InterviewStep,
    interviewFlowId: number
  ): void {
    // Validar que ambos pasos pertenecen al mismo flujo
    if (currentStep.interviewFlowId !== interviewFlowId || 
        newStep.interviewFlowId !== interviewFlowId) {
      throw new BusinessRuleError(
        'The new stage does not belong to the same interview flow'
      );
    }

    // Validar que no se salten pasos (opcional, según reglas de negocio)
    const orderDifference = Math.abs(newStep.orderIndex - currentStep.orderIndex);
    if (orderDifference > 1) {
      throw new BusinessRuleError(
        'Cannot skip stages in the interview process'
      );
    }

    // Validar que no se retroceda más de un paso (opcional)
    if (newStep.orderIndex < currentStep.orderIndex - 1) {
      throw new BusinessRuleError(
        'Can only move back one stage at a time'
      );
    }
  }
}

