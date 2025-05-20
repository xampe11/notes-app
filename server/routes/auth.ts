import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { generateToken } from '../utils/jwt';
import { insertUserSchema, loginSchema } from '../models/schema';
import { fromZodError } from 'zod-validation-error';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return res.status(400).json({ message: validationError.message });
    }
    
    // Check if username already exists
    const existingUserByUsername = await storage.getUserByUsername(validationResult.data.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists (if provided)
    if (validationResult.data.email) {
      const existingUserByEmail = await storage.getUserByEmail(validationResult.data.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Create user
    const user = await storage.createUser(validationResult.data);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user info (without password) and token
    const { password, ...userWithoutPassword } = user;
    
    return res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return res.status(400).json({ message: validationError.message });
    }
    
    // Validate credentials
    const user = await storage.validateUserCredentials(
      validationResult.data.username,
      validationResult.data.password
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user info (without password) and token
    const { password, ...userWithoutPassword } = user;
    
    return res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Failed to log in' });
  }
});

// Get current user info
router.get('/me', async (req: Request, res: Response) => {
  try {
    // The user should be set by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Failed to get user info' });
  }
});

export default router;