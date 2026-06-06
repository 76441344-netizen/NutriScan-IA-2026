import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetUser, useGetRecipeStats, getGetUserQueryKey, getGetRecipeStatsQueryKey } from "@workspace/api-client-react";
import { getUserId, clearUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, History, User, LogOut, TrendingUp, ChefHat, Calendar, Camera } from "lucide-react";

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
      {/* Hero banner */}
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

        {/* Main actions — 2x2 grid on mobile, 4-col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scan — featured */}
          <Link href="/escanear" data-testid="card-escanear" className="sm:col-span-2 lg:col-span-2">
            <div className="group relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-7 flex flex-col gap-4 h-full cursor-pointer hover:opacity-95 transition-opacity shadow-md shadow-primary/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="bg-white/20 p-3 rounded-xl w-fit relative z-10">
                <Camera className="h-7 w-7" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" />
                  Nuevo
                </div>
                <h2 className="text-xl font-serif font-bold">Escanear Ingredientes</h2>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Fotografía tus ingredientes y la IA los detecta automáticamente
                </p>
              </div>
              <div className="mt-auto relative z-10">
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Escanear ahora</span>
              </div>
            </div>
          </Link>

          {/* Generar receta */}
          <Link href="/generar" data-testid="card-generar">
            <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 h-full cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-secondary/10 p-3 rounded-xl w-fit">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-foreground">Generar Receta</h2>
                <p className="text-muted-foreground text-xs mt-1">
                  Escribe ingredientes y genera una receta nutritiva
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-xs font-semibold text-secondary">Generar &rarr;</span>
              </div>
            </div>
          </Link>

          {/* Historial */}
          <Link href="/historial" data-testid="card-historial">
            <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 h-full cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-primary/10 p-3 rounded-xl w-fit">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-foreground">Historial</h2>
                <p className="text-muted-foreground text-xs mt-1">
                  Revisa todas tus recetas anteriores
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-xs font-semibold text-primary">Ver historial &rarr;</span>
              </div>
            </div>
          </Link>

          {/* Mi Perfil */}
          <Link href="/perfil" data-testid="card-perfil" className="sm:col-span-2 lg:col-span-4">
            <div className="group bg-card border border-border rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-accent/5 transition-colors">
              <div className="bg-muted p-3 rounded-xl">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif font-bold text-foreground">Mi Perfil</h2>
                <p className="text-muted-foreground text-sm">
                  {user ? `${user.integrantes} integrantes · ${user.ninos} niño(s) · Presupuesto ${user.presupuesto}` : "Cargando..."}
                </p>
              </div>
              <span className="text-sm text-muted-foreground font-medium">Editar &rarr;</span>
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
