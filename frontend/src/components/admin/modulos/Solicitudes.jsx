import { useEffect, useMemo, useState } from "react";
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

const STATUS_TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
];

export default function Solicitudes() {
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
        setError(requestError?.message || "No se pudieron cargar las solicitudes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeStatus, refreshKey]);

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
      setError(requestError?.message || "No se pudo aprobar la solicitud.");
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
      setRejectError("Escribe un motivo de al menos 5 caracteres.");
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
      setRejectError(requestError?.message || "No se pudo rechazar la solicitud.");
    } finally {
      setBusyAction({ id: null, type: "" });
    }
  }

  return (
    <AdminModuleLayout title="Solicitudes" subtitle="Revision de solicitudes de verificacion de cuenta.">
      <section className="adm-requests__hero">
        <div>
          <span className="adm-requests__eyebrow"><ShieldCheck size={15} /> Verificacion de identidad</span>
          <h1>Solicitudes de cuenta verificada</h1>
          <p>Revisa documentos enviados por profesionales y decide si corresponde aprobar la insignia de verificado.</p>
        </div>
        <button type="button" className="adm-requests__refresh" onClick={() => setRefreshKey((value) => value + 1)}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </section>

      <div className="adm-requests__toolbar">
        <div className="adm-requests__tabs" role="tablist" aria-label="Estado de solicitudes">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`adm-requests__tab${activeStatus === tab.key ? " is-active" : ""}`}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="adm-requests__search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por usuario o estado"
          />
        </label>
      </div>

      <div className="adm-requests__summary">
        <MetricCard icon={<Clock3 size={17} />} label="En esta vista" value={counts.current} />
        <MetricCard icon={<Eye size={17} />} label="Coincidencias" value={counts.visible} />
        <MetricCard icon={<BadgeCheck size={17} />} label="Estado" value={statusLabel(activeStatus)} compact />
      </div>

      <div className="adm-requests__list">
        {loading ? (
          <State label="Cargando solicitudes" text="Estamos consultando las solicitudes de verificacion." />
        ) : error ? (
          <State label="No se pudo cargar" text={error} tone="error" />
        ) : filteredRequests.length ? (
          filteredRequests.map((request) => (
            <VerificationRequestCard
              key={request.id}
              request={request}
              busyAction={busyAction}
              onApprove={approveRequest}
              onReject={openRejectModal}
            />
          ))
        ) : (
          <State label="Sin solicitudes" text="No hay solicitudes que coincidan con esta vista." />
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
        />
      ) : null}
    </AdminModuleLayout>
  );
}

function VerificationRequestCard({ request, busyAction, onApprove, onReject }) {
  const isPending = request.status === "pending";
  const approving = busyAction.id === request.id && busyAction.type === "approve";
  const rejecting = busyAction.id === request.id && busyAction.type === "reject";
  const documents = [
    request.documents?.pdf ? { label: "PDF", url: request.documents.pdf, icon: FileText } : null,
    request.documents?.front ? { label: "Anverso", url: request.documents.front, icon: ImageIcon } : null,
    request.documents?.back ? { label: "Reverso", url: request.documents.back, icon: ImageIcon } : null,
  ].filter(Boolean);

  return (
    <article className="adm-request-card">
      <div className="adm-request-card__main">
        <div className="adm-request-card__avatar">{initials(request.profile?.name)}</div>
        <div>
          <div className="adm-request-card__topline">
            <h3>{request.profile?.name || "Usuario Portafy"}</h3>
            <span className={`adm-request-status adm-request-status--${request.status}`}>{statusLabel(request.status)}</span>
          </div>
          <p>Usuario #{request.profile?.user_id || "sin id"} - Enviado {formatDate(request.submitted_at)}</p>
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
        }) : <span className="adm-request-card__muted">Sin documentos adjuntos</span>}
      </div>

      <div className="adm-request-card__actions">
        {isPending ? (
          <>
            <button type="button" className="adm-request-btn adm-request-btn--approve" onClick={() => onApprove(request)} disabled={approving || rejecting}>
              <BadgeCheck size={16} />
              {approving ? "Aprobando..." : "Aprobar"}
            </button>
            <button type="button" className="adm-request-btn adm-request-btn--reject" onClick={() => onReject(request)} disabled={approving || rejecting}>
              <XCircle size={16} />
              Rechazar
            </button>
          </>
        ) : (
          <span className="adm-request-card__muted">Solicitud revisada {formatDate(request.reviewed_at)}</span>
        )}
      </div>
    </article>
  );
}

function RejectModal({ request, reason, error, busy, onReasonChange, onClose, onConfirm }) {
  return (
    <div className="adm-request-modal" role="presentation" onMouseDown={onClose}>
      <section className="adm-request-modal__panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="adm-request-modal__head">
          <div>
            <span>Rechazar solicitud</span>
            <h2>{request.profile?.name || "Usuario Portafy"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal">x</button>
        </div>

        <label className="adm-request-modal__field">
          Motivo del rechazo
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value.slice(0, 500))}
            rows={5}
            placeholder="Explica brevemente que debe corregir el usuario."
            disabled={busy}
          />
        </label>

        <div className="adm-request-modal__meta">
          <span className={error ? "is-error" : ""}>{error || `${reason.length}/500 caracteres`}</span>
        </div>

        <div className="adm-request-modal__actions">
          <button type="button" className="adm-request-btn adm-request-btn--ghost" onClick={onClose} disabled={busy}>Cancelar</button>
          <button type="button" className="adm-request-btn adm-request-btn--reject" onClick={onConfirm} disabled={busy}>
            {busy ? "Rechazando..." : "Confirmar rechazo"}
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

function State({ label, text, tone = "default" }) {
  return (
    <div className={`adm-requests__state adm-requests__state--${tone}`}>
      <span>{tone === "error" ? "Error" : "Panel"}</span>
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

function statusLabel(status) {
  const labels = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
  };
  return labels[status] || "Pendiente";
}

function initials(name) {
  const parts = String(name || "Usuario Portafy").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "UP";
}

function formatDate(value) {
  if (!value) return "sin fecha";
  try {
    return new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "sin fecha";
  }
}
