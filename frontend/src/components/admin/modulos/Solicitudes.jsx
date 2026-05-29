import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import AdminModuleLayout from "../components/AdminModuleLayout";
import {
  aprobarSolicitudVerificacion,
  listarSolicitudesVerificacion,
  rechazarSolicitudVerificacion,
} from "../../../services/adminService";
import "../../../styles/components/admin/AdminSolicitudes.css";

const STATUS_TABS = ["pending", "approved", "rejected"];

export default function Solicitudes() {
  const { t, i18n } = useTranslation();
  const [activeStatus, setActiveStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyAction, setBusyAction] = useState({ id: null, type: "" });
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    listarSolicitudesVerificacion({ status: activeStatus }, { signal: controller.signal })
      .then((response) => setRequests(response.items))
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        setRequests([]);
        setError(requestError?.message || t("appI18n.adminRequests.errors.load"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeStatus, refreshKey, t]);

  const filteredRequests = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return requests;

    return requests.filter((item) => {
      const haystack = normalizeText([
        item.profile?.name,
        item.profile?.user_id,
        item.status,
        item.rejection_reason,
      ].filter(Boolean).join(" "));
      return haystack.includes(query);
    });
  }, [requests, search]);

  const counts = useMemo(() => ({
    current: requests.length,
    visible: filteredRequests.length,
  }), [filteredRequests.length, requests.length]);

  async function approveRequest(request) {
    if (!request?.id || busyAction.id) return;
    setBusyAction({ id: request.id, type: "approve" });
    setError("");

    try {
      await aprobarSolicitudVerificacion(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } catch (requestError) {
      setError(requestError?.message || t("appI18n.adminRequests.errors.approve"));
    } finally {
      setBusyAction({ id: null, type: "" });
    }
  }

  function openRejectModal(request) {
    setRejectTarget(request);
    setRejectReason("");
    setRejectError("");
  }

  function closeRejectModal() {
    if (busyAction.type === "reject") return;
    setRejectTarget(null);
    setRejectReason("");
    setRejectError("");
  }

  async function confirmReject() {
    const reason = rejectReason.trim();
    if (reason.length < 5) {
      setRejectError(t("appI18n.adminRequests.errors.reasonMin"));
      return;
    }

    setBusyAction({ id: rejectTarget.id, type: "reject" });
    setRejectError("");

    try {
      await rechazarSolicitudVerificacion(rejectTarget.id, reason);
      setRequests((current) => current.filter((item) => item.id !== rejectTarget.id));
      setRejectTarget(null);
      setRejectReason("");
      setRejectError("");
    } catch (requestError) {
      setRejectError(requestError?.message || t("appI18n.adminRequests.errors.reject"));
    } finally {
      setBusyAction({ id: null, type: "" });
    }
  }

  return (
    <AdminModuleLayout title={t("appI18n.adminRequests.title")} subtitle={t("appI18n.adminRequests.subtitle")}>
      <section className="adm-requests__hero">
        <div>
          <span className="adm-requests__eyebrow"><ShieldCheck size={15} /> {t("appI18n.adminRequests.identity")}</span>
          <h1>{t("appI18n.adminRequests.heroTitle")}</h1>
          <p>{t("appI18n.adminRequests.heroText")}</p>
        </div>
        <button type="button" className="adm-requests__refresh" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw size={16} />
          {t("appI18n.adminRequests.refresh")}
        </button>
      </section>

      <div className="adm-requests__toolbar">
        <div className="adm-requests__tabs" role="tablist" aria-label={t("appI18n.adminRequests.tabsLabel")}>
          {STATUS_TABS.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              className={`adm-requests__tab${activeStatus === tabKey ? " is-active" : ""}`}
              onClick={() => setActiveStatus(tabKey)}
            >
              {t(`appI18n.adminRequests.tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        <label className="adm-requests__search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("appI18n.adminRequests.searchPlaceholder")}
          />
        </label>
      </div>

      <div className="adm-requests__summary">
        <MetricCard icon={<Clock3 size={17} />} label={t("appI18n.adminRequests.metrics.current")} value={counts.current} />
        <MetricCard icon={<Eye size={17} />} label={t("appI18n.adminRequests.metrics.visible")} value={counts.visible} />
        <MetricCard icon={<BadgeCheck size={17} />} label={t("appI18n.adminRequests.metrics.status")} value={statusLabel(activeStatus, t)} compact />
      </div>

      <div className="adm-requests__list">
        {loading ? (
          <State label={t("appI18n.adminRequests.states.loadingTitle")} text={t("appI18n.adminRequests.states.loadingText")} t={t} />
        ) : error ? (
          <State label={t("appI18n.adminRequests.states.errorTitle")} text={error} tone="error" t={t} />
        ) : filteredRequests.length ? (
          filteredRequests.map((request) => (
            <VerificationRequestCard
              key={request.id}
              request={request}
              busyAction={busyAction}
              onApprove={approveRequest}
              onReject={openRejectModal}
              t={t}
              language={i18n.language}
            />
          ))
        ) : (
          <State label={t("appI18n.adminRequests.states.emptyTitle")} text={t("appI18n.adminRequests.states.emptyText")} t={t} />
        )}
      </div>

      {rejectTarget ? (
        <RejectModal
          request={rejectTarget}
          reason={rejectReason}
          error={rejectError}
          busy={busyAction.id === rejectTarget.id && busyAction.type === "reject"}
          onReasonChange={setRejectReason}
          onClose={closeRejectModal}
          onConfirm={confirmReject}
          t={t}
        />
      ) : null}
    </AdminModuleLayout>
  );
}

function VerificationRequestCard({ request, busyAction, onApprove, onReject, t, language }) {
  const isPending = request.status === "pending";
  const approving = busyAction.id === request.id && busyAction.type === "approve";
  const rejecting = busyAction.id === request.id && busyAction.type === "reject";
  const documents = [
    request.documents?.pdf ? { label: t("appI18n.adminRequests.documents.pdf"), url: request.documents.pdf, icon: FileText } : null,
    request.documents?.front ? { label: t("appI18n.adminRequests.documents.front"), url: request.documents.front, icon: ImageIcon } : null,
    request.documents?.back ? { label: t("appI18n.adminRequests.documents.back"), url: request.documents.back, icon: ImageIcon } : null,
  ].filter(Boolean);

  return (
    <article className="adm-request-card">
      <div className="adm-request-card__main">
        <div className="adm-request-card__avatar">{initials(request.profile?.name)}</div>
        <div>
          <div className="adm-request-card__topline">
            <h3>{request.profile?.name || t("appI18n.adminRequests.card.userFallback")}</h3>
            <span className={`adm-request-status adm-request-status--${request.status}`}>{statusLabel(request.status, t)}</span>
          </div>
          <p>{t("appI18n.adminRequests.card.userLine", { id: request.profile?.user_id || t("appI18n.adminRequests.card.noId"), date: formatDate(request.submitted_at, t, language) })}</p>
          {request.rejection_reason ? <p className="adm-request-card__reason">{request.rejection_reason}</p> : null}
        </div>
      </div>

      <div className="adm-request-card__docs">
        {documents.length ? documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer" className="adm-request-doc">
              <Icon size={16} />
              {doc.label}
            </a>
          );
        }) : <span className="adm-request-card__muted">{t("appI18n.adminRequests.documents.empty")}</span>}
      </div>

      <div className="adm-request-card__actions">
        {isPending ? (
          <>
            <button type="button" className="adm-request-btn adm-request-btn--approve" onClick={() => onApprove(request)} disabled={approving || rejecting}>
              <BadgeCheck size={16} />
              {approving ? t("appI18n.adminRequests.actions.approving") : t("appI18n.adminRequests.actions.approve")}
            </button>
            <button type="button" className="adm-request-btn adm-request-btn--reject" onClick={() => onReject(request)} disabled={approving || rejecting}>
              <XCircle size={16} />
              {t("appI18n.adminRequests.actions.reject")}
            </button>
          </>
        ) : (
          <span className="adm-request-card__muted">{t("appI18n.adminRequests.card.reviewed", { date: formatDate(request.reviewed_at, t, language) })}</span>
        )}
      </div>
    </article>
  );
}

function RejectModal({ request, reason, error, busy, onReasonChange, onClose, onConfirm, t }) {
  return (
    <div className="adm-request-modal" role="presentation" onMouseDown={onClose}>
      <section className="adm-request-modal__panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="adm-request-modal__head">
          <div>
            <span>{t("appI18n.adminRequests.actions.rejectTitle")}</span>
            <h2>{request.profile?.name || t("appI18n.adminRequests.card.userFallback")}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t("appI18n.adminRequests.actions.closeModal")}>x</button>
        </div>

        <label className="adm-request-modal__field">
          {t("appI18n.adminRequests.actions.rejectReason")}
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value.slice(0, 500))}
            rows={5}
            placeholder={t("appI18n.adminRequests.actions.rejectPlaceholder")}
            disabled={busy}
          />
        </label>

        <div className="adm-request-modal__meta">
          <span className={error ? "is-error" : ""}>{error || t("appI18n.adminRequests.characters", { count: reason.length })}</span>
        </div>

        <div className="adm-request-modal__actions">
          <button type="button" className="adm-request-btn adm-request-btn--ghost" onClick={onClose} disabled={busy}>{t("appI18n.adminRequests.actions.cancel")}</button>
          <button type="button" className="adm-request-btn adm-request-btn--reject" onClick={onConfirm} disabled={busy}>
            {busy ? t("appI18n.adminRequests.actions.rejecting") : t("appI18n.adminRequests.actions.confirmReject")}
          </button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, compact = false }) {
  return (
    <article className="adm-requests__metric">
      <span>{icon}</span>
      <div>
        <strong className={compact ? "is-compact" : ""}>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function State({ label, text, tone = "default", t }) {
  return (
    <div className={`adm-requests__state adm-requests__state--${tone}`}>
      <span>{tone === "error" ? t("appI18n.adminRequests.states.error") : t("appI18n.adminRequests.states.panel")}</span>
      <strong>{label}</strong>
      <p>{text}</p>
    </div>
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function statusLabel(status, t) {
  return t(`appI18n.adminRequests.status.${status}`, t("appI18n.adminRequests.status.pending"));
}

function initials(name) {
  const parts = String(name || "Usuario Portafy").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "UP";
}

function formatDate(value, t, language = "es") {
  if (!value) return t("appI18n.adminRequests.noDate");
  try {
    return new Intl.DateTimeFormat(language || "es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return t("appI18n.adminRequests.noDate");
  }
}
