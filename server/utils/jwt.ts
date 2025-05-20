import jwt from 'jsonwebtoken';
import { User } from '../models/schema';

// Secret key for JWT signing and verification
// In production, you should use a strong, secure key stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'notes-app-secret-key';

// Token expiration time
const TOKEN_EXPIRY = '24h';

// Create a JWT token for a user
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    // Don't include sensitive data like password in the token
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify and decode a JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract user ID from token for authorization checks
export function getUserIdFromToken(token: string): number | null {
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}