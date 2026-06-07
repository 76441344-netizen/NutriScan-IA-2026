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
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `Eres un experto nutricionista. Analiza esta imagen con mucho detalle e identifica TODOS los ingredientes y alimentos visibles.

Puedes detectar: verduras (espinaca, zanahoria, brócoli, tomate, cebolla, ajo, pimiento, zapallo, betarraga, papa, apio, pepino, lechuga, coliflor), frutas (manzana, plátano, naranja, limón, pera, uvas, papaya, piña, mango), carnes y proteínas (pollo, carne de res, carne molida, pescado, atún, huevo, sangrecita, hígado, cerdo), granos y cereales (arroz, lentejas, quinoa, avena, frijoles, garbanzos, trigo, pan, pasta), lácteos (leche, queso, yogur, mantequilla) y otros alimentos procesados o frescos.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin explicaciones):
{
  "ingredients": ["ingrediente1", "ingrediente2"],
  "confidence": "alta"
}

Sé específico con los nombres. Si ves varios alimentos del mismo tipo, listarlos individualmente. En español siempre.`,
            },
          ],
        },
      ],
      temperature: 0.1,
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
  const { userId, ingredients, imageBase64, mimeType } = req.body as {
    userId: number;
    ingredients: string[];
    imageBase64: string;
    mimeType: string;
  };
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

Contexto familiar: ${user.ninos} niño(s) de edades ${user.edades || "no especificado"}. Familia de ${user.integrantes} integrantes, presupuesto ${user.presupuesto}, tiempo para cocinar: ${user.tiempo_cocina} minutos.

Se detectaron en la imagen los siguientes ingredientes: ${ingredientsList}

Genera UNA receta completa, saludable, nutritiva y apropiada para niños. Prioriza la prevención de anemia infantil.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown):
{
  "nombre": "Nombre atractivo de la receta",
  "porciones": "X porciones",
  "dificultad": "Fácil",
  "ingredientes": "Lista detallada con cantidades exactas, uno por línea",
  "pasos": "Pasos numerados y detallados, uno por línea",
  "tiempo_preparacion": "X minutos",
  "calorias": "XXX kcal por porción",
  "proteinas": "Xg por porción",
  "carbohidratos": "Xg por porción",
  "grasas": "Xg por porción",
  "beneficios": "Beneficios nutricionales principales para niños",
  "nivelHierro": "Medio",
  "prevencion_anemia": "Cómo esta receta ayuda a prevenir la anemia en niños",
  "consejos_absorcion": "Consejos para mejorar la absorción del hierro",
  "recomendacion_ninos": "Cómo presentar esta receta a los niños para que la disfruten"
}

Para dificultad usa: "Fácil", "Media" o "Avanzada". Para nivelHierro usa: "Bajo", "Medio" o "Alto".`;

  type RecipeData = {
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
    nivelHierro: string;
    prevencion_anemia: string;
    consejos_absorcion: string;
    recomendacion_ninos: string;
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
      temperature: 0.6,
      max_tokens: 1500,
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
    porciones: recipeData.porciones,
    dificultad: recipeData.dificultad,
    ingredientesDetectados: ingredients,
    ingredientes: recipeData.ingredientes,
    pasos: recipeData.pasos,
    tiempo_preparacion: recipeData.tiempo_preparacion,
    calorias: recipeData.calorias,
    proteinas: recipeData.proteinas,
    carbohidratos: recipeData.carbohidratos,
    grasas: recipeData.grasas,
    beneficios: recipeData.beneficios,
    nivelHierro: recipeData.nivelHierro,
    prevencion_anemia: recipeData.prevencion_anemia,
    consejos_absorcion: recipeData.consejos_absorcion,
    recomendacion_ninos: recipeData.recomendacion_ninos,
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
