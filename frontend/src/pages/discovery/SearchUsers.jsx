import { Search, Settings, MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function SearchUsers() {
  return (
    <section className="min-h-screen bg-background text-foreground">

      <div className="grid grid-cols-12 gap-4 p-4">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="col-span-3 h-[calc(100vh-2rem)] sticky top-4 flex flex-col justify-between">

          {/* Parte superior */}
          <div className="flex flex-col gap-4">

            {/* Opciones */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Settings className="w-4 h-4" />
                Opciones
              </div>

              <button className="text-left text-sm text-muted-foreground hover:text-foreground transition">
                Editar perfil
              </button>
              <button className="text-left text-sm text-muted-foreground hover:text-foreground transition">
                Mis proyectos
              </button>
              <button className="text-left text-sm text-muted-foreground hover:text-foreground transition">
                Configuración
              </button>
            </div>

          </div>

          {/* Parte inferior */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-2 text-sm text-muted-foreground">
            <button className="text-left hover:text-foreground transition">
              Acerca de
            </button>
            <button className="text-left hover:text-foreground transition">
              Contáctanos
            </button>
          </div>

        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="col-span-6 flex flex-col gap-4">

          {/* Barra superior unificada */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">

            {/* Barra de búsqueda */}
            <div className="flex items-center gap-2">
              <div className="flex items-center w-full px-3 py-2 rounded-lg bg-transparent border border-white/10">
                <Search className="w-4 h-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Buscar usuarios, habilidades..."
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>

              <Button size="sm" className="px-4">
                Buscar
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-t border-white/10 pt-2">
              <button className="text-sm font-semibold border-b-2 border-primary pb-1">
                Feed
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Tendencias
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Nuevos
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Explorar
              </button>
            </div>

          </div>

          {/* Feed */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item}`}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="text-sm font-semibold">Usuario {item}</h4>
                  <p className="text-xs text-muted-foreground">
                    Publicó un nuevo proyecto
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Contenido de ejemplo del feed. Aquí se mostrarán resultados o actividad de usuarios.
              </p>
            </div>
          ))}

        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="col-span-3 h-[calc(100vh-2rem)] sticky top-4">

          <div className="h-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col">

            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5" />
              <h3 className="text-sm font-semibold">Chats</h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto">
              {[1,2,3,4].map((chat) => (
                <div
                  key={chat}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=chat${chat}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">Usuario {chat}</span>
                </div>
              ))}
            </div>

          </div>

        </aside>

      </div>
    </section>
  );
}
