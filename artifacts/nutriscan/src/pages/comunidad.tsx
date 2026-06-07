import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUserId } from "@/lib/auth";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { Users, Heart, MessageCircle, Share2, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  autor: string;
  avatar: string;
  contenido: string;
  tipo: "receta" | "consejo" | "experiencia";
  likes: number;
  liked: boolean;
  comentarios: string[];
  fecha: string;
}

const POSTS_MOCK: Post[] = [
  {
    id: "p1",
    autor: "María G.",
    avatar: "MG",
    contenido: "🥗 ¡Les comparto mi receta de lentejas con espinacas que mis niños adoraron! Primero sofreír cebolla y ajo, añadir lentejas remojadas, espinacas y una pizca de cúrcuma. En 20 minutos queda delicioso y muy nutritivo para prevenir la anemia. 💪",
    tipo: "receta",
    likes: 24,
    liked: false,
    comentarios: ["¡Qué rico! ¿Cuántas lentejas usas?", "Lo voy a preparar hoy mismo 🙌"],
    fecha: "hace 2 horas",
  },
  {
    id: "p2",
    autor: "Carmen L.",
    avatar: "CL",
    contenido: "💡 Consejo del día: Si tu hijo no quiere comer espinacas, prueba añadirlas en batidos de frutas con plátano y mango. No se nota el sabor pero sí se aprovechan todos los nutrientes del hierro. ¡Funciona al 100%!",
    tipo: "consejo",
    likes: 41,
    liked: false,
    comentarios: ["¡Excelente idea! Gracias 🌿"],
    fecha: "hace 5 horas",
  },
  {
    id: "p3",
    autor: "Ana R.",
    avatar: "AR",
    contenido: "✨ Experiencia: Llevamos 3 semanas usando NutriScan IA y el nivel de hemoglobina de mi hijo subió de 10.2 a 11.8 g/dL. ¡Los cambios en la alimentación hacen una diferencia real! Las recetas de IA nos han dado muchas ideas nuevas. 🩺",
    tipo: "experiencia",
    likes: 67,
    liked: false,
    comentarios: ["¡Felicitaciones! Eso motiva mucho", "¿Qué recetas usaron más?", "Increíble resultado 👏"],
    fecha: "hace 1 día",
  },
  {
    id: "p4",
    autor: "Patricia M.",
    avatar: "PM",
    contenido: "🌿 Truco para el presupuesto bajo: Las menestras (lentejas, frijoles, pallares) son las más baratas y las más ricas en hierro. Con S/. 5 puedo hacer sopa de lenteja para toda la semana. ¡La economía y la salud van de la mano!",
    tipo: "consejo",
    likes: 38,
    liked: false,
    comentarios: ["Muy cierto! Las menestras son geniales", "¿Alguna receta específica con pallares?"],
    fecha: "hace 2 días",
  },
];

const TIPO_COLORS: Record<string, string> = {
  receta: "bg-green-100 text-green-700",
  consejo: "bg-blue-100 text-blue-700",
  experiencia: "bg-purple-100 text-purple-700",
};

const TIPO_LABELS: Record<string, string> = {
  receta: "Receta",
  consejo: "Consejo",
  experiencia: "Experiencia",
};

export default function Comunidad() {
  const [, setLocation] = useLocation();
  const userId = getUserId();
  const { toast } = useToast();
  const { data: user } = useGetUser(userId!, { query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId!) } });
  const [posts, setPosts] = useState<Post[]>(POSTS_MOCK);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ contenido: "", tipo: "consejo" as Post["tipo"] });
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!userId) setLocation("/");
  }, [userId, setLocation]);

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
      )
    );
  };

  const publish = () => {
    if (!newPost.contenido.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      autor: user?.nombre || "Tú",
      avatar: (user?.nombre || "T").slice(0, 2).toUpperCase(),
      contenido: newPost.contenido,
      tipo: newPost.tipo,
      likes: 0,
      liked: false,
      comentarios: [],
      fecha: "justo ahora",
    };
    setPosts([post, ...posts]);
    setNewPost({ contenido: "", tipo: "consejo" });
    setShowForm(false);
    toast({ title: "¡Publicado!", description: "Tu publicación ya está en la comunidad 🎉" });
  };

  const addComment = (postId: string) => {
    if (!newComment.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comentarios: [...p.comentarios, newComment] } : p
      )
    );
    setNewComment("");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white py-6 px-4">
        <div className="max-w-screen-md mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Comunidad NutriVecina</h1>
              <p className="text-white/80 text-sm">Comparte recetas y experiencias</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-4">
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="font-semibold">Nueva publicación</h3>
            <div className="flex gap-2">
              {(["receta", "consejo", "experiencia"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewPost({ ...newPost, tipo: t })}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                    newPost.tipo === t ? TIPO_COLORS[t] + " ring-2 ring-offset-1" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {TIPO_LABELS[t]}
                </button>
              ))}
            </div>
            <textarea
              value={newPost.contenido}
              onChange={(e) => setNewPost({ ...newPost, contenido: e.target.value })}
              placeholder="Comparte tu receta, consejo o experiencia con la comunidad..."
              rows={4}
              className="bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={publish}>Publicar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {posts.map((post) => (
          <div key={post.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 text-primary font-bold w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{post.autor}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[post.tipo]}`}>
                    {TIPO_LABELS[post.tipo]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{post.fecha}</p>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{post.contenido}</p>

            <div className="flex items-center gap-4 pt-1 border-t border-border">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  post.liked ? "text-red-500 font-semibold" : "text-muted-foreground hover:text-red-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                {post.likes}
              </button>
              <button
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.comentarios.length}
              </button>
            </div>

            {showComments === post.id && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {post.comentarios.map((c, i) => (
                  <div key={i} className="bg-muted rounded-xl px-3 py-2 text-xs">{c}</div>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-muted rounded-xl px-3 py-2 text-xs outline-none"
                  />
                  <button onClick={() => addComment(post.id)} className="text-primary">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
