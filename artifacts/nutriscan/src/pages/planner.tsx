import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MEALS = ["Desayuno", "Almuerzo", "Cena", "Refrigerio"] as const;
type Meal = typeof MEALS[number];

type PlannerData = Record<string, Record<Meal, string>>;

const MEAL_COLORS: Record<Meal, string> = {
  Desayuno: "bg-amber-50 border-amber-200 text-amber-800",
  Almuerzo: "bg-green-50 border-green-200 text-green-800",
  Cena: "bg-blue-50 border-blue-200 text-blue-800",
  Refrigerio: "bg-purple-50 border-purple-200 text-purple-800",
};

const SUGGESTIONS: Record<Meal, string[]> = {
  Desayuno: ["Avena con frutas", "Pan integral con huevo", "Quinoa con leche", "Frutas con yogurt"],
  Almuerzo: ["Lenteja con arroz", "Pollo con espinacas", "Sopa de quinoa", "Lentejas guisadas"],
  Cena: ["Sopa de verduras", "Arroz con frijoles", "Tortilla de espinacas", "Crema de zapallo"],
  Refrigerio: ["Manzana", "Plátano", "Frutos secos", "Pan con palta"],
};

function getWeekKey(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  return d.toISOString().split("T")[0];
}

function getWeekDates(offset: number) {
  const dates = [];
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1 + offset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function Planner() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [planner, setPlanner] = useState<PlannerData>({});
  const [editing, setEditing] = useState<{ day: string; meal: Meal } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [generating, setGenerating] = useState(false);

  const storageKey = `planner_${userId}`;
  const weekKey = getWeekKey(weekOffset);
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) setPlanner(JSON.parse(saved));
  }, [userId]);

  const save = (newPlanner: PlannerData) => {
    setPlanner(newPlanner);
    localStorage.setItem(storageKey, JSON.stringify(newPlanner));
  };

  const setMeal = (dayKey: string, meal: Meal, value: string) => {
    const updated = {
      ...planner,
      [`${weekKey}_${dayKey}`]: {
        ...(planner[`${weekKey}_${dayKey}`] || {}),
        [meal]: value,
      } as Record<Meal, string>,
    };
    save(updated);
  };

  const getMeal = (dayKey: string, meal: Meal) =>
    planner[`${weekKey}_${dayKey}`]?.[meal] || "";

  const autoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Genera un menú semanal completo (7 días) con desayuno, almuerzo, cena y refrigerio para cada día. 
          Responde SOLO con un JSON en este formato exacto (sin markdown):
          {"Lun":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Mar":{...},"Mié":{...},"Jue":{...},"Vie":{...},"Sáb":{...},"Dom":{...}}
          Las recetas deben ser económicas, nutritivas y anti-anemia para niños.`,
        }),
      });
      const data = await res.json();
      const jsonMatch = data.reply?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        const updated = { ...planner };
        DAYS.forEach((day) => {
          if (generated[day]) {
            updated[`${weekKey}_${day}`] = generated[day];
          }
        });
        save(updated);
        toast({ title: "¡Menú generado!", description: "Tu menú semanal ha sido creado con IA 🎉" });
      }
    } catch {
      toast({ title: "Error", description: "No se pudo generar el menú", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const clearWeek = () => {
    const updated = { ...planner };
    DAYS.forEach((day) => { delete updated[`${weekKey}_${day}`]; });
    save(updated);
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Planner Semanal</h1>
              <p className="text-primary-foreground/80 text-sm">Organiza las comidas de tu familia</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={autoGenerate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generar con IA
            </Button>
            <Button variant="outline" size="sm" onClick={clearWeek} className="text-white border-white/30 hover:bg-white/10">
              Limpiar semana
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm text-muted-foreground">
            {weekOffset === 0 ? "Esta semana" : weekOffset === 1 ? "Próxima semana" : weekOffset === -1 ? "Semana pasada" : `Semana ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
            {" · "}
            {weekDates[0].toLocaleDateString("es-PE", { day: "numeric", month: "short" })} – {weekDates[6].toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div />
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-semibold py-2 rounded-lg ${
                    weekOffset === 0 && i === todayIndex
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <div>{day}</div>
                  <div className="text-[10px] opacity-70">
                    {weekDates[i].toLocaleDateString("es-PE", { day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>

            {MEALS.map((meal) => (
              <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center justify-end pr-2">
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${MEAL_COLORS[meal]}`}>
                    {meal}
                  </span>
                </div>
                {DAYS.map((day) => {
                  const val = getMeal(day, meal);
                  const isEditing = editing?.day === day && editing?.meal === meal;
                  return (
                    <div key={day} className="min-h-[64px]">
                      {isEditing ? (
                        <div className="h-full">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { setMeal(day, meal, editValue); setEditing(null); }
                              if (e.key === "Escape") setEditing(null);
                            }}
                            onBlur={() => { setMeal(day, meal, editValue); setEditing(null); }}
                            className="w-full h-full min-h-[64px] text-xs p-2 rounded-lg border border-primary outline-none resize-none bg-background"
                            list={`suggestions-${meal}`}
                          />
                          <datalist id={`suggestions-${meal}`}>
                            {SUGGESTIONS[meal].map((s) => <option key={s} value={s} />)}
                          </datalist>
                        </div>
                      ) : val ? (
                        <div
                          className="relative h-full min-h-[64px] bg-card border border-border rounded-lg p-2 text-xs cursor-pointer hover:border-primary/50 transition-colors group"
                          onClick={() => { setEditing({ day, meal }); setEditValue(val); }}
                        >
                          {val}
                          <button
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setMeal(day, meal, ""); }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="w-full h-full min-h-[64px] border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                          onClick={() => { setEditing({ day, meal }); setEditValue(""); }}
                        >
                          <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
