import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReportCard from "../components/Reports/ReportCard";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminSearchBar from "../components/AdminSearchBar";
import AdminModuleLayout from "../components/AdminModuleLayout";
import ReportDeleteModal from "../components/ReportDeleteModal";
import {
  acceptReport, fetchReports, ignoreReport,
  redirectReport, rejectReport,
} from "../../../services/reportService";

export default function Reports() {
  const { t } = useTranslation();
  const r = "adminReports";

  const [search, setSearch]           = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeType, setActiveType]   = useState("todos");
  const [activeRefType, setActiveRefType] = useState("todos");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshKey, setRefreshKey]   = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteBusy, setDeleteBusy]   = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionBusy, setActionBusy]   = useState({ reportId: null, type: "" });

  useEffect(() => {
    const controller = new AbortController();
    const timerId = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const response = await fetchReports(
          { search, motivo: activeType, ref_type: activeRefType, date_from: dateFrom, date_to: dateTo },
          { signal: controller.signal }
        );
        setReports(response.items);
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;
        setReports([]);
        setError(requestError?.message || t(`${r}.list.loadError`));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timerId); };
  }, [activeType, activeRefType, dateFrom, dateTo, refreshKey, search]);

  const activeFilterCount = [
    activeType !== "todos", activeRefType !== "todos",
    Boolean(dateFrom), Boolean(dateTo),
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch(""); setActiveType("todos");
    setActiveRefType("todos"); setDateFrom(""); setDateTo("");
  }

  function refreshReportsAfterMutation() {
    setRefreshKey((v) => v + 1);
  }

  function openDeleteModal(report) {
    setSelectedReport(report); setDeleteError("");
  }

  function closeDeleteModal() {
    if (deleteBusy) return;
    setSelectedReport(null); setDeleteError("");
  }

  async function handleConfirmDelete() {
    if (!selectedReport) return;
    setDeleteBusy(true); setDeleteError("");
    try {
      await rejectReport(selectedReport.id);
      setSelectedReport(null);
      refreshReportsAfterMutation();
    } catch (requestError) {
      setDeleteError(requestError?.message || t(`${r}.deleteModal.deleteError`));
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleIgnore(report) {
    setActionBusy({ reportId: report.id, type: "ignore" });
    try { await ignoreReport(report.id); refreshReportsAfterMutation(); return true; }
    finally { setActionBusy({ reportId: null, type: "" }); }
  }

  async function handleAccept(report, payload = {}) {
    setActionBusy({ reportId: report.id, type: "accept" });
    try { await acceptReport(report.id, payload); refreshReportsAfterMutation(); return true; }
    finally { setActionBusy({ reportId: null, type: "" }); }
  }

  async function handleRedirect(report) {
    setActionBusy({ reportId: report.id, type: "redirect" });
    try { await redirectReport(report.id); refreshReportsAfterMutation(); return true; }
    finally { setActionBusy({ reportId: null, type: "" }); }
  }

  return (
    <AdminModuleLayout
      title={t(`${r}.module.title`)}
      subtitle={t(`${r}.module.subtitle`)}
    >
      <AdminFilterBar
        activeType={activeType} onTypeChange={setActiveType}
        activeRefType={activeRefType} onRefTypeChange={setActiveRefType}
        dateFrom={dateFrom} dateTo={dateTo}
        onDateFromChange={setDateFrom} onDateToChange={setDateTo}
        onClear={clearFilters}
        onRefresh={() => setRefreshKey((v) => v + 1)}
        onExport={() => console.log("Exportacion de reportes pendiente")}
      />

      <AdminSearchBar
        value={search} onChange={setSearch}
        placeholder={t(`${r}.search.placeholder`)}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
        activeFilterCount={activeFilterCount}
      />

      <div className="adm-reports__list">
        {loading ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${r}.list.loadingTitle`)}</span>
            <p>{t(`${r}.list.loadingText`)}</p>
          </div>
        ) : error ? (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${r}.list.errorTitle`)}</span>
            <p>{error}</p>
          </div>
        ) : reports.length ? (
          reports.map((report) => (
            <ReportCard
              key={report.id} report={report}
              onDelete={openDeleteModal} onIgnore={handleIgnore}
              onAccept={handleAccept} onRedirect={handleRedirect}
              isDeleting={deleteBusy && selectedReport?.id === report.id}
              actionBusy={actionBusy}
            />
          ))
        ) : (
          <div className="adm-reports__empty">
            <span className="adm-placeholder__icon">{t(`${r}.list.emptyTitle`)}</span>
            <p>{t(`${r}.list.emptyText`)}</p>
          </div>
        )}
      </div>

      <ReportDeleteModal
        report={selectedReport} isOpen={Boolean(selectedReport)}
        isBusy={deleteBusy} error={deleteError}
        onClose={closeDeleteModal} onConfirm={handleConfirmDelete}
      />
    </AdminModuleLayout>
  );
}