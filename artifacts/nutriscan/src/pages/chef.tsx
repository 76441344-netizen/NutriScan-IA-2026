import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Loader2, Lightbulb } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHIPS = [
  { emoji: "🥩", label: "Hierro", query: "¿Qué alimentos son ricos en hierro para niños?" },
  { emoji: "🍲", label: "Recetas", query: "Dame una receta económica y nutritiva anti-anemia" },
  { emoji: "👶", label: "Alimentación", query: "¿Cómo debe alimentarse un niño de 2 a 5 años?" },
  { emoji: "📅", label: "Menú semanal", query: "Genera un menú semanal saludable para 4 personas con niños" },
  { emoji: "🍎", label: "Frutas", query: "¿Qué frutas son más beneficiosas para niños con anemia?" },
  { emoji: "🥬", label: "Verduras", query: "¿Cuáles son las mejores verduras para prevenir la anemia?" },
  { emoji: "💊", label: "Vitaminas", query: "¿Qué vitaminas necesitan los niños en edad escolar?" },
  { emoji: "🤰", label: "Embarazo", query: "¿Qué debe comer una mujer embarazada para evitar la anemia?" },
];

const DAILY_TIPS = [
  { icon: "🩸", title: "Hierro + Vitamina C", tip: "Combina alimentos con hierro (lentejas, espinacas) con vitamina C (limón, naranja) para triplicar la absorción." },
  { icon: "🥩", title: "Sangrecita = Superfood", tip: "La sangrecita de pollo tiene 10 veces más hierro que la carne de res. Es el alimento anti-anemia más potente." },
  { icon: "🌾", title: "Quinoa para niños", tip: "La quinoa contiene todos los aminoácidos esenciales. Ideal para el crecimiento de niños de 6 meses en adelante." },
  { icon: "🥚", title: "Huevo completo", tip: "Un huevo al día aporta proteínas de alta calidad, hierro, zinc y vitamina B12 para el desarrollo cerebral." },
  { icon: "🍋", title: "Limón aliado", tip: "Agregar jugo de limón a tus guisos aumenta la absorción del hierro no-hemo hasta un 67%." },
];

function formatMessage(content: string) {
  const lines = content.split("\n");
  const result: { type: "text" | "bullet"; content: string }[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.match(/^\d+\.\s/)) {
      result.push({ type: "bullet", content: trimmed.replace(/^[-•]\s|^\d+\.\s/, "") });
    } else {
      result.push({ type: "text", content: trimmed });
    }
  }
  return result;
}

export default function Chef() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! 👋 Soy Chef IA, tu asistente nutricional personal. Puedo ayudarte con recetas saludables, menús semanales, consejos para prevenir la anemia en niños y mucho más. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const dayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text, history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Lo siento, ocurrió un error." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Por favor intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)]">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-primary-foreground py-5 px-4">
        <div className="max-w-screen-md mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold">Chef IA</h1>
            <p className="text-white/80 text-sm">Asistente nutricional inteligente 24/7</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-white/20 text-xs font-bold px-3 py-1.5 rounded-full">
            <Sparkles className="h-3 w-3" />
            IA activa
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-screen-md mx-auto flex items-start gap-3">
          <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
            <Lightbulb className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800">{dayTip.icon} Consejo Nutricional del Día — {dayTip.title}</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{dayTip.tip}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-1 max-w-screen-md mx-auto w-full">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Preguntas rápidas:</p>
        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.query)}
              disabled={loading}
              className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 max-w-screen-md mx-auto w-full space-y-4">
        {messages.map((msg, i) => {
          const formatted = formatMessage(msg.content);
          return (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="bg-violet-100 p-2 rounded-full h-fit mt-1 shrink-0">
                  <Bot className="h-3.5 w-3.5 text-violet-600" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[82%] text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-white border border-border text-foreground rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="space-y-1.5">
                    {formatted.map((part, j) =>
                      part.type === "bullet" ? (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span>{part.content}</span>
                        </div>
                      ) : (
                        <p key={j}>{part.content}</p>
                      )
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="bg-muted p-2 rounded-full h-fit mt-1 shrink-0">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="bg-violet-100 p-2 rounded-full h-fit shrink-0">
              <Bot className="h-3.5 w-3.5 text-violet-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-screen-md mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Pregunta sobre nutrición, recetas, anemia..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-xl shrink-0 bg-violet-600 hover:bg-violet-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
