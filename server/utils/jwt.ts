import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

// Secret key for JWT - in a real app, use a secure, environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

// Generate a JWT token for a user
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify a JWT token and return the decoded data
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract user ID from token
export function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}