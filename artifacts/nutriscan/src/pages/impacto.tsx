import { useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { useGetRecipeStats, useListRecipes, useGetUser, getGetRecipeStatsQueryKey, getListRecipesQueryKey, getGetUserQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, ChefHat, Target, Star, Zap, Trophy, ShoppingBag, Lock, CheckCircle2, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const NIVELES = [
  { nombre: "Principiante", puntos: 0, medalla: "🥉", siguiente: 100 },
  { nombre: "Aprendiz", puntos: 100, medalla: "🥈", siguiente: 300 },
  { nombre: "Nutricionista Jr.", puntos: 300, medalla: "🥇", siguiente: 600 },
  { nombre: "Chef Saludable", puntos: 600, medalla: "🏆", siguiente: 1000 },
  { nombre: "Maestro Nutri", puntos: 1000, medalla: "⭐", siguiente: 1500 },
  { nombre: "Experto Anti-Anemia", puntos: 1500, medalla: "🌟", siguiente: Infinity },
];

function getNivelInfo(puntos: number) {
  let info = NIVELES[0];
  for (const n of NIVELES) { if (puntos >= n.puntos) info = n; }
  return info;
}

export default function Impacto() {
  const [, setLocation] = useLocation();
  const userId = getUserId();

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const { data: stats } = useGetRecipeStats(userId!, { query: { enabled: !!userId, queryKey: getGetRecipeStatsQueryKey(userId!) } });
  const { data: recipes } = useListRecipes({ userId: userId! }, { query: { enabled: !!userId, queryKey: getListRecipesQueryKey({ userId: userId! }) } });
  const { data: user } = useGetUser(userId!, { query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId!) } });

  const retosData = (() => {
    try { const s = localStorage.getItem(`retos_${userId}`); return s ? JSON.parse(s) : { puntos: 0, retos: [] }; } catch { return { puntos: 0, retos: [] }; }
  })();
  const completados = (retosData.retos || []).filter((r: { completado: boolean }) => r.completado).length;

  const plannerData = (() => {
    try { const s = localStorage.getItem(`planner_${userId}`); return s ? JSON.parse(s) : {}; } catch { return {}; }
  })();
  const menusSemanal = Object.keys(plannerData).length;

  const mercadoData = (() => {
    try {
      const s = localStorage.getItem(`mercado2_${userId}`);
      if (s) { const items = JSON.parse(s); return { total: items.length, comprados: items.filter((i: { checked: boolean }) => i.checked).length }; }
    } catch {}
    return { total: 0, comprados: 0 };
  })();

  const ironRichIngredients = ["espinaca", "lenteja", "frijol", "quinoa", "sangrecita", "hígado", "atún", "acelga", "perejil", "kiwicha", "hierro", "betarraga"];
  const ironRecipes = recipes?.filter((r) => ironRichIngredients.some((i) => r.ingredientesUsados.toLowerCase().includes(i))).length || 0;

  const totalPuntos = retosData.puntos || 0;
  const nivelInfo = getNivelInfo(totalPuntos);
  const nextNivel = NIVELES.find((n) => n.puntos > totalPuntos);
  const progresNivel = nextNivel ? Math.min(100, Math.round(((totalPuntos - nivelInfo.puntos) / (nextNivel.puntos - nivelInfo.puntos)) * 100)) : 100;

  const healthScore = Math.min(100, Math.round(
    (stats?.totalRecipes || 0) * 5 +
    completados * 10 +
    menusSemanal * 3 +
    totalPuntos * 0.05
  ));

  const recipesPerMonth = (() => {
    if (!recipes) return [];
    const counts: Record<string, number> = {};
    recipes.forEach((r) => {
      const date = new Date(r.createdAt);
      const key = date.toLocaleDateString("es-PE", { month: "short", year: "2-digit" });
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).slice(-6).map(([mes, recetas]) => ({ mes, recetas }));
  })();

  const totalRecipes = stats?.totalRecipes || 0;
  const LOGROS = [
    { id: "primera_receta", emoji: "🍽️", titulo: "Primera Receta", desc: "Crea tu primera receta con IA", unlocked: totalRecipes >= 1 },
    { id: "chef_ia", emoji: "🤖", titulo: "Chef IA Activo", desc: "Haz tu primera consulta al Chef IA", unlocked: true },
    { id: "cinco_recetas", emoji: "⭐", titulo: "5 Recetas Creadas", desc: "Genera 5 recetas con IA", unlocked: totalRecipes >= 5 },
    { id: "menu_semanal", emoji: "📅", titulo: "Menú Semanal", desc: "Crea tu primer menú semanal", unlocked: menusSemanal > 0 },
    { id: "reto_familiar", emoji: "🏆", titulo: "Reto Familiar", desc: "Completa tu primer reto familiar", unlocked: completados >= 1 },
    { id: "anti_anemia", emoji: "💪", titulo: "Anti-Anemia Pro", desc: "Prepara 3 recetas anti-anemia", unlocked: ironRecipes >= 3 },
    { id: "diez_recetas", emoji: "🌟", titulo: "10 Recetas Maestras", desc: "Genera 10 recetas en total", unlocked: totalRecipes >= 10 },
    { id: "mercado", emoji: "🛒", titulo: "Compra Inteligente", desc: "Completa tu primera lista de compras", unlocked: mercadoData.comprados >= 1 },
  ];

  const unlockedCount = LOGROS.filter((l) => l.unlocked).length;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-2xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">🏆 Tu Progreso Nutricional Familiar</h1>
              <p className="text-white/80 text-sm">Observa cómo tu familia mejora sus hábitos alimenticios día a día.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-5">

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 font-medium">Nivel Familiar</p>
                <p className="text-2xl font-bold mt-0.5">{nivelInfo.nombre}</p>
                <p className="text-3xl mt-1">{nivelInfo.medalla}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{totalPuntos}</p>
                <p className="text-sm text-white/80">puntos totales</p>
              </div>
            </div>
          </div>
          {nextNivel && (
            <div className="p-4 bg-indigo-50">
              <div className="flex justify-between text-sm font-medium text-indigo-800 mb-2">
                <span>Progreso al siguiente nivel: <strong>{nextNivel.nombre}</strong></span>
                <span>{totalPuntos}/{nextNivel.puntos} pts</span>
              </div>
              <Progress value={progresNivel} className="h-3" />
              <p className="text-xs text-indigo-600 mt-1.5">Faltan {nextNivel.puntos - totalPuntos} puntos para subir de nivel</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ChefHat, value: stats?.totalRecipes || 0, label: "Recetas Generadas", color: "bg-primary/10", iconColor: "text-primary", emoji: "🍲" },
            { icon: Target, value: ironRecipes, label: "Recetas Anti-Anemia", color: "bg-green-100", iconColor: "text-green-600", emoji: "🎯" },
            { icon: Trophy, value: completados, label: "Retos Completados", color: "bg-amber-100", iconColor: "text-amber-600", emoji: "🏆" },
            { icon: Star, value: totalPuntos, label: "Puntos Ganados", color: "bg-purple-100", iconColor: "text-purple-600", emoji: "⭐" },
            { icon: Zap, value: stats?.thisMonth || 0, label: "Recetas este Mes", color: "bg-blue-100", iconColor: "text-blue-600", emoji: "⚡" },
            { icon: ShoppingBag, value: `${mercadoData.comprados}/${mercadoData.total}`, label: "Compras Completadas", color: "bg-orange-100", iconColor: "text-orange-600", emoji: "🛒" },
            { icon: Users, value: user?.integrantes || 0, label: "Integrantes Familia", color: "bg-pink-100", iconColor: "text-pink-600", emoji: "👨‍👩‍👧‍👦" },
            { icon: Heart, value: unlockedCount, label: "Logros Desbloqueados", color: "bg-rose-100", iconColor: "text-rose-600", emoji: "🏅" },
          ].map(({ icon: Icon, value, label, color, iconColor, emoji }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
              <div className={`${color} p-2 rounded-xl w-fit`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{emoji} {label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-bold text-foreground">💚 Puntaje de Salud Familiar</h3>
            <span className="text-2xl font-bold text-primary">{healthScore}<span className="text-sm text-muted-foreground font-normal">/100</span></span>
          </div>
          <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
              style={{ width: `${Math.max(healthScore, 5)}%` }}
            >
              {healthScore > 15 && <span className="text-[10px] text-white font-bold">{healthScore}%</span>}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {healthScore < 20 ? "🌱 ¡Bienvenida! Cada receta cuenta. Empieza tu camino nutricional." :
             healthScore < 40 ? "📈 ¡Muy buen comienzo! Sigue cocinando recetas saludables." :
             healthScore < 60 ? "⭐ ¡Excelente dedicación! Tu familia está mejorando su alimentación." :
             healthScore < 80 ? "💪 ¡Increíble! Eres una experta en nutrición familiar." :
             "🏆 ¡Familia NutriCampeona! Eres un ejemplo para todas las familias."}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-serif font-bold text-foreground mb-4">🏅 Logros Desbloqueados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOGROS.map((logro) => (
              <div
                key={logro.id}
                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                  logro.unlocked
                    ? "bg-green-50 border-green-200"
                    : "bg-muted/30 border-border opacity-60"
                }`}
              >
                <span className="text-2xl">{logro.unlocked ? logro.emoji : "🔒"}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${logro.unlocked ? "text-green-800" : "text-muted-foreground"}`}>{logro.titulo}</p>
                  <p className="text-xs text-muted-foreground truncate">{logro.desc}</p>
                </div>
                {logro.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipesPerMonth.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif font-bold text-foreground mb-4">📊 Recetas por mes</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={recipesPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="recetas" fill="#10b981" radius={[6, 6, 0, 0]} name="Recetas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif font-bold text-foreground mb-4">👨‍👩‍👧‍👦 Resumen Familiar</h3>
            <div className="space-y-3">
              {[
                { label: "Integrantes", value: user?.integrantes || 0, emoji: "👥" },
                { label: "Recetas creadas", value: totalRecipes, emoji: "🍲" },
                { label: "Recetas anti-anemia", value: ironRecipes, emoji: "💪" },
                { label: "Retos completados", value: completados, emoji: "🏆" },
                { label: "Nivel actual", value: nivelInfo.nombre, emoji: nivelInfo.medalla },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{emoji} {label}</span>
                  <span className="text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-3">
            <Star className="h-6 w-6 text-yellow-300 fill-yellow-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">🌟 ¡Excelente trabajo, mamá!</p>
              <p className="text-white/85 text-sm mt-1">
                Tu familia ya está construyendo hábitos alimenticios más saludables. Cada receta preparada es un paso hacia una vida libre de anemia. ¡Sigue avanzando para desbloquear nuevos logros!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {[
                  { val: stats?.thisMonth || 0, lbl: "🍲 Recetas este mes" },
                  { val: completados, lbl: "🏆 Retos completados" },
                  { val: mercadoData.comprados, lbl: "🛒 Compras realizadas" },
                  { val: unlockedCount, lbl: "🏅 Logros obtenidos" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} className="bg-white/20 rounded-xl p-2.5 text-center">
                    <p className="text-xl font-bold">{val}</p>
                    <p className="text-[10px] text-white/80 mt-0.5 leading-tight">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
