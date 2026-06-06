import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Camera, Upload, Search, Sparkles, Clock, Heart,
  Leaf, ChefHat, AlertCircle, CheckCircle2, X, Droplets
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScanRecipe } from "@workspace/api-client-react";

type Step = "upload" | "analyzing" | "ingredients" | "generating" | "result";

const ironColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Alto: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Alto contenido de hierro" },
  Medio: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Contenido medio de hierro" },
  Bajo: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Bajo contenido de hierro" },
};

export default function Scan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = getUserId();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
  const [recipe, setRecipe] = useState<ScanRecipe | null>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const processImage = useCallback((file: File) => {
    const mime = file.type || "image/jpeg";
    setMimeType(mime);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStep("upload");
      setIngredients([]);
      setRemovedIngredients(new Set());
      setRecipe(null);
      processImage(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !userId) return;
    setStep("analyzing");

    try {
      const res = await fetch("/api/scans/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageBase64, mimeType }),
      });
      if (!res.ok) throw new Error("Error al analizar");
      const data = await res.json() as { ingredients: string[] };

      if (!data.ingredients || data.ingredients.length === 0) {
        toast({
          title: "Sin ingredientes detectados",
          description: "No se encontraron alimentos en la imagen. Intenta con una foto más clara.",
          variant: "destructive",
        });
        setStep("upload");
        return;
      }

      setIngredients(data.ingredients);
      setStep("ingredients");
      toast({
        title: "Ingredientes detectados",
        description: `Se encontraron ${data.ingredients.length} ingredientes en tu imagen.`,
      });
    } catch {
      toast({ title: "Error", description: "No se pudo analizar la imagen. Inténtalo de nuevo.", variant: "destructive" });
      setStep("upload");
    }
  };

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(ing)) next.delete(ing);
      else next.add(ing);
      return next;
    });
  };

  const activeIngredients = ingredients.filter(i => !removedIngredients.has(i));

  const handleGenerateRecipe = async () => {
    if (!userId || activeIngredients.length === 0) return;
    setStep("generating");

    try {
      const res = await fetch("/api/scans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ingredients: activeIngredients, imageBase64, mimeType }),
      });
      if (!res.ok) throw new Error("Error al generar");
      const data = await res.json() as ScanRecipe;
      setRecipe(data);
      setStep("result");
      queryClient.invalidateQueries();
      toast({ title: "Receta generada", description: "Tu receta inteligente está lista." });
    } catch {
      toast({ title: "Error", description: "No se pudo generar la receta. Inténtalo de nuevo.", variant: "destructive" });
      setStep("ingredients");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setImagePreview(null);
    setImageBase64("");
    setIngredients([]);
    setRemovedIngredients(new Set());
    setRecipe(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const ironStyle = recipe ? (ironColors[recipe.nivelHierro] ?? ironColors.Medio) : null;

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-16 z-10">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-serif font-semibold text-foreground">Escanear Ingredientes</h1>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Step: Upload */}
        {(step === "upload") && (
          <div className="flex flex-col gap-5">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Escanea tus ingredientes</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Toma una foto o sube una imagen de los ingredientes que tienes disponibles y la IA los identificará automáticamente
              </p>
            </div>

            {!imagePreview ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Camera */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="group bg-card border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all cursor-pointer hover:bg-primary/5"
                  data-testid="button-camera"
                >
                  <div className="bg-primary/10 group-hover:bg-primary/20 p-4 rounded-full transition-colors">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Tomar foto</p>
                    <p className="text-xs text-muted-foreground mt-1">Usa la cámara de tu dispositivo</p>
                  </div>
                </button>

                {/* Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group bg-card border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all cursor-pointer hover:bg-primary/5"
                  data-testid="button-upload"
                >
                  <div className="bg-secondary/10 group-hover:bg-secondary/20 p-4 rounded-full transition-colors">
                    <Upload className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Subir imagen</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP hasta 10MB</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-border bg-muted aspect-video max-h-72 flex items-center justify-center" data-testid="image-preview">
                  <img src={imagePreview} alt="Imagen seleccionada" className="w-full h-full object-contain" />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 bg-background/90 p-1.5 rounded-full border border-border hover:bg-background transition-colors"
                    data-testid="button-remove-image"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={() => fileInputRef.current?.click()} data-testid="button-change-image">
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar imagen
                  </Button>
                  <Button className="flex-1 rounded-full" onClick={handleAnalyze} data-testid="button-analyze">
                    <Search className="h-4 w-4 mr-2" />
                    Analizar ingredientes
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Analyzing */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-16 gap-6 text-center" data-testid="analyzing-state">
            {imagePreview && (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/30">
                <img src={imagePreview} alt="Analizando" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Search className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            )}
            <div>
              <p className="text-xl font-serif font-bold text-foreground">Analizando imagen...</p>
              <p className="text-muted-foreground text-sm mt-1">La IA está identificando los ingredientes visibles</p>
            </div>
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Step: Ingredients */}
        {step === "ingredients" && (
          <div className="flex flex-col gap-5" data-testid="ingredients-step">
            <div className="flex gap-4">
              {imagePreview && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0">
                  <img src={imagePreview} alt="Escaneado" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="font-semibold text-foreground">{activeIngredients.length} ingredientes detectados</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toca un ingrediente para quitarlo si fue detectado incorrectamente
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-wrap gap-2" data-testid="ingredients-list">
                {ingredients.map((ing) => {
                  const removed = removedIngredients.has(ing);
                  return (
                    <button
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        removed
                          ? "bg-muted text-muted-foreground border-border line-through opacity-50"
                          : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      }`}
                      data-testid={`ingredient-tag-${ing.replace(/\s+/g, "-")}`}
                    >
                      {!removed && <Leaf className="h-3 w-3" />}
                      {removed && <X className="h-3 w-3" />}
                      {ing}
                    </button>
                  );
                })}
              </div>
              {removedIngredients.size > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {removedIngredients.size} ingrediente(s) excluido(s). Toca para reactivar.
                </p>
              )}
            </div>

            {activeIngredients.length === 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Debes mantener al menos un ingrediente activo para generar la receta.
              </div>
            )}

            <Button
              size="lg"
              className="w-full rounded-full"
              onClick={handleGenerateRecipe}
              disabled={activeIngredients.length === 0}
              data-testid="button-generate-recipe"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Receta Inteligente
            </Button>
          </div>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-16 gap-6 text-center" data-testid="generating-state">
            <div className="bg-primary/10 p-6 rounded-full">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <ChefHat className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-xl font-serif font-bold text-foreground">Creando tu receta inteligente...</p>
              <p className="text-muted-foreground text-sm mt-1">Analizando nutrientes y calculando nivel de hierro</p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs text-xs text-center text-muted-foreground">
              {["Ingredientes", "Nutrientes", "Receta"].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className={`h-1.5 w-full rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-primary/60 animate-pulse" : "bg-muted"}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && recipe && (
          <div className="flex flex-col gap-5" data-testid="scan-result">
            {/* Recipe header */}
            <div className="bg-primary rounded-2xl overflow-hidden shadow-md shadow-primary/20">
              <div className="px-6 py-6">
                <div className="flex items-center gap-2 text-primary-foreground/70 text-xs mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Receta Inteligente por NutriScan IA
                </div>
                <h2 className="text-2xl font-serif font-bold text-primary-foreground">{recipe.nombre}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-primary-foreground/80 text-sm">
                    <Clock className="h-4 w-4" />
                    {recipe.tiempo_preparacion}
                  </span>
                  {ironStyle && (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${ironStyle.bg} ${ironStyle.text} border ${ironStyle.border}`}>
                      <Droplets className="h-3 w-3" />
                      Hierro: {recipe.nivelHierro}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detected ingredients */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                <Camera className="h-4 w-4" />
                Ingredientes detectados en la imagen
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredientesDetectados.map((ing) => (
                  <span key={ing} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/20">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Leaf className="h-4 w-4 text-primary" />
                Ingredientes y cantidades
              </h3>
              <div className="bg-muted/50 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{recipe.ingredientes}</pre>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <ChefHat className="h-4 w-4 text-primary" />
                Preparación paso a paso
              </h3>
              <div className="bg-muted/50 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{recipe.pasos}</pre>
              </div>
            </div>

            {/* Nutritional benefits + Iron level */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" />
                  Beneficios nutricionales
                </h3>
                <p className="text-sm text-green-700 leading-relaxed">{recipe.beneficios}</p>
              </div>

              {ironStyle && (
                <div className={`${ironStyle.bg} border ${ironStyle.border} rounded-xl p-5`}>
                  <h3 className={`font-semibold ${ironStyle.text} flex items-center gap-2 mb-2`}>
                    <Droplets className="h-4 w-4" />
                    Nivel de hierro: {recipe.nivelHierro}
                  </h3>
                  <p className={`text-sm ${ironStyle.text} leading-relaxed`}>{ironStyle.label} — ideal para la prevención de anemia infantil.</p>
                </div>
              )}
            </div>

            {/* Anemia prevention */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4" />
                Prevención de anemia infantil
              </h3>
              <p className="text-sm text-red-700 leading-relaxed">{recipe.prevencion_anemia}</p>
            </div>

            {/* Iron absorption tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4" />
                Consejos para mejorar la absorción del hierro
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">{recipe.consejos_absorcion}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={handleReset} data-testid="button-new-scan">
                <Camera className="h-4 w-4 mr-2" />
                Nuevo escaneo
              </Button>
              <Button className="flex-1 rounded-full" asChild data-testid="button-history">
                <Link href="/historial">Ver historial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        data-testid="input-file"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        data-testid="input-camera"
      />
    </div>
  );
}
