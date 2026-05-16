import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/errors';
import { sendSuccess, sendCreated } from '../utils/response';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendCreated(res, result, 'Account created successfully');
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await authService.loginUser(req.body);
  sendSuccess(res, result, 'Login successful');
});

export const refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  const tokens = await authService.refreshTokens(refreshToken);
  sendSuccess(res, tokens, 'Tokens refreshed');
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  sendSuccess(res, req.user, 'Profile retrieved');
});
