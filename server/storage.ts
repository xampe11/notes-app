import { 
  notes, users, categories, noteCategories,
  type Note, type InsertNote, type UpdateNote, 
  type Category, type InsertCategory,
  type User, type InsertUser
} from "./models/schema";
import { db } from "./db";
import { eq, desc, and, like, sql, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";

// Extend the storage interface to include note operations
export interface IStorage {
  // User authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUserCredentials(username: string, password: string): Promise<User | null>;
  
  // Note methods
  getNotes(archived: boolean): Promise<Note[]>;
  getNotesWithCategories(archived: boolean): Promise<any[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: UpdateNote): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string, archived: boolean): Promise<Note[]>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Note-Category relationship methods
  addCategoryToNote(noteId: number, categoryId: number): Promise<boolean>;
  removeCategoryFromNote(noteId: number, categoryId: number): Promise<boolean>;
  getNoteCategories(noteId: number): Promise<Category[]>;
  getNotesByCategory(categoryId: number, archived: boolean): Promise<Note[]>;
}

export class DatabaseStorage implements IStorage {
  // Original user methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const [createdUser] = await db.insert(users)
      .values({ 
        ...userData, 
        password: hashedPassword 
      })
      .returning();
    
    return createdUser;
  }

  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    // Find user by username
    console.log(`Validating credentials for username: ${username}`);
    const user = await this.getUserByUsername(username);
    if (!user) {
      console.log("User not found");
      return null;
    }
    
    console.log("User found, comparing passwords");
    
    // Verify password
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password valid: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return null;
    }
  }

  // Notes methods
  async getNotes(archived: boolean): Promise<Note[]> {
    return db.select()
      .from(notes)
      .where(eq(notes.archived, archived))
      .orderBy(desc(notes.updatedAt));
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    const [note] = await db.select()
      .from(notes)
      .where(eq(notes.id, id));
    return note;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [created] = await db.insert(notes)
      .values({
        ...note,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateNote(id: number, noteUpdate: UpdateNote): Promise<Note | undefined> {
    const [updated] = await db.update(notes)
      .set({
        ...noteUpdate,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();
    return updated;
  }

  async deleteNote(id: number): Promise<boolean> {
    const [deleted] = await db.delete(notes)
      .where(eq(notes.id, id))
      .returning();
    return !!deleted;
  }

  async searchNotes(query: string, archived: boolean): Promise<Note[]> {
    return db.select()
      .from(notes)
      .where(
        and(
          eq(notes.archived, archived),
          query ? 
            sql`(${notes.title} ILIKE ${'%' + query + '%'} OR ${notes.content} ILIKE ${'%' + query + '%'})` :
            sql`TRUE`
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  // New method to get notes with their categories
  async getNotesWithCategories(archived: boolean): Promise<any[]> {
    const result = await db.query.notes.findMany({
      where: eq(notes.archived, archived),
      orderBy: [desc(notes.updatedAt)],
      with: {
        categories: {
          with: {
            category: true
          }
        }
      }
    });

    // Transform the result to include categories as a flat array
    return result.map(note => {
      const noteCategories = note.categories.map(nc => nc.category);
      const { categories, ...noteWithoutCategories } = note;
      return {
        ...noteWithoutCategories,
        categories: noteCategories
      };
    });
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories)
      .values(category)
      .returning();
    return created;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const [deleted] = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return !!deleted;
  }

  // Note-Category relationship methods
  async addCategoryToNote(noteId: number, categoryId: number): Promise<boolean> {
    try {
      await db.insert(noteCategories)
        .values({ noteId, categoryId })
        .onConflictDoNothing();
      return true;
    } catch (error) {
      console.error("Error adding category to note:", error);
      return false;
    }
  }

  async removeCategoryFromNote(noteId: number, categoryId: number): Promise<boolean> {
    const [deleted] = await db.delete(noteCategories)
      .where(
        and(
          eq(noteCategories.noteId, noteId),
          eq(noteCategories.categoryId, categoryId)
        )
      )
      .returning();
    return !!deleted;
  }

  async getNoteCategories(noteId: number): Promise<Category[]> {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(noteCategories)
      .innerJoin(categories, eq(noteCategories.categoryId, categories.id))
      .where(eq(noteCategories.noteId, noteId));
    
    return result;
  }

  async getNotesByCategory(categoryId: number, archived: boolean): Promise<Note[]> {
    const result = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        archived: notes.archived,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(noteCategories)
      .innerJoin(notes, eq(noteCategories.noteId, notes.id))
      .where(
        and(
          eq(noteCategories.categoryId, categoryId),
          eq(notes.archived, archived)
        )
      )
      .orderBy(desc(notes.updatedAt));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
