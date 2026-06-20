import { Router } from "express";
import { db, recipesTable, usersTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
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

/** Remove literal control characters that break JSON.parse */
function sanitizeJson(raw: string): string {
  // Replace unescaped control chars (newlines, tabs, etc.) inside the raw JSON string
  // JSON strings must have these escaped; the AI sometimes forgets
  return raw.replace(/[\u0000-\u001F\u007F]/g, (ch) => {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    if (ch === "\b") return "\\b";
    if (ch === "\f") return "\\f";
    return "";
  });
}

/** Attempt to parse JSON, retrying with sanitisation if needed */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(sanitizeJson(raw));
  }
}

router.post("/recipes/generate", async (req, res) => {
  const parsed = GenerateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.issues });
  }

  const { userId, ingredientes } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const prompt = `Eres un nutricionista experto en alimentación infantil y prevención de anemia en niños peruanos.

Contexto familiar: ${user.ninos} niño(s) de edades ${user.edades || "no especificado"}. Familia de ${user.integrantes} integrantes, presupuesto ${user.presupuesto}, tiempo para cocinar: ${user.tiempo_cocina} minutos.

Ingredientes disponibles: ${ingredientes}

Genera UNA receta saludable y nutritiva que prevenga la anemia infantil. Si los ingredientes no tienen hierro, agrégalo con pequeñas adiciones (limón, espinaca, etc.).

REGLAS IMPORTANTES para el JSON:
- Usa EXACTAMENTE este formato
- Para listas de ingredientes y pasos: separa cada item con el texto literal "\\n" (no saltos de línea reales)
- No uses comillas dentro de los valores de texto
- No pongas texto fuera del JSON

Responde ÚNICAMENTE con este JSON (sin markdown, sin texto antes ni después):
{"nombre":"Nombre de la receta","porciones":"4 porciones","dificultad":"Fácil","ingredientes":"- 200g espinaca\\n- 1 taza lentejas\\n- 2 huevos","pasos":"1. Lava las verduras.\\n2. Cocina las lentejas 20 min.\\n3. Sirve caliente.","tiempo_preparacion":"30 minutos","calorias":"350 kcal","proteinas":"18g","carbohidratos":"42g","grasas":"8g","beneficios":"Texto de beneficios nutricionales","prevencion_anemia":"Cómo previene la anemia","recomendacion_ninos":"Consejo para presentar a los niños"}

Para dificultad usa: Fácil, Media o Avanzada.`;

  let recipeData: {
    nombre: string;
    porciones: string;
    dificultad: string;
    ingredientes: string;
    pasos: string;
    tiempo_preparacion: string;
    calorias: string;
    proteinas: string;
    carbohidratos: string;
    grasas: string;
    beneficios: string;
    prevencion_anemia: string;
    recomendacion_ninos: string;
  };

  // Try up to 2 times to get a valid JSON response
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Eres un asistente que responde ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown, sin saltos de línea literales dentro de strings. Usa \\n para indicar nueva línea dentro de strings.",
          },
          { role: "user", content: prompt },
        ],
        temperature: attempt === 1 ? 0.5 : 0.2,
        max_tokens: 1200,
      });

      const content = completion.choices[0]?.message?.content ?? "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      recipeData = parseJson(jsonMatch[0]) as typeof recipeData;
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      req.log.warn({ err, attempt }, "Recipe JSON parse attempt failed, retrying");
    }
  }

  if (lastError) {
    req.log.error({ err: lastError }, "Groq API error");
    return res.status(500).json({ error: "Error al generar la receta. Por favor intenta de nuevo." });
  }

  const [recipe] = await db.insert(recipesTable).values({
    userId,
    nombre: recipeData!.nombre,
    ingredientes: recipeData!.ingredientes,
    pasos: recipeData!.pasos,
    tiempo_preparacion: recipeData!.tiempo_preparacion,
    beneficios: recipeData!.beneficios,
    prevencion_anemia: recipeData!.prevencion_anemia,
    ingredientesUsados: ingredientes,
    porciones: recipeData!.porciones,
    dificultad: recipeData!.dificultad,
    calorias: recipeData!.calorias,
    proteinas: recipeData!.proteinas,
    carbohidratos: recipeData!.carbohidratos,
    grasas: recipeData!.grasas,
    recomendacion_ninos: recipeData!.recomendacion_ninos,
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
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [all, monthly] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(recipesTable).where(eq(recipesTable.userId, userId)),
    db.select({ count: sql<number>`count(*)` })
      .from(recipesTable).where(
        and(eq(recipesTable.userId, userId), gte(recipesTable.createdAt, firstOfMonth)),
      ),
  ]);

  const topRows = await db.select({ ingredientesUsados: recipesTable.ingredientesUsados })
    .from(recipesTable).where(eq(recipesTable.userId, userId));

  const ingredientCount: Record<string, number> = {};
  topRows.forEach(r => {
    r.ingredientesUsados.split(",").map(i => i.trim().toLowerCase()).forEach(ing => {
      if (ing) ingredientCount[ing] = (ingredientCount[ing] || 0) + 1;
    });
  });
  const topIngredient = Object.entries(ingredientCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return res.json({
    totalRecipes: Number(all[0]?.count ?? 0),
    thisMonth: Number(monthly[0]?.count ?? 0),
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
