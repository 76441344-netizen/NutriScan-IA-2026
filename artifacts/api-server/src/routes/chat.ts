import { Router } from "express";
import Groq from "groq-sdk";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/chat", async (req, res) => {
  const { userId, message, history } = req.body as {
    userId?: number;
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Mensaje requerido" });
  }

  let userContext = "";
  if (userId) {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (user) {
        userContext = `\nPerfil familiar del usuario: ${user.ninos} niño(s) de edades ${user.edades || "no especificado"}, ${user.integrantes} integrantes, presupuesto ${user.presupuesto}, tiempo disponible ${user.tiempo_cocina} minutos.`;
      }
    } catch {}
  }

  const systemPrompt = `Eres Chef IA, el nutricionista virtual familiar de NutriScan IA. Eres experto, cálido, empático y accesible — hablas como un amigo que entiende de nutrición infantil.
${userContext}

## Tu especialidad:
- Alimentación saludable para niños y familias
- Prevención y tratamiento de anemia infantil  
- Recetas económicas y nutritivas adaptadas al presupuesto peruano
- Alimentos ricos en hierro: sangrecita, hígado, lentejas, quinoa, espinacas, frijoles
- Vitaminas, minerales y combinaciones que potencian la absorción del hierro
- Menús semanales variados y balanceados
- Loncheras nutritivas para escolares
- Hábitos alimenticios saludables para toda la familia

## Cómo responder:
- Usa formato estructurado: **títulos en negrita**, listas con viñetas, emojis ocasionales
- Cuando des recetas incluye: nombre, tiempo, porciones, ingredientes y pasos
- Para preguntas sobre anemia: explica síntomas, causas, alimentos recomendados
- Da alternativas económicas cuando sea posible
- Sé específico con cantidades y proporciones
- Si el usuario tiene errores de escritura o de ortografía, entiende lo que quiere decir
- Mantén el contexto de la conversación para dar respuestas coherentes
- Responde SIEMPRE en español, de forma clara y comprensible para madres con cualquier nivel educativo
- Termina con un consejo práctico o pregunta de seguimiento cuando sea relevante`;

  const messages = [
    ...(history || []).slice(-10),
    { role: "user" as const, content: message },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content ?? "Lo siento, no pude procesar tu consulta. Por favor intenta de nuevo.";
    return res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Chat Groq error");
    return res.status(500).json({ error: "Error al procesar la consulta" });
  }
});

export default router;
