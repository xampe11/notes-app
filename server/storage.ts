import { notes, type Note, type InsertNote, type UpdateNote } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Extend the storage interface to include note operations
export interface IStorage {
  // Original user methods
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Note methods
  getNotes(archived: boolean): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: UpdateNote): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string, archived: boolean): Promise<Note[]>;
}

export class DatabaseStorage implements IStorage {
  // Original user methods
  async getUser(id: number): Promise<any | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    // This method is not relevant for our notes app but kept for interface compatibility
    return undefined;
  }

  async createUser(user: any): Promise<any> {
    // This method is not relevant for our notes app but kept for interface compatibility
    return user;
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
        eq(notes.archived, archived)
      )
      .orderBy(desc(notes.updatedAt));
  }
}

export const storage = new DatabaseStorage();
