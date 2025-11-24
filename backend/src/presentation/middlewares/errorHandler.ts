import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}

