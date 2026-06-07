import React from "react";
import { Link, useLocation } from "wouter";
import {
  Leaf, Camera, Sparkles, History, User, LayoutDashboard,
  Bot, Calendar, ShoppingCart, Trophy, Users, BookOpen,
  TrendingUp, Menu, X
} from "lucide-react";
import { getUserId } from "@/lib/auth";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, group: "principal" },
  { href: "/escanear", label: "Nutri-Foto IA", icon: Camera, group: "principal" },
  { href: "/generar", label: "Generar Receta", icon: Sparkles, group: "principal" },
  { href: "/chef", label: "Chef IA", icon: Bot, group: "ia" },
  { href: "/planner", label: "Planner Semanal", icon: Calendar, group: "planificacion" },
  { href: "/mercado", label: "Mercado", icon: ShoppingCart, group: "planificacion" },
  { href: "/retos", label: "Retos Familiares", icon: Trophy, group: "comunidad" },
  { href: "/comunidad", label: "Comunidad", icon: Users, group: "comunidad" },
  { href: "/aprende", label: "Aprende", icon: BookOpen, group: "educacion" },
  { href: "/biohuerto", label: "Biohuerto", icon: Leaf, group: "educacion" },
  { href: "/impacto", label: "Panel de Impacto", icon: TrendingUp, group: "educacion" },
  { href: "/historial", label: "Historial", icon: History, group: "cuenta" },
  { href: "/perfil", label: "Mi Perfil", icon: User, group: "cuenta" },
];

const GROUP_LABELS: Record<string, string> = {
  principal: "Principal",
  ia: "Inteligencia Artificial",
  planificacion: "Planificación",
  comunidad: "Comunidad",
  educacion: "Educación",
  cuenta: "Mi cuenta",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const userId = getUserId();
  const isAuth = !!userId;
  const isPublic = location === "/" || location === "/registro";
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isPublic) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-xl items-center px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 mr-6 text-primary hover:opacity-80 transition-opacity" data-testid="link-home">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-serif font-semibold text-xl tracking-tight">NutriScan IA</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    );
  }

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={
        mobile
          ? "fixed inset-0 z-50 bg-background flex flex-col"
          : "hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-background/95 sticky top-0 h-[100dvh] overflow-y-auto"
      }
    >
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity flex-1" onClick={() => setMobileOpen(false)}>
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-serif font-semibold text-lg tracking-tight">NutriScan IA</span>
        </Link>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                {GROUP_LABELS[group]}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex h-14 items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-serif font-semibold tracking-tight">NutriScan IA</span>
          </Link>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <Sidebar mobile />
        </>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto min-h-[calc(100dvh-3.5rem)] lg:min-h-[100dvh]">
          {children}
        </main>
      </div>
    </div>
  );
}
