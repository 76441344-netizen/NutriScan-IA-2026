import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Trophy, Star, Zap, RotateCcw, CheckCircle2, XCircle, Timer, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Alimento {
  nombre: string;
  emoji: string;
  saludable: boolean;
  datoCurioso: string;
  dificultad: 1 | 2 | 3; // 1=fácil, 2=medio, 3=difícil
  categoria: string;
}

const DB_ALIMENTOS: Alimento[] = [
  // FÁCILES - muy obvios
  { nombre: "Manzana", emoji: "🍎", saludable: true, datoCurioso: "Rica en fibra y vitaminas. ¡Una manzana al día!", dificultad: 1, categoria: "Fruta" },
  { nombre: "Plátano", emoji: "🍌", saludable: true, datoCurioso: "Rico en potasio. ¡Energía natural para niños!", dificultad: 1, categoria: "Fruta" },
  { nombre: "Zanahoria", emoji: "🥕", saludable: true, datoCurioso: "Rica en vitamina A. ¡Cuida la vista de los niños!", dificultad: 1, categoria: "Verdura" },
  { nombre: "Brócoli", emoji: "🥦", saludable: true, datoCurioso: "Tiene hierro, calcio y vitamina C. ¡Triple beneficio!", dificultad: 1, categoria: "Verdura" },
  { nombre: "Naranja", emoji: "🍊", saludable: true, datoCurioso: "La vitamina C ayuda a absorber el hierro 3x más.", dificultad: 1, categoria: "Fruta" },
  { nombre: "Espinaca", emoji: "🥬", saludable: true, datoCurioso: "Rica en hierro. ¡Alimento anti-anemia número 1!", dificultad: 1, categoria: "Verdura" },
  { nombre: "Huevo", emoji: "🥚", saludable: true, datoCurioso: "Proteínas de alta calidad, hierro y vitamina B12.", dificultad: 1, categoria: "Proteína" },
  { nombre: "Leche", emoji: "🥛", saludable: true, datoCurioso: "Calcio para huesos fuertes y crecimiento sano.", dificultad: 1, categoria: "Lácteo" },
  { nombre: "Gaseosa", emoji: "🥤", saludable: false, datoCurioso: "¡10 cucharadas de azúcar! Daña dientes y eleva glucosa.", dificultad: 1, categoria: "Bebida" },
  { nombre: "Papas fritas", emoji: "🍟", saludable: false, datoCurioso: "Altas en sodio y grasas trans. Sin nutrientes reales.", dificultad: 1, categoria: "Snack" },
  { nombre: "Dulces", emoji: "🍭", saludable: false, datoCurioso: "Azúcar pura. Dificulta absorber el hierro en niños.", dificultad: 1, categoria: "Dulce" },
  { nombre: "Hot dog", emoji: "🌭", saludable: false, datoCurioso: "Alto en sodio y conservantes. No apto para niños.", dificultad: 1, categoria: "Procesado" },
  // MEDIOS - alimentos nutritivos menos conocidos
  { nombre: "Quinoa", emoji: "🌾", saludable: true, datoCurioso: "Cereal completo con todos los aminoácidos esenciales.", dificultad: 2, categoria: "Cereal" },
  { nombre: "Lentejas", emoji: "🫘", saludable: true, datoCurioso: "Tienen 3x más hierro que la carne roja. ¡Anti-anemia!", dificultad: 2, categoria: "Legumbre" },
  { nombre: "Sangrecita", emoji: "🩸", saludable: true, datoCurioso: "29mg de hierro por 100g. ¡El mejor anti-anemia del Perú!", dificultad: 2, categoria: "Proteína" },
  { nombre: "Sardina", emoji: "🐟", saludable: true, datoCurioso: "Omega-3 y calcio para cerebro y huesos de niños.", dificultad: 2, categoria: "Pescado" },
  { nombre: "Betarraga", emoji: "🫚", saludable: true, datoCurioso: "Aumenta hemoglobina y mejora circulación sanguínea.", dificultad: 2, categoria: "Verdura" },
  { nombre: "Hígado de pollo", emoji: "🍗", saludable: true, datoCurioso: "Fuente más concentrada de hierro hem. ¡Anti-anemia!", dificultad: 2, categoria: "Proteína" },
  { nombre: "Kiwicha", emoji: "🌿", saludable: true, datoCurioso: "Supercereal peruano con calcio y proteínas completas.", dificultad: 2, categoria: "Cereal" },
  { nombre: "Palta", emoji: "🥑", saludable: true, datoCurioso: "Grasas buenas que ayudan absorber vitaminas. ¡Excelente!", dificultad: 2, categoria: "Fruta" },
  { nombre: "Yogur natural", emoji: "🫙", saludable: true, datoCurioso: "Probióticos para la digestión. Sin azúcar añadida.", dificultad: 2, categoria: "Lácteo" },
  { nombre: "Yuca", emoji: "🥔", saludable: true, datoCurioso: "Carbohidrato energético. Rico en vitamina C y potasio.", dificultad: 2, categoria: "Tubérculo" },
  { nombre: "Hamburguesa fast food", emoji: "🍔", saludable: false, datoCurioso: "Alta en grasas saturadas y sodio. Ocasional máximo.", dificultad: 2, categoria: "Comida rápida" },
  { nombre: "Donut", emoji: "🍩", saludable: false, datoCurioso: "Azúcar + grasa saturada = sin nutrientes reales.", dificultad: 2, categoria: "Dulce" },
  { nombre: "Nuggets industriales", emoji: "🍗", saludable: false, datoCurioso: "70% relleno de grasas y almidones. Poco pollo real.", dificultad: 2, categoria: "Procesado" },
  { nombre: "Bebida energizante", emoji: "⚡", saludable: false, datoCurioso: "Cafeína + azúcar. Peligroso para niños menores de 16.", dificultad: 2, categoria: "Bebida" },
  // DIFÍCILES - alimentos ambiguos o poco conocidos
  { nombre: "Avena", emoji: "🥣", saludable: true, datoCurioso: "Beta-glucano reduce colesterol. Hierro + vitamina B.", dificultad: 3, categoria: "Cereal" },
  { nombre: "Atún en agua", emoji: "🐟", saludable: true, datoCurioso: "30g proteína por lata. Omega-3 y bajo en grasa.", dificultad: 3, categoria: "Pescado" },
  { nombre: "Garbanzos", emoji: "🫘", saludable: true, datoCurioso: "Hierro, zinc y proteína vegetal. Ideal con vitamina C.", dificultad: 3, categoria: "Legumbre" },
  { nombre: "Maracuyá", emoji: "🍋", saludable: true, datoCurioso: "Vitamina C y antioxidantes. Mejora absorción del hierro.", dificultad: 3, categoria: "Fruta" },
  { nombre: "Tarwi", emoji: "🌿", saludable: true, datoCurioso: "Legumbre andina con 44% proteína. ¡El más nutritivo del Perú!", dificultad: 3, categoria: "Legumbre" },
  { nombre: "Chicha morada", emoji: "🟣", saludable: true, datoCurioso: "Antocianinas antioxidantes. Sin azúcar añadida es saludable.", dificultad: 3, categoria: "Bebida" },
  { nombre: "Camu camu", emoji: "🫐", saludable: true, datoCurioso: "60x más vitamina C que la naranja. ¡Superfood amazónico!", dificultad: 3, categoria: "Fruta" },
  { nombre: "Arroz integral", emoji: "🍚", saludable: true, datoCurioso: "Fibra, vitaminas B y minerales. Mejor que arroz blanco.", dificultad: 3, categoria: "Cereal" },
  { nombre: "Granola con miel", emoji: "🥜", saludable: false, datoCurioso: "Parece saludable pero puede tener 20g de azúcar por porción.", dificultad: 3, categoria: "Procesado" },
  { nombre: "Jugo de fruta envasado", emoji: "🧃", saludable: false, datoCurioso: "Sin fibra + azúcar añadida. Come la fruta entera mejor.", dificultad: 3, categoria: "Bebida" },
  { nombre: "Galletas integrales", emoji: "🍪", saludable: false, datoCurioso: "'Integral' en etiqueta no garantiza salud. Lee ingredientes.", dificultad: 3, categoria: "Procesado" },
  { nombre: "Yogur con sabor", emoji: "🫙", saludable: false, datoCurioso: "El yogur de sabores puede tener 25g de azúcar. ¡Mucho!", dificultad: 3, categoria: "Lácteo" },
  // EXPERTO - casos especiales
  { nombre: "Espirulina", emoji: "💚", saludable: true, datoCurioso: "Alga con 65% proteína y hierro altísimo. ¡Superfood!", dificultad: 3, categoria: "Suplemento" },
  { nombre: "Maca andina", emoji: "🌱", saludable: true, datoCurioso: "Adaptógeno peruano. Energía y hierro. ¡Tesoro andino!", dificultad: 3, categoria: "Superalimento" },
  { nombre: "Trigo sarraceno", emoji: "🌾", saludable: true, datoCurioso: "Sin gluten + todos los aminoácidos. Hierro y magnesio.", dificultad: 3, categoria: "Cereal" },
  { nombre: "Cecina de res", emoji: "🥩", saludable: true, datoCurioso: "Alta en proteínas y hierro hem. Tradicional en la selva.", dificultad: 3, categoria: "Proteína" },
  { nombre: "Juane", emoji: "🍃", saludable: true, datoCurioso: "Plato amazónico con arroz, proteína y hierbas naturales.", dificultad: 3, categoria: "Plato" },
  { nombre: "Ceviche", emoji: "🍋", saludable: true, datoCurioso: "Pescado con vitamina C del limón. ¡Máxima absorción de hierro!", dificultad: 3, categoria: "Plato" },
  { nombre: "Chicharon", emoji: "🥓", saludable: false, datoCurioso: "Alta grasa saturada. Ocasional y en poca cantidad.", dificultad: 3, categoria: "Procesado" },
  { nombre: "Mazamorra morada", emoji: "🫐", saludable: false, datoCurioso: "Antocianinas sí, pero alta en azúcar. Mejor con menos.", dificultad: 3, categoria: "Postre" },
];

interface LevelConfig {
  foodCount: number;
  timeLimit: number; // segundos
  minDificultad: 1 | 2 | 3;
  label: string;
  description: string;
  badgeColor: string;
}

function getLevelConfig(level: number): LevelConfig {
  if (level <= 3) return { foodCount: 4, timeLimit: 0, minDificultad: 1, label: "Principiante", description: "Alimentos básicos obvios", badgeColor: "bg-green-100 text-green-700" };
  if (level <= 6) return { foodCount: 5, timeLimit: 60, minDificultad: 1, label: "Aprendiz", description: "Más alimentos, con tiempo", badgeColor: "bg-blue-100 text-blue-700" };
  if (level <= 10) return { foodCount: 6, timeLimit: 50, minDificultad: 2, label: "Nutricionista Jr.", description: "Alimentos menos conocidos", badgeColor: "bg-purple-100 text-purple-700" };
  if (level <= 15) return { foodCount: 7, timeLimit: 40, minDificultad: 2, label: "Chef Saludable", description: "Alimentos ambiguos y peruanos", badgeColor: "bg-amber-100 text-amber-700" };
  if (level <= 20) return { foodCount: 8, timeLimit: 35, minDificultad: 3, label: "Experto Nutri", description: "Casos difíciles de clasificar", badgeColor: "bg-orange-100 text-orange-700" };
  return { foodCount: Math.min(10, 8 + Math.floor((level - 20) / 5)), timeLimit: 30, minDificultad: 3, label: "Maestro Anti-Anemia", description: "¡El máximo desafío nutricional!", badgeColor: "bg-red-100 text-red-700" };
}

function selectFoodsForLevel(level: number, cfg: LevelConfig): Alimento[] {
  const pool = DB_ALIMENTOS.filter(a => a.dificultad >= cfg.minDificultad);
  const lowPool = DB_ALIMENTOS.filter(a => a.dificultad === 1);

  const saludables = pool.filter(a => a.saludable);
  const noSaludables = pool.filter(a => !a.saludable);
  const saludablesFaciles = lowPool.filter(a => a.saludable);
  const noSaludablesFaciles = lowPool.filter(a => !a.saludable);

  const half = Math.ceil(cfg.foodCount / 2);
  const seed = level * 37 + 7;
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort((a, b) => {
    const ha = (JSON.stringify(a).charCodeAt(0) * (seed + 1)) % 100;
    const hb = (JSON.stringify(b).charCodeAt(0) * (seed + 3)) % 100;
    return ha - hb;
  });

  let selSaludables = shuffle(saludables).slice(0, half);
  let selNoSaludables = shuffle(noSaludables).slice(0, cfg.foodCount - half);

  // Fill gaps from easy pool
  if (selSaludables.length < half) selSaludables = [...selSaludables, ...shuffle(saludablesFaciles).slice(0, half - selSaludables.length)];
  if (selNoSaludables.length < cfg.foodCount - half) selNoSaludables = [...selNoSaludables, ...shuffle(noSaludablesFaciles).slice(0, cfg.foodCount - half - selNoSaludables.length)];

  return shuffle([...selSaludables, ...selNoSaludables]);
}

interface GameState {
  totalPuntos: number;
  maxNivel: number;
  rachaMax: number;
  partidas: number;
}

type Phase = "menu" | "playing" | "roundResult" | "levelUp";

export default function NutriJuego() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("menu");
  const [level, setLevel] = useState(1);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [clasificados, setClasificados] = useState<Record<string, boolean | null>>({});
  const [feedback, setFeedback] = useState<{ nombre: string; correcto: boolean; dato: string } | null>(null);
  const [racha, setRacha] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [gameState, setGameState] = useState<GameState>({ totalPuntos: 0, maxNivel: 1, rachaMax: 0, partidas: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `nutrijuego_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) setGameState(JSON.parse(saved));
  }, [userId]);

  const saveGameState = (s: GameState) => {
    setGameState(s);
    localStorage.setItem(storageKey, JSON.stringify(s));
  };

  const cfg = getLevelConfig(level);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || cfg.timeLimit === 0) return;
    setTimeLeft(cfg.timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishRound(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, level]);

  const finishRound = useCallback((timeOut = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = Object.values(clasificados).filter(Boolean).length;
    setRoundCorrect(correct);
    setPhase("roundResult");
    if (timeOut) toast({ title: "⏱️ ¡Tiempo agotado!", description: `Respondiste ${correct} correctamente.` });
  }, [clasificados]);

  const startLevel = (lvl: number) => {
    const config = getLevelConfig(lvl);
    const foods = selectFoodsForLevel(lvl, config);
    setLevel(lvl);
    setAlimentos(foods);
    setClasificados({});
    setFeedback(null);
    setRacha(0);
    setPhase("playing");
  };

  const clasificar = useCallback((alimento: Alimento, escogiSaludable: boolean) => {
    if (clasificados[alimento.nombre] !== undefined) return;

    const correcto = alimento.saludable === escogiSaludable;
    const nuevoClasificados = { ...clasificados, [alimento.nombre]: correcto };
    setClasificados(nuevoClasificados);

    const nuevaRacha = correcto ? racha + 1 : 0;
    setRacha(nuevaRacha);

    const pts = correcto ? 10 + nuevaRacha * 2 + (alimento.dificultad - 1) * 5 : 0;
    setPuntos(p => p + pts);

    setFeedback({ nombre: alimento.nombre, correcto, dato: alimento.datoCurioso });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      const allDone = Object.keys(nuevoClasificados).length >= alimentos.length;
      if (allDone) finishRound();
    }, 1800);
  }, [clasificados, racha, alimentos, finishRound]);

  const handleNextLevel = () => {
    const correct = roundCorrect;
    const total = alimentos.length;
    const passed = correct / total >= 0.6; // 60% mínimo para avanzar

    const newLevel = passed ? level + 1 : level;
    const newTotal = gameState.totalPuntos + puntos;
    const newMax = Math.max(gameState.maxNivel, passed ? newLevel : level);
    const newRachaMax = Math.max(gameState.rachaMax, racha);

    const newState: GameState = {
      totalPuntos: newTotal,
      maxNivel: newMax,
      rachaMax: newRachaMax,
      partidas: gameState.partidas + 1,
    };
    saveGameState(newState);

    if (passed) {
      setPhase("levelUp");
      setTimeout(() => startLevel(newLevel), 2500);
    } else {
      toast({ title: "Intenta de nuevo 💪", description: "Necesitas 60% para avanzar." });
      setPuntos(0);
      startLevel(level);
    }
  };

  const resetToMenu = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setPhase("menu");
    setPuntos(0);
    setRacha(0);
    setLevel(1);
    setClasificados({});
    setFeedback(null);
  };

  const pendientes = alimentos.filter(a => clasificados[a.nombre] === undefined);
  const correctas = Object.values(clasificados).filter(Boolean).length;
  const incorrectas = Object.values(clasificados).filter(v => v === false).length;
  const progreso = alimentos.length > 0 ? ((alimentos.length - pendientes.length) / alimentos.length) * 100 : 0;
  const timerPct = cfg.timeLimit > 0 ? (timeLeft / cfg.timeLimit) * 100 : 100;

  const NIVEL_LABELS = [
    { min: 1, label: "Principiante 🥉" }, { min: 5, label: "Aprendiz 🥈" }, { min: 10, label: "Nutricionista 🥇" },
    { min: 15, label: "Chef Saludable 🏆" }, { min: 20, label: "Experto Nutri ⭐" }, { min: 25, label: "Maestro Nutri 🌟" },
  ];
  const userBadge = [...NIVEL_LABELS].reverse().find(n => gameState.maxNivel >= n.min) ?? NIVEL_LABELS[0];

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-6 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="max-w-screen-lg mx-auto relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl text-2xl">🥗</div>
            <div>
              <h1 className="text-2xl font-serif font-bold">NutriJuego Infinito</h1>
              <p className="text-white/80 text-sm">Niveles sin fin · Dificultad progresiva</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: gameState.totalPuntos, icon: <Star className="h-3 w-3" />, lbl: "Puntos" },
              { val: `Nv.${gameState.maxNivel}`, icon: <TrendingUp className="h-3 w-3" />, lbl: "Máx. nivel" },
              { val: gameState.partidas, icon: <Trophy className="h-3 w-3" />, lbl: "Partidas" },
            ].map(({ val, icon, lbl }) => (
              <div key={lbl} className="bg-white/20 rounded-xl p-2.5 text-center backdrop-blur min-w-[70px]">
                <p className="text-lg font-bold">{val}</p>
                <p className="text-[10px] text-white/80 flex items-center justify-center gap-0.5 mt-0.5">{icon} {lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-4">

        {/* MENU */}
        {phase === "menu" && (
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center shadow-sm">
              <div className="text-5xl mb-3">🏆</div>
              <p className="font-serif font-bold text-xl text-foreground">{userBadge.label}</p>
              <p className="text-muted-foreground text-sm mt-1">Nivel máximo alcanzado: <strong>{gameState.maxNivel}</strong></p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { val: gameState.totalPuntos, lbl: "Puntos totales" },
                  { val: gameState.rachaMax, lbl: "Racha máxima" },
                  { val: gameState.partidas, lbl: "Partidas jugadas" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} className="bg-muted/50 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{val}</p>
                    <p className="text-[10px] text-muted-foreground">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-sm w-full space-y-2">
              <p className="text-sm font-semibold text-muted-foreground text-center mb-3">Elige tu nivel de inicio</p>
              {[1, 5, 10, 15, 20].map(lvl => {
                const lCfg = getLevelConfig(lvl);
                const unlocked = gameState.maxNivel >= lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => unlocked && startLevel(lvl)}
                    disabled={!unlocked}
                    className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all ${
                      unlocked ? "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer" : "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {unlocked ? <span className="text-xl">🎮</span> : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <div className="text-left">
                        <p className="font-semibold text-sm text-foreground">Nivel {lvl}+ — {lCfg.label}</p>
                        <p className="text-xs text-muted-foreground">{lCfg.description} · {lCfg.foodCount} alimentos</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lCfg.badgeColor}`}>{lCfg.timeLimit > 0 ? `${lCfg.timeLimit}s` : "Sin tiempo"}</span>
                  </button>
                );
              })}
            </div>

            <Button size="lg" className="rounded-full px-10 gap-2 text-base" onClick={() => startLevel(1)}>
              <Zap className="h-5 w-5" />
              ¡Empezar desde el Nivel 1!
            </Button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && (
          <>
            {feedback && (
              <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-4 shadow-xl border-2 max-w-xs w-full transition-all animate-in slide-in-from-top-2 ${
                feedback.correcto ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {feedback.correcto ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <p className={`font-bold text-sm ${feedback.correcto ? "text-green-800" : "text-red-800"}`}>
                    {feedback.correcto ? `¡Correcto! +${10 + racha * 2} pts 🎉` : "Incorrecto 😅"}
                  </p>
                </div>
                <p className={`text-xs leading-relaxed ${feedback.correcto ? "text-green-700" : "text-red-700"}`}>
                  💡 {feedback.dato}
                </p>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeColor}`}>Nivel {level} — {cfg.label}</span>
                  {racha >= 2 && <span className="text-amber-600 font-bold text-xs flex items-center gap-1"><Zap className="h-3 w-3" /> Racha x{racha}</span>}
                </div>
                <span className="font-bold text-foreground">⭐ {puntos} pts</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{alimentos.length - pendientes.length}/{alimentos.length} clasificados</span>
                  <span className="text-green-600 font-medium">✅ {correctas}</span>
                </div>
                <Progress value={progreso} className="h-2" />
              </div>
              {cfg.timeLimit > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs mb-1">
                    <Timer className={`h-3.5 w-3.5 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                    <span className={`font-bold ${timeLeft <= 10 ? "text-red-500" : "text-muted-foreground"}`}>{timeLeft}s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${timerPct > 50 ? "bg-green-500" : timerPct > 25 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${timerPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-sm text-amber-800 text-center font-medium">
              🎮 Clasifica: ¿es <strong>✅ Saludable</strong> o <strong>❌ No saludable</strong>?
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alimentos.map(alimento => {
                const resultado = clasificados[alimento.nombre];
                const clasifado = resultado !== undefined;
                return (
                  <div
                    key={alimento.nombre}
                    className={`rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                      clasifado
                        ? resultado ? "border-green-400 bg-green-50 scale-95" : "border-red-400 bg-red-50 scale-95 opacity-70"
                        : "border-border bg-card hover:shadow-md"
                    }`}
                  >
                    <div className="text-3xl mb-2">{alimento.emoji}</div>
                    <p className="font-semibold text-xs text-foreground mb-1">{alimento.nombre}</p>
                    <p className="text-[9px] text-muted-foreground mb-3">{alimento.categoria}</p>
                    {clasifado ? (
                      <div className="flex items-center justify-center gap-1 text-xs font-bold">
                        {resultado ? <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">¡Correcto!</span></>
                          : <><XCircle className="h-4 w-4 text-red-500" /><span className="text-red-600">Incorrecto</span></>}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={() => clasificar(alimento, true)} className="bg-green-100 text-green-700 text-xs font-bold py-1.5 rounded-xl border border-green-200 hover:bg-green-200 transition-colors">✅ Sano</button>
                        <button onClick={() => clasificar(alimento, false)} className="bg-red-100 text-red-700 text-xs font-bold py-1.5 rounded-xl border border-red-200 hover:bg-red-200 transition-colors">❌ No</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ROUND RESULT */}
        {phase === "roundResult" && (
          <div className="flex flex-col items-center text-center gap-5 py-6">
            <div className="text-5xl">
              {roundCorrect / alimentos.length >= 0.8 ? "🏆" : roundCorrect / alimentos.length >= 0.6 ? "⭐" : "💪"}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">
                {roundCorrect / alimentos.length >= 0.8 ? "¡Excelente! ¡Casi perfecta!" :
                 roundCorrect / alimentos.length >= 0.6 ? "¡Buen trabajo! Nivel superado 🎉" :
                 "¡Sigue intentando! ¡Tú puedes!"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{roundCorrect}/{alimentos.length} correctas — Nivel {level}</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <Star key={s} className={`h-7 w-7 ${s <= Math.ceil((roundCorrect / alimentos.length) * 3) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-xs w-full">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-700">{roundCorrect}</p>
                <p className="text-xs text-green-600">Correctas</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-700">+{puntos}</p>
                <p className="text-xs text-amber-600">Puntos</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{roundCorrect / alimentos.length >= 0.6 ? level + 1 : level}</p>
                <p className="text-xs text-blue-600">Próx. nivel</p>
              </div>
            </div>
            {roundCorrect / alimentos.length < 0.6 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 max-w-xs w-full text-sm text-amber-700">
                ⚠️ Necesitas 60% para avanzar. ¡Revisa los alimentos difíciles!
              </div>
            )}
            <div className="flex gap-3 w-full max-w-xs">
              <Button variant="outline" className="flex-1 rounded-full" onClick={resetToMenu}><RotateCcw className="h-4 w-4 mr-1" /> Menú</Button>
              <Button className="flex-1 rounded-full gap-1" onClick={handleNextLevel}>
                {roundCorrect / alimentos.length >= 0.6 ? <><TrendingUp className="h-4 w-4" /> Nivel {level + 1}</> : <><Zap className="h-4 w-4" /> Reintentar</>}
              </Button>
            </div>
          </div>
        )}

        {/* LEVEL UP ANIMATION */}
        {phase === "levelUp" && (
          <div className="flex flex-col items-center text-center gap-4 py-10">
            <div className="text-6xl animate-bounce">🚀</div>
            <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              ¡NIVEL {level}!
            </h2>
            <p className="text-muted-foreground">¡Avanzando al siguiente desafío...</p>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
