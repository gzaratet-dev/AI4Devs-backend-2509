import { ValidationError } from './errors';

export function validateIdParam(paramValue: string, paramName: string): number {
  const id = parseInt(paramValue);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${paramName}: must be a positive integer`);
  }
  return id;
}

export function validateRequiredFields(obj: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

