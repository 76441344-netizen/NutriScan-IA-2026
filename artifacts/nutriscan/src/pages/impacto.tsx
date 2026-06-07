import { useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { useGetRecipeStats, useListRecipes, useGetUser, getGetRecipeStatsQueryKey, getListRecipesQueryKey, getGetUserQueryKey } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, ChefHat, Target, Star, Zap, Trophy, ShoppingBag } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

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
    try {
      const saved = localStorage.getItem(`retos_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { puntos: 0, retos: [] };
  })();

  const completados = (retosData.retos || []).filter((r: { completado: boolean }) => r.completado).length;

  const plannerData = (() => {
    try {
      const saved = localStorage.getItem(`planner_${userId}`);
      if (!saved) return {};
      return JSON.parse(saved);
    } catch {}
    return {};
  })();

  const menusSemanal = Object.keys(plannerData).length;

  const mercadoData = (() => {
    try {
      const saved = localStorage.getItem(`mercado_${userId}`);
      if (saved) {
        const items = JSON.parse(saved);
        return {
          total: items.length,
          comprados: items.filter((i: { checked: boolean }) => i.checked).length,
        };
      }
    } catch {}
    return { total: 0, comprados: 0 };
  })();

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

  const ingredientFreq = (() => {
    if (!recipes) return [];
    const counts: Record<string, number> = {};
    recipes.forEach((r) => {
      const items = r.ingredientesUsados.split(/[,\n]+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);
      items.forEach((item: string) => { counts[item] = (counts[item] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  })();

  const ironRichIngredients = ["espinaca", "lenteja", "frijol", "quinoa", "sangrecita", "hígado", "atún", "acelga", "perejil", "kiwicha"];
  const ironRecipes = recipes?.filter((r) =>
    ironRichIngredients.some((i) => r.ingredientesUsados.toLowerCase().includes(i))
  ).length || 0;

  const healthScore = Math.min(100, Math.round(
    (stats?.totalRecipes || 0) * 5 +
    completados * 10 +
    menusSemanal * 3 +
    (retosData.puntos || 0) * 0.05
  ));

  const pieData = [
    { name: "Recetas IA", value: stats?.totalRecipes || 0 },
    { name: "Retos completados", value: completados },
    { name: "Menús planificados", value: Math.floor(menusSemanal / 4) },
    { name: "Compras realizadas", value: mercadoData.comprados },
  ].filter((d) => d.value > 0);

  if (pieData.length === 0) {
    pieData.push({ name: "Sin datos aún", value: 1 });
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Panel de Impacto</h1>
            <p className="text-white/80 text-sm">Tu huella nutricional familiar</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-primary/10 p-2 rounded-xl w-fit">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats?.totalRecipes || 0}</p>
            <p className="text-xs text-muted-foreground">Recetas generadas</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-green-100 p-2 rounded-xl w-fit">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{ironRecipes}</p>
            <p className="text-xs text-muted-foreground">Recetas anti-anemia</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-amber-100 p-2 rounded-xl w-fit">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">{completados}</p>
            <p className="text-xs text-muted-foreground">Retos completados</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-purple-100 p-2 rounded-xl w-fit">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{retosData.puntos || 0}</p>
            <p className="text-xs text-muted-foreground">Puntos ganados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-blue-100 p-2 rounded-xl w-fit">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
            <p className="text-xs text-muted-foreground">Recetas este mes</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-orange-100 p-2 rounded-xl w-fit">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{mercadoData.comprados}/{mercadoData.total}</p>
            <p className="text-xs text-muted-foreground">Compras completadas</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-indigo-100 p-2 rounded-xl w-fit">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold">{user?.integrantes || 0}</p>
            <p className="text-xs text-muted-foreground">Integrantes familia</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif font-bold text-foreground">Puntaje de Salud Familiar</h3>
            <span className="text-2xl font-bold text-primary">{healthScore}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {healthScore < 30 ? "🌱 Recién comenzando tu camino nutricional" :
             healthScore < 60 ? "📈 Buen progreso, ¡sigue así!" :
             healthScore < 80 ? "⭐ ¡Excelente dedicación a la salud familiar!" :
             "🏆 ¡Familia NutriCampeona!"}
          </p>
        </div>

        {recipesPerMonth.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif font-bold text-foreground mb-4">Recetas por mes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recipesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="recetas" fill="#10b981" radius={[6, 6, 0, 0]} name="Recetas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ingredientFreq.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif font-bold text-foreground mb-4">Top ingredientes usados</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ingredientFreq} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Veces" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif font-bold text-foreground mb-4">Distribución de actividades</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {stats?.topIngredient && (
          <div className="bg-gradient-to-r from-primary/10 to-green-100 border border-primary/20 rounded-2xl p-5">
            <p className="text-sm font-semibold text-foreground mb-1">🏆 Tu ingrediente estrella</p>
            <p className="text-2xl font-bold capitalize text-primary">{stats.topIngredient}</p>
            <p className="text-xs text-muted-foreground mt-1">El ingrediente que más has usado en tus recetas con IA</p>
          </div>
        )}
      </div>
    </div>
  );
}
