import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema from original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Notes schema for our application
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
}).partial();

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Note to Category relation (many-to-many)
export const noteCategories = pgTable("note_categories", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => notes.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

// Relations
export const notesRelations = relations(notes, ({ many }) => ({
  categories: many(noteCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  notes: many(noteCategories),
}));

export const noteCategoriesRelations = relations(noteCategories, ({ one }) => ({
  note: one(notes, { fields: [noteCategories.noteId], references: [notes.id] }),
  category: one(categories, { fields: [noteCategories.categoryId], references: [categories.id] }),
}));