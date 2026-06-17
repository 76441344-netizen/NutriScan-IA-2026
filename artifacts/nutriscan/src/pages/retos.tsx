import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Trophy, Star, Zap, CheckCircle2, Award, Flame, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Reto {
  id: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  icono: string;
  categoria: string;
  duracion: string;
  completado: boolean;
  progreso: number;
  meta: number;
  accionLabel?: string;
  unlocksAt?: number;
}

const RETOS_BASE: Omit<Reto, "completado" | "progreso">[] = [
  { id: "r1", titulo: "Rey del Hierro", descripcion: "Cocina 5 recetas ricas en hierro esta semana", puntos: 100, icono: "🥩", categoria: "Nutrición", duracion: "7 días", meta: 5, accionLabel: "Registrar receta con hierro" },
  { id: "r2", titulo: "Hidratación Familiar", descripcion: "Registra el consumo de agua por 3 días seguidos", puntos: 50, icono: "💧", categoria: "Salud", duracion: "3 días", meta: 3, accionLabel: "Registrar día de hidratación" },
  { id: "r3", titulo: "Frutero Estrella", descripcion: "Incluye frutas en las comidas por 5 días seguidos", puntos: 75, icono: "🍎", categoria: "Nutrición", duracion: "5 días", meta: 5, accionLabel: "Registrar frutas del día" },
  { id: "r4", titulo: "Chef Saludable", descripcion: "Prepara 3 recetas nuevas generadas con IA", puntos: 150, icono: "👨‍🍳", categoria: "Recetas", duracion: "14 días", meta: 3, accionLabel: "Registrar receta preparada" },
  { id: "r5", titulo: "Planner Maestro", descripcion: "Completa un menú semanal completo en el planner", puntos: 80, icono: "📅", categoria: "Planificación", duracion: "7 días", meta: 1, accionLabel: "Marcar menú completado" },
  { id: "r6", titulo: "Verduras Diarias", descripcion: "Consume verduras verdes por 7 días consecutivos", puntos: 120, icono: "🥬", categoria: "Nutrición", duracion: "7 días", meta: 7, accionLabel: "Registrar verduras del día" },
  { id: "r7", titulo: "Anti-Anemia Pro", descripcion: "Sigue el plan anti-anemia por 2 semanas completas", puntos: 200, icono: "💪", categoria: "Salud", duracion: "14 días", meta: 14, accionLabel: "Registrar día anti-anemia" },
  { id: "r8", titulo: "Fotógrafo Nutricionista", descripcion: "Escanea 5 ingredientes con Nutri-Foto IA", puntos: 60, icono: "📸", categoria: "Tecnología", duracion: "Sin límite", meta: 5, accionLabel: "Registrar escaneo realizado" },
  { id: "r9", titulo: "Compras Inteligentes", descripcion: "Usa el mercado inteligente 3 veces para planificar", puntos: 70, icono: "🛒", categoria: "Planificación", duracion: "30 días", meta: 3, accionLabel: "Registrar compra completada" },
  { id: "r10", titulo: "Cena Sin Pantallas", descripcion: "Comparte la cena en familia sin celulares, televisión ni tablets durante 5 días.", puntos: 75, icono: "🍽️", categoria: "Familia", duracion: "5 días", meta: 5, accionLabel: "Registrar cena completada" },
  { id: "r11", titulo: "Cero Desperdicio", descripcion: "Evita desperdiciar alimentos y aprovecha todos los ingredientes durante 7 días.", puntos: 100, icono: "♻️", categoria: "Sostenibilidad", duracion: "7 días", meta: 7, accionLabel: "Hoy no desperdiciamos comida" },
];

const NIVELES = [
  { nombre: "Principiante", puntos: 0, medalla: "🥉", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { nombre: "Aprendiz", puntos: 100, medalla: "🥈", color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
  { nombre: "Nutricionista Jr.", puntos: 300, medalla: "🥇", color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
  { nombre: "Chef Saludable", puntos: 600, medalla: "🏆", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { nombre: "Maestro Nutri", puntos: 1000, medalla: "⭐", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  { nombre: "Experto Anti-Anemia", puntos: 1500, medalla: "🌟", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

const CATEGORIA_COLORS: Record<string, string> = {
  "Nutrición": "bg-green-100 text-green-700",
  "Salud": "bg-blue-100 text-blue-700",
  "Recetas": "bg-orange-100 text-orange-700",
  "Planificación": "bg-purple-100 text-purple-700",
  "Tecnología": "bg-cyan-100 text-cyan-700",
  "Familia": "bg-pink-100 text-pink-700",
  "Sostenibilidad": "bg-lime-100 text-lime-700",
};

function getNivel(puntos: number) {
  let nivel = NIVELES[0];
  for (const n of NIVELES) { if (puntos >= n.puntos) nivel = n; }
  return nivel;
}

function getNextNivel(puntos: number) {
  for (const n of NIVELES) { if (puntos < n.puntos) return n; }
  return null;
}

export default function Retos() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [retos, setRetos] = useState<Reto[]>([]);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [tab, setTab] = useState<"activos" | "completados">("activos");

  const storageKey = `retos_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      const savedRetos: Reto[] = data.retos || [];
      const merged = RETOS_BASE.map((base) => {
        const found = savedRetos.find((r) => r.id === base.id);
        return found
          ? { ...base, completado: found.completado, progreso: found.progreso }
          : { ...base, completado: false, progreso: 0 };
      });
      setRetos(merged);
      setTotalPuntos(data.puntos || 0);
    } else {
      setRetos(RETOS_BASE.map((r) => ({ ...r, completado: false, progreso: 0 })));
    }
  }, [userId]);

  const saveFn = (newRetos: Reto[], puntos: number) => {
    setRetos(newRetos);
    setTotalPuntos(puntos);
    localStorage.setItem(storageKey, JSON.stringify({ retos: newRetos, puntos }));
  };

  const avanzar = (id: string) => {
    const updated = retos.map((r) => {
      if (r.id !== id || r.completado) return r;
      const newProgreso = Math.min(r.progreso + 1, r.meta);
      const completado = newProgreso >= r.meta;
      if (completado) {
        toast({
          title: `🏆 ¡Reto completado!`,
          description: `${r.titulo} — ¡Ganaste ${r.puntos} puntos! ✨`,
        });
      } else {
        toast({ title: "✅ Progreso registrado", description: `${r.titulo}: ${newProgreso}/${r.meta}` });
      }
      return { ...r, progreso: newProgreso, completado };
    });
    const newPuntos = updated.filter((r) => r.completado).reduce((s, r) => s + r.puntos, 0);
    saveFn(updated, newPuntos);
  };

  const reset = (id: string) => {
    const updated = retos.map((r) => r.id === id ? { ...r, progreso: 0, completado: false } : r);
    const newPuntos = updated.filter((r) => r.completado).reduce((s, r) => s + r.puntos, 0);
    saveFn(updated, newPuntos);
    toast({ title: "Reto reiniciado", description: "Puedes empezar de nuevo 💪" });
  };

  const nivel = getNivel(totalPuntos);
  const nextNivel = getNextNivel(totalPuntos);
  const progresNivel = nextNivel
    ? Math.round(((totalPuntos - nivel.puntos) / (nextNivel.puntos - nivel.puntos)) * 100)
    : 100;

  const activos = retos.filter((r) => !r.completado);
  const completados = retos.filter((r) => r.completado);
  const shown = tab === "activos" ? activos : completados;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-8 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Retos Familiares</h1>
              <p className="text-white/80 text-sm">Gana puntos con hábitos saludables 💪</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur text-center">
              <p className="text-3xl font-bold">{totalPuntos}</p>
              <p className="text-xs text-white/80 mt-0.5 flex items-center justify-center gap-1"><Star className="h-3 w-3" /> Puntos</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur text-center">
              <p className="text-xl font-bold">{nivel.medalla}</p>
              <p className="text-xs font-semibold mt-0.5">{nivel.nombre}</p>
              <p className="text-[10px] text-white/70">Nivel actual</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur text-center">
              <p className="text-3xl font-bold">{completados.length}</p>
              <p className="text-xs text-white/80 mt-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completados</p>
            </div>
          </div>

          {nextNivel && (
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" /> Próximo nivel: <strong>{nextNivel.nombre}</strong></span>
                <span>{totalPuntos}/{nextNivel.puntos} pts</span>
              </div>
              <Progress value={progresNivel} className="h-3 bg-white/30" />
              <p className="text-xs text-white/70 mt-1.5">Faltan {nextNivel.puntos - totalPuntos} puntos para subir de nivel</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            variant={tab === "activos" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setTab("activos")}
          >
            🎯 Activos ({activos.length})
          </Button>
          <Button
            variant={tab === "completados" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setTab("completados")}
          >
            ✅ Completados ({completados.length})
          </Button>
        </div>

        {shown.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">{tab === "activos" ? "🎉" : "🔒"}</p>
            <p className="font-semibold text-foreground">
              {tab === "activos" ? "¡Has completado todos los retos!" : "Aún no has completado ningún reto"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "activos" ? "¡Eres una familia increíble!" : "Empieza uno de los retos activos 💪"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((reto) => (
            <div
              key={reto.id}
              className={`bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md ${
                reto.completado ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{reto.icono}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    +{reto.puntos} pts
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORIA_COLORS[reto.categoria] || "bg-gray-100 text-gray-700"}`}>
                    {reto.categoria}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-foreground">{reto.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{reto.descripcion}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <span>⏱</span> {reto.duracion}
                </p>
              </div>

              {!reto.completado && (
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="text-foreground">{reto.progreso}/{reto.meta}</span>
                  </div>
                  <Progress value={(reto.progreso / reto.meta) * 100} className="h-2.5 rounded-full" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {reto.meta - reto.progreso} {reto.meta - reto.progreso === 1 ? "paso más" : "pasos más"} para completar
                  </p>
                </div>
              )}

              <div className="mt-auto">
                {reto.completado ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                      ¡Completado! 🎉
                    </div>
                    <button
                      onClick={() => reset(reto.id)}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reiniciar
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full gap-2 rounded-xl"
                    onClick={() => avanzar(reto.id)}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {reto.accionLabel || "Registrar progreso"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">¡Cada reto cuenta! 🌟</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Completar retos mejora los hábitos alimenticios de tu familia. ¡Pequeños pasos, grandes cambios!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
