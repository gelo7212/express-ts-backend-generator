import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Domain validation errors
  if (error.message.includes('Invalid email format') || 
      error.message.includes('required') ||
      error.message.includes('already exists')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message
    });
  }

  // Business rule violations
  if (error.message.includes('Cannot delete') ||
      error.message.includes('not allowed')) {
    return res.status(409).json({
      error: 'Conflict',
      message: error.message
    });
  }

  // Default server error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
};
