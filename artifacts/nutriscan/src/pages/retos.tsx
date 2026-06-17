import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Trophy, Star, Zap, CheckCircle2, Award, Flame, RotateCcw, Plus, Sparkles } from "lucide-react";
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
  accionLabel: string;
}

type RetoTemplate = Omit<Reto, "completado" | "progreso" | "id">;

// Pool infinita de retos — organizada por dificultad
const RETO_POOL: RetoTemplate[] = [
  // Básicos (bajo)
  { titulo: "Rey del Hierro", descripcion: "Cocina 5 recetas ricas en hierro esta semana", puntos: 100, icono: "🥩", categoria: "Nutrición", duracion: "7 días", meta: 5, accionLabel: "Registrar receta con hierro" },
  { titulo: "Hidratación Familiar", descripcion: "Registra el consumo de agua por 3 días seguidos", puntos: 50, icono: "💧", categoria: "Salud", duracion: "3 días", meta: 3, accionLabel: "Registrar día de hidratación" },
  { titulo: "Frutero Estrella", descripcion: "Incluye frutas en las comidas por 5 días seguidos", puntos: 75, icono: "🍎", categoria: "Nutrición", duracion: "5 días", meta: 5, accionLabel: "Registrar frutas del día" },
  { titulo: "Chef Saludable", descripcion: "Prepara 3 recetas nuevas generadas con IA", puntos: 150, icono: "👨‍🍳", categoria: "Recetas", duracion: "14 días", meta: 3, accionLabel: "Registrar receta preparada" },
  { titulo: "Planner Maestro", descripcion: "Completa un menú semanal completo en el planner", puntos: 80, icono: "📅", categoria: "Planificación", duracion: "7 días", meta: 1, accionLabel: "Marcar menú completado" },
  { titulo: "Verduras Diarias", descripcion: "Consume verduras verdes por 7 días consecutivos", puntos: 120, icono: "🥬", categoria: "Nutrición", duracion: "7 días", meta: 7, accionLabel: "Registrar verduras del día" },
  { titulo: "Anti-Anemia Pro", descripcion: "Sigue el plan anti-anemia por 2 semanas completas", puntos: 200, icono: "💪", categoria: "Salud", duracion: "14 días", meta: 14, accionLabel: "Registrar día anti-anemia" },
  { titulo: "Fotógrafo Nutricionista", descripcion: "Escanea 5 ingredientes con Nutri-Foto IA", puntos: 60, icono: "📸", categoria: "Tecnología", duracion: "Sin límite", meta: 5, accionLabel: "Registrar escaneo realizado" },
  { titulo: "Compras Inteligentes", descripcion: "Usa el mercado inteligente 3 veces para planificar", puntos: 70, icono: "🛒", categoria: "Planificación", duracion: "30 días", meta: 3, accionLabel: "Registrar compra completada" },
  { titulo: "Cena Sin Pantallas", descripcion: "Comparte la cena en familia sin celulares ni tablets 5 días", puntos: 75, icono: "🍽️", categoria: "Familia", duracion: "5 días", meta: 5, accionLabel: "Registrar cena completada" },
  { titulo: "Cero Desperdicio", descripcion: "Evita desperdiciar alimentos y aprovecha todo durante 7 días", puntos: 100, icono: "♻️", categoria: "Sostenibilidad", duracion: "7 días", meta: 7, accionLabel: "Hoy no desperdiciamos comida" },
  // Intermedios
  { titulo: "Desayuno Campeón", descripcion: "Prepara desayunos nutritivos 10 días seguidos", puntos: 130, icono: "🌅", categoria: "Nutrición", duracion: "10 días", meta: 10, accionLabel: "Registrar desayuno nutritivo" },
  { titulo: "Sin Gaseosas", descripcion: "No consumas bebidas azucaradas por 5 días", puntos: 90, icono: "🚫", categoria: "Salud", duracion: "5 días", meta: 5, accionLabel: "Registrar día sin gaseosas" },
  { titulo: "Receta Andina", descripcion: "Prepara 3 recetas con ingredientes andinos (quinoa, kiwicha, tarwi)", puntos: 140, icono: "🌄", categoria: "Cultura", duracion: "14 días", meta: 3, accionLabel: "Registrar receta andina" },
  { titulo: "Actividad Física", descripcion: "Realiza 30 minutos de actividad física en familia 5 días", puntos: 110, icono: "🏃", categoria: "Salud", duracion: "7 días", meta: 5, accionLabel: "Registrar actividad física" },
  { titulo: "Legumbres Poderosas", descripcion: "Incluye lentejas, frijoles o garbanzos en 8 comidas", puntos: 160, icono: "🫘", categoria: "Nutrición", duracion: "14 días", meta: 8, accionLabel: "Registrar comida con legumbres" },
  { titulo: "Dormir Bien", descripcion: "Asegura 8 horas de sueño para toda la familia 7 noches", puntos: 85, icono: "😴", categoria: "Salud", duracion: "7 días", meta: 7, accionLabel: "Registrar noche de buen sueño" },
  { titulo: "Pescado en Mesa", descripcion: "Consume pescado 3 veces esta semana", puntos: 95, icono: "🐟", categoria: "Nutrición", duracion: "7 días", meta: 3, accionLabel: "Registrar comida de pescado" },
  { titulo: "Menú Semanal x2", descripcion: "Completa el planner durante 2 semanas consecutivas", puntos: 180, icono: "📆", categoria: "Planificación", duracion: "14 días", meta: 2, accionLabel: "Registrar semana completada" },
  { titulo: "Sin Dulces", descripcion: "Evita dulces, galletas y golosinas por 5 días", puntos: 100, icono: "🍬", categoria: "Salud", duracion: "5 días", meta: 5, accionLabel: "Registrar día sin dulces" },
  { titulo: "Cocinando Juntos", descripcion: "Cocina en familia al menos 4 veces esta semana", puntos: 120, icono: "👨‍👩‍👧", categoria: "Familia", duracion: "7 días", meta: 4, accionLabel: "Registrar sesión familiar de cocina" },
  { titulo: "Jugos Naturales", descripcion: "Prepara jugos naturales sin azúcar añadida 8 veces", puntos: 85, icono: "🍊", categoria: "Nutrición", duracion: "10 días", meta: 8, accionLabel: "Registrar jugo natural" },
  // Avanzados
  { titulo: "Maestro del Hierro", descripcion: "Alcanza 21 días consecutivos con alimentos ricos en hierro", puntos: 300, icono: "🧲", categoria: "Salud", duracion: "21 días", meta: 21, accionLabel: "Registrar día con hierro" },
  { titulo: "Super Planner", descripcion: "Completa 4 semanas de planificación consecutivas", puntos: 250, icono: "🗓️", categoria: "Planificación", duracion: "28 días", meta: 4, accionLabel: "Registrar semana completada" },
  { titulo: "Experto Anti-Anemia", descripcion: "Genera 10 recetas anti-anemia con la IA", puntos: 350, icono: "🏆", categoria: "Recetas", duracion: "30 días", meta: 10, accionLabel: "Registrar receta anti-anemia" },
  { titulo: "Familia Saludable", descripcion: "Completa retos de hidratación, frutas y verduras en la misma semana", puntos: 220, icono: "🌟", categoria: "Familia", duracion: "7 días", meta: 3, accionLabel: "Registrar triple reto diario" },
  { titulo: "Cero Procesados", descripcion: "Evita completamente los alimentos ultra-procesados por 10 días", puntos: 280, icono: "🚫", categoria: "Salud", duracion: "10 días", meta: 10, accionLabel: "Registrar día libre de procesados" },
  { titulo: "NutriJuego Experto", descripcion: "Alcanza el nivel 10 en el NutriJuego", puntos: 200, icono: "🎮", categoria: "Educación", duracion: "Sin límite", meta: 1, accionLabel: "Registrar nivel 10 alcanzado" },
  { titulo: "Educación Nutricional", descripcion: "Responde 20 preguntas al Chef IA sobre nutrición", puntos: 170, icono: "🤖", categoria: "Educación", duracion: "30 días", meta: 20, accionLabel: "Registrar consulta al Chef IA" },
  { titulo: "Huerto Familiar", descripcion: "Registra 5 cultivos en tu biohuerto familiar", puntos: 190, icono: "🌱", categoria: "Sostenibilidad", duracion: "30 días", meta: 5, accionLabel: "Registrar cultivo del biohuerto" },
];

const NIVELES = [
  { nombre: "Principiante", puntos: 0, medalla: "🥉", siguiente: 100 },
  { nombre: "Aprendiz", puntos: 100, medalla: "🥈", siguiente: 300 },
  { nombre: "Nutricionista Jr.", puntos: 300, medalla: "🥇", siguiente: 600 },
  { nombre: "Chef Saludable", puntos: 600, medalla: "🏆", siguiente: 1000 },
  { nombre: "Maestro Nutri", puntos: 1000, medalla: "⭐", siguiente: 1500 },
  { nombre: "Experto Anti-Anemia", puntos: 1500, medalla: "🌟", siguiente: Infinity },
];

const CATEGORIA_COLORS: Record<string, string> = {
  "Nutrición": "bg-green-100 text-green-700",
  "Salud": "bg-blue-100 text-blue-700",
  "Recetas": "bg-orange-100 text-orange-700",
  "Planificación": "bg-purple-100 text-purple-700",
  "Tecnología": "bg-cyan-100 text-cyan-700",
  "Familia": "bg-pink-100 text-pink-700",
  "Sostenibilidad": "bg-lime-100 text-lime-700",
  "Cultura": "bg-teal-100 text-teal-700",
  "Educación": "bg-indigo-100 text-indigo-700",
};

function getNivel(puntos: number) {
  let info = NIVELES[0];
  for (const n of NIVELES) { if (puntos >= n.puntos) info = n; }
  return info;
}

function getNextNivel(puntos: number) {
  for (const n of NIVELES) { if (puntos < n.puntos) return n; }
  return null;
}

// Generate a batch of retos based on the generation number
function generateRetoBatch(generacion: number): Reto[] {
  const startIdx = (generacion * 5) % RETO_POOL.length;
  const count = Math.min(5 + generacion * 2, 11); // más retos por generación
  const selected: RetoTemplate[] = [];

  for (let i = 0; i < Math.min(count, RETO_POOL.length); i++) {
    selected.push(RETO_POOL[(startIdx + i) % RETO_POOL.length]);
  }

  return selected.map((t, i) => ({
    ...t,
    id: `gen${generacion}_r${i}`,
    completado: false,
    progreso: 0,
  }));
}

interface StoredData {
  retos: Reto[];
  puntos: number;
  generacion: number;
  totalCompletados: number;
}

export default function Retos() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [retos, setRetos] = useState<Reto[]>([]);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [generacion, setGeneracion] = useState(0);
  const [totalCompletados, setTotalCompletados] = useState(0);
  const [tab, setTab] = useState<"activos" | "completados">("activos");

  const storageKey = `retos_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const data: StoredData = JSON.parse(saved);
      setRetos(data.retos || []);
      setTotalPuntos(data.puntos || 0);
      setGeneracion(data.generacion || 0);
      setTotalCompletados(data.totalCompletados || 0);
    } else {
      // First time — load the initial batch (first 11 retos)
      const initial: Reto[] = RETO_POOL.slice(0, 11).map((t, i) => ({
        ...t, id: `gen0_r${i}`, completado: false, progreso: 0,
      }));
      setRetos(initial);
    }
  }, [userId]);

  const saveFn = (newRetos: Reto[], puntos: number, gen: number, totalComp: number) => {
    setRetos(newRetos);
    setTotalPuntos(puntos);
    setGeneracion(gen);
    setTotalCompletados(totalComp);
    localStorage.setItem(storageKey, JSON.stringify({ retos: newRetos, puntos, generacion: gen, totalCompletados: totalComp }));
  };

  const generateNewBatch = (currentPuntos: number, currentGen: number, currentTotal: number) => {
    const nextGen = currentGen + 1;
    const newRetos = generateRetoBatch(nextGen);
    toast({ title: "🎉 ¡Nuevos retos desbloqueados!", description: `Generación ${nextGen}: ${newRetos.length} retos frescos te esperan 💪` });
    saveFn(newRetos, currentPuntos, nextGen, currentTotal);
  };

  const avanzar = (id: string) => {
    const updated = retos.map(r => {
      if (r.id !== id || r.completado) return r;
      const newProgreso = Math.min(r.progreso + 1, r.meta);
      const completado = newProgreso >= r.meta;
      if (completado) {
        toast({ title: `🏆 ¡Reto completado!`, description: `${r.titulo} — ¡Ganaste ${r.puntos} puntos! ✨` });
      } else {
        toast({ title: "✅ Progreso registrado", description: `${r.titulo}: ${newProgreso}/${r.meta}` });
      }
      return { ...r, progreso: newProgreso, completado };
    });

    const newPuntos = updated.filter(r => r.completado).reduce((s, r) => s + r.puntos, 0) + totalPuntos - retos.filter(r => r.completado).reduce((s, r) => s + r.puntos, 0);
    const newTotal = totalCompletados + (updated.find(r => r.id === id)?.completado && !retos.find(r => r.id === id)?.completado ? 1 : 0);

    // Check if all active retos are now completed
    const allDone = updated.every(r => r.completado);
    if (allDone) {
      setTimeout(() => generateNewBatch(newPuntos, generacion, newTotal), 1500);
    } else {
      saveFn(updated, newPuntos, generacion, newTotal);
    }
  };

  const reset = (id: string) => {
    const reto = retos.find(r => r.id === id);
    const wasDone = reto?.completado;
    const updated = retos.map(r => r.id === id ? { ...r, progreso: 0, completado: false } : r);
    const deduccion = wasDone && reto ? reto.puntos : 0;
    saveFn(updated, Math.max(0, totalPuntos - deduccion), generacion, totalCompletados);
    toast({ title: "Reto reiniciado", description: "Puedes empezar de nuevo 💪" });
  };

  const nivel = getNivel(totalPuntos);
  const nextNivel = getNextNivel(totalPuntos);
  const progresNivel = nextNivel ? Math.min(100, Math.round(((totalPuntos - nivel.puntos) / (nextNivel.puntos - nivel.puntos)) * 100)) : 100;

  const activos = retos.filter(r => !r.completado);
  const completados = retos.filter(r => r.completado);
  const shown = tab === "activos" ? activos : completados;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-8 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-white/20 p-3 rounded-2xl"><Trophy className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Retos Familiares</h1>
              <p className="text-white/80 text-sm">Retos infinitos · Generación {generacion + 1} · {totalCompletados} completados en total 💪</p>
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
              <p className="text-3xl font-bold">{totalCompletados}</p>
              <p className="text-xs text-white/80 mt-0.5 flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Totales</p>
            </div>
          </div>
          {nextNivel && (
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" /> Próximo: <strong>{nextNivel.nombre}</strong></span>
                <span>{totalPuntos}/{nextNivel.puntos} pts</span>
              </div>
              <Progress value={progresNivel} className="h-3 bg-white/30" />
              <p className="text-xs text-white/70 mt-1.5">Faltan {nextNivel.puntos - totalPuntos} puntos</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <Button variant={tab === "activos" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setTab("activos")}>
              🎯 Activos ({activos.length})
            </Button>
            <Button variant={tab === "completados" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setTab("completados")}>
              ✅ Completados ({completados.length})
            </Button>
          </div>
          {activos.length === 0 && (
            <Button size="sm" className="rounded-full gap-2 bg-amber-500 hover:bg-amber-600" onClick={() => generateNewBatch(totalPuntos, generacion, totalCompletados)}>
              <Sparkles className="h-3.5 w-3.5" />
              Nuevos retos
            </Button>
          )}
        </div>

        {shown.length === 0 && tab === "activos" && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-serif font-bold text-xl text-amber-800">¡Completaste todos los retos!</p>
            <p className="text-sm text-amber-700 mt-2 mb-4">¡Eres una familia increíble! Se generarán nuevos retos automáticamente.</p>
            <Button className="rounded-full gap-2 bg-amber-500 hover:bg-amber-600" onClick={() => generateNewBatch(totalPuntos, generacion, totalCompletados)}>
              <Plus className="h-4 w-4" />
              Generar nuevos retos ahora
            </Button>
          </div>
        )}

        {shown.length === 0 && tab === "completados" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🔒</p>
            <p className="font-semibold text-foreground">Aún no has completado ningún reto</p>
            <p className="text-sm text-muted-foreground mt-1">¡Empieza uno de los retos activos 💪!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map(reto => (
            <div key={reto.id} className={`bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md ${reto.completado ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" : "border-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{reto.icono}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">+{reto.puntos} pts</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORIA_COLORS[reto.categoria] || "bg-gray-100 text-gray-700"}`}>{reto.categoria}</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-bold text-foreground">{reto.titulo}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{reto.descripcion}</p>
                <p className="text-[10px] text-muted-foreground mt-1">⏱ {reto.duracion}</p>
              </div>
              {!reto.completado && (
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span>{reto.progreso}/{reto.meta}</span>
                  </div>
                  <Progress value={(reto.progreso / reto.meta) * 100} className="h-2.5 rounded-full" />
                  <p className="text-[10px] text-muted-foreground mt-1">{reto.meta - reto.progreso} {reto.meta - reto.progreso === 1 ? "paso más" : "pasos más"} para completar</p>
                </div>
              )}
              <div className="mt-auto">
                {reto.completado ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-bold"><CheckCircle2 className="h-5 w-5" /> ¡Completado! 🎉</div>
                    <button onClick={() => reset(reto.id)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"><RotateCcw className="h-3 w-3" /> Reiniciar</button>
                  </div>
                ) : (
                  <Button size="sm" className="w-full gap-2 rounded-xl" onClick={() => avanzar(reto.id)}>
                    <Zap className="h-3.5 w-3.5" />{reto.accionLabel}
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
              <p className="font-bold text-amber-800">¡Los retos nunca terminan! 🌟</p>
              <p className="text-sm text-amber-700 mt-0.5">Al completar todos los retos actuales se generan automáticamente nuevos desafíos. ¡{RETO_POOL.length} plantillas en la base de datos!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
