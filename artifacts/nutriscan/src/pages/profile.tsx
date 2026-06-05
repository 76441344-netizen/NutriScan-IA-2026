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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Edit2, Check } from "lucide-react";
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
          toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente." });
          setEditing(false);
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
        },
      }
    );
  };

  if (!userId) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Link>
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-lg font-serif font-semibold text-foreground">Mi Perfil</h1>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={() => setEditing(true)} data-testid="button-edit">
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto w-full px-4 py-8">
        {isLoading && (
          <div className="bg-card border border-border rounded-2xl p-8 animate-pulse h-64" />
        )}

        {user && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" data-testid="profile-card">
            <div className="bg-primary/5 border-b border-border p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">{user.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {!editing ? (
                <div className="grid sm:grid-cols-2 gap-5" data-testid="profile-view">
                  {[
                    { label: "Nombre", value: user.nombre },
                    { label: "Integrantes de la familia", value: `${user.integrantes} personas` },
                    { label: "Número de niños", value: `${user.ninos} niño(s)` },
                    { label: "Edades de los niños", value: user.edades || "No especificado" },
                    { label: "Presupuesto", value: user.presupuesto },
                    { label: "Tiempo para cocinar", value: `${user.tiempo_cocina} minutos` },
                  ].map(({ label, value }) => (
                    <div key={label} className="border-b border-border pb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
                      <p className="text-foreground font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="profile-form">
                    <FormField control={form.control} name="nombre" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl><Input {...field} data-testid="input-nombre" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="integrantes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Integrantes</FormLabel>
                          <FormControl><Input type="number" min={1} {...field} data-testid="input-integrantes" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ninos" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niños</FormLabel>
                          <FormControl><Input type="number" min={1} {...field} data-testid="input-ninos" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="edades" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edades de los niños</FormLabel>
                        <FormControl><Input placeholder="Ej: 3, 5 y 8 años" {...field} data-testid="input-edades" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="presupuesto" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-presupuesto">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Bajo">Bajo</SelectItem>
                            <SelectItem value="Medio">Medio</SelectItem>
                            <SelectItem value="Alto">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tiempo_cocina" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiempo para cocinar (minutos)</FormLabel>
                        <FormControl><Input type="number" min={5} step={5} {...field} data-testid="input-tiempo" /></FormControl>
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
