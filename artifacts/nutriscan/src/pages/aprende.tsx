import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { BookOpen, Search, ChevronRight, Tag } from "lucide-react";

const ARTICULOS = [
  {
    id: "a1",
    titulo: "¿Qué es la anemia infantil y cómo prevenirla?",
    categoria: "Anemia",
    descripcion: "La anemia infantil ocurre cuando los glóbulos rojos no tienen suficiente hemoglobina para transportar oxígeno. Afecta al 43% de niños en Perú menores de 3 años.",
    contenido: `## ¿Qué es la anemia?
La anemia es una condición en la que la sangre tiene menos hemoglobina de lo normal. En niños, afecta el desarrollo cognitivo, motor y emocional.

## Causas principales en niños
- **Déficit de hierro** (causa más común): alimentación pobre en hierro
- Infecciones recurrentes que consumen reservas de hierro
- Parasitosis intestinal
- Bajo peso al nacer

## Valores normales de hemoglobina en niños
- Menores de 2 años: 11.0 g/dL o más
- De 2 a 11 años: 11.5 g/dL o más

## Señales de alerta
- Palidez en piel, uñas y encías
- Cansancio o fatiga fácil
- Pérdida de apetito
- Dificultad de concentración

## Prevención con alimentación
- Incluir alimentos ricos en hierro hemo (carnes rojas, pollo, hígado)
- Combinar con vitamina C para mejorar absorción
- Evitar té o café con las comidas
- Dar suplementos de hierro según indicación médica`,
    tiempo: "5 min",
    icono: "🩸",
  },
  {
    id: "a2",
    titulo: "Los mejores alimentos ricos en hierro para niños",
    categoria: "Nutrición",
    descripcion: "Conoce los alimentos con mayor contenido de hierro que deberías incluir en la dieta diaria de tus hijos para prevenir la anemia.",
    contenido: `## Hierro hemo (animal) — Mejor absorbido
| Alimento | Hierro por 100g |
|----------|----------------|
| Hígado de res | 6.5 mg |
| Bazo | 28 mg |
| Sangrecita | 25 mg |
| Carne de res | 2.5 mg |
| Pollo (muslo) | 1.3 mg |
| Atún | 1.3 mg |

## Hierro no hemo (vegetal) — Requiere vitamina C
| Alimento | Hierro por 100g |
|----------|----------------|
| Kiwicha | 7.5 mg |
| Lentejas | 3.3 mg |
| Quinoa | 4.6 mg |
| Espinacas | 2.7 mg |
| Frijoles | 6.7 mg |

## Truco clave: La combinación perfecta
Combina siempre alimentos ricos en hierro con vitamina C:
- Lentejas + limón
- Espinacas + naranja
- Carnes + tomate fresco

## Lo que dificulta la absorción
❌ Té y café durante las comidas
❌ Leche en exceso durante el almuerzo
❌ Calcio en grandes cantidades junto al hierro`,
    tiempo: "4 min",
    icono: "🥩",
  },
  {
    id: "a3",
    titulo: "Vitaminas esenciales para el crecimiento infantil",
    categoria: "Vitaminas",
    descripcion: "Guía completa sobre las vitaminas más importantes para el desarrollo saludable de los niños, sus fuentes alimentarias y funciones.",
    contenido: `## Vitamina A
- **Función**: Visión, crecimiento, inmunidad
- **Fuentes**: Zanahoria, zapallo, mango, yema de huevo, hígado
- **Señal de déficit**: Visión nocturna reducida, infecciones frecuentes

## Vitamina C
- **Función**: Inmunidad, absorción de hierro, cicatrización
- **Fuentes**: Limón, naranja, kiwi, guayaba, pimiento
- **Señal de déficit**: Encías sangrantes, cicatrización lenta

## Vitamina D
- **Función**: Absorción de calcio, huesos fuertes, inmunidad
- **Fuentes**: Sol (15 min/día), pescado graso, yema de huevo, leche
- **Señal de déficit**: Raquitismo, huesos débiles

## Vitamina B12
- **Función**: Sistema nervioso, formación de glóbulos rojos
- **Fuentes**: Carnes, pescado, huevos, lácteos
- **Señal de déficit**: Anemia megaloblástica, fatiga

## Ácido Fólico (B9)
- **Función**: Desarrollo cerebral, formación de ADN
- **Fuentes**: Espinacas, brócoli, lentejas, aguacate
- **Señal de déficit**: Anemia, defectos del tubo neural`,
    tiempo: "6 min",
    icono: "💊",
  },
  {
    id: "a4",
    titulo: "Alimentación saludable según la edad del niño",
    categoria: "Alimentación Infantil",
    descripcion: "Guía de nutrición por etapas: desde los primeros alimentos hasta la alimentación escolar, adaptada a las necesidades de cada edad.",
    contenido: `## 0-6 meses: Lactancia materna exclusiva
La leche materna contiene todo lo que el bebé necesita. No dar agua, jugos ni otros alimentos.

## 6-12 meses: Inicio de alimentación complementaria
- Comenzar con papillas de un solo ingrediente
- Introducir alimentos ricos en hierro desde los 6 meses
- **Papilla de pollo**: Mezclada con papa y zanahoria
- **Purés de legumbres**: Lentejas, frijoles bien cocidos

## 1-3 años: Alimentación variada
- 3 comidas principales + 2 refrigerios
- Porciones pequeñas pero nutritivas
- Evitar alimentos procesados y azúcar añadida
- Incluir todos los grupos alimenticios

## 3-6 años: Etapa preescolar
- El niño puede comer la misma comida familiar adaptada
- Promover autonomía en la alimentación
- Crear hábitos: desayuno obligatorio, frutas como refrigerio

## 6-12 años: Etapa escolar
- Mayor requerimiento de hierro y calcio
- Desayuno completo fundamental para el rendimiento
- Incluir refrigerio saludable en la lonchera
- Limitar bebidas azucaradas`,
    tiempo: "7 min",
    icono: "👶",
  },
  {
    id: "a5",
    titulo: "Recetas anti-anemia económicas para toda la familia",
    categoria: "Recetas",
    descripcion: "10 recetas prácticas, económicas y deliciosas diseñadas específicamente para prevenir y tratar la anemia infantil con ingredientes locales.",
    contenido: `## 1. Sopa de lentejas con espinacas
**Ingredientes**: Lentejas 200g, espinacas 100g, cebolla, ajo, zanahoria
**Hierro**: ★★★★☆
**Costo**: S/. 3.00 aprox.

## 2. Causa de atún
**Ingredientes**: Papa amarilla 4 unidades, atún 1 lata, limón, mayonesa
**Hierro**: ★★★☆☆
**Costo**: S/. 5.00 aprox.

## 3. Sangrecita guisada
**Ingredientes**: Sangrecita 250g, cebolla, ají amarillo, hierbabuena
**Hierro**: ★★★★★ (El más alto)
**Costo**: S/. 4.00 aprox.

## 4. Quinoa con leche y frutas
**Ingredientes**: Quinoa ½ taza, leche 1 vaso, plátano, canela
**Hierro**: ★★★☆☆ (+ vitamina C del plátano)
**Costo**: S/. 3.50 aprox.

## 5. Frijoles negros con arroz integral
**Ingredientes**: Frijoles 200g, arroz integral ½ taza, tomate, cilantro
**Hierro**: ★★★★☆
**Costo**: S/. 2.50 aprox.

## Combinaciones ganadoras para absorber más hierro
✅ Hígado + ensalada de tomate con limón
✅ Lentejas + jugo de naranja
✅ Kiwicha + frutas cítricas
✅ Espinacas + limón`,
    tiempo: "5 min",
    icono: "🍲",
  },
  {
    id: "a6",
    titulo: "Hábitos saludables que toda familia debe tener",
    categoria: "Estilo de Vida",
    descripcion: "Más allá de la alimentación: hábitos de vida que complementan una nutrición saludable y mejoran el bienestar de toda la familia.",
    contenido: `## Hidratación
- Niños 1-3 años: 1.3 litros/día
- Niños 4-8 años: 1.7 litros/día
- Niños 9-13 años: 2.1-2.4 litros/día
- Preferir agua sobre jugos azucarados

## Actividad física
- 60 minutos de actividad moderada-intensa al día
- Juegos al aire libre, deportes, baile
- Limitar pantallas a 2 horas/día para mayores de 2 años

## Higiene alimentaria
- Lavado de manos antes de comer y después del baño
- Lavar frutas y verduras antes de consumir
- Mantener cadena de frío de alimentos

## Sueño reparador
- 1-3 años: 11-14 horas
- 3-5 años: 10-13 horas
- 6-12 años: 9-12 horas

## Controles de salud
- Control de talla y peso mensual en menores de 1 año
- Análisis de hemoglobina cada 6 meses
- Suplementación de hierro preventiva según edad

## Desayuno: La comida más importante
Un buen desayuno mejora:
- Concentración y rendimiento escolar
- Estado de ánimo
- Energía para actividades físicas`,
    tiempo: "5 min",
    icono: "🌟",
  },
];

const CATEGORIAS = ["Todos", "Anemia", "Nutrición", "Vitaminas", "Alimentación Infantil", "Recetas", "Estilo de Vida"];

const CAT_COLORS: Record<string, string> = {
  "Anemia": "bg-red-100 text-red-700",
  "Nutrición": "bg-green-100 text-green-700",
  "Vitaminas": "bg-blue-100 text-blue-700",
  "Alimentación Infantil": "bg-yellow-100 text-yellow-700",
  "Recetas": "bg-orange-100 text-orange-700",
  "Estilo de Vida": "bg-purple-100 text-purple-700",
};

export default function Aprende() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [selected, setSelected] = useState<typeof ARTICULOS[0] | null>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const filtered = ARTICULOS.filter((a) => {
    const matchSearch = a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === "Todos" || a.categoria === categoria;
    return matchSearch && matchCat;
  });

  if (selected) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-primary text-primary-foreground py-6 px-4">
          <div className="max-w-screen-md mx-auto">
            <button onClick={() => setSelected(null)} className="text-primary-foreground/70 text-sm hover:text-primary-foreground mb-3 flex items-center gap-1">
              ← Volver a Aprende
            </button>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selected.icono}</span>
              <div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20`}>{selected.categoria}</span>
                <h1 className="text-2xl font-serif font-bold mt-1">{selected.titulo}</h1>
                <p className="text-primary-foreground/70 text-sm">⏱ {selected.tiempo} de lectura</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-screen-md mx-auto w-full px-4 py-8 flex-1">
          <div className="prose prose-sm max-w-none text-foreground">
            {selected.contenido.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground">{line.slice(3)}</h2>;
              if (line.startsWith("| ")) return <p key={i} className="text-sm font-mono text-muted-foreground">{line}</p>;
              if (line.startsWith("- **")) {
                const parts = line.slice(2).split("**: ");
                return <p key={i} className="text-sm mb-1"><strong>{parts[0].slice(2)}</strong>: {parts[1]}</p>;
              }
              if (line.startsWith("- ")) return <p key={i} className="text-sm mb-1 ml-4">• {line.slice(2)}</p>;
              if (line.startsWith("✅") || line.startsWith("❌") || line.startsWith("**")) return <p key={i} className="text-sm mb-1">{line}</p>;
              if (!line.trim()) return <br key={i} />;
              return <p key={i} className="text-sm mb-2 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Aprende</h1>
            <p className="text-primary-foreground/80 text-sm">Biblioteca de nutrición familiar</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos sobre nutrición, anemia, vitaminas..."
            className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                categoria === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelected(art)}
              className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{art.icono}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[art.categoria] || "bg-gray-100 text-gray-700"}`}>
                  {art.categoria}
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                  {art.titulo}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{art.descripcion}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-muted-foreground">⏱ {art.tiempo}</span>
                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No encontramos artículos para tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
