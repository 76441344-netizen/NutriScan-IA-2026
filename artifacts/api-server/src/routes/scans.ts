import { Router } from "express";
import { db, ingredientScansTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/scans/analyze", async (req, res) => {
  const { userId, imageBase64, mimeType } = req.body as { userId: number; imageBase64: string; mimeType: string };
  if (!userId || !imageBase64 || !mimeType) {
    return res.status(400).json({ error: "Faltan campos requeridos: userId, imageBase64, mimeType" });
  }
  if (typeof imageBase64 !== "string" || imageBase64.length < 10) {
    return res.status(400).json({ error: "imageBase64 inválido" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: `Eres un experto en nutrición y alimentación. Analiza esta imagen y detecta todos los ingredientes o alimentos visibles.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "ingredients": ["ingrediente1", "ingrediente2", "ingrediente3"]
}

Lista solo los ingredientes/alimentos que puedas ver claramente. Si no hay alimentos visibles, devuelve una lista vacía. Los nombres deben estar en español.`,
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "No se pudo analizar la imagen" });
    }

    const data = JSON.parse(jsonMatch[0]) as { ingredients: string[] };
    return res.json({ ingredients: Array.isArray(data.ingredients) ? data.ingredients : [] });
  } catch (err) {
    req.log.error({ err }, "Groq vision error");
    return res.status(500).json({ error: "Error al analizar la imagen con IA" });
  }
});

router.post("/scans/generate", async (req, res) => {
  const { userId, ingredients, imageBase64, mimeType } = req.body as { userId: number; ingredients: string[]; imageBase64: string; mimeType: string };
  if (!userId || !ingredients || !imageBase64 || !mimeType) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients debe ser un arreglo no vacío" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const ingredientsList = ingredients.join(", ");

  const prompt = `Eres un nutricionista experto en alimentación infantil y prevención de anemia en niños latinoamericanos.

El usuario es una madre/padre con ${user.ninos} niño(s) de edades: ${user.edades || "no especificado"}. La familia tiene ${user.integrantes} integrantes, presupuesto ${user.presupuesto} y puede dedicar ${user.tiempo_cocina} minutos a cocinar.

Se detectaron los siguientes ingredientes en la imagen: ${ingredientsList}

Genera UNA receta saludable, nutritiva y apropiada para niños. La receta DEBE enfocarse en prevenir la anemia infantil.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones adicionales):
{
  "nombre": "Nombre de la receta",
  "ingredientes": "Lista detallada de ingredientes con cantidades, uno por línea",
  "pasos": "Pasos de preparación numerados, uno por línea",
  "tiempo_preparacion": "X minutos",
  "beneficios": "Beneficios nutricionales principales de la receta para los niños",
  "nivelHierro": "Bajo",
  "prevencion_anemia": "Explicación específica de cómo esta receta ayuda a prevenir la anemia en niños",
  "consejos_absorcion": "Consejos prácticos para mejorar la absorción del hierro al comer esta receta"
}

Para nivelHierro usa exactamente uno de: "Bajo", "Medio" o "Alto" según el contenido de hierro de los ingredientes.`;

  type RecipeData = {
    nombre: string;
    ingredientes: string;
    pasos: string;
    tiempo_preparacion: string;
    beneficios: string;
    nivelHierro: string;
    prevencion_anemia: string;
    consejos_absorcion: string;
  };

  let recipeData: RecipeData;

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    recipeData = JSON.parse(jsonMatch[0]) as RecipeData;
  } catch (err) {
    req.log.error({ err }, "Groq recipe generation error");
    return res.status(500).json({ error: "Error al generar la receta con IA" });
  }

  const [scan] = await db.insert(ingredientScansTable).values({
    userId,
    ingredientesDetectados: ingredientsList,
    nombre: recipeData.nombre,
    nivelHierro: recipeData.nivelHierro,
    recipeData: JSON.stringify(recipeData),
  }).returning();

  return res.json({
    id: scan.id,
    userId: scan.userId,
    nombre: recipeData.nombre,
    ingredientesDetectados: ingredients,
    ingredientes: recipeData.ingredientes,
    pasos: recipeData.pasos,
    tiempo_preparacion: recipeData.tiempo_preparacion,
    beneficios: recipeData.beneficios,
    nivelHierro: recipeData.nivelHierro,
    prevencion_anemia: recipeData.prevencion_anemia,
    consejos_absorcion: recipeData.consejos_absorcion,
    createdAt: scan.createdAt.toISOString(),
  });
});

router.get("/scans", async (req, res) => {
  const userId = Number(req.query.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "userId inválido" });

  const scans = await db.select().from(ingredientScansTable)
    .where(eq(ingredientScansTable.userId, userId))
    .orderBy(sql`${ingredientScansTable.createdAt} DESC`);

  return res.json(scans.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.get("/scans/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const [scan] = await db.select().from(ingredientScansTable).where(eq(ingredientScansTable.id, id));
  if (!scan) return res.status(404).json({ error: "Escaneo no encontrado" });

  return res.json({ ...scan, createdAt: scan.createdAt.toISOString() });
});

router.delete("/scans/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  await db.delete(ingredientScansTable).where(eq(ingredientScansTable.id, id));
  return res.status(204).send();
});

export default router;
