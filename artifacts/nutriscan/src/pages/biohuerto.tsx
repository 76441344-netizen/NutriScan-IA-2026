import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, Loader2, Droplets, Sun, Clock, ChefHat, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Planta {
  id: string;
  nombre: string;
  emoji: string;
  diasCrecimiento: string;
  dificultad: "Fácil" | "Media" | "Difícil";
  riego: string;
  sol: string;
  espacio: string;
  beneficios: string;
  comoConsumir: string;
  cuidados: string[];
  sembrar: string[];
  hierro: boolean;
}

const PLANTAS: Planta[] = [
  {
    id: "lechuga", nombre: "Lechuga", emoji: "🥬",
    diasCrecimiento: "45-60 días", dificultad: "Fácil", riego: "Diario",
    sol: "Semi-sombra o sol parcial", espacio: "Maceta mediana",
    beneficios: "Rica en agua, vitaminas A y K, folato. Hidratante y digestiva.",
    comoConsumir: "Ensaladas frescas, sándwiches, batidos verdes, wraps saludables.",
    hierro: false,
    cuidados: ["Mantener tierra húmeda sin encharcamiento", "Podar hojas externas para activar crecimiento", "Proteger del calor intenso"],
    sembrar: ["Preparar maceta con tierra mezclada con compost", "Sembrar semillas a 1cm de profundidad", "Mantener húmedo y en semi-sombra", "Transplantar cuando tengan 4-5 hojas"],
  },
  {
    id: "espinaca", nombre: "Espinaca", emoji: "🌿",
    diasCrecimiento: "40-50 días", dificultad: "Fácil", riego: "Cada 2 días",
    sol: "Sol parcial", espacio: "Maceta o cajón",
    beneficios: "Excelente fuente de hierro, vitaminas C y K, ácido fólico. ¡Ideal para prevenir anemia!",
    comoConsumir: "Saltada con ajo, en sopas, purés, jugos verdes, tortillas.",
    hierro: true,
    cuidados: ["Sembrar en temporada fría", "Abonar con compost cada 2 semanas", "Cosechar hojas externas primero"],
    sembrar: ["Usar maceta profunda con buen drenaje", "Sembrar directamente sin transplantar", "Regar suavemente cada 2 días", "Cosechar cuando hojas midan 10cm"],
  },
  {
    id: "tomate", nombre: "Tomate", emoji: "🍅",
    diasCrecimiento: "70-90 días", dificultad: "Media", riego: "Cada 2 días",
    sol: "Pleno sol (6-8 horas)", espacio: "Maceta grande (20L)",
    beneficios: "Rico en licopeno, vitamina C y antioxidantes. Protege el corazón y mejora la absorción de hierro.",
    comoConsumir: "Salsas, ensaladas, sopas, guisos, jugos naturales.",
    hierro: false,
    cuidados: ["Instalar tutor/estaca al crecer", "Podar brotes laterales", "Fertilizar cada 15 días"],
    sembrar: ["Germinar en vaso con tierra fina", "Transplantar con 15cm de altura", "Colocar en zona soleada", "Regar en la base, no en las hojas"],
  },
  {
    id: "culantro", nombre: "Culantro (Cilantro)", emoji: "🌱",
    diasCrecimiento: "21-28 días", dificultad: "Fácil", riego: "Cada 2 días",
    sol: "Sol parcial", espacio: "Maceta pequeña",
    beneficios: "Vitaminas A y K, antioxidantes. Mejora la digestión y tiene propiedades antibacterianas.",
    comoConsumir: "Picado en guisos, causas, ceviche, arroz, guacamole.",
    hierro: false,
    cuidados: ["Sembrar en grupos para mejores resultados", "Cosechar antes de que florezca", "Sembrar cada 3 semanas para cosecha continua"],
    sembrar: ["Remojar semillas 24h antes", "Sembrar 3-4 semillas juntas", "Cubrir ligeramente con tierra", "Cosechar desde los 21 días"],
  },
  {
    id: "perejil", nombre: "Perejil", emoji: "🌿",
    diasCrecimiento: "70-90 días", dificultad: "Fácil", riego: "Cada 2-3 días",
    sol: "Sol parcial", espacio: "Maceta mediana",
    beneficios: "Muy alto en vitamina C, hierro y vitamina K. Refuerza el sistema inmune.",
    comoConsumir: "Picado en sopas, salsas, tabule, ensaladas, carnes.",
    hierro: true,
    cuidados: ["Cosechar regularmente para estimular crecimiento", "Evitar encharcamiento", "Fertilizar mensualmente"],
    sembrar: ["Remojar semillas 24h antes", "Sembrar a 5mm de profundidad", "Germina lento: 2-3 semanas", "Cosechar hojas externas primero"],
  },
  {
    id: "cebolla-china", nombre: "Cebolla China", emoji: "🧅",
    diasCrecimiento: "30-40 días", dificultad: "Fácil", riego: "Diario",
    sol: "Sol pleno o parcial", espacio: "Cualquier maceta",
    beneficios: "Vitaminas B y C, antioxidantes. Antiinflamatoria y mejora la digestión.",
    comoConsumir: "Picada en arroces, sopas, guisos, tortillas, ensaladas.",
    hierro: false,
    cuidados: ["Cortar dejando 3cm del bulbo para rebrote", "Regar la base, no las hojas", "Cosechar continuamente"],
    sembrar: ["Puedes sembrar desde tallos con raíz", "Colocar en agua hasta que broten raíces", "Transplantar a maceta con tierra", "Lista en 3-4 semanas"],
  },
  {
    id: "zanahoria", nombre: "Zanahoria", emoji: "🥕",
    diasCrecimiento: "70-80 días", dificultad: "Media", riego: "Cada 2 días",
    sol: "Pleno sol", espacio: "Maceta profunda (30cm)",
    beneficios: "Rica en beta-caroteno (vitamina A), fibra y antioxidantes. Mejora la visión y el sistema inmune.",
    comoConsumir: "Cocida en sopas, cruda en ensaladas, jugos, purés, guisos.",
    hierro: false,
    cuidados: ["Tierra suelta y profunda sin piedras", "No transplantar: sembrar directa", "Ralear cuando midan 5cm"],
    sembrar: ["Preparar maceta profunda con tierra suelta", "Sembrar semillas en surcos a 1cm", "Ralear a 5cm entre plantas", "Cosechar cuando la parte superior sea naranja"],
  },
  {
    id: "betarraga", nombre: "Betarraga (Remolacha)", emoji: "🫚",
    diasCrecimiento: "50-70 días", dificultad: "Media", riego: "Cada 2 días",
    sol: "Pleno sol", espacio: "Maceta profunda o jardín",
    beneficios: "Alta en hierro, ácido fólico y antioxidantes. Mejora la circulación y previene la anemia.",
    comoConsumir: "Cocida en ensaladas, jugo energizante, crema, encurtidos.",
    hierro: true,
    cuidados: ["No compactar la tierra", "Ralear plantas para dar espacio", "Cosechar cuando el bulbo mida 5-7cm"],
    sembrar: ["Remojar semillas 12h", "Sembrar a 2cm de profundidad", "Separar plantas a 10cm", "Cosechar a los 50-70 días"],
  },
  {
    id: "rabanito", nombre: "Rabanito", emoji: "🔴",
    diasCrecimiento: "22-30 días", dificultad: "Fácil", riego: "Diario",
    sol: "Sol parcial", espacio: "Maceta pequeña",
    beneficios: "Vitamina C, potasio, fibra. Estimula la digestión y tiene efecto depurativo.",
    comoConsumir: "Crudo en ensaladas, encurtido, en sándwiches.",
    hierro: false,
    cuidados: ["Cosechar a tiempo (no dejar pasar)", "Sembrar cada 2 semanas para cosecha continua", "Mantener tierra húmeda"],
    sembrar: ["Sembrar directamente a 1cm profundidad", "Separar 5cm entre semillas", "Regar suavemente todos los días", "Listo en tan solo 22-30 días"],
  },
  {
    id: "hierbabuena", nombre: "Hierbabuena", emoji: "🌿",
    diasCrecimiento: "30-40 días desde brote", dificultad: "Fácil", riego: "Cada 2 días",
    sol: "Sol parcial", espacio: "Maceta mediana (separada)",
    beneficios: "Mentol y antioxidantes, mejora la digestión. Alivia cólicos en niños y resfríos.",
    comoConsumir: "Infusión, ensaladas, mojito de frutas, salsas, chicha morada.",
    hierro: false,
    cuidados: ["Sembrar en maceta propia (se expande mucho)", "Podar regularmente para controlar crecimiento", "Regar sin encharcar"],
    sembrar: ["Mejor propagar desde esqueje (tallo con raíz)", "Colocar en agua hasta ver raíces", "Transplantar a maceta con tierra húmeda", "Crece rápido una vez establecida"],
  },
  {
    id: "oregano", nombre: "Orégano", emoji: "🌱",
    diasCrecimiento: "10-14 días (germinación)", dificultad: "Fácil", riego: "Cada 3-4 días",
    sol: "Pleno sol", espacio: "Maceta pequeña",
    beneficios: "Potente antioxidante, antibacterial natural, vitaminas K y E. Fortalece el sistema inmune.",
    comoConsumir: "Seco en pizzas, pastas, carnes, salsas, sopas.",
    hierro: false,
    cuidados: ["Dejar secar un poco entre riegos", "Podar regularmente", "Secar y guardar para uso en cocina"],
    sembrar: ["Sembrar a superficie sin cubrir mucho", "Necesita calor para germinar", "Cosechar cuando tenga 15cm", "Secar colgando en lugar ventilado"],
  },
  {
    id: "albahaca", nombre: "Albahaca", emoji: "🌿",
    diasCrecimiento: "7-14 días (germinación)", dificultad: "Fácil", riego: "Diario",
    sol: "Pleno sol (6+ horas)", espacio: "Maceta mediana",
    beneficios: "Vitaminas A, C y K, antioxidantes. Antiinflamatoria natural, mejora la circulación.",
    comoConsumir: "Pesto, ensaladas caprese, pizzas, salsas, infusiones.",
    hierro: false,
    cuidados: ["Evitar el frío", "Podar flores para prolongar vida", "No regar en exceso"],
    sembrar: ["Germinar en bandeja cubierta", "Transplantar con 4-5cm de altura", "Colocar en zona muy soleada", "Cosechar hojas superiores continuamente"],
  },
  {
    id: "aji", nombre: "Ají", emoji: "🌶️",
    diasCrecimiento: "80-100 días", dificultad: "Media", riego: "Cada 2 días",
    sol: "Pleno sol", espacio: "Maceta grande (15L)",
    beneficios: "Vitamina C (más que el limón), capsaicina antiinflamatoria. Estimula el metabolismo.",
    comoConsumir: "Salsas, ceviche, ajíes de gallina, guisos, decoración.",
    hierro: false,
    cuidados: ["Necesita calor constante", "Polinizar manualmente en interior", "Cosechar antes de cambiar de color para más picante"],
    sembrar: ["Germinar semillas a 25°C en bandeja", "Transplantar con 10cm de altura", "Colocar en zona muy soleada y cálida", "Cosechar desde los 80 días"],
  },
];

const DIFICULTAD_COLOR: Record<string, string> = {
  "Fácil": "bg-green-100 text-green-700",
  "Media": "bg-amber-100 text-amber-700",
  "Difícil": "bg-red-100 text-red-700",
};

export default function Biohuerto() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Planta | null>(null);
  const [tab, setTab] = useState<"todas" | "facil" | "hierro">("todas");
  const [recommendation, setRecommendation] = useState<string>("");
  const [loadingRec, setLoadingRec] = useState(false);
  const [showRecForm, setShowRecForm] = useState(false);
  const [formData, setFormData] = useState({ espacio: "", clima: "", tiempo: "", ninos: "" });

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const filtered = PLANTAS.filter(p => {
    if (tab === "facil") return p.dificultad === "Fácil";
    if (tab === "hierro") return p.hierro;
    return true;
  });

  const getRecommendation = async () => {
    setLoadingRec(true);
    setRecommendation("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Soy madre y quiero crear un biohuerto familiar. 
          - Espacio disponible: ${formData.espacio || "balcón/terraza pequeña"}
          - Clima de mi ciudad: ${formData.clima || "templado"}
          - Tiempo disponible para cuidar: ${formData.tiempo || "30 minutos al día"}
          - Número de niños: ${formData.ninos || "2 niños"}
          
          Del siguiente catálogo de plantas: ${PLANTAS.map(p => p.nombre).join(", ")}
          
          ¿Qué 4-5 plantas me recomiendas sembrar? Prioriza las que ayuden a prevenir la anemia en niños. 
          Explica brevemente por qué cada una y en qué orden empezar. Usa formato amigable con emojis.`,
        }),
      });
      const data = await res.json() as { reply: string };
      setRecommendation(data.reply || "No se pudo obtener recomendación");
    } catch {
      toast({ title: "Error", description: "No se pudo consultar la IA", variant: "destructive" });
    } finally {
      setLoadingRec(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Biohuerto Familiar</h1>
            <p className="text-primary-foreground/80 text-sm">13 cultivos · Guías completas · Recomendación IA</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {!showRecForm ? (
          <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-serif font-bold text-lg">¿No sabes qué sembrar?</p>
              <p className="text-green-100 text-sm mt-1">La IA recomienda cultivos según tu espacio, clima y necesidades familiares</p>
            </div>
            <Button variant="secondary" onClick={() => setShowRecForm(true)} className="shrink-0 gap-2">
              <Sparkles className="h-4 w-4" />
              Pedir recomendación IA
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Recomendación personalizada IA
              </h3>
              <button onClick={() => { setShowRecForm(false); setRecommendation(""); }} className="text-muted-foreground hover:text-foreground text-sm">
                Cerrar
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "espacio", label: "Espacio disponible", placeholder: "Ej: balcón pequeño, jardín, ventana" },
                { key: "clima", label: "Clima de tu ciudad", placeholder: "Ej: cálido, templado, frío" },
                { key: "tiempo", label: "Tiempo diario disponible", placeholder: "Ej: 15 minutos, 30 minutos" },
                { key: "ninos", label: "Número de niños", placeholder: "Ej: 2 niños de 5 y 8 años" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                  <input
                    value={formData[key as keyof typeof formData]}
                    onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
            <Button onClick={getRecommendation} disabled={loadingRec} className="gap-2">
              {loadingRec ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loadingRec ? "Consultando IA..." : "Obtener recomendación"}
            </Button>
            {recommendation && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">{recommendation}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {[
            { key: "todas", label: `Todas (${PLANTAS.length})` },
            { key: "facil", label: "🌱 Fáciles de cultivar" },
            { key: "hierro", label: "🩸 Ricas en hierro" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-700 to-green-600 px-6 py-5 text-white">
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-sm mb-3 flex items-center gap-1">
                ← Volver al catálogo
              </button>
              <div className="text-5xl mb-3">{selected.emoji}</div>
              <h2 className="text-2xl font-serif font-bold">{selected.nombre}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DIFICULTAD_COLOR[selected.dificultad]}`}>{selected.dificultad}</span>
                {selected.hierro && <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">🩸 Alta en hierro</span>}
              </div>
            </div>

            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Información general</h3>
                <div className="space-y-2.5">
                  {[
                    { Icon: Clock, label: "Tiempo hasta cosecha", val: selected.diasCrecimiento },
                    { Icon: Droplets, label: "Frecuencia de riego", val: selected.riego },
                    { Icon: Sun, label: "Luz solar", val: selected.sol },
                    { Icon: Leaf, label: "Espacio necesario", val: selected.espacio },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4" /> Beneficios nutricionales
                  </h3>
                  <p className="text-sm text-green-700 leading-relaxed">{selected.beneficios}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-2">
                    <ChefHat className="h-4 w-4" /> Cómo consumirla
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">{selected.comoConsumir}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">🌱 Cómo sembrar paso a paso</h3>
                <div className="space-y-2">
                  {selected.sembrar.map((paso, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-blue-700">{paso}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-800 mb-3">💡 Cuidados importantes</h3>
                <div className="space-y-2">
                  {selected.cuidados.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5 shrink-0">•</span>
                      <p className="text-sm text-purple-700">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((planta) => (
              <button
                key={planta.id}
                onClick={() => setSelected(planta)}
                className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{planta.emoji}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFICULTAD_COLOR[planta.dificultad]}`}>
                      {planta.dificultad}
                    </span>
                    {planta.hierro && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🩸 Hierro</span>}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{planta.nombre}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{planta.diasCrecimiento}</span>
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />Riego {planta.riego.split(" ")[0].toLowerCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{planta.beneficios}</p>
                <div className="mt-3 text-xs text-primary font-semibold group-hover:underline">Ver guía completa →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
