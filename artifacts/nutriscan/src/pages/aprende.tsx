import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { BookOpen, Search, Tag, Clock, ChevronLeft } from "lucide-react";

interface Articulo {
  id: string;
  titulo: string;
  categoria: string;
  emoji: string;
  tiempo: string;
  introduccion: string;
  desarrollo: string[];
  consejos: string[];
  referencia: string;
}

const ARTICULOS: Articulo[] = [
  {
    id: "a1",
    titulo: "¿Qué es la anemia infantil y cómo prevenirla?",
    categoria: "Anemia",
    emoji: "🩸",
    tiempo: "5 min",
    introduccion: "La anemia infantil es una de las deficiencias nutricionales más comunes en el Perú y afecta al 40% de niños menores de 3 años. Ocurre cuando el cuerpo no produce suficientes glóbulos rojos saludables para transportar oxígeno.",
    desarrollo: [
      "La anemia por deficiencia de hierro es la más frecuente. El hierro es esencial para producir hemoglobina, la proteína que transporta oxígeno en la sangre. Sin suficiente hierro, los niños se sienten cansados, tienen dificultad para concentrarse y su sistema inmune se debilita.",
      "Los síntomas más comunes incluyen: palidez en piel y mucosas, fatiga excesiva, irritabilidad, menor rendimiento escolar, pérdida de apetito y mayor susceptibilidad a infecciones.",
      "Los niños más vulnerables son: menores de 2 años (crecimiento rápido), niños prematuros, hijos de madres anémicas durante el embarazo, y niños con alimentación pobre en hierro.",
      "El diagnóstico se realiza mediante análisis de sangre (hemoglobina). Valores normales: 11 g/dL en niños de 6 meses a 5 años. Por debajo de este valor se considera anemia.",
    ],
    consejos: [
      "Incluir sangrecita o hígado al menos 2 veces por semana (son las mejores fuentes de hierro)",
      "Combinar alimentos ricos en hierro con vitamina C (ej: lenteja + naranja)",
      "Evitar dar té o café junto con comidas ricas en hierro (bloquean la absorción)",
      "Dar la leche materna o fórmula entre comidas, no durante",
      "Consultar al médico si sospechas de anemia para confirmar con análisis",
    ],
    referencia: "Ministerio de Salud del Perú - Plan Nacional para la Reducción y Control de la Anemia",
  },
  {
    id: "a2",
    titulo: "Alimentos ricos en hierro para niños",
    categoria: "Nutrición",
    emoji: "🥩",
    tiempo: "4 min",
    introduccion: "El hierro es el mineral más importante para prevenir la anemia. Conocer las mejores fuentes de hierro y cómo potenciar su absorción es clave para la nutrición de tus hijos.",
    desarrollo: [
      "Hierro hemo (de origen animal — absorción del 20-30%): Sangrecita (la mejor fuente: 29mg por 100g), hígado de res o pollo, carnes rojas, pescado azul, atún, sardinas. El hierro hemo se absorbe mucho mejor que el vegetal.",
      "Hierro no hemo (de origen vegetal — absorción del 5-10%): Espinaca, lentejas, frijoles, garbanzos, quinoa, kiwicha, betarraga. Aunque la absorción es menor, pueden consumirse en mayor cantidad y combinados con vitamina C.",
      "La vitamina C aumenta la absorción del hierro vegetal hasta 3 veces. Combina: lenteja + jugo de naranja, espinaca + limón, frijoles + tomate, quinoa + kiwi.",
      "Alimentos que BLOQUEAN la absorción de hierro: té negro, café, calcio (leche), fitatos (pan integral en exceso). Evitar consumirlos junto a comidas ricas en hierro.",
    ],
    consejos: [
      "Ofrecer sangrecita al menos 2 veces por semana (cocida con ajo, cebolla y un toque de limón)",
      "Preparar menestras (lentejas, frijoles) con ají amarillo o tomate para mejorar absorción",
      "Añadir limón o naranja a los jugos y comidas con hierro vegetal",
      "Cocinar en ollas de hierro fundido añade pequeñas cantidades de hierro a los alimentos",
      "Variar las fuentes de hierro durante la semana para mejor nutrición global",
    ],
    referencia: "OPS/OMS - Guía de alimentación complementaria para lactantes y niños pequeños",
  },
  {
    id: "a3",
    titulo: "Vitaminas esenciales para el crecimiento infantil",
    categoria: "Vitaminas",
    emoji: "💊",
    tiempo: "5 min",
    introduccion: "Las vitaminas son micronutrientes esenciales que el cuerpo no puede producir solo. Durante la infancia, su presencia adecuada determina el desarrollo físico, mental e inmunológico del niño.",
    desarrollo: [
      "Vitamina A: Esencial para la visión, piel y sistema inmune. Fuentes: zanahoria, zapallo, espinaca, hígado, yema de huevo, leche entera. Deficiencia causa ceguera nocturna y mayor riesgo de infecciones.",
      "Vitamina C: Fundamental para el sistema inmune y la absorción de hierro. Fuentes: naranja, limón, kiwi, pimiento rojo, brócoli, papaya. Los niños necesitan entre 15-45mg diarios.",
      "Vitamina D: Necesaria para la absorción de calcio y el desarrollo óseo. Fuente principal: exposición al sol (15-20 min diarios) y pescados grasos. Deficiencia causa raquitismo.",
      "Vitaminas del complejo B: Esenciales para el metabolismo energético y el sistema nervioso. B12 (solo en alimentos animales): carnes, huevos, lácteos. Ácido fólico: verduras verdes, lentejas, garbanzos.",
      "Vitamina K: Coagulación sanguínea y salud ósea. Fuentes: espinaca, brócoli, lechuga, perejil, aceite de oliva.",
    ],
    consejos: [
      "Incluir al menos 5 colores de frutas y verduras diferentes cada semana",
      "No sobre-cocinar las verduras (pierde vitaminas solubles en agua)",
      "Exponer al niño al sol al menos 20 minutos diarios (brazos y piernas)",
      "Dar huevo completo (yema incluida) 3-4 veces por semana",
      "Consultar al pediatra sobre suplementación si el niño es muy selectivo con los alimentos",
    ],
    referencia: "Instituto Nacional de Salud del Perú - Tablas de composición de alimentos",
  },
  {
    id: "a4",
    titulo: "Alimentación saludable por etapas: 0 a 5 años",
    categoria: "Desarrollo",
    emoji: "👶",
    tiempo: "6 min",
    introduccion: "La alimentación en los primeros 5 años de vida es determinante para la salud de por vida. Cada etapa tiene necesidades específicas que debemos conocer.",
    desarrollo: [
      "0-6 meses: Lactancia materna exclusiva. La leche materna contiene todos los nutrientes necesarios, incluido el hierro en forma muy biodisponible. Dar pecho a demanda, al menos 8-12 veces al día.",
      "6-8 meses: Inicio de la alimentación complementaria. Comenzar con purés y papillas suaves: papas, zanahoria, zapallo, plátano. Introducir de a un alimento nuevo cada 3-5 días para detectar alergias.",
      "8-12 meses: Aumentar variedad y textura. Introducir carnes (pollo, res, pescado) en trozos pequeños. El bebé puede comer 3 comidas principales y 1-2 refrigerios. Incluir legumbres bien cocidas y aplastadas.",
      "1-2 años: El niño puede comer casi de todo. Fomentar la autonomía alimentaria. Ofrecer variedad de alimentos de todos los grupos. La leche materna puede continuar como complemento.",
      "2-5 años: Establecer horarios regulares de comida. Evitar ultraprocesados y azúcares añadidos. Fomentar el consumo de frutas y verduras. Los niños pueden ser selectivos — ofrecer el mismo alimento 10-15 veces antes de concluir que no les gusta.",
    ],
    consejos: [
      "Nunca añadir sal ni azúcar a los alimentos hasta los 2 años",
      "Los jugos de fruta no deben reemplazar a la fruta entera (pierde fibra)",
      "Hacer de la hora de comer un momento agradable, sin pantallas ni distracciones",
      "No usar la comida como premio o castigo",
      "Un niño sano regula su propio apetito — confiar en sus señales",
    ],
    referencia: "UNICEF Perú - Guía de alimentación complementaria para bebés",
  },
  {
    id: "a5",
    titulo: "Loncheras saludables y nutritivas para escolares",
    categoria: "Loncheras",
    emoji: "🎒",
    tiempo: "4 min",
    introduccion: "La lonchera escolar aporta entre el 15-20% de la energía diaria del niño. Una lonchera bien planificada mejora la concentración, el rendimiento escolar y previene la malnutrición.",
    desarrollo: [
      "Una lonchera balanceada debe incluir: 1 alimento energético (carbohidrato), 1 alimento protector (proteína o vitamina), 1 fruta o verdura, y agua o refresco natural sin azúcar.",
      "Alimentos energéticos: pan integral, galletas de avena caseras, camote cocido, papa, arroz. Aportan la energía necesaria para el aprendizaje y el juego.",
      "Alimentos protectores: huevo duro, queso fresco, pollo cocido, atún, tortilla de huevo. Aportan proteínas para el crecimiento y el desarrollo cerebral.",
      "Frutas ideales para lonchera: manzana, plátano, mandarina, uvas, pera. Aportan vitaminas, fibra y energía natural. Siempre lavarlas bien.",
      "¿Qué NO incluir?: Gaseosas, jugos artificiales, snacks de bolsa, dulces, frituras. Estos no aportan nutrientes y desplazan alimentos saludables.",
    ],
    consejos: [
      "Involucrar al niño en la elección de su lonchera (dentro de opciones saludables)",
      "Preparar la lonchera la noche anterior para ahorrar tiempo",
      "Usar recipientes herméticos y bolsas de tela para conservar frescura",
      "Incluir una botella de agua siempre (evitar refrescos)",
      "Variar la lonchera cada día para que el niño no se aburra",
    ],
    referencia: "MINSA Perú - Guía de loncheras escolares saludables",
  },
  {
    id: "a6",
    titulo: "Hidratación infantil: cuánta agua necesitan los niños",
    categoria: "Hidratación",
    emoji: "💧",
    tiempo: "3 min",
    introduccion: "El agua es el nutriente más importante del organismo. Los niños son especialmente vulnerables a la deshidratación porque tienen mayor proporción de agua en el cuerpo y la pierden más rápido.",
    desarrollo: [
      "Necesidades diarias de agua: 1-3 años: 1.3 litros/día. 4-8 años: 1.7 litros/día. 9-13 años: 2.1-2.4 litros/día. Esto incluye el agua de los alimentos (frutas, sopas, etc.).",
      "Señales de deshidratación: boca seca, orina oscura y escasa, llanto sin lágrimas, fontanela hundida en bebés, mareos, irritabilidad, somnolencia.",
      "El agua es la mejor bebida. Los jugos naturales sin azúcar son una segunda opción. Las bebidas azucaradas, gaseosas e isotónicas no son recomendables para niños menores de 12 años.",
      "Los deportes y el clima cálido aumentan las necesidades de agua. En verano o durante actividad física intensa, aumentar el consumo en un 30-50%.",
    ],
    consejos: [
      "Ofrecer agua antes, durante y después de las comidas",
      "Usar vasos coloridos o pajitas divertidas para motivar al niño",
      "Agregar rodajas de limón, menta o pepino al agua para hacerla más atractiva",
      "Revisar el color de la orina: amarillo pálido = bien hidratado; oscuro = tomar más agua",
      "Las frutas y sopas también cuentan como aporte de líquidos",
    ],
    referencia: "Academia Americana de Pediatría - Guías de hidratación infantil",
  },
  {
    id: "a7",
    titulo: "Obesidad infantil: prevención desde el hogar",
    categoria: "Salud",
    emoji: "⚖️",
    tiempo: "5 min",
    introduccion: "La obesidad infantil es una epidemia global que afecta a 41 millones de niños menores de 5 años. Prevenirla desde el hogar es posible con cambios de hábitos sencillos y consistentes.",
    desarrollo: [
      "La obesidad infantil aumenta el riesgo de diabetes tipo 2, hipertensión, problemas articulares, baja autoestima y depresión. Los niños obesos tienen mayor probabilidad de serlo en la adultez.",
      "Causas principales: consumo excesivo de alimentos ultraprocesados y azucarados, sedentarismo, exceso de tiempo frente a pantallas, tamaños de porción inapropiados y falta de sueño.",
      "El ambiente familiar es el factor más importante. Los niños aprenden por imitación — si los padres comen saludable y hacen ejercicio, los niños también lo harán.",
      "No se trata de 'dietas' sino de hábitos: cocinar en casa, comer en familia, limitar ultraprocesados, promover el juego activo al aire libre.",
    ],
    consejos: [
      "Limitar el tiempo de pantallas a máximo 1-2 horas diarias para niños mayores de 2 años",
      "Promover al menos 60 minutos de actividad física moderada al día",
      "No usar comida como recompensa ni castigo",
      "Ofrecer porciones adecuadas y dejar que el niño decida cuándo está lleno",
      "Hacer de la cocina familiar un hábito: preparar comidas sencillas juntos",
    ],
    referencia: "OMS - Informe sobre la comisión para acabar con la obesidad infantil",
  },
  {
    id: "a8",
    titulo: "Lactancia materna: beneficios y consejos prácticos",
    categoria: "Lactancia",
    emoji: "🤱",
    tiempo: "5 min",
    introduccion: "La lactancia materna exclusiva durante los primeros 6 meses de vida es el mejor regalo nutricional que una madre puede dar a su hijo. Protege contra enfermedades y fortalece el vínculo madre-bebé.",
    desarrollo: [
      "Beneficios para el bebé: protección contra infecciones (diarrea, neumonía, otitis), menor riesgo de alergias y enfermedades crónicas, mejor desarrollo cognitivo, menor riesgo de obesidad y diabetes.",
      "Beneficios para la madre: recuperación posparto más rápida, reducción del riesgo de cáncer de mama y ovario, menor riesgo de depresión posparto, ahorro económico significativo.",
      "Composición de la leche materna: cambia según las necesidades del bebé. El calostro (primeros días) está lleno de anticuerpos. La leche madura aporta todos los nutrientes en las proporciones exactas.",
      "La leche materna sí contiene suficiente hierro para los primeros 6 meses en bebés a término. Sin embargo, a partir de los 6 meses es necesario introducir alimentos ricos en hierro.",
      "Los problemas más comunes: pezones doloridos (por mal agarre), baja producción (se soluciona dando pecho a demanda), grietas (aplicar la propia leche sobre el pezón). Buscar apoyo de una asesora de lactancia.",
    ],
    consejos: [
      "Dar pecho a demanda, al menos cada 2-3 horas en los primeros meses",
      "Asegurar un buen agarre: boca bien abierta, labios evertidos, mejillas redondeadas",
      "Mantenerse bien hidratada y nutrida durante la lactancia",
      "Evitar el uso de biberones y chupetes en las primeras semanas (confusión de pezón)",
      "Buscar apoyo en grupos de lactancia o asesoras certificadas si tienes dudas",
    ],
    referencia: "UNICEF / OMS - Estrategia mundial para la alimentación del lactante y del niño pequeño",
  },
  {
    id: "a9",
    titulo: "Desnutrición infantil: señales de alerta y qué hacer",
    categoria: "Salud",
    emoji: "⚠️",
    tiempo: "4 min",
    introduccion: "La desnutrición infantil sigue siendo un problema grave en el Perú, especialmente en zonas rurales. Detectarla a tiempo y actuar rápido puede cambiar el curso del desarrollo de un niño.",
    desarrollo: [
      "Tipos de desnutrición: desnutrición aguda (pérdida brusca de peso — emergencia), desnutrición crónica (talla baja para la edad — trastorno del crecimiento) y déficit de micronutrientes (vitaminas y minerales).",
      "Señales de alerta: estancamiento o pérdida de peso, talla muy baja para la edad, cabello quebradizo o que cae, abdomen prominente, apatía y falta de energía, infecciones frecuentes, retraso en el desarrollo.",
      "La desnutrición crónica en el Perú afecta al 12.2% de menores de 5 años y tiene consecuencias irreversibles si no se trata en los primeros 1000 días de vida.",
      "El tratamiento incluye: alimentación terapéutica supervisada, suplementación de micronutrientes, tratamiento de infecciones subyacentes y apoyo familiar para mejorar las prácticas de alimentación.",
    ],
    consejos: [
      "Llevar al niño a sus controles de crecimiento y desarrollo (CRED) regularmente",
      "Pesar y tallar al niño y registrar en el carné de crecimiento",
      "Si el niño no sube de peso o está bajo para su edad, consultar al médico inmediatamente",
      "Acceder a los programas sociales: Qali Warma, Vaso de Leche, Juntos",
      "Solicitar micronutrientes en polvito ('chispitas') en el centro de salud para niños de 6-36 meses",
    ],
    referencia: "INEI Perú - Encuesta Demográfica y de Salud Familiar (ENDES)",
  },
  {
    id: "a10",
    titulo: "Frutas y verduras: cómo lograr que los niños las coman",
    categoria: "Consejos",
    emoji: "🥦",
    tiempo: "4 min",
    introduccion: "Uno de los mayores retos de los padres es lograr que los niños coman frutas y verduras. Aquí encontrarás estrategias probadas para convertirlas en parte natural de la alimentación familiar.",
    desarrollo: [
      "La ciencia de la exposición repetida: los niños necesitan ver un alimento nuevo entre 10-15 veces antes de aceptarlo. La clave es la paciencia y la constancia, sin presionar.",
      "La presentación importa mucho: cortar las verduras en formas divertidas, usar colores variados en el plato, servir en recipientes llamativos o con 'nombres creativos' (árboles de brócoli, carros de zanahoria).",
      "Involucrar a los niños en la cocina aumenta significativamente la probabilidad de que coman lo que prepararon. Dejarlos lavar, mezclar, decorar o elegir ingredientes.",
      "Las frutas y verduras escondidas en preparaciones son un recurso válido: espinaca en batidos de frutas, zanahoria rallada en guisos, betarraga en tortas, calabaza en salsas.",
      "Dar el ejemplo es la herramienta más poderosa: los niños comen lo que ven comer a sus padres. Las comidas en familia donde todos comen lo mismo crean hábitos positivos.",
    ],
    consejos: [
      "Nunca forzar al niño a comer — crea aversión y trauma alimentario",
      "Servir pequeñas cantidades nuevas junto a alimentos que ya le gustan",
      "Llevar al niño al mercado y dejarle elegir una fruta o verdura nueva por semana",
      "Preparar smoothies con espinaca, plátano y leche — el color verde se vuelve divertido",
      "Celebrar cada vez que prueba algo nuevo, aunque no le guste del todo",
    ],
    referencia: "División de Nutrición Infantil, Harvard T.H. Chan School of Public Health",
  },
];

const CATEGORIAS = ["Todas", "Anemia", "Nutrición", "Vitaminas", "Desarrollo", "Loncheras", "Hidratación", "Salud", "Lactancia", "Consejos"];

const CAT_COLORS: Record<string, string> = {
  "Anemia": "bg-red-100 text-red-700",
  "Nutrición": "bg-orange-100 text-orange-700",
  "Vitaminas": "bg-yellow-100 text-yellow-700",
  "Desarrollo": "bg-blue-100 text-blue-700",
  "Loncheras": "bg-purple-100 text-purple-700",
  "Hidratación": "bg-cyan-100 text-cyan-700",
  "Salud": "bg-green-100 text-green-700",
  "Lactancia": "bg-pink-100 text-pink-700",
  "Consejos": "bg-amber-100 text-amber-700",
};

export default function Aprende() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const [categoria, setCategoria] = useState("Todas");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Articulo | null>(null);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const filtered = ARTICULOS.filter(a => {
    const matchCat = categoria === "Todas" || a.categoria === categoria;
    const matchSearch = a.titulo.toLowerCase().includes(search.toLowerCase()) || a.introduccion.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold">Aprende</h1>
            <p className="text-primary-foreground/80 text-sm">{ARTICULOS.length} artículos de nutrición infantil · Por expertos</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {selected ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-6 text-primary-foreground">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a la biblioteca
              </button>
              <div className="text-4xl mb-3">{selected.emoji}</div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CAT_COLORS[selected.categoria] || "bg-white/20 text-white"} mb-3 inline-block`}>
                {selected.categoria}
              </span>
              <h2 className="text-xl font-serif font-bold mt-2">{selected.titulo}</h2>
              <div className="flex items-center gap-2 mt-3 text-primary-foreground/70 text-sm">
                <Clock className="h-4 w-4" />
                Lectura de {selected.tiempo}
              </div>
            </div>

            <div className="p-5 md:p-8 space-y-6">
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                <p className="text-foreground leading-relaxed">{selected.introduccion}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-lg mb-3">📖 Desarrollo</h3>
                <div className="space-y-3">
                  {selected.desarrollo.map((parrafo, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-primary font-bold text-sm mt-1 shrink-0">{i + 1}.</span>
                      <p className="text-muted-foreground leading-relaxed text-sm">{parrafo}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  💡 Consejos prácticos para mamás
                </h3>
                <div className="space-y-2">
                  {selected.consejos.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-amber-500 font-bold shrink-0">✓</span>
                      <p className="text-sm text-amber-700">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <strong>Fuente:</strong> {selected.referencia}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar artículos sobre nutrición infantil..."
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    categoria === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No hay artículos que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelected(art)}
                    className="bg-card border border-border rounded-2xl p-5 text-left hover:border-primary/40 hover:shadow-md transition-all group flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl">{art.emoji}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${CAT_COLORS[art.categoria] || "bg-muted text-muted-foreground"}`}>
                        {art.categoria}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{art.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{art.introduccion}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {art.tiempo} de lectura
                      </span>
                      <span className="text-xs text-primary font-semibold group-hover:underline">Leer artículo →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
              <Tag className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{filtered.length} artículos</strong> disponibles. Contenido basado en fuentes oficiales: MINSA, OMS, UNICEF, OPS e institutos especializados en nutrición infantil.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
