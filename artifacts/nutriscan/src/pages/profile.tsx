import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetUser, useUpdateUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Edit2, Check, Wallet, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  integrantes: z.coerce.number().min(1),
  ninos: z.coerce.number().min(1),
  edades: z.string().optional(),
  presupuesto: z.string().min(1),
  tiempo_cocina: z.coerce.number().min(5),
});
type FormData = z.infer<typeof schema>;

const PRESUPUESTO_OPTIONS = [
  { value: "Bajo", label: "Bajo", sub: "Menos de S/20/día", emoji: "🟢", color: "border-green-400 bg-green-50 text-green-800" },
  { value: "Medio", label: "Medio", sub: "S/20 a S/50/día", emoji: "🟡", color: "border-amber-400 bg-amber-50 text-amber-800" },
  { value: "Alto", label: "Alto", sub: "Más de S/50/día", emoji: "🔵", color: "border-blue-400 bg-blue-50 text-blue-800" },
];

const TIEMPO_OPTIONS = [15, 20, 30, 45, 60, 90];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = getUserId();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const { data: user, isLoading } = useGetUser(userId!, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId!) },
  });

  const updateUser = useUpdateUser();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      integrantes: 4,
      ninos: 1,
      edades: "",
      presupuesto: "Medio",
      tiempo_cocina: 30,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        nombre: user.nombre,
        integrantes: user.integrantes,
        ninos: user.ninos,
        edades: user.edades ?? "",
        presupuesto: user.presupuesto,
        tiempo_cocina: user.tiempo_cocina,
      });
    }
  }, [user, form]);

  const onSubmit = (data: FormData) => {
    updateUser.mutate(
      {
        id: userId!,
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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId!) });
          toast({ title: "✅ Perfil actualizado", description: "Tus datos han sido guardados correctamente." });
          setEditing(false);
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
        },
      }
    );
  };

  if (!userId) return null;

  const PROFILE_FIELDS = user ? [
    { label: "Nombre", value: user.nombre, emoji: "👤" },
    { label: "Integrantes de la familia", value: `${user.integrantes} personas`, emoji: "👨‍👩‍👧‍👦" },
    { label: "Número de niños", value: `${user.ninos} niño(s)`, emoji: "👶" },
    { label: "Edades de los niños", value: user.edades || "No especificado", emoji: "🎂" },
    { label: "Presupuesto", value: `${user.presupuesto}`, emoji: "💰" },
    { label: "Tiempo para cocinar", value: `${user.tiempo_cocina} minutos`, emoji: "⏱️" },
  ] : [];

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" data-testid="button-back">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
            <div className="h-5 w-px bg-white/30" />
            <h1 className="text-xl font-serif font-bold">Mi Perfil</h1>
          </div>
          {!editing && user && (
            <Button variant="secondary" size="sm" className="rounded-full gap-1.5" onClick={() => setEditing(true)} data-testid="button-edit">
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-6">
        {isLoading && (
          <div className="bg-card border border-border rounded-2xl p-8 animate-pulse h-64" />
        )}

        {user && !editing && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" data-testid="profile-card">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6 flex items-center gap-4">
              <div className="bg-primary text-primary-foreground p-4 rounded-full">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">{user.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  💪 ¡Gracias por cuidar la nutrición de tu familia!
                </p>
              </div>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4" data-testid="profile-view">
              {PROFILE_FIELDS.map(({ label, value, emoji }) => (
                <div key={label} className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{emoji} {label}</p>
                  <p className="text-foreground font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <Button onClick={() => setEditing(true)} variant="outline" className="w-full rounded-full gap-2">
                <Edit2 className="h-4 w-4" />
                Editar mis datos
              </Button>
            </div>
          </div>
        )}

        {user && editing && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm" data-testid="profile-form">
            <h3 className="font-serif font-bold text-lg text-foreground mb-5">Editar perfil familiar</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">👤 Nombre</FormLabel>
                    <FormControl><Input className="rounded-xl" {...field} data-testid="input-nombre" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="integrantes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">👨‍👩‍👧‍👦 Integrantes</FormLabel>
                      <FormControl><Input type="number" min={1} className="rounded-xl" {...field} data-testid="input-integrantes" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ninos" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">👶 Niños</FormLabel>
                      <FormControl><Input type="number" min={1} className="rounded-xl" {...field} data-testid="input-ninos" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="edades" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">🎂 Edades de los niños</FormLabel>
                    <FormControl><Input placeholder="Ej: 3, 5 y 8 años" className="rounded-xl" {...field} data-testid="input-edades" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="presupuesto" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-primary" />
                      Presupuesto diario
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESUPUESTO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`rounded-xl border-2 p-3 text-center transition-all duration-150 ${
                            field.value === opt.value
                              ? `${opt.color} border-2 shadow-sm scale-105`
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          }`}
                          data-testid={`presupuesto-${opt.value.toLowerCase()}`}
                        >
                          <div className="text-lg mb-1">{opt.emoji}</div>
                          <div className="text-sm font-bold">{opt.label}</div>
                          <div className="text-[10px] mt-0.5 opacity-80">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.presupuesto && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.presupuesto.message}</p>
                    )}
                  </FormItem>
                )} />

                <FormField control={form.control} name="tiempo_cocina" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      Tiempo para cocinar
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {TIEMPO_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={`rounded-xl border-2 py-2.5 px-3 text-sm font-semibold transition-all duration-150 ${
                            Number(field.value) === t
                              ? "border-primary bg-primary/10 text-primary scale-105 shadow-sm"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {t} min
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setEditing(false)} data-testid="button-cancel">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full gap-1.5" disabled={updateUser.isPending} data-testid="button-save">
                    <Check className="h-4 w-4" />
                    {updateUser.isPending ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
