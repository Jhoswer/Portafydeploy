import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
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
  aprobarSolicitudFormacion,
  aprobarSolicitudVerificacion,
  listarSolicitudesFormacion,
  obtenerVistaDocumentoAdmin,
  listarSolicitudesVerificacion,
  rechazarSolicitudFormacion,
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
  const [selectedKind, setSelectedKind] = useState(null);
  const requestCacheRef = useRef({});

  useEffect(() => {
    if (!selectedKind) {
      setLoading(false);
      setRequests([]);
      return undefined;
    }

    const controller = new AbortController();
    const currentCacheKey = cacheKeyFor(selectedKind, activeStatus);
    const cachedRequests = requestCacheRef.current[currentCacheKey];

    setLoading(!cachedRequests);
    if (cachedRequests) setRequests(cachedRequests);
    setError("");

    const loader = selectedKind === "education" ? listarSolicitudesFormacion : listarSolicitudesVerificacion;

    loader({ status: activeStatus }, { signal: controller.signal })
      .then((payload) => {
        const nextRequests = normalizeRequests(payload.items, selectedKind).sort(sortRequestsByDate);
        requestCacheRef.current[currentCacheKey] = nextRequests;
        setRequests(nextRequests);
      })
      .catch((requestError) => {
        if (requestError?.name === "AbortError") return;
        setRequests([]);
        setError(requestError?.message || t("appI18n.adminRequests.errors.load"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeStatus, refreshKey, selectedKind, t]);

  useEffect(() => {
    if (!selectedKind || activeStatus !== "pending") return undefined;

    const interval = window.setInterval(() => {
      setRefreshKey((value) => value + 1);
    }, 18000);

    return () => window.clearInterval(interval);
  }, [activeStatus, selectedKind]);

  const filteredRequests = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return requests;

    return requests.filter((item) => {
      const haystack = normalizeText([
        item.profile?.name,
        item.profile?.user_id,
        item.kind,
        item.education?.program,
        item.education?.institution,
        item.education?.level,
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
    setBusyAction({ id: request.id, key: request.key, type: "approve" });
    setError("");

    try {
      if (request.kind === "education") {
        await aprobarSolicitudFormacion(request.id);
      } else {
        await aprobarSolicitudVerificacion(request.id);
      }
      removeRequestFromCurrentView(request);
    } catch (requestError) {
      setError(requestError?.message || t("appI18n.adminRequests.errors.approve"));
    } finally {
      setBusyAction({ id: null, key: null, type: "" });
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

    setBusyAction({ id: rejectTarget.id, key: rejectTarget.key, type: "reject" });
    setRejectError("");

    try {
      if (rejectTarget.kind === "education") {
        await rechazarSolicitudFormacion(rejectTarget.id, reason);
      } else {
        await rechazarSolicitudVerificacion(rejectTarget.id, reason);
      }
      removeRequestFromCurrentView(rejectTarget);
      setRejectTarget(null);
      setRejectReason("");
      setRejectError("");
    } catch (requestError) {
      setRejectError(requestError?.message || t("appI18n.adminRequests.errors.reject"));
    } finally {
      setBusyAction({ id: null, key: null, type: "" });
    }
  }

  function chooseKind(kind) {
    setSelectedKind(kind);
    setSearch("");
    setActiveStatus("pending");
    setError("");
  }

  function goBackToChooser() {
    setSelectedKind(null);
    setSearch("");
    setError("");
  }

  function removeRequestFromCurrentView(request) {
    const currentCacheKey = cacheKeyFor(request.kind, activeStatus);
    requestCacheRef.current[currentCacheKey] = (requestCacheRef.current[currentCacheKey] || requests)
      .filter((item) => item.key !== request.key);
    setRequests((current) => current.filter((item) => item.key !== request.key));
  }

  async function openDocumentInTab(doc) {
    const tab = window.open("", "_blank");
    if (tab) {
      tab.opener = null;
      tab.document.title = doc.label;
      tab.document.body.innerHTML = `<p style="font-family:system-ui;padding:24px;color:#334155;">${t("appI18n.adminRequests.preview.loading")}</p>`;
    }

    try {
      const canOpenRaw = doc.rawUrl && /^https?:\/\//i.test(doc.rawUrl) && doc.type !== "pdf";

      if (canOpenRaw) {
        if (tab) tab.location.href = doc.rawUrl;
        else window.open(doc.rawUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const objectUrl = await obtenerVistaDocumentoAdmin(doc.url);
      if (tab) tab.location.href = objectUrl;
      else window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 90000);
    } catch (requestError) {
      if (tab) tab.close();
      setError(requestError?.message || t("appI18n.adminRequests.preview.error"));
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

      {!selectedKind ? (
        <RequestTypeChooser onChoose={chooseKind} t={t} />
      ) : (
        <>
          <div className="adm-requests__subhead">
            <button type="button" className="adm-requests__back" onClick={goBackToChooser}>
              <ArrowLeft size={16} />
              {t("appI18n.adminRequests.chooser.back")}
            </button>
            <span>{t(`appI18n.adminRequests.chooser.selected.${selectedKind}`)}</span>
          </div>

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
                  key={request.key}
                  request={request}
                  busyAction={busyAction}
                  onApprove={approveRequest}
                  onReject={openRejectModal}
                  onPreview={openDocumentInTab}
                  t={t}
                  language={i18n.language}
                />
              ))
            ) : (
              <State label={t("appI18n.adminRequests.states.emptyTitle")} text={t("appI18n.adminRequests.states.emptyText")} t={t} />
            )}
          </div>
        </>
      )}

      {rejectTarget ? (
        <RejectModal
          request={rejectTarget}
          reason={rejectReason}
          error={rejectError}
          busy={busyAction.key === rejectTarget.key && busyAction.type === "reject"}
          onReasonChange={setRejectReason}
          onClose={closeRejectModal}
          onConfirm={confirmReject}
          t={t}
        />
      ) : null}

    </AdminModuleLayout>
  );
}

function VerificationRequestCard({ request, busyAction, onApprove, onReject, onPreview, t, language }) {
  const isPending = request.status === "pending";
  const approving = busyAction.key === request.key && busyAction.type === "approve";
  const rejecting = busyAction.key === request.key && busyAction.type === "reject";
  const documents = [
    request.documents?.pdf ? { label: t("appI18n.adminRequests.documents.pdf"), url: request.documents.pdf_preview || request.documents.pdf, rawUrl: request.documents.pdf, type: "pdf", icon: FileText } : null,
    request.documents?.front ? { label: t("appI18n.adminRequests.documents.front"), url: request.documents.front_preview || request.documents.front, rawUrl: request.documents.front, type: "image", icon: ImageIcon } : null,
    request.documents?.back ? { label: t("appI18n.adminRequests.documents.back"), url: request.documents.back_preview || request.documents.back, rawUrl: request.documents.back, type: "image", icon: ImageIcon } : null,
    request.documents?.support ? { label: t("appI18n.adminRequests.documents.support"), url: request.documents.support_preview || request.documents.support, rawUrl: request.documents.support, type: inferDocumentType(request.documents.support), icon: FileText } : null,
  ].filter(Boolean);
  const title = request.kind === "education"
    ? request.education?.program || t("appI18n.adminRequests.card.educationFallback")
    : request.profile?.name || t("appI18n.adminRequests.card.userFallback");
  const description = request.kind === "education"
    ? t("appI18n.adminRequests.card.educationLine", {
        user: request.profile?.name || t("appI18n.adminRequests.card.userFallback"),
        institution: request.education?.institution || t("appI18n.adminRequests.card.noInstitution"),
        level: request.education?.level || t("appI18n.adminRequests.card.noLevel"),
        date: formatDate(request.submitted_at, t, language),
      })
    : t("appI18n.adminRequests.card.userLine", { id: request.profile?.user_id || t("appI18n.adminRequests.card.noId"), date: formatDate(request.submitted_at, t, language) });

  return (
    <article className="adm-request-card">
      <div className="adm-request-card__main">
        <div className={`adm-request-card__avatar adm-request-card__avatar--${request.kind}`}>
          {request.kind === "education" ? <BookOpenCheck size={20} /> : initials(request.profile?.name)}
        </div>
        <div>
          <div className="adm-request-card__topline">
            <span className={`adm-request-kind adm-request-kind--${request.kind}`}>{kindLabel(request.kind, t)}</span>
            <h3>{title}</h3>
            <span className={`adm-request-status adm-request-status--${request.status}`}>{statusLabel(request.status, t)}</span>
          </div>
          <p>{description}</p>
          {request.rejection_reason ? <p className="adm-request-card__reason">{request.rejection_reason}</p> : null}
        </div>
      </div>

      <div className="adm-request-card__docs">
        {documents.length ? documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <button key={doc.label} type="button" className="adm-request-doc" onClick={() => onPreview(doc)}>
              <Icon size={16} />
              {doc.label}
            </button>
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

function RequestTypeChooser({ onChoose, t }) {
  const choices = [
    {
      kind: "identity",
      icon: ShieldCheck,
      title: t("appI18n.adminRequests.chooser.identityTitle"),
      text: t("appI18n.adminRequests.chooser.identityText"),
    },
    {
      kind: "education",
      icon: BookOpenCheck,
      title: t("appI18n.adminRequests.chooser.educationTitle"),
      text: t("appI18n.adminRequests.chooser.educationText"),
    },
  ];

  return (
    <div className="adm-request-chooser">
      {choices.map((choice) => {
        const Icon = choice.icon;
        return (
          <button
            key={choice.kind}
            type="button"
            className={`adm-request-choice adm-request-choice--${choice.kind}`}
            onClick={() => onChoose(choice.kind)}
          >
            <span className="adm-request-choice__icon"><Icon size={22} /></span>
            <span className="adm-request-choice__content">
              <strong>{choice.title}</strong>
              <small>{choice.text}</small>
            </span>
            <span className="adm-request-choice__action">{t("appI18n.adminRequests.chooser.enter")}</span>
          </button>
        );
      })}
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

function kindLabel(kind, t) {
  return t(`appI18n.adminRequests.kind.${kind}`, t("appI18n.adminRequests.kind.identity"));
}

function normalizeRequests(items = [], fallbackKind = "identity") {
  return (Array.isArray(items) ? items : []).map((item) => {
    const kind = item.kind || fallbackKind;
    return {
      ...item,
      kind,
      key: `${kind}-${item.id}`,
    };
  });
}

function cacheKeyFor(kind, status) {
  return `${kind || "identity"}:${status || "pending"}`;
}

function sortRequestsByDate(a, b) {
  const aTime = safeTime(a.submitted_at || a.reviewed_at);
  const bTime = safeTime(b.submitted_at || b.reviewed_at);
  return bTime - aTime;
}

function safeTime(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function inferDocumentType(url) {
  return String(url || "").toLowerCase().includes(".pdf") ? "pdf" : "image";
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
