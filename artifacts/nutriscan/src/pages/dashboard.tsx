import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetUser, useGetRecipeStats, getGetUserQueryKey, getGetRecipeStatsQueryKey } from "@workspace/api-client-react";
import { getUserId, clearUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sparkles, History, User, LogOut, TrendingUp, ChefHat, Calendar,
  Camera, Bot, ShoppingCart, Trophy, Users, BookOpen, Leaf, Star, Heart, Zap
} from "lucide-react";

const MODULES = [
  { href: "/chef", icon: Bot, title: "Chef IA", desc: "Asistente nutricional", color: "from-violet-500 to-purple-600" },
  { href: "/planner", icon: Calendar, title: "Planner Semanal", desc: "Organiza las comidas", color: "from-blue-500 to-cyan-500" },
  { href: "/mercado", icon: ShoppingCart, title: "Mercado Inteligente", desc: "Lista de compras", color: "from-emerald-500 to-green-600" },
  { href: "/retos", icon: Trophy, title: "Retos Familiares", desc: "Hábitos saludables", color: "from-amber-500 to-orange-500" },
  { href: "/comunidad", icon: Users, title: "Comunidad", desc: "Comparte con familias", color: "from-pink-500 to-rose-500" },
  { href: "/aprende", icon: BookOpen, title: "Aprende", desc: "Biblioteca de nutrición", color: "from-teal-500 to-emerald-600" },
  { href: "/biohuerto", icon: Leaf, title: "Biohuerto", desc: "Cultiva tus alimentos", color: "from-lime-500 to-green-600" },
  { href: "/impacto", icon: TrendingUp, title: "Panel de Impacto", desc: "Tu huella nutricional", color: "from-indigo-500 to-blue-600" },
  { href: "/nutrijuego", icon: Sparkles, title: "NutriJuego", desc: "¿Saludable o no? ¡Juega!", color: "from-green-500 to-emerald-600" },
];

const MOTIVATIONAL_MESSAGES = [
  { text: "¡Cada receta que preparas es un acto de amor! 💚", icon: "💚" },
  { text: "Hoy es un gran día para cuidar la salud de tus hijos 🌟", icon: "🌟" },
  { text: "¡Tú puedes prevenir la anemia con comida deliciosa! 💪", icon: "💪" },
  { text: "Una madre nutrida cría hijos saludables y felices 🥰", icon: "🥰" },
  { text: "¡Pequeños cambios en la dieta hacen grandes diferencias! 🌱", icon: "🌱" },
  { text: "El hierro en sangrecita y lentejas es tu mejor aliado 🩸", icon: "🩸" },
  { text: "¡Sigue así! Tu familia te lo agradecerá siempre ⭐", icon: "⭐" },
];

const NUTRITION_TIPS = [
  "💡 Combina lentejas + naranja para triplicar la absorción de hierro",
  "💡 La sangrecita tiene 29mg de hierro por cada 100g — ¡la más nutritiva!",
  "💡 Agrega limón a tus guisos para que el hierro se absorba mejor",
  "💡 La quinoa tiene todos los aminoácidos esenciales para el crecimiento",
  "💡 Un huevo al día aporta proteínas, vitaminas y hierro para los niños",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "¡Buenos días";
  if (hour < 18) return "¡Buenas tardes";
  return "¡Buenas noches";
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const userId = getUserId();

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const { data: user } = useGetUser(userId!, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId!) },
  });

  const { data: stats } = useGetRecipeStats(userId!, {
    query: { enabled: !!userId, queryKey: getGetRecipeStatsQueryKey(userId!) },
  });

  const handleLogout = () => {
    clearUserId();
    setLocation("/");
  };

  if (!userId) return null;

  const dayIndex = new Date().getDay();
  const motivMsg = MOTIVATIONAL_MESSAGES[dayIndex % MOTIVATIONAL_MESSAGES.length];
  const tip = NUTRITION_TIPS[dayIndex % NUTRITION_TIPS.length];

  const getEncouragementMsg = () => {
    const total = stats?.totalRecipes ?? 0;
    if (total === 0) return "¡Genera tu primera receta hoy y empieza el camino hacia una familia más sana! 🚀";
    if (total < 5) return `¡Vas muy bien! Ya tienes ${total} receta${total > 1 ? "s" : ""}. ¡Sigue así! 🌟`;
    if (total < 20) return `¡Increíble! ${total} recetas generadas. ¡Tu familia come de maravilla! 💪`;
    return `¡Eres una super mamá! ${total} recetas y creciendo. ¡Tus hijos te lo agradecen! 🏆`;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-8 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="max-w-screen-lg mx-auto relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium mb-0.5">
                {getGreeting()},
              </p>
              <h1 className="text-3xl font-serif font-bold">
                {user?.nombre || "..."} 👋
              </h1>
              <p className="text-primary-foreground/80 mt-1 text-sm max-w-md">{getEncouragementMsg()}</p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-full shrink-0">
              <Heart className="h-6 w-6 fill-white/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-5">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{motivMsg.text}</p>
            <p className="text-xs text-amber-600 mt-0.5">{tip}</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center" data-testid="stat-total">
              <div className="bg-primary/10 p-2.5 rounded-xl mb-2">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-xs text-muted-foreground leading-tight">Recetas creadas</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center" data-testid="stat-month">
              <div className="bg-secondary/10 p-2.5 rounded-xl mb-2">
                <Zap className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground leading-tight">Este mes</p>
            </div>
            {stats.topIngredient ? (
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center" data-testid="stat-ingredient">
                <div className="bg-green-100 p-2.5 rounded-xl mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-bold text-foreground capitalize truncate w-full text-center">{stats.topIngredient}</p>
                <p className="text-xs text-muted-foreground leading-tight">Fav. ingrediente</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="bg-muted p-2.5 rounded-xl mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">–</p>
                <p className="text-xs text-muted-foreground leading-tight">Ingrediente fav.</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/escanear" data-testid="card-escanear">
            <div className="group relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 flex flex-col gap-3 cursor-pointer hover:opacity-95 transition-opacity shadow-md shadow-primary/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="bg-white/20 p-3 rounded-xl w-fit relative z-10">
                <Camera className="h-6 w-6" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" />
                  ¡Más popular!
                </div>
                <h2 className="text-lg font-serif font-bold">Nutri-Foto IA</h2>
                <p className="text-primary-foreground/80 text-xs mt-1">
                  Fotografía ingredientes → IA detecta → Receta lista 🎉
                </p>
              </div>
            </div>
          </Link>

          <Link href="/generar" data-testid="card-generar">
            <div className="group bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 rounded-2xl p-6 flex flex-col gap-3 cursor-pointer hover:from-secondary/30 hover:to-secondary/20 transition-all">
              <div className="bg-secondary/20 p-3 rounded-xl w-fit">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-foreground">Generar Receta</h2>
                <p className="text-muted-foreground text-xs mt-1">
                  Escribe ingredientes → Receta completa con nutrición 🌟
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/historial" data-testid="card-historial">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Historial</p>
                <p className="text-xs text-muted-foreground">Tus recetas</p>
              </div>
            </div>
          </Link>
          <Link href="/chef" data-testid="card-chef">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-violet-100 p-2.5 rounded-xl shrink-0">
                <Bot className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Chef IA</p>
                <p className="text-xs text-muted-foreground">Chat nutrición</p>
              </div>
            </div>
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-serif font-bold text-lg text-foreground">Todos los módulos</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{MODULES.length}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link key={mod.href} href={mod.href}>
                  <div className={`relative overflow-hidden bg-gradient-to-br ${mod.color} rounded-2xl p-4 flex flex-col gap-2 cursor-pointer hover:opacity-90 transition-opacity`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                    <div className="bg-white/20 p-2 rounded-lg w-fit relative z-10">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm font-bold text-white">{mod.title}</p>
                      <p className="text-[11px] text-white/75 mt-0.5 leading-tight">{mod.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <Link href="/perfil" data-testid="card-perfil">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-accent/5 transition-colors">
            <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-3 rounded-xl shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground">{user?.nombre || "Mi Perfil"}</h2>
              <p className="text-muted-foreground text-xs truncate">
                {user ? `${user.integrantes} integrantes · ${user.ninos} niño(s) · Presupuesto ${user.presupuesto}` : "Cargando..."}
              </p>
            </div>
            <span className="text-xs text-primary font-semibold shrink-0">Editar →</span>
          </div>
        </Link>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout" className="text-muted-foreground hover:text-foreground gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
