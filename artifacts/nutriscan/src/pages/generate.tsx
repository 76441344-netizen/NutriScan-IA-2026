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
import {
  Sparkles, ArrowLeft, Clock, Heart, Leaf, ChefHat, CheckCircle2,
  Users, BarChart3, Flame, Beef, Wheat, Droplets, Baby, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@workspace/api-client-react";

const schema = z.object({
  ingredientes: z.string().min(3, "Escribe al menos un ingrediente"),
});
type FormData = z.infer<typeof schema>;

const QUICK_INGREDIENTS = [
  "Arroz, lentejas, zanahoria",
  "Pollo, papa, cebolla, ajo",
  "Espinacas, huevo, ajo, aceite",
  "Quinoa, leche, plátano",
  "Avena, manzana, canela",
  "Atún, tomate, lechuga, pan",
  "Hígado, cebolla, tomate, ají",
];

const DIFICULTAD_COLORS: Record<string, string> = {
  "Fácil": "bg-green-100 text-green-700 border-green-200",
  "Media": "bg-amber-100 text-amber-700 border-amber-200",
  "Avanzada": "bg-red-100 text-red-700 border-red-200",
};

function RecipeDisplay({ recipe }: { recipe: Recipe }) {
  const dificultadStyle = DIFICULTAD_COLORS[recipe.dificultad || "Fácil"] || DIFICULTAD_COLORS["Fácil"];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" data-testid="recipe-result">
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-6">
        <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-2">
          <CheckCircle2 className="h-4 w-4" />
          Receta generada con éxito por IA
        </div>
        <h2 className="text-2xl font-serif font-bold text-primary-foreground">{recipe.nombre}</h2>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
            <Clock className="h-4 w-4" />
            {recipe.tiempo_preparacion}
          </span>
          {recipe.porciones && (
            <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
              <Users className="h-4 w-4" />
              {recipe.porciones}
            </span>
          )}
          {recipe.dificultad && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${dificultadStyle}`}>
              {recipe.dificultad}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {(recipe.calorias || recipe.proteinas || recipe.carbohidratos || recipe.grasas) && (
          <div className="bg-muted/40 rounded-2xl p-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              Información nutricional
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recipe.calorias && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                  <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-orange-700">{recipe.calorias}</p>
                  <p className="text-[10px] text-orange-600">Calorías</p>
                </div>
              )}
              {recipe.proteinas && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <Beef className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-700">{recipe.proteinas}</p>
                  <p className="text-[10px] text-blue-600">Proteínas</p>
                </div>
              )}
              {recipe.carbohidratos && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                  <Wheat className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-yellow-700">{recipe.carbohidratos}</p>
                  <p className="text-[10px] text-yellow-600">Carbohidratos</p>
                </div>
              )}
              {recipe.grasas && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                  <Droplets className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700">{recipe.grasas}</p>
                  <p className="text-[10px] text-purple-600">Grasas</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <Leaf className="h-4 w-4 text-primary" />
            Ingredientes
          </h3>
          <div className="bg-muted/40 rounded-xl p-4 space-y-1.5">
            {recipe.ingredientes.split("\n").filter(Boolean).map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{line.replace(/^[-•*]\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <ChefHat className="h-4 w-4 text-primary" />
            Preparación paso a paso
          </h3>
          <div className="space-y-2.5">
            {recipe.pasos.split("\n").filter(Boolean).map((paso, i) => {
              const text = paso.replace(/^\d+[.)]\s*/, "").trim();
              if (!text) return null;
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed flex-1">{text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              Beneficios nutricionales
            </h3>
            <p className="text-sm text-green-700 leading-relaxed">{recipe.beneficios}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4" />
              Prevención de anemia
            </h3>
            <p className="text-sm text-red-700 leading-relaxed">{recipe.prevencion_anemia}</p>
          </div>
        </div>

        {recipe.recomendacion_ninos && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
              <Baby className="h-4 w-4" />
              Recomendación para niños
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">{recipe.recomendacion_ninos}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="rounded-full flex-1"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
  );
}

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
          setTimeout(() => {
            document.getElementById("recipe-section")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo generar la receta. Inténtalo de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  const quickFill = (text: string) => {
    form.setValue("ingredientes", text);
  };

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Generar Receta</h1>
            <p className="text-primary-foreground/80 text-sm">IA crea recetas nutritivas anti-anemia</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">¿Qué tienes en casa?</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Escribe los ingredientes disponibles y la IA generará una receta completa con información nutricional
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sugerencias rápidas</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_INGREDIENTS.map((ing) => (
                <button
                  key={ing}
                  onClick={() => quickFill(ing)}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {ing}
                </button>
              ))}
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
                        placeholder="Ej: arroz, lentejas, zanahoria, cebolla, tomate, ajo, aceite, huevo..."
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
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <ChefHat className="absolute inset-0 m-auto h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-serif font-semibold text-lg text-foreground">La IA está cocinando tu receta...</p>
              <p className="text-muted-foreground text-sm mt-1">Analizando ingredientes, calculando nutrientes y creando pasos</p>
            </div>
            <div className="grid grid-cols-4 gap-3 w-full max-w-xs text-[10px] text-center text-muted-foreground">
              {["Ingredientes", "Nutrientes", "Pasos", "Receta"].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className={`h-1.5 w-full rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-primary/60 animate-pulse" : "bg-muted"}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe && (
          <div id="recipe-section">
            <RecipeDisplay recipe={recipe} />
          </div>
        )}
      </div>
    </div>
  );
}
