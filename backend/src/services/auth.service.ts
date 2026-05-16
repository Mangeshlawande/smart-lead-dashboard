import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { JwtPayload, UserRole } from '../types';
import { RegisterInput, LoginInput } from '../validators/schemas';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresIn: string): string =>
  jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

const generateTokens = (payload: Omit<JwtPayload, 'iat' | 'exp'>): AuthTokens => ({
  accessToken: signToken(payload, config.jwt.secret, config.jwt.expiresIn),
  refreshToken: signToken(payload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn),
});

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw AppError.conflict('Email already in use');

  const user = await User.create(input);

  const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tokens,
  };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email, isActive: true }).select('+password');
  if (!user) throw AppError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw AppError.unauthorized('Invalid credentials');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tokens,
  };
};

export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw AppError.unauthorized('User not found');

    return generateTokens({ id: user.id, email: user.email, role: user.role });
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
};
