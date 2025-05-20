import { z } from "zod";

// Note schema
export const noteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  archived: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const insertNoteSchema = noteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNoteSchema = noteSchema.omit({
  id: true,
  createdAt: true,
}).partial();

export type Note = z.infer<typeof noteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const insertCategorySchema = categorySchema.omit({
  id: true,
});

export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// For the relationship between notes and categories
export const noteCategorySchema = z.object({
  id: z.number(),
  noteId: z.number(),
  categoryId: z.number(),
});

// Extended note type to include categories
export const noteWithCategoriesSchema = noteSchema.extend({
  categories: z.array(categorySchema).optional(),
});

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = userSchema.pick({
  username: true,
  password: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;