import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles, Loader2, CheckCircle2, Circle, Home, ShoppingBag, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductItem {
  id: string;
  nombre: string;
  emoji: string;
  categoria: string;
  cantidad: string;
  precio: string;
  inCart: boolean;
  inHome: boolean;
}

const CATALOG: Omit<ProductItem, "inCart" | "inHome">[] = [
  { id: "v1", nombre: "Zanahoria", emoji: "🥕", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 1.50" },
  { id: "v2", nombre: "Brócoli", emoji: "🥦", categoria: "Verduras", cantidad: "1 unidad", precio: "S/. 2.50" },
  { id: "v3", nombre: "Espinaca", emoji: "🌿", categoria: "Verduras", cantidad: "500g", precio: "S/. 2.00" },
  { id: "v4", nombre: "Lechuga", emoji: "🥬", categoria: "Verduras", cantidad: "1 unidad", precio: "S/. 1.00" },
  { id: "v5", nombre: "Tomate", emoji: "🍅", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 2.00" },
  { id: "v6", nombre: "Pepino", emoji: "🥒", categoria: "Verduras", cantidad: "2 unidades", precio: "S/. 1.50" },
  { id: "v7", nombre: "Betarraga", emoji: "🫚", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 2.50" },
  { id: "v8", nombre: "Zapallo", emoji: "🎃", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 1.50" },
  { id: "v9", nombre: "Coliflor", emoji: "🥦", categoria: "Verduras", cantidad: "1 unidad", precio: "S/. 3.00" },
  { id: "v10", nombre: "Apio", emoji: "🌱", categoria: "Verduras", cantidad: "1 atado", precio: "S/. 1.00" },
  { id: "v11", nombre: "Cebolla", emoji: "🧅", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 2.00" },
  { id: "v12", nombre: "Ajo", emoji: "🧄", categoria: "Verduras", cantidad: "1 cabeza", precio: "S/. 0.50" },
  { id: "v13", nombre: "Papa", emoji: "🥔", categoria: "Verduras", cantidad: "1 kg", precio: "S/. 1.50" },
  { id: "v14", nombre: "Pimiento", emoji: "🫑", categoria: "Verduras", cantidad: "3 unidades", precio: "S/. 2.00" },
  { id: "f1", nombre: "Manzana", emoji: "🍎", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 3.00" },
  { id: "f2", nombre: "Plátano", emoji: "🍌", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 2.00" },
  { id: "f3", nombre: "Naranja", emoji: "🍊", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 2.50" },
  { id: "f4", nombre: "Mandarina", emoji: "🍊", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 3.00" },
  { id: "f5", nombre: "Papaya", emoji: "🍈", categoria: "Frutas", cantidad: "1 unidad", precio: "S/. 4.00" },
  { id: "f6", nombre: "Piña", emoji: "🍍", categoria: "Frutas", cantidad: "1 unidad", precio: "S/. 3.50" },
  { id: "f7", nombre: "Pera", emoji: "🍐", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 3.00" },
  { id: "f8", nombre: "Sandía", emoji: "🍉", categoria: "Frutas", cantidad: "1/4", precio: "S/. 3.00" },
  { id: "f9", nombre: "Uvas", emoji: "🍇", categoria: "Frutas", cantidad: "1 kg", precio: "S/. 5.00" },
  { id: "f10", nombre: "Limón", emoji: "🍋", categoria: "Frutas", cantidad: "1 bolsa", precio: "S/. 1.00" },
  { id: "p1", nombre: "Pollo (presa)", emoji: "🍗", categoria: "Proteínas", cantidad: "1 kg", precio: "S/. 9.00" },
  { id: "p2", nombre: "Carne de res", emoji: "🥩", categoria: "Proteínas", cantidad: "500g", precio: "S/. 12.00" },
  { id: "p3", nombre: "Carne molida", emoji: "🫙", categoria: "Proteínas", cantidad: "500g", precio: "S/. 10.00" },
  { id: "p4", nombre: "Pescado", emoji: "🐟", categoria: "Proteínas", cantidad: "500g", precio: "S/. 8.00" },
  { id: "p5", nombre: "Atún (lata)", emoji: "🐠", categoria: "Proteínas", cantidad: "2 latas", precio: "S/. 5.00" },
  { id: "p6", nombre: "Sangrecita", emoji: "🫀", categoria: "Proteínas", cantidad: "250g", precio: "S/. 3.00" },
  { id: "p7", nombre: "Hígado", emoji: "🫀", categoria: "Proteínas", cantidad: "500g", precio: "S/. 5.00" },
  { id: "p8", nombre: "Huevo", emoji: "🥚", categoria: "Proteínas", cantidad: "1 docena", precio: "S/. 7.00" },
  { id: "p9", nombre: "Cerdo (costilla)", emoji: "🥓", categoria: "Proteínas", cantidad: "500g", precio: "S/. 9.00" },
  { id: "g1", nombre: "Arroz", emoji: "🍚", categoria: "Granos y Cereales", cantidad: "1 kg", precio: "S/. 4.00" },
  { id: "g2", nombre: "Avena", emoji: "🌾", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 3.50" },
  { id: "g3", nombre: "Quinua", emoji: "🌾", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 5.00" },
  { id: "g4", nombre: "Lentejas", emoji: "🫘", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 4.00" },
  { id: "g5", nombre: "Frijoles", emoji: "🫘", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 3.50" },
  { id: "g6", nombre: "Garbanzos", emoji: "🫘", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 4.00" },
  { id: "g7", nombre: "Kiwicha", emoji: "🌾", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 6.00" },
  { id: "g8", nombre: "Pan integral", emoji: "🍞", categoria: "Granos y Cereales", cantidad: "1 unidad", precio: "S/. 5.00" },
  { id: "g9", nombre: "Pasta", emoji: "🍝", categoria: "Granos y Cereales", cantidad: "500g", precio: "S/. 3.00" },
  { id: "l1", nombre: "Leche", emoji: "🥛", categoria: "Lácteos", cantidad: "1 litro", precio: "S/. 5.00" },
  { id: "l2", nombre: "Queso", emoji: "🧀", categoria: "Lácteos", cantidad: "250g", precio: "S/. 6.00" },
  { id: "l3", nombre: "Yogur", emoji: "🥛", categoria: "Lácteos", cantidad: "1 litro", precio: "S/. 7.00" },
  { id: "l4", nombre: "Mantequilla", emoji: "🧈", categoria: "Lácteos", cantidad: "200g", precio: "S/. 6.50" },
  { id: "o1", nombre: "Aceite vegetal", emoji: "🫗", categoria: "Otros", cantidad: "1 litro", precio: "S/. 7.00" },
  { id: "o2", nombre: "Sal", emoji: "🧂", categoria: "Otros", cantidad: "1 kg", precio: "S/. 1.00" },
  { id: "o3", nombre: "Azúcar", emoji: "🍬", categoria: "Otros", cantidad: "1 kg", precio: "S/. 3.50" },
  { id: "o4", nombre: "Fideos", emoji: "🍜", categoria: "Otros", cantidad: "500g", precio: "S/. 3.00" },
];

const CATEGORIAS = ["Todas", "Verduras", "Frutas", "Proteínas", "Granos y Cereales", "Lácteos", "Otros"];
const CAT_EMOJIS: Record<string, string> = {
  "Todas": "🛒", "Verduras": "🥦", "Frutas": "🍎", "Proteínas": "🥩",
  "Granos y Cereales": "🌾", "Lácteos": "🥛", "Otros": "📦",
};
const IRON_RICH = ["Espinaca", "Lentejas", "Frijoles", "Sangrecita", "Hígado", "Quinua", "Kiwicha", "Betarraga", "Brócoli"];

export default function Mercado() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [view, setView] = useState<"catalog" | "cart">("catalog");
  const [categoria, setCategoria] = useState("Todas");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ProductItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const storageKey = `mercado2_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(CATALOG.map(p => ({ ...p, inCart: false, inHome: false })));
    }
  }, [userId]);

  const save = (newItems: ProductItem[]) => {
    setItems(newItems);
    localStorage.setItem(storageKey, JSON.stringify(newItems));
  };

  const toggleCart = (id: string) => {
    save(items.map(i => i.id === id ? { ...i, inCart: !i.inCart, inHome: i.inCart ? i.inHome : false } : i));
  };

  const toggleHome = (id: string) => {
    save(items.map(i => i.id === id ? { ...i, inHome: !i.inHome, inCart: i.inHome ? i.inCart : false } : i));
  };

  const clearCart = () => {
    save(items.map(i => ({ ...i, inCart: false })));
    toast({ title: "Lista limpiada", description: "Se eliminaron todos los productos de la lista" });
  };

  const generateFromPlanner = async () => {
    setGenerating(true);
    try {
      const plannerRaw = localStorage.getItem(`planner_${userId}`);
      const plannerData = plannerRaw ? JSON.parse(plannerRaw) : null;
      const plannerSummary = plannerData
        ? Object.entries(plannerData).map(([k, v]) => `${k}: ${Object.values(v as Record<string, string>).join(", ")}`).join("; ")
        : "Sin menú";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Basándote en este menú semanal: "${plannerSummary}", dime qué productos del siguiente catálogo necesito comprar. 
          Catálogo disponible: ${CATALOG.map(p => p.nombre).join(", ")}.
          Responde SOLO con un JSON array de nombres exactos del catálogo (sin markdown):
          ["nombre1","nombre2",...]
          Prioriza alimentos ricos en hierro para prevenir anemia.`,
        }),
      });
      const data = await res.json();
      const jsonMatch = data.reply?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const needed: string[] = JSON.parse(jsonMatch[0]);
        const updated = items.map(i => ({
          ...i,
          inCart: needed.includes(i.nombre) && !i.inHome,
        }));
        save(updated);
        const count = updated.filter(i => i.inCart).length;
        toast({ title: "¡Lista generada!", description: `${count} productos agregados desde tu planner 🛒` });
        setView("cart");
      }
    } catch {
      toast({ title: "Error", description: "No se pudo generar la lista", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const filtered = items.filter(i => {
    const matchCat = categoria === "Todas" || i.categoria === categoria;
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartItems = items.filter(i => i.inCart);
  const homeItems = items.filter(i => i.inHome);
  const totalCart = cartItems.reduce((sum, i) => {
    const price = parseFloat(i.precio.replace(/[^0-9.]/g, "") || "0");
    return sum + price;
  }, 0);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Mercado Inteligente</h1>
              <p className="text-primary-foreground/80 text-sm">Catálogo completo de alimentos nutritivos</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={generateFromPlanner} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generar desde planner
          </Button>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-4 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{cartItems.length}</p>
            <p className="text-[10px] text-muted-foreground">Por comprar</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{homeItems.length}</p>
            <p className="text-[10px] text-muted-foreground">En casa</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">S/. {totalCart.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Total estimado</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("catalog")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === "catalog" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            <ShoppingBag className="h-4 w-4" />
            Catálogo ({CATALOG.length})
          </button>
          <button
            onClick={() => setView("cart")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === "cart" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            <ShoppingCart className="h-4 w-4" />
            Lista ({cartItems.length})
          </button>
        </div>

        {view === "catalog" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar alimento..."
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    categoria === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span>{CAT_EMOJIS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered.map((item) => {
                const isIronRich = IRON_RICH.includes(item.nombre);
                return (
                  <div
                    key={item.id}
                    className={`bg-card border rounded-xl p-3 flex items-center gap-3 transition-all ${
                      item.inCart ? "border-primary/40 bg-primary/5" :
                      item.inHome ? "border-green-300 bg-green-50" :
                      "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{item.nombre}</p>
                        {isIronRich && (
                          <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold shrink-0">🩸 Hierro</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{item.cantidad} · {item.precio}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleCart(item.id)}
                        title="Agregar a lista de compras"
                        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold transition-all ${
                          item.inCart ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {item.inCart ? "En lista" : "Comprar"}
                      </button>
                      <button
                        onClick={() => toggleHome(item.id)}
                        title="Ya lo tengo en casa"
                        className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold transition-all ${
                          item.inHome ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground hover:bg-green-50"
                        }`}
                      >
                        <Home className="h-3 w-3" />
                        {item.inHome ? "En casa" : "Tengo"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === "cart" && (
          <div className="flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="bg-muted p-6 rounded-full">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Tu lista de compras está vacía</p>
                <p className="text-sm text-muted-foreground">Agrega productos desde el catálogo o genera desde el planner semanal</p>
                <Button variant="outline" size="sm" onClick={() => setView("catalog")}>
                  Ir al catálogo
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{cartItems.length} productos para comprar</p>
                  <Button variant="outline" size="sm" onClick={clearCart} className="gap-2 text-destructive border-destructive/30">
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {cartItems.map((item, i) => (
                    <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${i < cartItems.length - 1 ? "border-b border-border" : ""}`}>
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">{item.cantidad}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.precio}</span>
                      <button onClick={() => toggleCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Circle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-primary/10">
                    <p className="font-semibold text-foreground">Total estimado</p>
                    <p className="text-lg font-bold text-primary">S/. {totalCart.toFixed(2)}</p>
                  </div>
                </div>

                {homeItems.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Ya tienes en casa ({homeItems.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {homeItems.map(i => (
                        <span key={i.id} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {i.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
