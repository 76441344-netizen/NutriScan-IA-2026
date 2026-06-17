import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Sparkles, Loader2, Target, RefreshCw } from "lucide-react";
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

const MEAL_ICONS: Record<Meal, string> = {
  Desayuno: "🌅",
  Almuerzo: "☀️",
  Cena: "🌙",
  Refrigerio: "🍎",
};

const OBJETIVOS = [
  { value: "equilibrada", label: "Alimentación equilibrada", emoji: "⚖️" },
  { value: "anemia", label: "Reducir anemia", emoji: "🩸" },
  { value: "hierro", label: "Aumentar hierro", emoji: "💪" },
  { value: "peso_ganar", label: "Ganar peso saludable", emoji: "📈" },
  { value: "peso_bajar", label: "Bajar de peso saludable", emoji: "📉" },
  { value: "proteinas", label: "Aumentar proteínas", emoji: "🥩" },
  { value: "digestion", label: "Mejorar digestión", emoji: "🌿" },
  { value: "frutas_verduras", label: "Más frutas y verduras", emoji: "🥬" },
  { value: "infantil", label: "Alimentación infantil", emoji: "👶" },
  { value: "adulto_mayor", label: "Adulto mayor", emoji: "👴" },
  { value: "embarazo", label: "Embarazo", emoji: "🤰" },
  { value: "lactancia", label: "Lactancia", emoji: "🤱" },
  { value: "azucar", label: "Control de azúcar", emoji: "🩺" },
  { value: "cardiovascular", label: "Salud cardiovascular", emoji: "❤️" },
  { value: "energia_estudiar", label: "Energía para estudiar", emoji: "📚" },
  { value: "energia_trabajo", label: "Energía para trabajar", emoji: "⚡" },
  { value: "deporte", label: "Rendimiento deportivo", emoji: "🏃" },
];

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

function hasWeekData(planner: PlannerData, weekKey: string) {
  return DAYS.some((day) => {
    const entry = planner[`${weekKey}_${day}`];
    return entry && Object.values(entry).some((v) => v.trim() !== "");
  });
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
  const [showObjetivoModal, setShowObjetivoModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedObjetivo, setSelectedObjetivo] = useState("");
  const [pendingObjetivo, setPendingObjetivo] = useState("");

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

  const handleGenerateClick = () => {
    if (hasWeekData(planner, weekKey)) {
      setShowReplaceModal(true);
    } else {
      setShowObjetivoModal(true);
    }
  };

  const handleReplaceConfirm = () => {
    setShowReplaceModal(false);
    setShowObjetivoModal(true);
  };

  const autoGenerate = async (objetivo: string) => {
    setSelectedObjetivo(objetivo);
    setShowObjetivoModal(false);
    setGenerating(true);

    const objLabel = OBJETIVOS.find((o) => o.value === objetivo)?.label || objetivo;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Genera un menú semanal completo (7 días) con desayuno, almuerzo, cena y refrigerio para cada día.
          El objetivo nutricional es: ${objLabel}.
          Responde SOLO con un JSON en este formato exacto (sin markdown, sin explicaciones):
          {"Lun":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Mar":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Mié":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Jue":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Vie":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Sáb":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."},"Dom":{"Desayuno":"...","Almuerzo":"...","Cena":"...","Refrigerio":"..."}}
          Recetas económicas, nutritivas y adaptadas al objetivo: ${objLabel}.`,
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
        toast({ title: "¡Menú generado! 🎉", description: `Plan personalizado para: ${objLabel}` });
      } else {
        toast({ title: "Error", description: "No se pudo interpretar el menú generado. Intenta de nuevo.", variant: "destructive" });
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
    setSelectedObjetivo("");
    toast({ title: "Semana limpiada", description: "Puedes generar un nuevo menú o llenarlo manualmente." });
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const currentObj = OBJETIVOS.find((o) => o.value === selectedObjetivo);

  return (
    <div className="flex-1 flex flex-col">
      {showObjetivoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground">Objetivo nutricional</h3>
                <p className="text-sm text-muted-foreground">¿Cuál es tu objetivo esta semana?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {OBJETIVOS.map((obj) => (
                <button
                  key={obj.value}
                  onClick={() => setPendingObjetivo(obj.value)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                    pendingObjetivo === obj.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span className="text-xl shrink-0">{obj.emoji}</span>
                  <span className="text-sm font-medium">{obj.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => { setShowObjetivoModal(false); setPendingObjetivo(""); }}>
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-full gap-2"
                disabled={!pendingObjetivo}
                onClick={() => { autoGenerate(pendingObjetivo); setPendingObjetivo(""); }}
              >
                <Sparkles className="h-4 w-4" />
                Generar menú
              </Button>
            </div>
          </div>
        </div>
      )}

      {showReplaceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-serif font-bold text-lg text-foreground">¿Reemplazar plan actual?</h3>
              <p className="text-sm text-muted-foreground mt-1">Esta semana ya tiene un menú planificado. Si generas uno nuevo, se reemplazará.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowReplaceModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 rounded-full gap-2" onClick={handleReplaceConfirm}>
                <RefreshCw className="h-4 w-4" />
                Reemplazar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6 px-4">
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
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleGenerateClick} disabled={generating} className="gap-2 font-semibold">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generando..." : "Generar con IA"}
            </Button>
            <Button variant="outline" size="sm" onClick={clearWeek} className="text-white border-white/30 hover:bg-white/10 gap-2">
              <X className="h-3.5 w-3.5" />
              Limpiar semana
            </Button>
          </div>
        </div>
      </div>

      {currentObj && (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2.5">
          <div className="max-w-screen-xl mx-auto flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Objetivo nutricional:</span>
            <span className="font-semibold text-primary">{currentObj.emoji} {currentObj.label}</span>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)} className="rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-sm text-foreground">
              {weekOffset === 0 ? "Esta semana" : weekOffset === 1 ? "Próxima semana" : weekOffset === -1 ? "Semana pasada" : `Semana ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {weekDates[0].toLocaleDateString("es-PE", { day: "numeric", month: "short" })} – {weekDates[6].toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {generating && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <div>
              <p className="font-semibold text-sm text-primary">Generando plan personalizado...</p>
              <p className="text-xs text-muted-foreground">La IA está creando un menú adaptado a tu objetivo</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-2 mb-3">
              <div />
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-bold py-2.5 rounded-xl ${
                    weekOffset === 0 && i === todayIndex
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div>{day}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {weekDates[i].toLocaleDateString("es-PE", { day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>

            {MEALS.map((meal) => (
              <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center justify-end pr-2">
                  <span className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border ${MEAL_COLORS[meal]} flex items-center gap-1`}>
                    <span>{MEAL_ICONS[meal]}</span>
                    <span>{meal}</span>
                  </span>
                </div>
                {DAYS.map((day) => {
                  const val = getMeal(day, meal);
                  const isEditing = editing?.day === day && editing?.meal === meal;
                  return (
                    <div key={day} className="min-h-[68px]">
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
                            className="w-full h-full min-h-[68px] text-xs p-2 rounded-xl border-2 border-primary outline-none bg-background"
                            list={`suggestions-${meal}`}
                          />
                          <datalist id={`suggestions-${meal}`}>
                            {SUGGESTIONS[meal].map((s) => <option key={s} value={s} />)}
                          </datalist>
                        </div>
                      ) : val ? (
                        <div
                          className="relative h-full min-h-[68px] bg-card border border-border rounded-xl p-2 text-xs cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
                          onClick={() => { setEditing({ day, meal }); setEditValue(val); }}
                        >
                          <span className="leading-relaxed">{val}</span>
                          <button
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full p-0.5"
                            onClick={(e) => { e.stopPropagation(); setMeal(day, meal, ""); }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="w-full h-full min-h-[68px] border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all group"
                          onClick={() => { setEditing({ day, meal }); setEditValue(""); }}
                        >
                          <Plus className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          💡 <strong>Tip:</strong> Haz clic en cualquier celda para editar manualmente. Pulsa <kbd className="bg-amber-200 px-1 rounded text-xs">Enter</kbd> para guardar.
        </div>
      </div>
    </div>
  );
}
