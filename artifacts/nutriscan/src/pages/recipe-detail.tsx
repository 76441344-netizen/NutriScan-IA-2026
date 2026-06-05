import { useEffect } from "react";
import { useLocation, Link, useParams } from "wouter";
import { useGetRecipe, getGetRecipeQueryKey } from "@workspace/api-client-react";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Leaf, ChefHat, Heart, Sparkles } from "lucide-react";

export default function RecipeDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const userId = getUserId();
  const recipeId = Number(params.id);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const { data: recipe, isLoading } = useGetRecipe(recipeId, {
    query: { enabled: !!recipeId, queryKey: getGetRecipeQueryKey(recipeId) },
  });

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/historial">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Historial
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-lg font-serif font-semibold text-foreground">Detalle de receta</h1>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8">
        {isLoading && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl h-32 animate-pulse" />
            <div className="bg-card border border-border rounded-2xl h-48 animate-pulse" />
          </div>
        )}

        {recipe && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" data-testid="recipe-detail">
            <div className="bg-primary px-6 py-8">
              <p className="text-primary-foreground/70 text-xs uppercase tracking-widest mb-2">Receta NutriScan IA</p>
              <h1 className="text-3xl font-serif font-bold text-primary-foreground">{recipe.nombre}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-primary-foreground/80 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {recipe.tiempo_preparacion}
                </span>
                <span className="flex items-center gap-1.5">
                  <Leaf className="h-4 w-4" />
                  {recipe.ingredientesUsados.split(/[,\n]+/).length} ingredientes usados
                </span>
                <span>
                  {new Date(recipe.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-7">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ingredientes de la despensa</h2>
                <div className="flex flex-wrap gap-2" data-testid="ingredientes-usados">
                  {recipe.ingredientesUsados.split(/[,\n]+/).map((ing, i) => (
                    ing.trim() && (
                      <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/20">
                        {ing.trim()}
                      </span>
                    )
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif font-semibold text-lg text-foreground flex items-center gap-2 mb-3">
                  <Leaf className="h-5 w-5 text-primary" />
                  Ingredientes y cantidades
                </h2>
                <div className="bg-muted/50 rounded-xl p-5" data-testid="ingredientes">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{recipe.ingredientes}</pre>
                </div>
              </div>

              <div>
                <h2 className="font-serif font-semibold text-lg text-foreground flex items-center gap-2 mb-3">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Pasos de preparación
                </h2>
                <div className="bg-muted/50 rounded-xl p-5" data-testid="pasos">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{recipe.pasos}</pre>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5" data-testid="beneficios">
                  <h2 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Beneficios nutricionales
                  </h2>
                  <p className="text-sm text-green-700 leading-relaxed">{recipe.beneficios}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5" data-testid="prevencion-anemia">
                  <h2 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4" />
                    Prevención de anemia infantil
                  </h2>
                  <p className="text-sm text-red-700 leading-relaxed">{recipe.prevencion_anemia}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="rounded-full flex-1" asChild data-testid="button-history">
                  <Link href="/historial">Ver historial</Link>
                </Button>
                <Button className="rounded-full flex-1" asChild data-testid="button-generate">
                  <Link href="/generar">Nueva receta</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
