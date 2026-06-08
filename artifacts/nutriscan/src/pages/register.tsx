import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateUser } from "@workspace/api-client-react";
import { setUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heart, Users, Baby, Clock, Wallet, ChefHat, Sparkles, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  integrantes: z.coerce.number().min(1, "Al menos 1 integrante"),
  ninos: z.coerce.number().min(1, "Al menos 1 niño"),
  edades: z.string().optional(),
  presupuesto: z.string().min(1, "Selecciona un presupuesto"),
  tiempo_cocina: z.coerce.number().min(5, "Mínimo 5 minutos"),
});

type FormData = z.infer<typeof schema>;

const PRESUPUESTO_OPTIONS = [
  { value: "Bajo", label: "Bajo", sub: "Menos de S/20/día", emoji: "🟢", color: "border-green-400 bg-green-50 text-green-800" },
  { value: "Medio", label: "Medio", sub: "S/20 a S/50/día", emoji: "🟡", color: "border-amber-400 bg-amber-50 text-amber-800" },
  { value: "Alto", label: "Alto", sub: "Más de S/50/día", emoji: "🔵", color: "border-blue-400 bg-blue-50 text-blue-800" },
];

const TIEMPO_OPTIONS = [15, 20, 30, 45, 60, 90];

const TIPS = [
  "🥕 Los niños que comen variado tienen mejor desarrollo cognitivo",
  "🩸 La sangrecita tiene 10x más hierro que la carne de res",
  "🌿 Una lonchera colorida garantiza más nutrientes",
  "💪 Con solo S/20 al día puedes preparar comidas muy nutritivas",
  "⭐ Las madres que planifican el menú reducen el estrés diario",
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      integrantes: 4,
      ninos: 1,
      edades: "",
      presupuesto: "",
      tiempo_cocina: 30,
    },
  });

  const presupuesto = form.watch("presupuesto");

  const onSubmit = (data: FormData) => {
    createUser.mutate(
      {
        data: {
          nombre: data.nombre,
          integrantes: data.integrantes,
          ninos: data.ninos,
          edades: data.edades || undefined,
          presupuesto: data.presupuesto,
          tiempo_cocina: data.tiempo_cocina,
        },
      },
      {
        onSuccess: (user) => {
          setUserId(user.id);
          toast({ title: `¡Bienvenida, ${user.nombre}! 🎉`, description: "Tu perfil fue creado. ¡Empieza generando tu primera receta!" });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Ocurrió un error", description: "No se pudo crear el perfil. Inténtalo de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-primary/5 to-background min-h-screen">
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center bg-white/20 p-3 rounded-full mb-3">
            <Heart className="h-7 w-7 fill-white/40" />
          </div>
          <h1 className="text-2xl font-serif font-bold">¡Empieza a cuidar a tu familia!</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Cuéntanos sobre ti y personalizaremos cada receta para tus hijos</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Star className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">{randomTip}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground">👋 ¿Cómo te llamas?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: María López"
                        className="rounded-xl"
                        {...field}
                        data-testid="input-nombre"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="integrantes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        Integrantes
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} className="rounded-xl" {...field} data-testid="input-integrantes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ninos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground flex items-center gap-1.5">
                        <Baby className="h-4 w-4 text-primary" />
                        Niños
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} className="rounded-xl" {...field} data-testid="input-ninos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="edades"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground">🎂 Edades de los niños <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 3, 5 y 8 años" className="rounded-xl" {...field} data-testid="input-edades" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presupuesto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-primary" />
                      Presupuesto diario para comida
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {PRESUPUESTO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`rounded-xl border-2 p-3 text-center transition-all duration-150 ${
                            field.value === opt.value
                              ? `${opt.color} border-2 shadow-sm scale-105`
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                          }`}
                          data-testid={`presupuesto-${opt.value.toLowerCase()}`}
                        >
                          <div className="text-lg mb-1">{opt.emoji}</div>
                          <div className="text-sm font-bold">{opt.label}</div>
                          <div className="text-[10px] mt-0.5 opacity-80 leading-tight">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.presupuesto && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.presupuesto.message}</p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiempo_cocina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      ¿Cuánto tiempo tienes para cocinar?
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {TIEMPO_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={`rounded-xl border-2 py-2.5 px-3 text-sm font-semibold transition-all duration-150 ${
                            Number(field.value) === t
                              ? "border-primary bg-primary/10 text-primary scale-105 shadow-sm"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          {t} min
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {presupuesto && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-primary">
                    {presupuesto === "Bajo" && "¡Perfecto! Te enseñaremos a hacer comidas super nutritivas y económicas 💪"}
                    {presupuesto === "Medio" && "¡Excelente! Tienes un presupuesto ideal para una alimentación variada y nutritiva 🌟"}
                    {presupuesto === "Alto" && "¡Fantástico! Podrás aprovechar los mejores ingredientes para la salud de tus hijos ⭐"}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full mt-2 gap-2 text-base py-6"
                size="lg"
                disabled={createUser.isPending}
                data-testid="button-register"
              >
                {createUser.isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Creando tu perfil...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    ¡Crear mi perfil y empezar!
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Al continuar, acepto que esta aplicación es una guía nutricional y no reemplaza consultas médicas 🏥
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
