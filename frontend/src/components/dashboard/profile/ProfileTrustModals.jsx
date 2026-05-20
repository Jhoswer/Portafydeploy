import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Eye, FileText, Image, Loader2, Send, ShieldCheck, UploadCloud, UserMinus, UserPlus, X } from "lucide-react";
import { getPublicationReportReasons } from "../../../services/reportService";
import {
  SUGGESTION_AREAS,
  SUGGESTION_TYPES,
  validateSuggestion,
} from "../../../services/profileTrustService";
import { profileUi as ui } from "../../../styles/components/dashboard/profileStyles";

const backdrop = {
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: "grid",
  placeItems: "center",
  padding: 18,
  background: "rgba(15,23,42,.38)",
  backdropFilter: "blur(6px)",
};

const modal = {
  width: "min(620px, 100%)",
  maxHeight: "min(760px, calc(100vh - 36px))",
  overflow: "auto",
  borderRadius: 24,
  background: "#fff",
  border: "1px solid rgba(205,225,245,.72)",
  boxShadow: "0 32px 80px rgba(14,30,60,.28)",
  padding: 22,
};

function ModalShell({ title, subtitle, icon, children, onClose, busy = false }) {
  return (
    <div style={backdrop} onMouseDown={busy ? undefined : onClose}>
      <section style={modal} onMouseDown={(event) => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ ...ui.avatarAction, position: "static", boxShadow: "none" }}>{icon}</span>
            <span style={{ display: "grid", gap: 4 }}>
              <strong style={{ fontFamily: "var(--f-title)", fontSize: "1.18rem", color: "var(--text)" }}>{title}</strong>
              {subtitle ? <span style={ui.muted}>{subtitle}</span> : null}
            </span>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} disabled={busy} style={ui.icon}>
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function UserRow({ user, readonly, onFollow, onUnfollow, onOpenProfile, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const canAct = !readonly && !user.is_me;
  const following = Boolean(user.is_following);

  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "auto minmax(0, 1fr)" : "auto minmax(0, 1fr) auto", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(162,214,249,.16)" }}>
      <button type="button" onClick={() => onOpenProfile(user)} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}>
        {user.photo ? (
          <img src={user.photo} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span style={{ ...ui.avatarAction, position: "static", boxShadow: "none" }}>{user.name?.slice(0, 2) || "US"}</span>
        )}
      </button>
      <button type="button" onClick={() => onOpenProfile(user)} style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-ui)", fontWeight: 850, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
        <div style={ui.muted}>{user.title}</div>
      </button>
      {canAct ? (
        <button
          type="button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => (following ? onUnfollow(user) : onFollow(user))}
          style={{ ...ui.secondary, gridColumn: compact ? "1 / -1" : undefined, justifySelf: compact ? "stretch" : "end", justifyContent: "center", padding: "8px 10px", color: following && hovered ? "#dc2626" : "#2048a8" }}
          title={following ? "Dejar de seguir" : "Seguir tambien"}
        >
          {following ? <UserMinus size={14} /> : <UserPlus size={14} />}
          {following ? (hovered ? "Dejar de seguir" : "Siguiendo") : "Seguir tambien"}
        </button>
      ) : null}
    </div>
  );
}

export function RelationListModal({ title, type, readonly, loading, items, onClose, onFollow, onAskUnfollow, onOpenProfile }) {
  const isNarrow = useModalViewport() < 520;

  return (
    <ModalShell title={title} subtitle={readonly ? "Vista publica de conexiones" : "Administra tus conexiones"} icon={<UserPlus size={17} />} onClose={onClose}>
      {loading ? <div style={ui.muted}>Cargando lista...</div> : null}
      {!loading && !items.length ? <div style={ui.muted}>No hay usuarios para mostrar.</div> : null}
      <div style={{ maxHeight: "58vh", overflowY: "auto", paddingRight: 4 }}>
        {items.map((user) => (
          <UserRow
            key={`${type}-${user.profile_id}`}
            user={user}
            readonly={readonly}
            onFollow={onFollow}
            onUnfollow={onAskUnfollow}
            onOpenProfile={onOpenProfile}
            compact={isNarrow}
          />
        ))}
      </div>
    </ModalShell>
  );
}

export function ConfirmUnfollowModal({ user, busy, error, onCancel, onConfirm }) {
  return (
    <ModalShell title="Dejar de seguir" subtitle={`Estas seguro de dejar de seguir a ${user?.name || "este usuario"}?`} icon={<AlertTriangle size={17} />} onClose={onCancel} busy={busy}>
      {error ? <div style={{ ...ui.muted, color: "#dc2626", marginBottom: 12 }}>{error}</div> : null}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} disabled={busy} style={ui.secondary}>Cancelar</button>
        <button type="button" onClick={onConfirm} disabled={busy} style={{ ...ui.primary, background: "#dc2626" }}>
          {busy ? "Procesando..." : "Confirmar"}
        </button>
      </div>
    </ModalShell>
  );
}

export function ProfileViewsModal({ views, loading, onClose, onOpenProfile }) {
  return (
    <ModalShell title="Visualizaciones del perfil" subtitle="Usuarios que visitaron tu perfil recientemente" icon={<Eye size={17} />} onClose={onClose}>
      {loading ? <div style={ui.muted}>Cargando visualizaciones...</div> : null}
      {!loading && !views.length ? <div style={ui.muted}>Aun no hay visualizaciones registradas.</div> : null}
      {views.map((item) => (
        <button key={item.id} type="button" onClick={() => onOpenProfile(item.viewer)} style={{ width: "100%", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "11px 0", border: 0, borderBottom: "1px solid rgba(162,214,249,.16)", background: "transparent", textAlign: "left", cursor: "pointer" }}>
          {item.viewer?.photo ? <img src={item.viewer.photo} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ ...ui.avatarAction, position: "static", boxShadow: "none" }}>US</span>}
          <span>
            <div style={{ fontFamily: "var(--f-ui)", fontWeight: 850, color: "var(--text)" }}>{item.viewer?.name || "Usuario"}</div>
            <div style={ui.muted}>{item.viewer?.title || "Profesional Portafy"}</div>
          </span>
          <span style={ui.muted}>{item.viewed_ago}</span>
        </button>
      ))}
    </ModalShell>
  );
}

export function SuggestionModal({ busy, error, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: "idea", area: "perfil", title: "", description: "" });
  const validation = useMemo(() => validateSuggestion(form), [form]);

  const submit = (event) => {
    event.preventDefault();
    if (validation || busy) return;
    onSubmit(form);
  };

  return (
    <ModalShell title="Enviar sugerencia" subtitle="Tu idea sera revisada desde el panel de administracion" icon={<Send size={17} />} onClose={onClose} busy={busy}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} style={ui.input}>
            {SUGGESTION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={form.area} onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))} style={ui.input}>
            {SUGGESTION_AREAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <input value={form.title} maxLength={120} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Nombre de la sugerencia" style={ui.input} />
        <textarea value={form.description} maxLength={255} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Motivo o detalle" rows={5} style={ui.textarea} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ ...ui.muted, color: error || validation ? "#dc2626" : "var(--muted)" }}>{error || validation || `${form.description.length}/255 caracteres`}</span>
          <span style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} disabled={busy} style={ui.secondary}>Cancelar</button>
            <button type="submit" disabled={busy || Boolean(validation)} style={ui.primary}>{busy ? "Enviando..." : "Enviar"}</button>
          </span>
        </div>
      </form>
    </ModalShell>
  );
}

export function VerificationModal({ status, busy, error, onClose, onSubmit }) {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [pdf, setPdf] = useState(null);
  const currentStatus = status?.status || "none";
  const finalStep = currentStatus === "approved" || currentStatus === "rejected";
  const pending = currentStatus === "pending";
  const validationError = validateVerificationFiles({ front, back, pdf });
  const canSubmit = !validationError && (pdf || (front && back));

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit || busy) return;
    const formData = new FormData();
    if (front) formData.append("document_front", front);
    if (back) formData.append("document_back", back);
    if (pdf) formData.append("document_pdf", pdf);
    onSubmit(formData);
  };

  return (
    <ModalShell title="Verificar cuenta" subtitle="Completa el proceso para obtener la insignia de verificado" icon={<ShieldCheck size={17} />} onClose={onClose} busy={busy}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 16 }}>
        {["Documento", "Revision", "Resultado"].map((label, index) => (
          <div key={label} style={{ ...ui.subtleCard, borderColor: index === 0 && !pending && !finalStep ? "#2048a8" : "rgba(205,225,245,.76)" }}>
            <strong style={{ fontFamily: "var(--f-ui)", fontSize: ".78rem" }}>{index + 1}. {label}</strong>
          </div>
        ))}
      </div>
      {pending ? <div style={ui.body}>Tu solicitud esta pendiente. Espera la revision de administracion.</div> : null}
      {currentStatus === "approved" ? <div style={ui.body}><Check size={16} /> Cuenta aprobada. La insignia ya puede mostrarse en tu perfil.</div> : null}
      {currentStatus === "rejected" ? <div style={ui.body}>Solicitud rechazada: {status?.rejection_reason || "Sin justificativo registrado."}</div> : null}
      {!pending && !finalStep ? (
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
              <FileUploadBox
                label="Documento anverso"
                hint="JPG, PNG o WEBP"
                file={front}
                accept="image/png,image/jpeg,image/webp"
                icon={<Image size={17} />}
                onChange={setFront}
              />
              <FileUploadBox
                label="Documento reverso"
                hint="JPG, PNG o WEBP"
                file={back}
                accept="image/png,image/jpeg,image/webp"
                icon={<Image size={17} />}
                onChange={setBack}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <FileUploadBox
                label="Documento completo en PDF"
                hint="Opcional si subes anverso y reverso"
                file={pdf}
                accept="application/pdf"
                icon={<FileText size={17} />}
                onChange={setPdf}
              />
            </div>
          </div>
          <span style={{ ...ui.muted, color: error || validationError || !canSubmit ? "#dc2626" : "var(--muted)" }}>
            {error || validationError || "Sube un PDF o ambas imagenes del documento. Maximo 4 MB por imagen, 6 MB PDF."}
          </span>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={onClose} disabled={busy} style={ui.secondary}>Cancelar</button>
            <button type="submit" disabled={busy || !canSubmit} style={ui.primary}>{busy ? "Enviando..." : "Enviar solicitud"}</button>
          </div>
        </form>
      ) : null}
    </ModalShell>
  );
}

function FileUploadBox({ label, hint, file, accept, icon, onChange }) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 12,
        minHeight: 82,
        padding: "14px 15px",
        borderRadius: 18,
        background: file
          ? "linear-gradient(135deg, rgba(239,246,255,.98) 0%, rgba(255,255,255,.98) 100%)"
          : "linear-gradient(135deg, rgba(248,251,255,.94) 0%, rgba(255,255,255,.98) 100%)",
        border: file ? "1px solid rgba(37,99,235,.32)" : "1px dashed rgba(37,99,235,.34)",
        boxShadow: file ? "0 14px 30px rgba(37,99,235,.10)" : "0 10px 24px rgba(14,30,60,.05)",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          color: "#2563eb",
          background: "rgba(37,99,235,.10)",
          border: "1px solid rgba(37,99,235,.18)",
        }}
      >
        {icon}
      </span>
      <span style={{ minWidth: 0, display: "grid", gap: 3 }}>
        <strong style={{ fontFamily: "var(--f-ui)", fontSize: ".86rem", color: "var(--text)" }}>{label}</strong>
        <span style={{ ...ui.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file ? `${file.name} - ${formatFileSize(file.size)}` : hint}
        </span>
      </span>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          color: file ? "#16a34a" : "#2563eb",
          background: file ? "rgba(22,163,74,.12)" : "rgba(37,99,235,.08)",
        }}
      >
        {file ? <Check size={16} /> : <UploadCloud size={16} />}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
    </label>
  );
}

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 KB";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function validateVerificationFiles({ front, back, pdf }) {
  const maxImage = 4 * 1024 * 1024;
  const maxPdf = 6 * 1024 * 1024;
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];

  for (const [file, label] of [[front, "anverso"], [back, "reverso"]]) {
    if (!file) continue;
    if (!imageTypes.includes(file.type)) return `El ${label} debe ser JPG, PNG o WEBP.`;
    if (file.size > maxImage) return `El ${label} supera el maximo de 4 MB.`;
  }

  if (pdf) {
    if (pdf.type !== "application/pdf") return "El documento completo debe ser PDF.";
    if (pdf.size > maxPdf) return "El PDF supera el maximo de 6 MB.";
  }

  if (!pdf && (front || back) && !(front && back)) {
    return "Si eliges imagenes, adjunta anverso y reverso.";
  }

  return "";
}

function useModalViewport() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1024 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export function ReportProfileModal({ targetName, busy, error, onClose, onSubmit }) {
  const reasons = getPublicationReportReasons();
  const [motivo, setMotivo] = useState(reasons[0]?.key || "spam");
  const [description, setDescription] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    onSubmit({ motivo, description });
  };

  return (
    <ModalShell title="Reportar perfil" subtitle={`El reporte sobre ${targetName} sera enviado a administracion`} icon={<AlertTriangle size={17} />} onClose={onClose} busy={busy}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <select value={motivo} onChange={(event) => setMotivo(event.target.value)} style={ui.input}>
          {reasons.map((reason) => <option key={reason.key} value={reason.key}>{reason.label}</option>)}
        </select>
        <textarea value={description} maxLength={255} onChange={(event) => setDescription(event.target.value)} placeholder="Detalle opcional" rows={4} style={ui.textarea} />
        {error ? <div style={{ ...ui.muted, color: "#dc2626" }}>{error}</div> : null}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} disabled={busy} style={ui.secondary}>Cancelar</button>
          <button type="submit" disabled={busy} style={ui.primary}>{busy ? "Enviando..." : "Enviar reporte"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

export function LoadingInline() {
  useEffect(() => {}, []);
  return <Loader2 size={14} />;
}
