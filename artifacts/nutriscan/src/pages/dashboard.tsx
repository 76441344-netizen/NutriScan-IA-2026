import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetUser, useGetRecipeStats, getGetUserQueryKey, getGetRecipeStatsQueryKey } from "@workspace/api-client-react";
import { getUserId, clearUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, History, User, LogOut, TrendingUp, ChefHat, Calendar } from "lucide-react";

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

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-10 px-4">
        <div className="max-w-screen-lg mx-auto">
          <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">Panel principal</p>
          <h1 className="text-3xl font-serif font-bold">
            Hola, {user?.nombre || "..."}
          </h1>
          <p className="text-primary-foreground/80 mt-1">Genera recetas saludables para tus hijos con IA</p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8 flex-1 flex flex-col gap-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4" data-testid="stat-total">
              <div className="bg-primary/10 p-3 rounded-xl">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalRecipes}</p>
                <p className="text-sm text-muted-foreground">Recetas totales</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4" data-testid="stat-month">
              <div className="bg-secondary/10 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
                <p className="text-sm text-muted-foreground">Este mes</p>
              </div>
            </div>
            {stats.topIngredient && (
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4" data-testid="stat-ingredient">
                <div className="bg-accent/10 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground capitalize">{stats.topIngredient}</p>
                  <p className="text-sm text-muted-foreground">Ingrediente favorito</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/generar" data-testid="card-generar">
            <div className="group bg-primary text-primary-foreground rounded-2xl p-7 flex flex-col gap-4 h-full cursor-pointer hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
              <div className="bg-white/20 p-3 rounded-xl w-fit">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold">Generar Receta</h2>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Escribe los ingredientes que tienes y la IA creará una receta nutritiva
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Comenzar</span>
              </div>
            </div>
          </Link>

          <Link href="/historial" data-testid="card-historial">
            <div className="group bg-card border border-border rounded-2xl p-7 flex flex-col gap-4 h-full cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-secondary/10 p-3 rounded-xl w-fit">
                <History className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">Historial</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Revisa todas las recetas que has generado anteriormente
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-sm font-semibold text-secondary">Ver historial &rarr;</span>
              </div>
            </div>
          </Link>

          <Link href="/perfil" data-testid="card-perfil">
            <div className="group bg-card border border-border rounded-2xl p-7 flex flex-col gap-4 h-full cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-3 rounded-xl w-fit">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">Mi Perfil</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Actualiza la información de tu familia y preferencias
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-sm font-semibold text-primary">Ver perfil &rarr;</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout" className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
