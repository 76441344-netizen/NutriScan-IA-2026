import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateUser } from "@workspace/api-client-react";
import { setUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Users, Baby, Clock, Wallet } from "lucide-react";
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
          toast({ title: "Bienvenida", description: `Hola, ${user.nombre}. Tu perfil ha sido creado.` });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo crear el perfil. Inténtalo de nuevo.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Crea tu perfil</h1>
          <p className="text-muted-foreground mt-2">Cuéntanos sobre tu familia para personalizar las recetas</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Tu nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: María López" {...field} data-testid="input-nombre" />
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
                      <FormLabel className="font-medium flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Integrantes
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-integrantes" />
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
                      <FormLabel className="font-medium flex items-center gap-1.5">
                        <Baby className="h-4 w-4 text-muted-foreground" />
                        Niños
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-ninos" />
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
                    <FormLabel className="font-medium">Edades de los niños</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 3, 5 y 8 años" {...field} data-testid="input-edades" />
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
                    <FormLabel className="font-medium flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      Presupuesto para cocinar
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-presupuesto">
                          <SelectValue placeholder="Selecciona tu presupuesto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bajo">Bajo — menos de S/20 por día</SelectItem>
                        <SelectItem value="Medio">Medio — S/20 a S/50 por día</SelectItem>
                        <SelectItem value="Alto">Alto — más de S/50 por día</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiempo_cocina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Tiempo disponible para cocinar (minutos)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={5} step={5} {...field} data-testid="input-tiempo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-full mt-2"
                size="lg"
                disabled={createUser.isPending}
                data-testid="button-register"
              >
                {createUser.isPending ? "Creando perfil..." : "Crear mi perfil"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
