import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles, Loader2, Plus, Trash2, CheckCircle2, Circle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: string;
  nombre: string;
  cantidad: string;
  precio: string;
  checked: boolean;
  categoria: string;
}

const CATEGORIAS = ["Carnes y proteínas", "Verduras y hojas verdes", "Frutas", "Granos y cereales", "Lácteos", "Otros"];

const CATEGORIA_COLORS: Record<string, string> = {
  "Carnes y proteínas": "bg-red-50 text-red-700 border-red-200",
  "Verduras y hojas verdes": "bg-green-50 text-green-700 border-green-200",
  "Frutas": "bg-orange-50 text-orange-700 border-orange-200",
  "Granos y cereales": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Lácteos": "bg-blue-50 text-blue-700 border-blue-200",
  "Otros": "bg-gray-50 text-gray-700 border-gray-200",
};

export default function Mercado() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ nombre: "", cantidad: "", precio: "", categoria: "Otros" });

  const storageKey = `mercado_${userId}`;

  useEffect(() => {
    if (!userId) { setLocation("/"); return; }
    const saved = localStorage.getItem(storageKey);
    if (saved) setItems(JSON.parse(saved));
  }, [userId]);

  const save = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem(storageKey, JSON.stringify(newItems));
  };

  const toggle = (id: string) => {
    save(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const remove = (id: string) => {
    save(items.filter((i) => i.id !== id));
  };

  const addItem = () => {
    if (!newItem.nombre.trim()) return;
    const item: ShoppingItem = {
      id: Date.now().toString(),
      ...newItem,
      checked: false,
    };
    save([...items, item]);
    setNewItem({ nombre: "", cantidad: "", precio: "", categoria: "Otros" });
    setAdding(false);
  };

  const generateList = async () => {
    setGenerating(true);
    try {
      const plannerRaw = localStorage.getItem(`planner_${userId}`);
      const plannerData = plannerRaw ? JSON.parse(plannerRaw) : null;
      const plannerSummary = plannerData
        ? Object.entries(plannerData)
            .map(([k, v]) => `${k}: ${Object.values(v as Record<string, string>).join(", ")}`)
            .join("\n")
        : "Sin menú semanal registrado";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: `Basándote en este menú semanal: "${plannerSummary}", genera una lista de compras completa y económica. 
          Prioriza alimentos ricos en hierro para prevenir anemia. 
          Responde SOLO con un JSON array (sin markdown):
          [{"nombre":"Espinacas","cantidad":"500g","precio":"S/. 2.00","categoria":"Verduras y hojas verdes"},...]
          Las categorías deben ser una de: "Carnes y proteínas", "Verduras y hojas verdes", "Frutas", "Granos y cereales", "Lácteos", "Otros"`,
        }),
      });
      const data = await res.json();
      const jsonMatch = data.reply?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generated: Omit<ShoppingItem, "id" | "checked">[] = JSON.parse(jsonMatch[0]);
        const newItems = generated.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random(),
          checked: false,
        }));
        save([...items, ...newItems]);
        toast({ title: "¡Lista generada!", description: `${newItems.length} productos agregados 🛒` });
      }
    } catch {
      toast({ title: "Error", description: "No se pudo generar la lista", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const totalEstimado = items.reduce((sum, item) => {
    const price = parseFloat(item.precio?.replace(/[^0-9.]/g, "") || "0");
    return sum + price;
  }, 0);

  const pendientes = items.filter((i) => !i.checked).length;
  const completados = items.filter((i) => i.checked).length;

  const byCategoria = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.categoria === cat);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

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
              <p className="text-primary-foreground/80 text-sm">Lista de compras automática</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={generateList} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generar desde planner
          </Button>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total productos</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completados}</p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">S/. {totalEstimado.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total estimado</p>
          </div>
        </div>

        {pendientes > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-sm text-amber-800 font-medium">📋 {pendientes} producto(s) pendientes</span>
            <span className="text-xs text-amber-600">{items.length > 0 ? Math.round((completados / items.length) * 100) : 0}% completado</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAdding(!adding)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar producto
          </Button>
          {items.some((i) => i.checked) && (
            <Button variant="outline" size="sm" onClick={() => save(items.filter((i) => !i.checked))} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              Eliminar comprados
            </Button>
          )}
        </div>

        {adding && (
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-sm">Nuevo producto</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Nombre del producto"
                value={newItem.nombre}
                onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                className="col-span-2 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                placeholder="Cantidad (ej: 500g)"
                value={newItem.cantidad}
                onChange={(e) => setNewItem({ ...newItem, cantidad: e.target.value })}
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                placeholder="Precio estimado"
                value={newItem.precio}
                onChange={(e) => setNewItem({ ...newItem, precio: e.target.value })}
                className="bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={newItem.categoria}
                onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                className="col-span-2 bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              >
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addItem}>Agregar</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="bg-muted p-6 rounded-full">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Tu lista está vacía</p>
            <p className="text-sm text-muted-foreground">Genera una lista desde tu planner semanal o agrega productos manualmente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {CATEGORIAS.map((cat) => {
              const catItems = byCategoria[cat];
              if (!catItems.length) return null;
              return (
                <div key={cat} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className={`px-4 py-2 border-b ${CATEGORIA_COLORS[cat]} border-opacity-50`}>
                    <span className="text-xs font-semibold">{cat}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {catItems.map((item) => (
                      <div key={item.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${item.checked ? "opacity-50" : ""}`}>
                        <button onClick={() => toggle(item.id)} className="shrink-0">
                          {item.checked
                            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                            : <Circle className="h-5 w-5 text-muted-foreground" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${item.checked ? "line-through" : ""}`}>{item.nombre}</p>
                          <p className="text-xs text-muted-foreground">{item.cantidad}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{item.precio}</span>
                        <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
