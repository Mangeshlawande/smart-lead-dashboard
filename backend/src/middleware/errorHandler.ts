import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const handleCastError = (err: mongoose.Error.CastError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const errors: Record<string, string[]> = {};
  Object.values(err.errors).forEach((e) => {
    if (!errors[e.path]) errors[e.path] = [];
    errors[e.path].push(e.message);
  });
  return new AppError('Validation failed', 422, errors);
};

const handleDuplicateKeyError = (err: Error & { keyValue?: Record<string, unknown> }): AppError => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  return new AppError(`${field} already exists`, 409);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  let error = err instanceof AppError ? err : new AppError(err.message, 500, undefined, false);

  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);
  if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);
  if ('code' in err && err.code === 11000)
    error = handleDuplicateKeyError(err as Error & { keyValue?: Record<string, unknown> });

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.isOperational ? error.message : 'Internal server error',
    ...(error.errors && { errors: error.errors }),
    ...(config.isDev && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
