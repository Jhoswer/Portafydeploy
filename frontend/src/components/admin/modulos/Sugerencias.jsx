import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SugerenciaCard from "../components/Sugerencias/SugerenciaCard";
import SugerenciaFilterBar from "../components/Sugerencias/SugerenciaFilterBar";
import AdminSearchBar from "../components/Sugerencias/SugerenciaSearchBar";
import AdminModuleLayout from "../components/AdminModuleLayout";
import {
  acceptSugerencia, fetchSugerencias, rejectSugerencia,
  discussSugerencia, escalateSugerencia, ignoreSugerencia,
} from "../../../services/sugerenciaService";

export default function Sugerencias() {
  const { t } = useTranslation();
  const s = "adminSugerencias";

  const [search, setSearch]         = useState("");
  const [activeType, setActiveType] = useState("todos");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionBusy, setActionBusy] = useState({ sugerenciaId: null, type: "" });

  useEffect(() => {
    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const response = await fetchSugerencias(
          { search, type: activeType, date_from: dateFrom, date_to: dateTo },
          { signal: controller.signal }
        );
        setSugerencias(response.items);
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;
        setSugerencias([]);
        setError(requestError?.message || t(`${s}.list.loadError`));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timerId); };
  }, [activeType, dateFrom, dateTo, refreshKey, search]);

  function clearFilters() {
    setSearch(""); setActiveType("todos"); setDateFrom(""); setDateTo("");
  }

  function removeSugerencia(sugerenciaId) {
    setSugerencias((current) => current.filter((s) => s.id !== sugerenciaId));
    setRefreshKey((v) => v + 1);
  }

  async function handleAccept(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "accept" });
    try {
      await acceptSugerencia(sugerencia.id, note);
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
      await rejectSugerencia(sugerencia.id, note);
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al rechazar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleDelete(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "delete" });
    try {
      await rejectSugerencia(sugerencia.id, note);
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al rechazar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleDiscuss(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "discuss" });
    try {
      await discussSugerencia(sugerencia.id, note);
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al discutir sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleEscalate(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "escalate" });
    try {
      await escalateSugerencia(sugerencia.id, note);
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al escalar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  async function handleIgnore(sugerencia, note = null) {
    setActionBusy({ sugerenciaId: sugerencia.id, type: "ignore" });
    try {
      await ignoreSugerencia(sugerencia.id, note);
      removeSugerencia(sugerencia.id);
      return true;
    } catch (err) {
      console.error("Error al ignorar sugerencia:", err);
      return false;
    } finally {
      setActionBusy({ sugerenciaId: null, type: "" });
    }
  }

  return (
    <AdminModuleLayout
      title={t(`${s}.module.title`)}
      subtitle={t(`${s}.module.subtitle`)}
    >
      <SugerenciaFilterBar
        activeType={activeType} onTypeChange={setActiveType}
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={setDateFrom} onDateToChange={setDateTo}
        onClear={clearFilters}
        onRefresh={() => setRefreshKey((v) => v + 1)}
        onExport={() => console.log("Exportación de sugerencias pendiente")}
      />

      <AdminSearchBar
        value={search} onChange={setSearch}
        placeholder={t(`${s}.search.placeholder`)}
      />

      <div className="adm-reports__list">
        {loading ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${s}.list.loadingTitle`)}</span>
            <p>{t(`${s}.list.loadingText`)}</p>
          </div>
        ) : error ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${s}.list.errorTitle`)}</span>
            <p>{error}</p>
          </div>
        ) : sugerencias.length ? (
          sugerencias.map((sugerencia) => (
            <SugerenciaCard
              key={sugerencia.id} sugerencia={sugerencia}
              onAccept={handleAccept} onReject={handleReject}
              onDelete={handleDelete} onDiscuss={handleDiscuss}
              onEscalate={handleEscalate} onIgnore={handleIgnore}
              actionBusy={actionBusy}
            />
          ))
        ) : (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${s}.list.emptyTitle`)}</span>
            <p>{t(`${s}.list.emptyText`)}</p>
          </div>
        )}
      </div>
    </AdminModuleLayout>
  );
}