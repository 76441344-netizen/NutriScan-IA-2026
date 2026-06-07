import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Leaf, ChevronRight, Calendar, Droplets, Sun, Thermometer } from "lucide-react";

const CULTIVOS = [
  {
    id: "c1",
    nombre: "Espinaca",
    icono: "🌿",
    descripcion: "Hoja verde de alto contenido en hierro, ideal para prevenir la anemia.",
    hierro: "2.7 mg/100g",
    dificultad: "Fácil",
    tiempo: "45-60 días",
    espacio: "Maceta mediana",
    riego: "Cada 2 días",
    luz: "Semisombra",
    temperatura: "10-20°C",
    meses: ["Mar", "Abr", "May", "Ago", "Sep", "Oct"],
    pasos: [
      "Llenar la maceta con tierra fértil mezclada con compost",
      "Esparcir las semillas superficialmente cada 5 cm",
      "Cubrir ligeramente con tierra y regar con spray",
      "Mantener húmedo hasta la germinación (7-14 días)",
      "Cuando tengan 3 hojas, ralar dejando una planta cada 10 cm",
      "Cosechar las hojas externas cuando alcancen 15 cm",
    ],
    beneficios: ["Rico en hierro no-hemo", "Alto contenido en vitamina C", "Ácido fólico", "Vitamina K"],
    tip: "Acompaña las espinacas con limón para triplicar la absorción de hierro 🍋",
  },
  {
    id: "c2",
    nombre: "Tomate Cherry",
    icono: "🍅",
    descripcion: "Rico en vitamina C que ayuda a absorber mejor el hierro de otros alimentos.",
    hierro: "0.3 mg/100g",
    dificultad: "Fácil",
    tiempo: "60-80 días",
    espacio: "Maceta grande o jardín",
    riego: "Cada 2-3 días",
    luz: "Sol directo 6h/día",
    temperatura: "18-27°C",
    meses: ["Sep", "Oct", "Nov", "Dic"],
    pasos: [
      "Preparar semillero con sustrato húmedo",
      "Sembrar 2 semillas por celda a 1 cm de profundidad",
      "Mantener a 20-25°C hasta la germinación (7-10 días)",
      "Trasplantar cuando tengan 4 hojas verdaderas",
      "Colocar tutor (palo) cuando la planta mida 20 cm",
      "Cosechar cuando los frutos estén completamente rojos",
    ],
    beneficios: ["Alto contenido de vitamina C", "Licopeno antioxidante", "Potasio", "Vitamina A"],
    tip: "Consume tomates junto a lentejas o espinacas para mejorar la absorción de hierro 💪",
  },
  {
    id: "c3",
    nombre: "Perejil",
    icono: "🌱",
    descripcion: "Hierba aromática con hierro, vitamina C y vitamina K esencial para la salud.",
    hierro: "6.2 mg/100g",
    dificultad: "Fácil",
    tiempo: "70-90 días",
    espacio: "Maceta pequeña",
    riego: "Cada 3 días",
    luz: "Semisombra o sol",
    temperatura: "12-25°C",
    meses: ["Todo el año"],
    pasos: [
      "Remojar semillas 24 horas antes de sembrar",
      "Sembrar en maceta con tierra húmeda a 0.5 cm de profundidad",
      "Mantener húmedo durante la germinación (15-21 días)",
      "Aclarar dejando una planta cada 15 cm",
      "Cosechar tallos externos cuando tengan 20 cm",
      "No cortar más del 30% de la planta a la vez",
    ],
    beneficios: ["Muy rico en hierro", "Vitamina C y K", "Antioxidantes", "Fácil de cultivar"],
    tip: "Agrega perejil fresco a todas tus comidas para un aporte diario de hierro y vitaminas 🌿",
  },
  {
    id: "c4",
    nombre: "Quinoa",
    icono: "🌾",
    descripcion: "Superalimento andino con proteínas completas, hierro y todos los aminoácidos esenciales.",
    hierro: "4.6 mg/100g",
    dificultad: "Media",
    tiempo: "90-120 días",
    espacio: "Jardín o tierra amplia",
    riego: "Cada 3-4 días",
    luz: "Sol directo",
    temperatura: "15-20°C",
    meses: ["Mar", "Abr", "May"],
    pasos: [
      "Preparar terreno suelto y bien drenado",
      "Sembrar en surcos de 50 cm entre filas",
      "Colocar 2-3 semillas cada 30 cm",
      "Regar moderadamente, es resistente a la sequía",
      "Aporcar (acumular tierra) cuando mida 20 cm",
      "Cosechar cuando los granos estén duros y secos",
    ],
    beneficios: ["Proteína completa", "Hierro de alta calidad", "Calcio", "Aminoácidos esenciales"],
    tip: "La quinoa puede cultivarse en macetas grandes de 40+ litros en balcón 🌿",
  },
  {
    id: "c5",
    nombre: "Limón",
    icono: "🍋",
    descripcion: "Aliado indispensable para mejorar la absorción del hierro en todas las comidas.",
    hierro: "0.6 mg/100g",
    dificultad: "Media",
    tiempo: "2-3 años (árbol)",
    espacio: "Maceta grande o jardín",
    riego: "2 veces por semana",
    luz: "Sol directo 8h/día",
    temperatura: "15-30°C",
    meses: ["Todo el año"],
    pasos: [
      "Comprar un plantín de vivero para acortar el tiempo",
      "Plantar en maceta de 60 litros con tierra bien drenada",
      "Ubicar en lugar soleado (8 horas de sol mínimo)",
      "Regar profundamente pero espaciado",
      "Fertilizar cada 2 meses con compost",
      "Cosechar cuando los limones estén amarillos y ceden al tacto",
    ],
    beneficios: ["Vitamina C (potenciadora del hierro)", "Antioxidantes", "Flavonoides", "Vitamina B6"],
    tip: "Un limón al día es el mejor aliado anti-anemia: acompáñalo con cada comida rica en hierro 🍋",
  },
  {
    id: "c6",
    nombre: "Acelga",
    icono: "🥬",
    descripcion: "Verdura de hoja verde con hierro, vitamina A y calcio, perfecta para sopas y guisos.",
    hierro: "1.8 mg/100g",
    dificultad: "Muy fácil",
    tiempo: "50-70 días",
    espacio: "Maceta mediana",
    riego: "Cada 2 días",
    luz: "Semisombra",
    temperatura: "10-18°C",
    meses: ["Abr", "May", "Jun", "Jul", "Ago"],
    pasos: [
      "Llenar maceta con tierra fértil mezclada con compost",
      "Sembrar semillas a 2 cm de profundidad",
      "Espaciar 20 cm entre plantas",
      "Regar regularmente manteniendo la tierra húmeda",
      "Abonar con compost cada 30 días",
      "Cosechar hojas externas desde los 50 días",
    ],
    beneficios: ["Vitamina A, C y K", "Hierro y calcio", "Fibra dietética", "Antioxidantes"],
    tip: "La acelga es perfecta para hacer tortillas y sopas que los niños aceptan fácilmente 🥬",
  },
];

const DIFICULTAD_COLORS: Record<string, string> = {
  "Muy fácil": "bg-green-100 text-green-700",
  "Fácil": "bg-blue-100 text-blue-700",
  "Media": "bg-amber-100 text-amber-700",
};

export default function Biohuerto() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const [selected, setSelected] = useState<typeof CULTIVOS[0] | null>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  if (selected) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-6 px-4">
          <div className="max-w-screen-md mx-auto">
            <button onClick={() => setSelected(null)} className="text-white/70 text-sm hover:text-white mb-3">
              ← Volver al Biohuerto
            </button>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selected.icono}</span>
              <div>
                <h1 className="text-3xl font-serif font-bold">{selected.nombre}</h1>
                <p className="text-white/80 text-sm mt-1">{selected.descripcion}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-md mx-auto w-full px-4 py-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Cosecha</p>
              <p className="text-sm font-semibold">{selected.tiempo}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Riego</p>
              <p className="text-sm font-semibold">{selected.riego}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Sun className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Luz</p>
              <p className="text-sm font-semibold">{selected.luz}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Thermometer className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Temperatura</p>
              <p className="text-sm font-semibold">{selected.temperatura}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">🩸 Aporte nutricional</p>
            <p className="text-sm text-green-700">Hierro: <strong>{selected.hierro}</strong></p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selected.beneficios.map((b) => (
                <span key={b} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-800">💡 Tip nutricional</p>
            <p className="text-sm text-amber-700 mt-1">{selected.tip}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif font-bold text-foreground mb-4">📋 Guía de cultivo paso a paso</h3>
            <div className="flex flex-col gap-3">
              {selected.pasos.map((paso, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground">{paso}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif font-bold text-foreground mb-3">📅 Mejores meses para sembrar</h3>
            <div className="flex flex-wrap gap-2">
              {selected.meses.map((mes) => (
                <span key={mes} className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                  {mes}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Biohuerto</h1>
            <p className="text-white/80 text-sm">Cultiva tus propios alimentos nutritivos</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">🌱 ¿Por qué tener un biohuerto?</p>
          <p className="text-sm text-green-700">
            Cultivar tus propios alimentos garantiza frescura, ahorra dinero y enseña a tus hijos a valorar la alimentación saludable. 
            Enfocamos en plantas ricas en hierro para prevenir la anemia infantil.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CULTIVOS.map((cultivo) => (
            <button
              key={cultivo.id}
              onClick={() => setSelected(cultivo)}
              className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md hover:border-green-300 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{cultivo.icono}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFICULTAD_COLORS[cultivo.dificultad]}`}>
                  {cultivo.dificultad}
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-foreground group-hover:text-green-700 transition-colors">
                  {cultivo.nombre}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cultivo.descripcion}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <div className="flex items-center gap-3">
                  <span>🩸 {cultivo.hierro}</span>
                  <span>⏱ {cultivo.tiempo}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
