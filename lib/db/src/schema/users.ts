import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  integrantes: integer("integrantes").notNull(),
  ninos: integer("ninos").notNull(),
  edades: text("edades"),
  presupuesto: text("presupuesto").notNull(),
  tiempo_cocina: integer("tiempo_cocina").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
