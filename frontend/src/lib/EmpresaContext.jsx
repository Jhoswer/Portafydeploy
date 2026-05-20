import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  obtenerMisOfertas,
  crearOferta,
  eliminarOferta,
  actualizarOferta,
  cambiarEstadoOferta,
} from "../services/offerService";

const EmpresaContext = createContext();

function mapStatus(state) {
  const map = { open: "Activa", private: "Borrador", closed: "Cerrada" };
  return map[state] ?? "Borrador";
}

function mapOferta(oferta) {
  return {
    id:          oferta.id_offer,
    id_offer:    oferta.id_offer,
    title:       oferta.title,
    description: oferta.description ?? "",
    type:        oferta.type ?? "",
    modalidad:   oferta.modalidad ?? "",
    ubicacion:   oferta.ubicacion ?? "",
    salaryMin:   oferta.salary_min,
    salaryMax:   oferta.salary_max,
    currency:    oferta.currency ?? "USD",
    nivel:       oferta.nivel ?? "",
    skills:      oferta.skills?.map((s) => s.name ?? s) ?? [],
    status:      mapStatus(oferta.state),
    state:       oferta.state,
    real_state:  oferta.real_state ?? oferta.state,
    bannerImage: oferta.banner_url ?? null,
    createdAt:   oferta.created_at?.split("T")[0] ?? "",
    stats: oferta.stats ?? {
      total: 0, accepted: 0, refused: 0, in_verification: 0,
    },
    postulantes: oferta.postulantes ?? [],
  };
}

const mockTeam = [
  { id: "t1", name: "Ana Silva",   role: "Admin",      email: "ana@empresa.com",    avatar: "AS" },
  { id: "t2", name: "Carlos Ruiz", role: "Reclutador", email: "carlos@empresa.com", avatar: "CR" },
];

const mockTalents = [
  {
    id: "tal1", name: "Laura Gómez", headline: "Frontend Developer",
    location: "Bogotá", availability: "Inmediata",
    skills: ["React"], experienceLevel: "Semi-Senior", avatar: "LG",
  },
];

const mockPostulantes = [
  {
    id: "p1", talentId: "tal1", convocatoriaId: "c1",
    stage: "Postulado", appliedAt: "2023-10-10",
    headline: "Frontend Developer", location: "Bogotá", availability: "Inmediata",
  },
];

// Intervalo de auto-refresh en milisegundos (30 segundos)
const REFRESH_INTERVAL_MS = 30_000;

export function EmpresaProvider({ children }) {
  const [team]         = useState(mockTeam);
  const [convocatorias, setConvocatorias] = useState([]);
  const [talents]      = useState(mockTalents);
  const [postulantes,  setPostulantes]    = useState(mockPostulantes);
  const [loadingConvocatorias, setLoadingConvocatorias] = useState(true);
  const [errorConvocatorias,   setErrorConvocatorias]   = useState(null);

  // ── Carga inicial de ofertas ────────────────────────────
  const fetchConvocatorias = useCallback(async ({ force = false, silent = false } = {}) => {
    try {
      if (!silent) setLoadingConvocatorias(true);
      const res  = await obtenerMisOfertas({ force });
      const data = res.data ?? [];
      setConvocatorias(data.map(mapOferta));
      if (errorConvocatorias) setErrorConvocatorias(null);
    } catch (err) {
      console.error("Error al cargar convocatorias:", err);
      if (!silent) setErrorConvocatorias("No se pudieron cargar las convocatorias.");
    } finally {
      if (!silent) setLoadingConvocatorias(false);
    }
  }, []);

  // Carga al montar
  useEffect(() => {
    fetchConvocatorias();
  }, [fetchConvocatorias]);

  // ── Auto-refresh silencioso cada REFRESH_INTERVAL_MS ───
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConvocatorias({ force: true, silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchConvocatorias]);

  // ── Refrescar postulantes de UNA oferta específica ─────
  // Recarga todas las ofertas con force=true y extrae los postulantes frescos.
  // Como tu backend embebe los postulantes en offers/mine, es el approach correcto.
  const refreshPostulantes = useCallback(async (jobId) => {
    try {
      await fetchConvocatorias({ force: true, silent: true });
    } catch (err) {
      console.error("Error al refrescar postulantes:", err);
    }
  }, [fetchConvocatorias]);

  // ── Actualizar estado de un postulante en el contexto local ──
  // Se llama justo después de que la API confirme el cambio,
  // para no tener que esperar el próximo refresh.
  const updatePostulanteState = useCallback((jobId, postulationId, newState) => {
    setConvocatorias((prev) =>
      prev.map((c) => {
        if (String(c.id_offer ?? c.id) !== String(jobId)) return c;
        return {
          ...c,
          postulantes: (c.postulantes ?? []).map((p) =>
            String(p.id_postulation ?? p.id) === String(postulationId)
              ? { ...p, state: newState }
              : p
          ),
        };
      })
    );
  }, []);

  // ── Leer postulantes de una oferta desde el contexto ───
  const getPostulantes = useCallback((jobId) => {
    const oferta = convocatorias.find(
      (c) => String(c.id_offer ?? c.id) === String(jobId)
    );
    return oferta?.postulantes ?? [];
  }, [convocatorias]);

  // ── CRUD de convocatorias ───────────────────────────────
  const addConvocatoria = async (c, asDraft = false) => {
    try {
      const res   = await crearOferta({ ...c, asDraft });
      const nueva = mapOferta(res.data?.offer ?? res.data);
      setConvocatorias((prev) => [nueva, ...prev]);
    } catch (err) {
      console.error("Error al crear convocatoria:", err);
      throw err;
    }
  };

  const publishDraft = (id) => {
    setConvocatorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Activa" } : c))
    );
  };

  const eliminarConvocatoria = async (id) => {
    try {
      await eliminarOferta(id);
      setConvocatorias((prev) =>
        prev.filter((c) => c.id.toString() !== id.toString())
      );
    } catch (err) {
      console.error("Error al eliminar convocatoria:", err);
      throw err;
    }
  };

  const actualizarConvocatoria = async (id, datos) => {
    try {
      const res         = await actualizarOferta(id, datos);
      const actualizada = mapOferta(res.data?.offer ?? res.data);
      setConvocatorias((prev) =>
        prev.map((c) =>
          c.id.toString() === id.toString() ? actualizada : c
        )
      );
    } catch (err) {
      console.error("Error al actualizar convocatoria:", err);
      throw err;
    }
  };

  const cambiarEstadoConvocatoria = async (id, nuevoState) => {
    try {
      await cambiarEstadoOferta(id, nuevoState);
      setConvocatorias((prev) =>
        prev.map((c) =>
          c.id.toString() === id.toString()
            ? { ...c, status: mapStatus(nuevoState), state: nuevoState }
            : c
        )
      );
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      throw err;
    }
  };

  const updatePostulanteStage = (id, stage) => {
    setPostulantes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage } : p))
    );
  };

  const removePostulante = (id) => {
    setPostulantes((prev) => prev.filter((p) => p.id !== id));
  };

  const inviteToApply = (talentId, convocatoriaId) => {
    console.log("Invitar", talentId, convocatoriaId);
  };

  return (
    <EmpresaContext.Provider
      value={{
        team,
        convocatorias,
        loadingConvocatorias,
        errorConvocatorias,
        talents,
        postulantes,
        actualizarConvocatoria,
        cambiarEstadoConvocatoria,
        eliminarConvocatoria,
        addConvocatoria,
        publishDraft,
        updatePostulanteStage,
        removePostulante,
        inviteToApply,
        getPostulantes,
        refreshPostulantes,   
        updatePostulanteState,    
        fetchConvocatorias,   
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) throw new Error("useEmpresa debe usarse dentro de EmpresaProvider");
  return context;
}