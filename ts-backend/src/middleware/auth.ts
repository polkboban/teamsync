import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication token missing or invalid' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as { id: string };
    
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token has expired or is invalid' });
  }
};