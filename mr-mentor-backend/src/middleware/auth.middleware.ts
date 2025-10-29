import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { UserRole } from '../types/UserTypes';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: string; 
      email: string;
      role: UserRole;
    };
    // Create a user object with the decoded information
    req.user = { 
      id: decoded.id, 
      email: decoded.email,
      role: decoded.role
    } as User;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};