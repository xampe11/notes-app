import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// User registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password, email, name } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Check if username already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Check if email already exists (if provided)
        if (email) {
            const userWithEmail = await storage.getUserByEmail(email);
            if (userWithEmail) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await storage.createUser({
            username,
            password: hashedPassword,
            email,
            name,
        });
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Authenticate user
        const user = await storage.validateUserCredentials(username, password);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get authenticated user profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        const user = await storage.getUser(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

export default router;