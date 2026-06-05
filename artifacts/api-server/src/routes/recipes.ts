import { Router } from "express";
import { db, recipesTable, usersTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import Groq from "groq-sdk";
import {
  GenerateRecipeBody,
  ListRecipesQueryParams,
  GetRecipeParams,
  DeleteRecipeParams,
  GetRecipeStatsParams,
} from "@workspace/api-zod";

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/recipes/generate", async (req, res) => {
  const parsed = GenerateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
  }

  const { userId, ingredientes } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const prompt = `Eres un nutricionista experto en alimentación infantil y prevención de anemia en niños latinoamericanos.

El usuario es una madre/padre con ${user.ninos} niño(s) de edades: ${user.edades || "no especificado"}. La familia tiene ${user.integrantes} integrantes, un presupuesto ${user.presupuesto} y puede dedicar ${user.tiempo_cocina} minutos a cocinar.

Con los siguientes ingredientes disponibles: ${ingredientes}

Genera UNA receta saludable, nutritiva y apropiada para niños. La receta DEBE ayudar a prevenir la anemia infantil incluyendo ingredientes ricos en hierro o que mejoren su absorción cuando sea posible.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones adicionales):
{
  "nombre": "Nombre de la receta",
  "ingredientes": "Lista detallada de ingredientes con cantidades, uno por línea",
  "pasos": "Pasos de preparación numerados, uno por línea",
  "tiempo_preparacion": "X minutos",
  "beneficios": "Beneficios nutricionales principales de la receta para los niños",
  "prevencion_anemia": "Explicación específica de cómo esta receta ayuda a prevenir la anemia en niños"
}`;

  let recipeData: {
    nombre: string;
    ingredientes: string;
    pasos: string;
    tiempo_preparacion: string;
    beneficios: string;
    prevencion_anemia: string;
  };

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    recipeData = JSON.parse(jsonMatch[0]);
  } catch (err) {
    req.log.error({ err }, "Groq API error");
    return res.status(500).json({ error: "Error al generar la receta con IA" });
  }

  const [recipe] = await db.insert(recipesTable).values({
    userId,
    nombre: recipeData.nombre,
    ingredientes: recipeData.ingredientes,
    pasos: recipeData.pasos,
    tiempo_preparacion: recipeData.tiempo_preparacion,
    beneficios: recipeData.beneficios,
    prevencion_anemia: recipeData.prevencion_anemia,
    ingredientesUsados: ingredientes,
  }).returning();

  return res.json({
    ...recipe,
    createdAt: recipe.createdAt.toISOString(),
  });
});

router.get("/recipes", async (req, res) => {
  const parsed = ListRecipesQueryParams.safeParse({ userId: Number(req.query.userId) });
  if (!parsed.success) return res.status(400).json({ error: "userId inválido" });

  const recipes = await db.select().from(recipesTable)
    .where(eq(recipesTable.userId, parsed.data.userId))
    .orderBy(sql`${recipesTable.createdAt} DESC`);

  return res.json(recipes.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.get("/recipes/stats/:userId", async (req, res) => {
  const parsed = GetRecipeStatsParams.safeParse({ userId: Number(req.params.userId) });
  if (!parsed.success) return res.status(400).json({ error: "userId inválido" });

  const { userId } = parsed.data;

  const [totalRow] = await db.select({ count: sql<number>`count(*)::int` })
    .from(recipesTable).where(eq(recipesTable.userId, userId));

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthRow] = await db.select({ count: sql<number>`count(*)::int` })
    .from(recipesTable)
    .where(and(eq(recipesTable.userId, userId), gte(recipesTable.createdAt, startOfMonth)));

  const allRecipes = await db.select({ ingredientesUsados: recipesTable.ingredientesUsados })
    .from(recipesTable).where(eq(recipesTable.userId, userId));

  const ingredientCount: Record<string, number> = {};
  for (const r of allRecipes) {
    const items = r.ingredientesUsados.split(/[,\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    for (const item of items) {
      ingredientCount[item] = (ingredientCount[item] ?? 0) + 1;
    }
  }
  const topIngredient = Object.entries(ingredientCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return res.json({
    totalRecipes: totalRow?.count ?? 0,
    thisMonth: monthRow?.count ?? 0,
    topIngredient,
  });
});

router.get("/recipes/:id", async (req, res) => {
  const parsed = GetRecipeParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "ID inválido" });

  const [recipe] = await db.select().from(recipesTable).where(eq(recipesTable.id, parsed.data.id));
  if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });

  return res.json({ ...recipe, createdAt: recipe.createdAt.toISOString() });
});

router.delete("/recipes/:id", async (req, res) => {
  const parsed = DeleteRecipeParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "ID inválido" });

  await db.delete(recipesTable).where(eq(recipesTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
