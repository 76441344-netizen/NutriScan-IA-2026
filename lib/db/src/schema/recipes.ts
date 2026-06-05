import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  nombre: text("nombre").notNull(),
  ingredientes: text("ingredientes").notNull(),
  pasos: text("pasos").notNull(),
  tiempo_preparacion: text("tiempo_preparacion").notNull(),
  beneficios: text("beneficios").notNull(),
  prevencion_anemia: text("prevencion_anemia").notNull(),
  ingredientesUsados: text("ingredientes_usados").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({ id: true, createdAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;
