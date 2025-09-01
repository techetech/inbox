import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw createError('Access token required', 401);
  }

  jwt.verify(token, config.jwt.secret, (err, decoded: any) => {
    if (err) {
      throw createError('Invalid or expired token', 403);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  });
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    throw createError('Admin access required', 403);
  }
  next();
};
