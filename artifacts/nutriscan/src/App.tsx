import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Generate from "@/pages/generate";
import History from "@/pages/history";
import RecipeDetail from "@/pages/recipe-detail";
import Profile from "@/pages/profile";
import Scan from "@/pages/scan";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/registro" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/escanear" component={Scan} />
        <Route path="/generar" component={Generate} />
        <Route path="/historial" component={History} />
        <Route path="/receta/:id" component={RecipeDetail} />
        <Route path="/perfil" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
