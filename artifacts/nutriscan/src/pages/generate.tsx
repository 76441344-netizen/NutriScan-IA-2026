import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateRecipe, getListRecipesQueryKey, getGetRecipeStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Clock, Heart, Leaf, ChefHat, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@workspace/api-client-react";

const schema = z.object({
  ingredientes: z.string().min(3, "Escribe al menos un ingrediente"),
});
type FormData = z.infer<typeof schema>;

export default function Generate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = getUserId();
  const queryClient = useQueryClient();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const generateRecipe = useGenerateRecipe();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ingredientes: "" },
  });

  const onSubmit = (data: FormData) => {
    setRecipe(null);
    generateRecipe.mutate(
      { data: { userId: userId!, ingredientes: data.ingredientes } },
      {
        onSuccess: (result) => {
          setRecipe(result);
          queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey({ userId: userId! }) });
          queryClient.invalidateQueries({ queryKey: getGetRecipeStatsQueryKey(userId!) });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo generar la receta. Inténtalo de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-lg font-serif font-semibold text-foreground">Generar Receta con IA</h1>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8 flex flex-col gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">¿Qué tienes en casa?</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Escribe los ingredientes disponibles y la IA generará una receta saludable y nutritiva para tus hijos
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ingredientes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Ingredientes disponibles</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: arroz, lentejas, zanahoria, cebolla, tomate, ajo, aceite..."
                        className="min-h-[120px] resize-none rounded-xl"
                        {...field}
                        data-testid="textarea-ingredientes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                disabled={generateRecipe.isPending}
                data-testid="button-generate"
              >
                {generateRecipe.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generando receta...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generar Receta con IA
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {generateRecipe.isPending && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col items-center text-center gap-4" data-testid="loading-recipe">
            <div className="bg-primary/10 p-5 rounded-full animate-pulse">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="font-serif font-semibold text-lg text-foreground">La IA está cocinando tu receta...</p>
              <p className="text-muted-foreground text-sm mt-1">Analizando ingredientes y calculando valor nutricional</p>
            </div>
          </div>
        )}

        {recipe && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" data-testid="recipe-result">
            <div className="bg-primary px-6 py-5">
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Receta generada con éxito
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary-foreground">{recipe.nombre}</h2>
              <div className="flex items-center gap-1.5 mt-2 text-primary-foreground/80 text-sm">
                <Clock className="h-4 w-4" />
                {recipe.tiempo_preparacion}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Leaf className="h-4 w-4 text-primary" />
                  Ingredientes
                </h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{recipe.ingredientes}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-primary" />
                  Preparación
                </h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{recipe.pasos}</pre>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Beneficios nutricionales
                  </h3>
                  <p className="text-sm text-green-700">{recipe.beneficios}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4" />
                    Prevención de anemia
                  </h3>
                  <p className="text-sm text-red-700">{recipe.prevencion_anemia}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-full flex-1"
                  onClick={() => { setRecipe(null); form.reset(); }}
                  data-testid="button-new-recipe"
                >
                  Generar otra receta
                </Button>
                <Button asChild className="rounded-full flex-1" data-testid="button-view-history">
                  <Link href="/historial">Ver historial</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
