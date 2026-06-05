import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/auth";
import { useEffect } from "react";
import { Heart, Sparkles, Carrot, Activity } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (getUserId()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  return (
    <div className="flex-1 flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex-1 flex flex-col justify-center bg-card">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Nutrición inteligente para tus hijos
                </div>
                <h1 className="text-4xl font-serif font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                  Recetas saludables con los ingredientes que ya tienes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  NutriScan IA te ayuda a crear comidas nutritivas y accesibles para combatir la anemia infantil, usando inteligencia artificial para aprovechar al máximo tu despensa.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button size="lg" className="rounded-full px-8 font-medium shadow-md shadow-primary/20" asChild data-testid="button-start">
                  <Link href="/registro">Comenzar ahora</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square">
                {/* Decorative background circle */}
                <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl opacity-70 animate-pulse" />
                
                <div className="relative h-full w-full grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-primary/10 shadow-sm mt-8">
                    <div className="bg-primary/20 p-4 rounded-full">
                      <Carrot className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Ingredientes</h3>
                      <p className="text-sm text-muted-foreground mt-1">Usa lo que tienes en casa</p>
                    </div>
                  </div>
                  <div className="bg-secondary/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-secondary/10 shadow-sm mb-8">
                    <div className="bg-secondary/20 p-4 rounded-full">
                      <Activity className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Salud</h3>
                      <p className="text-sm text-muted-foreground mt-1">Previene la anemia</p>
                    </div>
                  </div>
                  <div className="col-span-2 bg-card rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-border shadow-md z-10 -mt-12 mx-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Heart className="h-8 w-8 text-primary fill-primary/20" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl">Recetas con amor</h3>
                      <p className="text-sm text-muted-foreground mt-2">IA diseñada para cuidar a los que más quieres</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
