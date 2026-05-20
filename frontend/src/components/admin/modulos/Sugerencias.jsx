import { useEffect, useState } from "react";
import SugerenciaCard from "../components/Sugerencias/SugerenciaCard";
import SugerenciaFilterBar from "../components/Sugerencias/SugerenciaFilterBar";
import AdminSearchBar from "../components/Sugerencias/SugerenciaSearchBar";
import AdminModuleLayout from "../components/AdminModuleLayout";
import {
  acceptSugerencia,
  fetchSugerencias,
  rejectSugerencia,
  discussSugerencia,
  escalateSugerencia,
  ignoreSugerencia,
} from "../../../services/sugerenciaService";

export default function Sugerencias() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionBusy, setActionBusy] = useState({ sugerenciaId: null, type: "" });

  /* ── Carga con debounce de 250 ms ── */
  useEffect(() => {
    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchSugerencias(
          { search, type: activeType, date_from: dateFrom, date_to: dateTo },
          { signal: controller.signal }
        );
        setSugerencias(response.items);
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;
        setSugerencias([]);
        setError(requestError?.message || "No se pudieron cargar las sugerencias.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => { controller.abort(); window.clearTimeout(timerId); };
  }, [activeType, dateFrom, dateTo, refreshKey, search]);

  /* ── Helpers ── */
  function clearFilters() {
    setSearch("");
    setActiveType("todos");
    setDateFrom("");
    setDateTo("");
  }

  function removeSugerencia(sugerenciaId) {
    setSugerencias((current) => current.filter((s) => s.id !== sugerenciaId));
    setRefreshKey((v) => v + 1);
  }

  // Nota: Las llamadas a la API (accept/reject/discuss/escalate/ignore) ya se hacen desde SugerenciaOpen.jsx
  // Estas funciones solo limpian el estado de carga y remueven la sugerencia de la lista local

  async function handleAccept(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "accept" });
    try {
      removeSugerencia(sugerencia.id);
      return true;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleReject(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "reject" });
    try {
      removeSugerencia(sugerencia.id);
      return true;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleDiscuss(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "discuss" });
    try {
      removeSugerencia(sugerencia.id);
      return true;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleEscalate(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "escalate" });
    try {
      removeSugerencia(sugerencia.id);
      return true;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleIgnore(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "ignore" });
    try {
      await ignoreSugerencia(sugerencia.id, note); // ← esta línea faltaba
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al ignorar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleDelete(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "delete" });
    try {
      await rejectSugerencia(sugerencia.id, note); // ← esta línea faltaba
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al rechazar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleReject(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "reject" });
    try {
      await rejectSugerencia(sugerencia.id, note); // ← esto faltaba
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al rechazar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleAccept(sugerencia, note = null) {
  setActionBusy({ sugerenciaId: sugerencia.id, type: "accept" });
  try {
    await acceptSugerencia(sugerencia.id, note); // ← faltaba
    removeSugerencia(sugerencia.id);
    return true;
  } catch (err) {
    console.error("Error al aceptar sugerencia:", err);
    return false;
  } finally {
    setActionBusy({ sugerenciaId: null, type: "" });
  }
}

async function handleReject(sugerencia, note = null) {
  setActionBusy({ sugerenciaId: sugerencia.id, type: "reject" });
  try {
    await rejectSugerencia(sugerencia.id, note); // ← faltaba
    removeSugerencia(sugerencia.id);
    return true;
  } catch (err) {
    console.error("Error al rechazar sugerencia:", err);
    return false;
  } finally {
    setActionBusy({ sugerenciaId: null, type: "" });
  }
}

async function handleEscalate(sugerencia, note = null) {
  setActionBusy({ sugerenciaId: sugerencia.id, type: "escalate" });
  try {
    await escalateSugerencia(sugerencia.id, note); // ← faltaba
    removeSugerencia(sugerencia.id);
    return true;
  } catch (err) {
    console.error("Error al escalar sugerencia:", err);
    return false;
  } finally {
    setActionBusy({ sugerenciaId: null, type: "" });
  }
}

async function handleDiscuss(sugerencia, note = null) {
  setActionBusy({ sugerenciaId: sugerencia.id, type: "discuss" });
  try {
    await discussSugerencia(sugerencia.id, note); // ← faltaba
    removeSugerencia(sugerencia.id);
    return true;
  } catch (err) {
    console.error("Error al discutir sugerencia:", err);
    return false;
  } finally {
    setActionBusy({ sugerenciaId: null, type: "" });
  }
}

  return (
    <AdminModuleLayout
      title="Sugerencias"
      subtitle="Vista para revisar y priorizar ideas propuestas por usuarios."
    >
      {/* ── Filtros ── */}
      <SugerenciaFilterBar
        activeType={activeType}
        onTypeChange={setActiveType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClear={clearFilters}
        onRefresh={() => setRefreshKey((v) => v + 1)}
        onExport={() => console.log("Exportación de sugerencias pendiente")}
      />

      {/* ── Búsqueda ── */}
      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar sugerencias..."
      />

      {/* ── Lista ── */}
      <div className="adm-reports__list">
        {loading ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Cargando</span>
            <p>Estamos consultando las sugerencias en la base de datos.</p>
          </div>
        ) : error ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Error</span>
            <p>{error}</p>
          </div>
        ) : sugerencias.length ? (
          sugerencias.map((sugerencia) => (
            <SugerenciaCard
              key={sugerencia.id}
              sugerencia={sugerencia}
              onAccept={handleAccept}
              onReject={handleReject}
              onDelete={handleDelete}
              onDiscuss={handleDiscuss}
              onEscalate={handleEscalate}
              onIgnore={handleIgnore}
              actionBusy={actionBusy}
            />
          ))
        ) : (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Sin resultados</span>
            <p>No hay sugerencias que coincidan con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </AdminModuleLayout>
  );
}