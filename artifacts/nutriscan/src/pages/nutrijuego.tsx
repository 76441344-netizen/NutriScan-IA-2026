import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Trophy, Star, Zap, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Alimento {
  nombre: string;
  emoji: string;
  saludable: boolean;
  datoCurioso: string;
  color: string;
}

const TODOS_ALIMENTOS: Alimento[] = [
  { nombre: "Espinaca", emoji: "🥬", saludable: true, datoCurioso: "Rica en hierro y vitamina C. ¡Previene la anemia!", color: "bg-green-100 border-green-300" },
  { nombre: "Lentejas", emoji: "🫘", saludable: true, datoCurioso: "Tienen 3x más hierro que la carne roja. ¡Súper nutritivas!", color: "bg-orange-100 border-orange-300" },
  { nombre: "Sangrecita", emoji: "🩸", saludable: true, datoCurioso: "El alimento con más hierro: 29mg por 100g. ¡Combate la anemia!", color: "bg-red-100 border-red-300" },
  { nombre: "Naranja", emoji: "🍊", saludable: true, datoCurioso: "La vitamina C ayuda a absorber el hierro. ¡Cómela con lentejas!", color: "bg-orange-100 border-orange-300" },
  { nombre: "Quinoa", emoji: "🌾", saludable: true, datoCurioso: "Tiene todos los aminoácidos esenciales. ¡El cereal más completo!", color: "bg-yellow-100 border-yellow-300" },
  { nombre: "Huevo", emoji: "🥚", saludable: true, datoCurioso: "Un huevo tiene proteínas, hierro y vitamina B12. ¡Un súper alimento!", color: "bg-yellow-100 border-yellow-300" },
  { nombre: "Zanahoria", emoji: "🥕", saludable: true, datoCurioso: "Rica en betacaroteno que se convierte en vitamina A. ¡Para la vista!", color: "bg-orange-100 border-orange-300" },
  { nombre: "Betarraga", emoji: "🫚", saludable: true, datoCurioso: "Aumenta la hemoglobina y mejora la circulación sanguínea.", color: "bg-pink-100 border-pink-300" },
  { nombre: "Hígado", emoji: "🥩", saludable: true, datoCurioso: "El hígado de pollo es la mejor fuente de hierro hem. ¡Anti-anemia!", color: "bg-red-100 border-red-300" },
  { nombre: "Brócoli", emoji: "🥦", saludable: true, datoCurioso: "Tiene vitamina C, hierro y calcio. ¡Un trío ganador para los niños!", color: "bg-green-100 border-green-300" },
  { nombre: "Plátano", emoji: "🍌", saludable: true, datoCurioso: "Rico en potasio y vitamina B6. ¡Da energía natural a los niños!", color: "bg-yellow-100 border-yellow-300" },
  { nombre: "Sardina", emoji: "🐟", saludable: true, datoCurioso: "Rica en omega-3 y calcio. ¡Excelente para el cerebro de los niños!", color: "bg-blue-100 border-blue-300" },
  { nombre: "Galleta rellena", emoji: "🍪", saludable: false, datoCurioso: "Tiene mucho azúcar y grasas trans. ¡Puede causar caries y obesidad!", color: "bg-gray-100 border-gray-300" },
  { nombre: "Gaseosa", emoji: "🥤", saludable: false, datoCurioso: "Una gaseosa tiene hasta 10 cucharadas de azúcar. ¡Daña los dientes!", color: "bg-gray-100 border-gray-300" },
  { nombre: "Papas fritas", emoji: "🍟", saludable: false, datoCurioso: "Tienen muchas calorías vacías y sodio. ¡No nutren a los niños!", color: "bg-gray-100 border-gray-300" },
  { nombre: "Dulces", emoji: "🍭", saludable: false, datoCurioso: "El exceso de azúcar causa caries y dificulta absorber el hierro.", color: "bg-gray-100 border-gray-300" },
  { nombre: "Hot dog", emoji: "🌭", saludable: false, datoCurioso: "Tiene muchos conservantes y sodio. ¡No apto para niños pequeños!", color: "bg-gray-100 border-gray-300" },
  { nombre: "Donut", emoji: "🍩", saludable: false, datoCurioso: "Grasas saturadas + azúcar = sin nutrientes. ¡Evítalo para los niños!", color: "bg-gray-100 border-gray-300" },
];

function getDailyAlimentos(): Alimento[] {
  const seed = Math.floor(Date.now() / 86400000);
  const shuffled = [...TODOS_ALIMENTOS].sort((a, b) => {
    const ha = (a.nombre.charCodeAt(0) * seed) % 100;
    const hb = (b.nombre.charCodeAt(0) * seed) % 100;
    return ha - hb;
  });
  const saludables = shuffled.filter((a) => a.saludable).slice(0, 3);
  const noSaludables = shuffled.filter((a) => !a.saludable).slice(0, 3);
  return [...saludables, ...noSaludables].sort(() => Math.random() - 0.5);
}

interface JuegoState {
  puntos: number;
  racha: number;
  maxRacha: number;
  partidas: number;
}

export default function NutriJuego() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();

  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [clasificados, setClasificados] = useState<Record<string, boolean | null>>({});
  const [feedback, setFeedback] = useState<{ nombre: string; correcto: boolean; dato: string } | null>(null);
  const [terminado, setTerminado] = useState(false);
  const [stats, setStats] = useState<JuegoState>({ puntos: 0, racha: 0, maxRacha: 0, partidas: 0 });

  const storageKey = `nutrijuego_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) setStats(JSON.parse(saved));
    setAlimentos(getDailyAlimentos());
  }, [userId]);

  const saveStats = (s: JuegoState) => {
    setStats(s);
    localStorage.setItem(storageKey, JSON.stringify(s));
  };

  const clasificar = useCallback((alimento: Alimento, escogiSaludable: boolean) => {
    if (clasificados[alimento.nombre] !== undefined || terminado) return;

    const correcto = alimento.saludable === escogiSaludable;
    const nuevaClasificados = { ...clasificados, [alimento.nombre]: correcto };
    setClasificados(nuevaClasificados);

    const nuevaRacha = correcto ? stats.racha + 1 : 0;
    const nuevosPuntos = correcto ? stats.puntos + (10 + nuevaRacha * 2) : stats.puntos;
    const nuevoMaxRacha = Math.max(stats.maxRacha, nuevaRacha);

    const newStats = {
      puntos: nuevosPuntos,
      racha: nuevaRacha,
      maxRacha: nuevoMaxRacha,
      partidas: stats.partidas,
    };
    saveStats(newStats);

    setFeedback({ nombre: alimento.nombre, correcto, dato: alimento.datoCurioso });

    setTimeout(() => {
      setFeedback(null);
      const todosClasificados = alimentos.every((a) => nuevaClasificados[a.nombre] !== undefined);
      if (todosClasificados) {
        const correctosTotal = Object.values(nuevaClasificados).filter(Boolean).length;
        const finalStats = { ...newStats, partidas: newStats.partidas + 1, racha: 0 };
        saveStats(finalStats);
        setTerminado(true);
        if (correctosTotal === alimentos.length) {
          toast({ title: "🏆 ¡Perfecta! ¡Clasificaste todo correctamente!", description: `+${alimentos.length * 12} puntos bonus 🎉` });
        } else {
          toast({ title: `✅ Ronda completada`, description: `${correctosTotal}/${alimentos.length} correctas` });
        }
      }
    }, 2200);
  }, [alimentos, clasificados, stats, terminado]);

  const reiniciar = () => {
    setAlimentos(getDailyAlimentos());
    setClasificados({});
    setFeedback(null);
    setTerminado(false);
  };

  const pendientes = alimentos.filter((a) => clasificados[a.nombre] === undefined);
  const correctas = Object.values(clasificados).filter(Boolean).length;
  const incorrectas = Object.values(clasificados).filter((v) => v === false).length;
  const estrellas = correctas >= 6 ? 3 : correctas >= 4 ? 2 : correctas >= 2 ? 1 : 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-7 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl text-2xl">🥗</div>
            <div>
              <h1 className="text-2xl font-serif font-bold">NutriJuego</h1>
              <p className="text-white/80 text-sm">¿Saludable o no saludable? ¡Tú decides!</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{stats.puntos}</p>
              <p className="text-xs text-white/80 flex items-center justify-center gap-1 mt-0.5"><Star className="h-3 w-3" /> Puntos</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{stats.racha}</p>
              <p className="text-xs text-white/80 flex items-center justify-center gap-1 mt-0.5"><Zap className="h-3 w-3" /> Racha</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3 text-center backdrop-blur">
              <p className="text-2xl font-bold">{stats.partidas}</p>
              <p className="text-xs text-white/80 flex items-center justify-center gap-1 mt-0.5"><Trophy className="h-3 w-3" /> Partidas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-4">
        {feedback && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-4 shadow-xl border-2 max-w-xs w-full transition-all ${
            feedback.correcto ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {feedback.correcto
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <XCircle className="h-5 w-5 text-red-600" />}
              <p className={`font-bold text-sm ${feedback.correcto ? "text-green-800" : "text-red-800"}`}>
                {feedback.correcto ? "¡Correcto! 🎉" : "¡Incorrecto! 😅"}
              </p>
            </div>
            <p className={`text-xs leading-relaxed ${feedback.correcto ? "text-green-700" : "text-red-700"}`}>
              💡 {feedback.dato}
            </p>
          </div>
        )}

        {!terminado ? (
          <>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Progreso de la ronda</p>
                <p className="text-sm text-muted-foreground">{alimentos.length - pendientes.length}/{alimentos.length}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="h-2.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${((alimentos.length - pendientes.length) / alimentos.length) * 100}%` }}
                />
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-green-600 font-medium">✅ {correctas} correctas</span>
                <span className="text-red-500 font-medium">❌ {incorrectas} incorrectas</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 font-medium text-center">
              🎮 Clasifica cada alimento — ¿es <strong>saludable</strong> o <strong>no saludable</strong>?
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alimentos.map((alimento) => {
                const resultado = clasificados[alimento.nombre];
                const clasifado = resultado !== undefined;
                return (
                  <div
                    key={alimento.nombre}
                    className={`rounded-2xl border-2 p-4 text-center transition-all ${
                      clasifado
                        ? resultado
                          ? "border-green-400 bg-green-50 scale-95"
                          : "border-red-400 bg-red-50 scale-95 opacity-80"
                        : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <div className="text-4xl mb-2">{alimento.emoji}</div>
                    <p className="font-semibold text-sm text-foreground mb-3">{alimento.nombre}</p>
                    {clasifado ? (
                      <div className="flex items-center justify-center gap-1">
                        {resultado ? (
                          <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> ¡Correcto!
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-xs flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Incorrecto
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => clasificar(alimento, true)}
                          className="bg-green-100 text-green-700 text-xs font-bold py-1.5 rounded-xl border border-green-200 hover:bg-green-200 transition-colors"
                        >
                          ✅ Sano
                        </button>
                        <button
                          onClick={() => clasificar(alimento, false)}
                          className="bg-red-100 text-red-700 text-xs font-bold py-1.5 rounded-xl border border-red-200 hover:bg-red-200 transition-colors"
                        >
                          ❌ No sano
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-5 py-6">
            <div className="text-6xl">
              {estrellas === 3 ? "🏆" : estrellas === 2 ? "🥈" : estrellas === 1 ? "🥉" : "💪"}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {estrellas === 3 ? "¡Perfecta! ¡Experta en nutrición!" :
                 estrellas === 2 ? "¡Muy bien! ¡Casi perfecta!" :
                 estrellas === 1 ? "¡Buen intento! ¡Sigue practicando!" :
                 "¡Sigue aprendiendo! ¡Tú puedes!"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {correctas}/{alimentos.length} respuestas correctas
              </p>
            </div>

            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 ${s <= estrellas ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{correctas}</p>
                <p className="text-xs text-green-600">Correctas ✅</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{incorrectas}</p>
                <p className="text-xs text-red-500">Incorrectas ❌</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 max-w-sm w-full">
              <p className="text-sm font-semibold text-primary mb-2">🌟 Dato del día</p>
              <p className="text-sm text-foreground">
                Los alimentos ricos en hierro como la sangrecita, lentejas y espinacas son esenciales para prevenir la anemia en niños.
                ¡Inclúyelos en cada comida!
              </p>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <Button variant="outline" className="flex-1 rounded-full gap-2" onClick={() => setLocation("/dashboard")}>
                Volver
              </Button>
              <Button className="flex-1 rounded-full gap-2" onClick={reiniciar}>
                <RotateCcw className="h-4 w-4" />
                Jugar de nuevo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
