import React from "react";
import { Link } from "wouter";
import { Leaf } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
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
          <nav className="flex items-center gap-6 text-sm font-medium ml-auto">
            {/* Nav items could go here depending on auth state, handled in pages mostly */}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
