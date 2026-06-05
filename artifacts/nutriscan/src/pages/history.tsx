import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useListRecipes, useDeleteRecipe, getListRecipesQueryKey, getGetRecipeStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChefHat, Clock, Trash2, Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = getUserId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const { data: recipes, isLoading } = useListRecipes(
    { userId: userId! },
    { query: { enabled: !!userId, queryKey: getListRecipesQueryKey({ userId: userId! }) } }
  );

  const deleteRecipe = useDeleteRecipe();

  const handleDelete = (id: number) => {
    deleteRecipe.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey({ userId: userId! }) });
          queryClient.invalidateQueries({ queryKey: getGetRecipeStatsQueryKey(userId!) });
          toast({ title: "Receta eliminada", description: "La receta fue eliminada del historial." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo eliminar la receta.", variant: "destructive" });
        },
      }
    );
  };

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-lg font-serif font-semibold text-foreground">Historial de Recetas</h1>
          </div>
          <Button size="sm" asChild className="rounded-full" data-testid="button-new">
            <Link href="/generar">
              <Plus className="h-4 w-4 mr-1" />
              Nueva receta
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8">
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!isLoading && (!recipes || recipes.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-5" data-testid="empty-history">
            <div className="bg-muted p-6 rounded-full">
              <ChefHat className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground">Aún no tienes recetas</h2>
              <p className="text-muted-foreground mt-1">Genera tu primera receta saludable con la IA</p>
            </div>
            <Button asChild className="rounded-full" data-testid="button-generate-first">
              <Link href="/generar">Generar primera receta</Link>
            </Button>
          </div>
        )}

        {!isLoading && recipes && recipes.length > 0 && (
          <div className="grid gap-4" data-testid="recipe-list">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
                data-testid={`recipe-card-${recipe.id}`}
              >
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-foreground truncate">{recipe.nombre}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.tiempo_preparacion}
                    </span>
                    <span>·</span>
                    <span>{new Date(recipe.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" asChild data-testid={`button-view-${recipe.id}`}>
                    <Link href={`/receta/${recipe.id}`}>
                      <Eye className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deleteRecipe.isPending}
                    data-testid={`button-delete-${recipe.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
