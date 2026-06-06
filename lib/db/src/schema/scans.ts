import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const ingredientScansTable = pgTable("ingredient_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  ingredientesDetectados: text("ingredientes_detectados").notNull(),
  nombre: text("nombre"),
  nivelHierro: text("nivel_hierro"),
  recipeData: text("recipe_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IngredientScan = typeof ingredientScansTable.$inferSelect;
