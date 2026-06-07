import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Trophy, Star, Zap, Target, CheckCircle2, Lock, Award } from "lucide-react";
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
}

const RETOS_BASE: Omit<Reto, "completado" | "progreso">[] = [
  { id: "r1", titulo: "Rey del Hierro", descripcion: "Cocina 5 recetas ricas en hierro esta semana", puntos: 100, icono: "🥩", categoria: "Nutrición", duracion: "7 días", meta: 5 },
  { id: "r2", titulo: "Hidratación Familiar", descripcion: "Registra el consumo de agua por 3 días", puntos: 50, icono: "💧", categoria: "Salud", duracion: "3 días", meta: 3 },
  { id: "r3", titulo: "Frutero Estrella", descripcion: "Incluye frutas en las comidas por 5 días seguidos", puntos: 75, icono: "🍎", categoria: "Nutrición", duracion: "5 días", meta: 5 },
  { id: "r4", titulo: "Chef Saludable", descripcion: "Prepara 3 recetas nuevas generadas con IA", puntos: 150, icono: "👨‍🍳", categoria: "Recetas", duracion: "14 días", meta: 3 },
  { id: "r5", titulo: "Planner Maestro", descripcion: "Completa un menú semanal en el planner", puntos: 80, icono: "📅", categoria: "Planificación", duracion: "7 días", meta: 1 },
  { id: "r6", titulo: "Verduras Diarias", descripcion: "Consume verduras verdes por 7 días", puntos: 120, icono: "🥬", categoria: "Nutrición", duracion: "7 días", meta: 7 },
  { id: "r7", titulo: "Anti-Anemia Pro", descripcion: "Sigue el plan anti-anemia por 2 semanas", puntos: 200, icono: "💪", categoria: "Salud", duracion: "14 días", meta: 14 },
  { id: "r8", titulo: "Fotógrafo Nutricionista", descripcion: "Escanea 5 ingredientes con Nutri-Foto", puntos: 60, icono: "📸", categoria: "Tecnología", duracion: "Sin límite", meta: 5 },
  { id: "r9", titulo: "Compras Inteligentes", descripcion: "Usa el mercado inteligente 3 veces", puntos: 70, icono: "🛒", categoria: "Planificación", duracion: "30 días", meta: 3 },
];

const NIVELES = [
  { nombre: "Principiante", puntos: 0, color: "text-gray-500", bg: "bg-gray-100" },
  { nombre: "Aprendiz", puntos: 100, color: "text-green-600", bg: "bg-green-100" },
  { nombre: "Nutricionista Jr.", puntos: 300, color: "text-blue-600", bg: "bg-blue-100" },
  { nombre: "Chef Saludable", puntos: 600, color: "text-purple-600", bg: "bg-purple-100" },
  { nombre: "Maestro Nutri", puntos: 1000, color: "text-amber-600", bg: "bg-amber-100" },
  { nombre: "Experto Anti-Anemia", puntos: 1500, color: "text-red-600", bg: "bg-red-100" },
];

function getNivel(puntos: number) {
  let nivel = NIVELES[0];
  for (const n of NIVELES) {
    if (puntos >= n.puntos) nivel = n;
  }
  return nivel;
}

function getNextNivel(puntos: number) {
  for (const n of NIVELES) {
    if (puntos < n.puntos) return n;
  }
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
      setRetos(data.retos);
      setTotalPuntos(data.puntos || 0);
    } else {
      const initial = RETOS_BASE.map((r) => ({ ...r, completado: false, progreso: 0 }));
      setRetos(initial);
    }
  }, [userId]);

  const save = (newRetos: Reto[], puntos: number) => {
    setRetos(newRetos);
    setTotalPuntos(puntos);
    localStorage.setItem(storageKey, JSON.stringify({ retos: newRetos, puntos }));
  };

  const avanzar = (id: string) => {
    const updated = retos.map((r) => {
      if (r.id !== id || r.completado) return r;
      const newProgreso = Math.min(r.progreso + 1, r.meta);
      const completado = newProgreso >= r.meta;
      if (completado && !r.completado) {
        toast({
          title: `🏆 ¡Reto completado!`,
          description: `${r.titulo} — +${r.puntos} puntos ganados`,
        });
      }
      return { ...r, progreso: newProgreso, completado };
    });
    const newPuntos = updated.filter((r) => r.completado).reduce((s, r) => s + r.puntos, 0);
    save(updated, newPuntos);
  };

  const reset = (id: string) => {
    const updated = retos.map((r) => r.id === id ? { ...r, progreso: 0, completado: false } : r);
    const newPuntos = updated.filter((r) => r.completado).reduce((s, r) => s + r.puntos, 0);
    save(updated, newPuntos);
  };

  const nivel = getNivel(totalPuntos);
  const nextNivel = getNextNivel(totalPuntos);
  const progresNivel = nextNivel
    ? Math.round(((totalPuntos - nivel.puntos) / (nextNivel.puntos - nivel.puntos)) * 100)
    : 100;

  const activos = retos.filter((r) => !r.completado);
  const completados = retos.filter((r) => r.completado);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-8 px-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Retos Familiares</h1>
              <p className="text-white/80 text-sm">Gana puntos con hábitos saludables</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-sm font-semibold">Puntos totales</span>
              </div>
              <p className="text-3xl font-bold">{totalPuntos}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold">Nivel actual</span>
              </div>
              <p className="text-lg font-bold">{nivel.nombre}</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Retos completados</span>
              </div>
              <p className="text-3xl font-bold">{completados.length}</p>
            </div>
          </div>

          {nextNivel && (
            <div className="mt-4 bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso al siguiente nivel: <strong>{nextNivel.nombre}</strong></span>
                <span>{totalPuntos}/{nextNivel.puntos} pts</span>
              </div>
              <Progress value={progresNivel} className="h-2 bg-white/30" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            variant={tab === "activos" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("activos")}
          >
            Activos ({activos.length})
          </Button>
          <Button
            variant={tab === "completados" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("completados")}
          >
            Completados ({completados.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tab === "activos" ? activos : completados).map((reto) => (
            <div
              key={reto.id}
              className={`bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all ${
                reto.completado ? "border-green-200 bg-green-50" : "border-border hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{reto.icono}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    +{reto.puntos} pts
                  </span>
                  <span className="text-[10px] text-muted-foreground">{reto.duracion}</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-bold text-foreground">{reto.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{reto.descripcion}</p>
              </div>

              {!reto.completado && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso</span>
                    <span>{reto.progreso}/{reto.meta}</span>
                  </div>
                  <Progress value={(reto.progreso / reto.meta) * 100} className="h-2" />
                </div>
              )}

              <div className="mt-auto">
                {reto.completado ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      ¡Completado!
                    </div>
                    <button onClick={() => reset(reto.id)} className="text-xs text-muted-foreground hover:text-primary">
                      Reiniciar
                    </button>
                  </div>
                ) : (
                  <Button size="sm" className="w-full gap-2" onClick={() => avanzar(reto.id)}>
                    <Zap className="h-3.5 w-3.5" />
                    Registrar progreso
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
