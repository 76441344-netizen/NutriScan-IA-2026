import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody, GetUserParams, UpdateUserParams } from "@workspace/api-zod";

const router = Router();

router.post("/users", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
  }
  const data = parsed.data;
  const [user] = await db.insert(usersTable).values({
    nombre: data.nombre,
    integrantes: data.integrantes,
    ninos: data.ninos,
    edades: data.edades ?? null,
    presupuesto: data.presupuesto,
    tiempo_cocina: data.tiempo_cocina,
  }).returning();
  return res.status(201).json({
    ...user,
    createdAt: user.createdAt.toISOString(),
  });
});

router.get("/users/:id", async (req, res) => {
  const parsed = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "ID inválido" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.id));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    ...user,
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/users/:id", async (req, res) => {
  const paramParsed = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) return res.status(400).json({ error: "ID inválido" });

  const bodyParsed = UpdateUserBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Datos inválidos" });

  const updates: Record<string, unknown> = {};
  const data = bodyParsed.data;
  if (data.nombre !== undefined) updates.nombre = data.nombre;
  if (data.integrantes !== undefined) updates.integrantes = data.integrantes;
  if (data.ninos !== undefined) updates.ninos = data.ninos;
  if (data.edades !== undefined) updates.edades = data.edades;
  if (data.presupuesto !== undefined) updates.presupuesto = data.presupuesto;
  if (data.tiempo_cocina !== undefined) updates.tiempo_cocina = data.tiempo_cocina;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, paramParsed.data.id)).returning();
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  return res.json({
    ...user,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
