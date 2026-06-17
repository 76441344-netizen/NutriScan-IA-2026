import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Camera, Upload, Search, Sparkles, Clock, Heart,
  Leaf, ChefHat, AlertCircle, CheckCircle2, X, Droplets,
  Users, BarChart3, Flame, Beef, Wheat, Baby, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScanRecipe } from "@workspace/api-client-react";

type Step = "upload" | "analyzing" | "ingredients" | "generating" | "result";

const ironColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Alto: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Alto contenido de hierro" },
  Medio: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Contenido medio de hierro" },
  Bajo: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Bajo contenido de hierro" },
};

const DIFICULTAD_COLORS: Record<string, string> = {
  "Fácil": "bg-green-100 text-green-700 border-green-200",
  "Media": "bg-amber-100 text-amber-700 border-amber-200",
  "Avanzada": "bg-red-100 text-red-700 border-red-200",
};

type ScanRecipeExtended = ScanRecipe & {
  porciones?: string;
  dificultad?: string;
  calorias?: string;
  proteinas?: string;
  carbohidratos?: string;
  grasas?: string;
  azucar?: string;
  sodio?: string;
  fibra?: string;
  porcion_estimada?: string;
  nivel_nutricional?: string;
  recomendacion_ia?: string;
  recomendacion_ninos?: string;
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
  const [recipe, setRecipe] = useState<ScanRecipeExtended | null>(null);
  const [newIngredient, setNewIngredient] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<{ confidence?: string; plato_completo?: string | null; notas?: string | null } | null>(null);

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
      const data = await res.json() as { ingredients: string[]; confidence?: string; plato_completo?: string | null; notas?: string | null; error?: boolean };
      if (data.error || !data.ingredients || data.ingredients.length === 0) {
        toast({ title: "Sin ingredientes detectados", description: data.notas || "Intenta con una foto más clara y bien iluminada.", variant: "destructive" });
        setStep("upload");
        return;
      }
      setIngredients(data.ingredients);
      setAnalyzeResult({ confidence: data.confidence, plato_completo: data.plato_completo, notas: data.notas });
      setStep("ingredients");
      const confLabel = data.confidence === "alta" ? "✅ Alta confianza" : data.confidence === "media" ? "⚠️ Confianza media" : "🔍 Estimación";
      toast({ title: `${data.ingredients.length} ingredientes detectados`, description: `${confLabel}${data.plato_completo ? ` · ${data.plato_completo}` : ""}` });
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

  const addIngredient = () => {
    const val = newIngredient.trim();
    if (!val) return;
    if (!ingredients.includes(val)) setIngredients(prev => [...prev, val]);
    setNewIngredient("");
  };

  const activeIngredients = ingredients.filter(i => !removedIngredients.has(i));

  const handleGenerateRecipe = async () => {
    if (!userId || activeIngredients.length === 0) return;
    setStep("generating");
    try {
      const res = await fetch("/api/scans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ingredients: activeIngredients, imageBase64, mimeType, plato_completo: analyzeResult?.plato_completo }),
      });
      if (!res.ok) throw new Error("Error al generar");
      const data = await res.json() as ScanRecipeExtended;
      setRecipe(data);
      setStep("result");
      queryClient.invalidateQueries();
      toast({ title: "¡Receta generada!", description: "Tu receta inteligente con info nutricional está lista." });
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
    setNewIngredient("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const ironStyle = recipe ? (ironColors[recipe.nivelHierro] ?? ironColors.Medio) : null;

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Nutri-Foto IA</h1>
            <p className="text-primary-foreground/80 text-sm">Detecta ingredientes y genera recetas</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {step === "upload" && (
          <div className="flex flex-col gap-5">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Fotografía tus ingredientes</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                La IA detectará automáticamente los alimentos y generará una receta nutritiva completa con información nutricional
              </p>
            </div>

            {!imagePreview ? (
              <div className="grid sm:grid-cols-2 gap-4">
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
              <p className="text-xl font-serif font-bold text-foreground">Detectando alimentos...</p>
              <p className="text-muted-foreground text-sm mt-1">La IA está identificando todos los ingredientes visibles en la imagen</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

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
                  <p className="font-semibold text-foreground">{activeIngredients.length} ingredientes activos</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toca para desactivar ingredientes incorrectos o agrega faltantes
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
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

              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                  placeholder="Agregar ingrediente manualmente..."
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button size="sm" variant="outline" onClick={addIngredient} className="gap-1.5 shrink-0">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {activeIngredients.length === 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Necesitas al menos un ingrediente activo para generar la receta.
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
              Generar Receta con Info Nutricional
            </Button>
          </div>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-16 gap-6 text-center" data-testid="generating-state">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <ChefHat className="absolute inset-0 m-auto h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xl font-serif font-bold text-foreground">Creando tu receta inteligente...</p>
              <p className="text-muted-foreground text-sm mt-1">Analizando nutrientes, calculando hierro y elaborando pasos</p>
            </div>
            <div className="grid grid-cols-4 gap-3 w-full max-w-xs text-[10px] text-center text-muted-foreground">
              {["Ingredientes", "Nutrientes", "Hierro", "Receta"].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div className={`h-1.5 w-full rounded-full ${i === 0 ? "bg-primary" : i === 1 ? "bg-primary/70 animate-pulse" : i === 2 ? "bg-primary/40 animate-pulse" : "bg-muted"}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "result" && recipe && (
          <div className="flex flex-col gap-5" data-testid="scan-result">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl overflow-hidden shadow-md shadow-primary/20">
              <div className="px-6 py-6">
                <div className="flex items-center gap-2 text-primary-foreground/70 text-xs mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Receta Inteligente generada por Nutri-Foto IA
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFICULTAD_COLORS[recipe.dificultad] || DIFICULTAD_COLORS["Fácil"]}`}>
                      {recipe.dificultad}
                    </span>
                  )}
                  {ironStyle && (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${ironStyle.bg} ${ironStyle.text} border ${ironStyle.border}`}>
                      <Droplets className="h-3 w-3" />
                      Hierro: {recipe.nivelHierro}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm uppercase tracking-wide text-muted-foreground">
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

            {(recipe.calorias || recipe.proteinas || recipe.carbohidratos || recipe.grasas) && (
              <div className="bg-muted/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Información nutricional por porción
                  </h3>
                  {(recipe as ScanRecipeExtended).porcion_estimada && (
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                      Porción: {(recipe as ScanRecipeExtended).porcion_estimada}
                    </span>
                  )}
                </div>
                {(recipe as ScanRecipeExtended).nivel_nutricional && (
                  <div className={`mb-3 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-2 ${
                    (recipe as ScanRecipeExtended).nivel_nutricional === "excelente" ? "bg-green-100 text-green-800" :
                    (recipe as ScanRecipeExtended).nivel_nutricional === "bueno" ? "bg-blue-100 text-blue-800" :
                    (recipe as ScanRecipeExtended).nivel_nutricional === "regular" ? "bg-amber-100 text-amber-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    <span>{(recipe as ScanRecipeExtended).nivel_nutricional === "excelente" ? "🌟" : (recipe as ScanRecipeExtended).nivel_nutricional === "bueno" ? "✅" : (recipe as ScanRecipeExtended).nivel_nutricional === "regular" ? "⚠️" : "🔴"}</span>
                    Nivel nutricional: <strong className="capitalize">{(recipe as ScanRecipeExtended).nivel_nutricional}</strong>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
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
                {((recipe as ScanRecipeExtended).azucar || (recipe as ScanRecipeExtended).sodio || (recipe as ScanRecipeExtended).fibra) && (
                  <div className="grid grid-cols-3 gap-2">
                    {(recipe as ScanRecipeExtended).azucar && (
                      <div className="bg-pink-50 border border-pink-100 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-pink-700">{(recipe as ScanRecipeExtended).azucar}</p>
                        <p className="text-[10px] text-pink-600">🍬 Azúcar</p>
                      </div>
                    )}
                    {(recipe as ScanRecipeExtended).sodio && (
                      <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-teal-700">{(recipe as ScanRecipeExtended).sodio}</p>
                        <p className="text-[10px] text-teal-600">🧂 Sodio</p>
                      </div>
                    )}
                    {(recipe as ScanRecipeExtended).fibra && (
                      <div className="bg-lime-50 border border-lime-100 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-bold text-lime-700">{(recipe as ScanRecipeExtended).fibra}</p>
                        <p className="text-[10px] text-lime-600">🌿 Fibra</p>
                      </div>
                    )}
                  </div>
                )}
                {(recipe as ScanRecipeExtended).recomendacion_ia && (
                  <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 text-sm text-primary">
                    <span className="font-semibold">💡 Recomendación IA:</span> {(recipe as ScanRecipeExtended).recomendacion_ia}
                  </div>
                )}
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Leaf className="h-4 w-4 text-primary" />
                Ingredientes y cantidades
              </h3>
              <div className="space-y-1.5">
                {recipe.ingredientes.split("\n").filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    <span>{line.replace(/^[-•*]\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
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

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4" />
                Prevención de anemia infantil
              </h3>
              <p className="text-sm text-red-700 leading-relaxed">{recipe.prevencion_anemia}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4" />
                Consejos para mejorar la absorción del hierro
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">{recipe.consejos_absorcion}</p>
            </div>

            {recipe.recomendacion_ninos && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <Baby className="h-4 w-4" />
                  Recomendación para niños
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed">{recipe.recomendacion_ninos}</p>
              </div>
            )}

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

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} data-testid="input-file" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} data-testid="input-camera" />
    </div>
  );
}
