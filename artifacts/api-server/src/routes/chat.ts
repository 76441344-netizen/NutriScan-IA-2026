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
        userContext = `El usuario tiene ${user.ninos} niño(s) de edades: ${user.edades || "no especificado"}, ${user.integrantes} integrantes en la familia, presupuesto ${user.presupuesto} y puede cocinar en ${user.tiempo_cocina} minutos.`;
      }
    } catch {}
  }

  const systemPrompt = `Eres Chef IA, un asistente nutricional experto y amigable de NutriScan IA. Tu especialidad es la alimentación saludable infantil y la prevención de anemia en niños latinoamericanos.

${userContext}

Puedes ayudar con:
- Recetas económicas y nutritivas personalizadas
- Menús semanales para familias
- Prevención y tratamiento de la anemia infantil
- Alimentos ricos en hierro, vitaminas y minerales
- Consejos de alimentación infantil
- Recomendaciones nutricionales adaptadas al presupuesto

Responde siempre en español, de forma clara, cálida y práctica. Usa emojis ocasionalmente para hacer la respuesta más amigable. Cuando sugiereas recetas, incluye ingredientes y pasos básicos.`;

  const messages = [
    ...(history || []).slice(-8),
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
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content ?? "Lo siento, no pude procesar tu consulta.";
    return res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Chat Groq error");
    return res.status(500).json({ error: "Error al procesar la consulta" });
  }
});

export default router;
