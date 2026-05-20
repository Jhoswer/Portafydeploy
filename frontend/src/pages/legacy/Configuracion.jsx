/* import { useState, useEffect } from "react";
import { Navbar } from "../components/landing/Navbar";
import axios from "axios";
import config from "../config";

export default function Configuracion() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    biografia: "",
    universidad: "",
    carrera: "",
    ubicacion: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiUrl}/perfil/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setPerfil({
            nombre:      response.data.nombre      || "",
            apellido:    response.data.apellido    || "",
            biografia:   response.data.biografia   || "",
            universidad: response.data.universidad || "",
            carrera:     response.data.carrera     || "",
            ubicacion:   response.data.ubicacion   || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${config.apiUrl}/perfil/actualizar`, perfil, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje("¡Cambios guardados correctamente!");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje("Error al actualizar el perfil");
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-[#0D0221] text-white flex items-center justify-center">
      <p>Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0221] text-white">
      <Navbar />
      <div className="container mx-auto pt-32 px-4">
        <div className="max-w-2xl mx-auto bg-[#0F172A] p-8 rounded-3xl border border-white/10">
          <h2 className="text-3xl font-bold mb-8">⚙️ Edición de Perfil</h2>

          {mensaje && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {mensaje}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
                <input
                  name="nombre"
                  value={perfil.nombre}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Apellido</label>
                <input
                  name="apellido"
                  value={perfil.apellido}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Biografía</label>
              <textarea
                name="biografia"
                value={perfil.biografia}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Universidad</label>
              <input
                name="universidad"
                value={perfil.universidad}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Carrera</label>
              <input
                name="carrera"
                value={perfil.carrera}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ubicación</label>
              <input
                name="ubicacion"
                value={perfil.ubicacion}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <button
              onClick={handleGuardar}
              className="w-full bg-primary hover:bg-primary/80 py-4 rounded-xl font-bold transition-all mt-4"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} */