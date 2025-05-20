import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

// Authentication middleware to protect routes
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Set user in request object
  req.user = {
    id: decoded.id,
    username: decoded.username
  };
  
  next();
};

// Optional auth middleware - doesn't require authentication but adds user to req if token is provided
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        username: decoded.username
      };
    }
  }
  
  next();
};