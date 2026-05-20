import { useEffect, useState } from "react";
import ReportCard from "../components/Reports/ReportCard";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminSearchBar from "../components/AdminSearchBar";
import AdminModuleLayout from "../components/AdminModuleLayout";
import ReportDeleteModal from "../components/ReportDeleteModal";
import {
  acceptReport,
  fetchReports,
  ignoreReport,
  redirectReport,
  rejectReport,
} from "../../../services/reportService";

export default function Reports() {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeType, setActiveType] = useState("todos");
  const [activeRefType, setActiveRefType] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionBusy, setActionBusy] = useState({ reportId: null, type: "" });

  useEffect(() => {
    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchReports(
          {
            search,
            motivo: activeType,
            ref_type: activeRefType,
            date_from: dateFrom,
            date_to: dateTo,
          },
          { signal: controller.signal }
        );

        setReports(response.items);
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;
        setReports([]);
        setError(requestError?.message || "No se pudieron cargar los reportes.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timerId);
    };
  }, [activeType, activeRefType, dateFrom, dateTo, refreshKey, search]);

  const activeFilterCount = [
    activeType !== "todos",
    activeRefType !== "todos",
    Boolean(dateFrom),
    Boolean(dateTo),
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setActiveType("todos");
    setActiveRefType("todos");
    setDateFrom("");
    setDateTo("");
  }

  function refreshReportsAfterMutation() {
    // Solo incrementar refreshKey para que se recargen todos los reportes del servidor
    // El backend garantiza que solo se devuelven reportes sin instancia en ATTENDED
    setRefreshKey((value) => value + 1);
  }

  function openDeleteModal(report) {
    setSelectedReport(report);
    setDeleteError("");
  }

  function closeDeleteModal() {
    if (deleteBusy) return;
    setSelectedReport(null);
    setDeleteError("");
  }

  async function handleConfirmDelete() {
    if (!selectedReport) return;

    setDeleteBusy(true);
    setDeleteError("");

    try {
      await rejectReport(selectedReport.id);
      setSelectedReport(null);
      refreshReportsAfterMutation();
    } catch (requestError) {
      setDeleteError(requestError?.message || "No se pudo registrar la eliminacion del reporte.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleIgnore(report) {
    setActionBusy({ reportId: report.id, type: "ignore" });

    try {
      await ignoreReport(report.id);
      refreshReportsAfterMutation();
      return true;
    } finally {
      setActionBusy({ reportId: null, type: "" });
    }
  }

  async function handleAccept(report, payload = {}) {
    setActionBusy({ reportId: report.id, type: "accept" });

    try {
      await acceptReport(report.id, payload);
      refreshReportsAfterMutation();
      return true;
    } finally {
      setActionBusy({ reportId: null, type: "" });
    }
  }

  async function handleRedirect(report) {
    setActionBusy({ reportId: report.id, type: "redirect" });

    try {
      await redirectReport(report.id);
      refreshReportsAfterMutation();
      return true;
    } finally {
      setActionBusy({ reportId: null, type: "" });
    }
  }

  return (
    <AdminModuleLayout
      title="Reportes"
      subtitle="Revision general de los reportes hechos por los usuarios de PortaFy."
    >
      <AdminFilterBar
        activeType={activeType}
        onTypeChange={setActiveType}
        activeRefType={activeRefType}
        onRefTypeChange={setActiveRefType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClear={clearFilters}
        onRefresh={() => setRefreshKey((value) => value + 1)}
        onExport={() => console.log("Exportacion de reportes pendiente")}
      />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar reportes..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        activeFilterCount={activeFilterCount}
      />

      <div className="adm-reports__list">
        {loading ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Cargando</span>
            <p>Estamos consultando los reportes en la base de datos.</p>
          </div>
        ) : error ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Error</span>
            <p>{error}</p>
          </div>
        ) : reports.length ? (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={openDeleteModal}
              onIgnore={handleIgnore}
              onAccept={handleAccept}
              onRedirect={handleRedirect}
              isDeleting={deleteBusy && selectedReport?.id === report.id}
              actionBusy={actionBusy}
            />
          ))
        ) : (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">Sin resultados</span>
            <p>No hay reportes que coincidan con los filtros aplicados.</p>
          </div>
        )}
      </div>

      <ReportDeleteModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        isBusy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </AdminModuleLayout>
  );
}
