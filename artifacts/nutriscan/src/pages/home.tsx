import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/auth";
import { useEffect } from "react";
import { Heart, Sparkles, Star, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const STATS = [
  { value: "100%", label: "Recetas anti-anemia", emoji: "🩸" },
  { value: "IA", label: "Inteligencia Artificial", emoji: "🤖" },
  { value: "10+", label: "Módulos de nutrición", emoji: "🌟" },
];

const FEATURES = [
  { icon: "📷", title: "Nutri-Foto IA", desc: "Fotografía ingredientes y obtén recetas al instante" },
  { icon: "🍽️", title: "Genera Recetas", desc: "IA crea recetas nutritivas según lo que tienes" },
  { icon: "📅", title: "Planner Semanal", desc: "Organiza el menú de tutta la semana" },
  { icon: "🛒", title: "Mercado Inteligente", desc: "Lista de compras automática y económica" },
  { icon: "🌱", title: "Biohuerto Familiar", desc: "Cultiva tus propios alimentos en casa" },
  { icon: "📚", title: "Aprende Nutrición", desc: "Artículos sobre alimentación infantil" },
];

const MOTIVATIONAL = [
  { text: "Cada comida nutritiva que preparas es un regalo de amor para tus hijos 💚", author: "NutriScan IA" },
  { text: "Una madre que cocina con conciencia construye el futuro de su familia", author: "" },
  { text: "¡Tú tienes el poder de prevenir la anemia! Empieza hoy 💪", author: "" },
];

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (getUserId()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const quote = MOTIVATIONAL[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-screen-lg mx-auto px-4 py-14 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Nutrición inteligente para tu familia
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-4">
                Recetas saludables<br />
                <span className="text-yellow-300">con amor</span> y<br />
                <span className="text-yellow-300">con IA</span>
              </h1>

              <p className="text-primary-foreground/85 text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                NutriScan IA ayuda a madres a crear comidas nutritivas y económicas que <strong>previenen la anemia infantil</strong>, usando inteligencia artificial avanzada.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-base font-bold shadow-lg gap-2 w-full sm:w-auto" asChild data-testid="button-start">
                  <Link href="/registro">
                    <Heart className="h-5 w-5 fill-current" />
                    ¡Empezar gratis ahora!
                  </Link>
                </Button>
                <p className="text-primary-foreground/70 text-sm">Sin pago · Sin registro complicado</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 justify-center lg:justify-start text-sm text-primary-foreground/80">
                {["100% gratuito", "Recetas en español", "Adaptado a Perú"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-yellow-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-xs">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 shadow-xl">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                  ✨ IA en tiempo real
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/15 rounded-2xl p-3">
                    <span className="text-2xl">📷</span>
                    <div>
                      <p className="font-bold text-sm">Foto tomada</p>
                      <p className="text-xs text-primary-foreground/70">Analizando ingredientes...</p>
                    </div>
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 bg-white/15 rounded-2xl p-3">
                    <span className="text-2xl">🥦</span>
                    <div>
                      <p className="font-bold text-sm">7 ingredientes detectados</p>
                      <p className="text-xs text-primary-foreground/70">Zanahoria, espinaca, pollo...</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3 border border-white/30">
                    <p className="font-serif font-bold text-sm mb-1">🍲 Sopa Nutritiva de Pollo</p>
                    <div className="flex gap-2 text-[10px]">
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">⏱ 30 min</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">🩸 Hierro: Alto</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full">😊 Fácil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200 py-4 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Star className="h-5 w-5 text-amber-500 shrink-0 fill-amber-400" />
          <p className="text-amber-800 text-sm italic font-medium">"{quote.text}"</p>
        </div>
      </section>

      <section className="bg-card border-b border-border py-8 px-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-background">
        <div className="max-w-screen-lg mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold mb-3">
              <Zap className="h-3.5 w-3.5" />
              Todo lo que necesitas
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Una plataforma completa para<br />la nutrición de tu familia
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4 bg-primary">
        <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-primary-foreground text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Shield className="h-5 w-5 text-yellow-300" />
              <span className="font-bold text-lg">¡Únete a miles de madres!</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">Empieza a preparar comidas que cuidan la salud de tus hijos</p>
          </div>
          <Button variant="secondary" size="lg" className="rounded-full px-8 gap-2 font-bold shrink-0" asChild>
            <Link href="/registro">
              Crear mi perfil gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
