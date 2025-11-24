import { StageTransitionValidator } from '../../domain/services/StageTransitionValidator';
import { InterviewStep } from '../../domain/models/InterviewStep';
import { BusinessRuleError } from '../../utils/errors';

describe('StageTransitionValidator', () => {
  it('should allow transition to next stage', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 2,
      interviewFlowId: 1,
      interviewTypeId: 2,
      orderIndex: 2,
      name: 'Technical Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).not.toThrow();
  });

  it('should allow transition to previous stage (go back one step)', () => {
    const currentStep = new InterviewStep({
      id: 2,
      interviewFlowId: 1,
      interviewTypeId: 2,
      orderIndex: 2,
      name: 'Technical Interview'
    });

    const newStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).not.toThrow();
  });

  it('should throw error when skipping stages forward', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 3,
      interviewFlowId: 1,
      interviewTypeId: 3,
      orderIndex: 3,
      name: 'Final Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow(BusinessRuleError);
    
    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow('Cannot skip stages in the interview process');
  });

  it('should throw error when new step is from different flow', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 5,
      interviewFlowId: 2,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'Other Flow Step'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow(BusinessRuleError);
    
    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow('The new stage does not belong to the same interview flow');
  });

  it('should throw error when trying to go back more than one stage', () => {
    const currentStep = new InterviewStep({
      id: 3,
      interviewFlowId: 1,
      interviewTypeId: 3,
      orderIndex: 3,
      name: 'Final Interview'
    });

    const newStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow(BusinessRuleError);
    
    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow('Can only move back one stage at a time');
  });

  it('should allow staying in the same stage', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 2,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
      orderIndex: 2,
      name: 'HR Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).not.toThrow();
  });
});

