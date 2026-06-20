import { Router } from "express";
import { db, ingredientScansTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import Groq from "groq-sdk";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function sanitizeJson(raw: string): string {
  return raw.replace(/[\u0000-\u001F\u007F]/g, (ch) => {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    if (ch === "\b") return "\\b";
    if (ch === "\f") return "\\f";
    return "";
  });
}
function parseJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return JSON.parse(sanitizeJson(raw)); }
}

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
              text: `Eres un experto nutricionista y analista visual de alimentos. Analiza esta imagen con máximo detalle e identifica TODOS los alimentos, ingredientes y platos visibles.

Puedes detectar:
- Frutas y verduras frescas (manzana, naranja, plátano, zanahoria, espinaca, brócoli, tomate, pepino, lechuga, zapallo, betarraga, yuca, etc.)
- Carnes y proteínas (pollo, carne de res, pescado, atún, huevo, sangrecita, hígado, cerdo, pavo, etc.)
- Granos y cereales (arroz, quinoa, avena, lentejas, frijoles, garbanzos, kiwicha, trigo, pasta, pan, etc.)
- Lácteos (leche, queso, yogur, mantequilla, etc.)
- Platos preparados peruanos (ceviche, arroz con leche, lomo saltado, ají de gallina, causa, etc.)
- Bebidas (jugos naturales, chicha, leche, agua, etc.)
- Snacks y procesados (galletas, papas fritas, golosinas, etc.)
- Condimentos y hierbas (perejil, cilantro, ajo, cebolla, etc.)

IMPORTANTE:
- Si ves un plato preparado, identifica sus componentes principales.
- Si la imagen no es clara, proporciona una estimación con menor confianza.
- NUNCA respondas que no puedes ver nada — siempre da al menos 1 alimento estimado.
- Si la imagen es de mala calidad, di qué crees ver con menor confianza.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin explicaciones):
{
  "ingredients": ["ingrediente1", "ingrediente2", "ingrediente3"],
  "confidence": "alta",
  "plato_completo": "Nombre del plato si es uno preparado o null",
  "notas": "Observación breve si la imagen no es clara"
}

Sé específico y en español siempre. Máximo 12 ingredientes.`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // Fallback: try to extract ingredients from plain text
      req.log.warn({ content }, "No JSON from vision, trying text extraction");
      return res.json({ ingredients: ["alimento no identificado"], confidence: "baja", notas: "No se pudo analizar con claridad" });
    }

    const data = parseJson(jsonMatch[0]) as { ingredients: string[]; confidence?: string; plato_completo?: string; notas?: string };
    const ingredients = Array.isArray(data.ingredients) && data.ingredients.length > 0
      ? data.ingredients
      : ["alimento detectado"];

    return res.json({
      ingredients,
      confidence: data.confidence || "media",
      plato_completo: data.plato_completo || null,
      notas: data.notas || null,
    });
  } catch (err) {
    req.log.error({ err }, "Groq vision error");
    // Return a graceful fallback instead of 500
    return res.json({
      ingredients: [],
      confidence: "baja",
      notas: "No se pudo analizar la imagen. Intenta con una foto más clara y bien iluminada.",
      error: true,
    });
  }
});

router.post("/scans/generate", async (req, res) => {
  const { userId, ingredients, imageBase64, mimeType, plato_completo } = req.body as {
    userId: number;
    ingredients: string[];
    imageBase64: string;
    mimeType: string;
    plato_completo?: string;
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
  const platoCtx = plato_completo ? `\nSe detectó que podría ser un plato completo: "${plato_completo}". Ten esto en cuenta.` : "";

  const prompt = `Eres un nutricionista experto en alimentación infantil y prevención de anemia en niños latinoamericanos, especialmente peruanos.

Contexto familiar: ${user.ninos} niño(s) de edades ${user.edades || "no especificado"}. Familia de ${user.integrantes} integrantes, presupuesto ${user.presupuesto}, tiempo para cocinar: ${user.tiempo_cocina} minutos.

Se detectaron en la imagen los siguientes ingredientes: ${ingredientsList}${platoCtx}

TAREA: Genera UNA receta completa, saludable, nutritiva y apropiada para niños. Prioriza la prevención de anemia infantil con ingredientes ricos en hierro y vitamina C.

Incluye estimaciones nutricionales REALES y específicas (no aproximadas). Si el plato contiene ingredientes ricos en hierro (espinaca, lentejas, sangrecita, hígado, quinoa, etc.), indícalo con nivelHierro "Alto".

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin explicaciones previas):
{
  "nombre": "Nombre atractivo y apetitoso de la receta",
  "porciones": "X porciones",
  "dificultad": "Fácil",
  "ingredientes": "- 200g ingrediente1\\n- 1 taza ingrediente2\\n- Al gusto ingrediente3",
  "pasos": "1. Primer paso detallado.\\n2. Segundo paso.\\n3. Tercer paso.",
  "tiempo_preparacion": "X minutos",
  "calorias": "XXX kcal",
  "proteinas": "Xg",
  "carbohidratos": "Xg",
  "grasas": "Xg",
  "azucar": "Xg",
  "sodio": "XXmg",
  "fibra": "Xg",
  "porcion_estimada": "mediana",
  "beneficios": "Beneficios nutricionales principales y concretos para niños",
  "nivelHierro": "Medio",
  "prevencion_anemia": "Cómo esta receta específicamente ayuda a prevenir la anemia",
  "consejos_absorcion": "Consejo práctico para mejorar la absorción del hierro (ej: acompañar con limón)",
  "recomendacion_ninos": "Cómo presentar esta receta a los niños para que la disfruten y la quieran comer",
  "nivel_nutricional": "bueno",
  "recomendacion_ia": "Recomendación personalizada breve para mejorar este plato nutricionalmente"
}

Para dificultad usa: "Fácil", "Media" o "Avanzada".
Para nivelHierro usa: "Bajo", "Medio" o "Alto".
Para porcion_estimada usa: "pequeña", "mediana" o "grande".
Para nivel_nutricional usa: "excelente", "bueno", "regular" o "mejorable".`;

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
    azucar?: string;
    sodio?: string;
    fibra?: string;
    porcion_estimada?: string;
    beneficios: string;
    nivelHierro: string;
    prevencion_anemia: string;
    consejos_absorcion: string;
    recomendacion_ninos: string;
    nivel_nutricional?: string;
    recomendacion_ia?: string;
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
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    recipeData = parseJson(jsonMatch[0]) as RecipeData;
  } catch (err) {
    req.log.error({ err }, "Groq recipe generation error");
    return res.status(500).json({ error: "Error al generar la receta con IA. Intenta de nuevo." });
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
    azucar: recipeData.azucar,
    sodio: recipeData.sodio,
    fibra: recipeData.fibra,
    porcion_estimada: recipeData.porcion_estimada,
    beneficios: recipeData.beneficios,
    nivelHierro: recipeData.nivelHierro,
    prevencion_anemia: recipeData.prevencion_anemia,
    consejos_absorcion: recipeData.consejos_absorcion,
    recomendacion_ninos: recipeData.recomendacion_ninos,
    nivel_nutricional: recipeData.nivel_nutricional,
    recomendacion_ia: recipeData.recomendacion_ia,
    createdAt: scan.createdAt.toISOString(),
  });
});

router.get("/scans", async (req, res) => {
  const userId = Number(req.query.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "userId inválido" });

  const scans = await db.select().from(ingredientScansTable)
    .where(eq(ingredientScansTable.userId, userId))
    .orderBy(sql`${ingredientScansTable.createdAt} DESC`);

  return res.json(scans.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })));
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
