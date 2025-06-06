import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertNoteSchema, updateNoteSchema, 
  insertCategorySchema 
} from "./models/schema";
import { fromZodError } from "zod-validation-error";
import authRoutes from "./routes/auth";
import { authenticate } from "./middlewares/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  app.use('/api/auth', authRoutes);
  // Get all active notes with their categories
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const archived = req.query.archived === "true";
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const includeCategories = req.query.includeCategories === "true";
      
      // Filter by categoryId if provided
      if (categoryId && !isNaN(categoryId)) {
        const notes = await storage.getNotesByCategory(categoryId, archived);
        return res.json(notes);
      }
      
      // Search by query if provided
      if (search && search.trim() !== "") {
        const notes = await storage.searchNotes(search, archived);
        return res.json(notes);
      }
      
      // Get notes with categories if requested
      if (includeCategories) {
        const notesWithCategories = await storage.getNotesWithCategories(archived);
        return res.json(notesWithCategories);
      }
      
      // Default: just get notes without categories
      const notes = await storage.getNotes(archived);
      return res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      return res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Get a single note by ID
  app.get("/api/notes/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      return res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      return res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  // Create a new note
  app.post("/api/notes", authenticate, async (req: Request, res: Response) => {
    try {
      console.log("Creating note with request body:", req.body);
      console.log("User from token:", req.user);
      
      const validationResult = insertNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        console.log("Validation error:", validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Make sure userId is set from the authenticated user
      const noteData = {
        ...validationResult.data,
        userId: req.user?.id
      };
      
      console.log("Creating note with data:", noteData);
      const note = await storage.createNote(noteData);
      return res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      return res.status(500).json({ message: "Failed to create note" });
    }
  });

  // Update an existing note
  app.put("/api/notes/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const validationResult = updateNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedNote = await storage.updateNote(id, validationResult.data);
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      return res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      return res.status(500).json({ message: "Failed to update note" });
    }
  });

  // Toggle archive status
  app.patch("/api/notes/:id/archive", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      const updatedNote = await storage.updateNote(id, {
        archived: !note.archived
      });
      
      return res.json(updatedNote);
    } catch (error) {
      console.error("Error archiving note:", error);
      return res.status(500).json({ message: "Failed to archive note" });
    }
  });

  // Delete a note
  app.delete("/api/notes/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Attempting to delete note with ID: ${id}, user ID: ${req.user?.id}`);
      
      if (isNaN(id)) {
        console.log('Invalid note ID');
        return res.status(400).json({ message: "Invalid note ID" });
      }

      // Check if note exists before deletion
      const noteToDelete = await storage.getNoteById(id);
      console.log('Note to delete:', noteToDelete);
      
      if (!noteToDelete) {
        console.log(`Note with ID ${id} not found`);
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Comment out owner verification for now as we implement proper user association
      // if (noteToDelete.userId !== req.user?.id) {
      //   console.log(`User ${req.user?.id} attempted to delete note ${id} belonging to user ${noteToDelete.userId}`);
      //   return res.status(403).json({ message: "You don't have permission to delete this note" });
      // }
      
      // Temporarily allow any authenticated user to delete any note
      console.log(`Allowing user ${req.user?.id} to delete note ${id} for testing purposes`);
      

      // Delete note with categories
      try {
        // First, remove all category associations
        const categories = await storage.getNoteCategories(id);
        for (const category of categories) {
          await storage.removeCategoryFromNote(id, category.id);
        }
        
        // Then delete the note
        const deleted = await storage.deleteNote(id);
        
        if (!deleted) {
          console.log(`Database failed to delete note with ID ${id}`);
          return res.status(500).json({ message: "Database error: Failed to delete note" });
        }
        
        console.log(`Successfully deleted note with ID ${id}`);
        return res.json({ success: true, message: "Note deleted successfully" });
      } catch (err) {
        console.error(`Error during delete operation for note ${id}:`, err);
        return res.status(500).json({ message: "Server error during note deletion" });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return res.status(500).json({ message: "Server error: Failed to delete note" });
    }
  });

  // Category endpoints
  
  // Get all categories - removing authentication temporarily for development
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create a new category
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const validationResult = insertCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const category = await storage.createCategory(validationResult.data);
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Delete a category
  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get categories for a note
  app.get("/api/notes/:id/categories", async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const categories = await storage.getNoteCategories(noteId);
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching note categories:", error);
      return res.status(500).json({ message: "Failed to fetch note categories" });
    }
  });

  // Add a category to a note
  app.post("/api/notes/:id/categories/:categoryId", async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(noteId) || isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid note or category ID" });
      }

      const success = await storage.addCategoryToNote(noteId, categoryId);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to add category to note" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error adding category to note:", error);
      return res.status(500).json({ message: "Failed to add category to note" });
    }
  });

  // Remove a category from a note
  app.delete("/api/notes/:id/categories/:categoryId", async (req: Request, res: Response) => {
    try {
      const noteId = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(noteId) || isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid note or category ID" });
      }

      const success = await storage.removeCategoryFromNote(noteId, categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Note-category relationship not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error removing category from note:", error);
      return res.status(500).json({ message: "Failed to remove category from note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
