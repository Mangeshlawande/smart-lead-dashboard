import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created'): Response =>
  sendSuccess(res, data, message, 201);

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = { success: false, message, ...(errors && { errors }) };
  return res.status(statusCode).json(response);
};

export const sendNotFound = (res: Response, resource = 'Resource'): Response =>
  sendError(res, `${resource} not found`, 404);

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response =>
  sendError(res, message, 401);

export const sendForbidden = (res: Response, message = 'Forbidden'): Response =>
  sendError(res, message, 403);

export const sendValidationError = (
  res: Response,
  errors: Record<string, string[]>
): Response => sendError(res, 'Validation failed', 422, errors);

export const sendNoContent = (res: Response): Response => res.status(204).send();
