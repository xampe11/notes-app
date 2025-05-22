import { Request, Response, NextFunction } from "express";
import { verifyToken, getUserIdFromToken } from "../utils/jwt";

// Extend Express Request to include user property
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

// Middleware to verify JWT token and set user in request object
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authentication required" });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }
        
        // Verify token and get user data
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        
        // Set user information in the request
        req.user = {
            id: decoded.userId,
            username: decoded.username
        };
        
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};

// Middleware for routes that can be accessed with or without authentication
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return next();
        }
        
        // Verify token and get user data
        const userData = verifyToken(token);
        
        if (userData) {
            // Set user information in the request
            req.user = {
                id: userData.userId,
                username: userData.username
            };
        }
        
        next();
    } catch (error) {
        // Continue without setting user
        next();
    }
};