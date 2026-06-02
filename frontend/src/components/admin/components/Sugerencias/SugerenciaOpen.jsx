import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X, User, Calendar, Tag, FileText, CheckCircle, XCircle,
  ArrowUpCircle, MessageCircle, Clock, ShieldCheck, Loader, AlertCircle,
} from "lucide-react";
import "../../../../styles/components/admin/components/Sugerencias/SugerenciaOpen.css";
import SugerenciaAceptModal      from "./SugerenciaAceptModal";
import SugerenciaDeleteModal     from "./SugerenciaDeleteModal";
import SugerenciaRedirectedModal from "./SugerenciaRedirectedModal";
import { fetchSuggestionContext } from "../../../../services/sugerenciaService";

function PostulantAvatar({ photo, initials, avatarClass, size = 40 }) {
  const [imgError, setImgError] = useState(false);
  const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0 };
  if (photo && !imgError) {
    return (
      <div style={{ ...style, overflow: "hidden" }}>
        <img src={photo} alt={initials}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setImgError(true)} />
      </div>
    );
  }
  return (
    <div className={`so-header__avatar ${avatarClass}`} style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

function AttendedBadge({ state, t }) {
  const key = `adminSugerencias.stateBadge.${state}`;
  const fallbackKey = "adminSugerencias.stateBadge.pending";
  const STATE_CLS = {
    pending: "badge--abierto", accepted: "badge--success", rejected: "badge--critico",
    in_discussion: "badge--blue", higher: "badge--purple", ignored: "badge--pendiente",
  };
  const cls = STATE_CLS[state] ?? STATE_CLS.pending;
  return <span className={`rp-badge ${cls}`}>{t(STATE_CLS[state] ? key : fallbackKey)}</span>;
}

export default function SugerenciaOpen({
  sugerencia, onClose, onAccept, onReject, onEscalate, onIgnore, actionBusy,
}) {
  const { t } = useTranslation();
  const o = "adminSugerencias.open";

  if (!sugerencia) return null;
  const { meta, postulant, description, formattedDate, id } = sugerencia;

  const [note,             setNote]             = useState("");
  const [context,          setContext]          = useState(null);
  const [ctxLoading,       setCtxLoading]       = useState(true);
  const [ctxError,         setCtxError]         = useState("");
  const [showAcceptModal,  setShowAcceptModal]  = useState(false);
  const [showRejectModal,  setShowRejectModal]  = useState(false);
  const [showEscalateModal,setShowEscalateModal]= useState(false);
  const [actionError,      setActionError]      = useState("");
  const [busy,             setBusy]             = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCtxLoading(true); setCtxError("");
    fetchSuggestionContext(id)
      .then((data) => { if (!cancelled) setContext(data); })
      .catch((err) => { if (!cancelled) setCtxError(err?.message || t(`${o}.errorContext`)); })
      .finally(() => { if (!cancelled) setCtxLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleIgnore() {
    setBusy(true); setActionError("");
    try { await onIgnore?.(sugerencia, note); }
    catch (e) { setActionError(e?.message || t(`${o}.errorIgnore`)); setBusy(false); }
  }

  async function handleConfirmAccept() {
    setBusy(true); setActionError("");
    try { setShowAcceptModal(false); await onAccept?.(sugerencia, note); }
    catch (e) { setActionError(e?.message || t(`${o}.errorAccept`)); }
    finally { setBusy(false); }
  }

  async function handleConfirmReject() {
    setBusy(true); setActionError("");
    try { setShowRejectModal(false); await onReject?.(sugerencia, note); }
    catch (e) { setActionError(e?.message || t(`${o}.errorReject`)); }
    finally { setBusy(false); }
  }

  async function handleConfirmEscalate() {
    setBusy(true); setActionError("");
    try { setShowEscalateModal(false); await onEscalate?.(sugerencia, note); }
    catch (e) { setActionError(e?.message || t(`${o}.errorEscalate`)); }
    finally { setBusy(false); }
  }

  const attended         = context?.attended         ?? null;
  const postulantHistory = context?.postulant_history ?? null;

  return (
    <>
      <div className="so-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog" aria-modal="true" aria-label={t(`${o}.ariaLabel`)}>
        <div className="so-modal">

          {/* Cabecera */}
          <div className="so-header">
            <div className="so-header__left">
              <PostulantAvatar photo={postulant.photo} initials={postulant.initials}
                avatarClass={meta.avatarClass} size={42} />
              <div>
                <h2 className="so-header__title">
                  {t(`${o}.titlePrefix`)}{" "}
                  <span className="so-header__name">{postulant.name}</span>
                </h2>
                <p className="so-header__subtitle">
                  {meta.label}
                  <span className="so-header__dot">·</span>
                  {t(`${o}.idPrefix`)}{id}
                  <span className="so-header__dot">·</span>
                  {ctxLoading
                    ? <span className="so-loading-inline">{t(`${o}.statusLoading`)}</span>
                    : <AttendedBadge state={attended?.state ?? "pending"} t={t} />}
                </p>
              </div>
            </div>
            <button className="so-close-btn" onClick={onClose}
              aria-label={t(`${o}.closeLabel`)}>
              <X size={18} />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="so-body">
            <div className="so-main">

              <section className="so-section">
                <div className="so-section__label">
                  <User size={14} /> {t(`${o}.sectionUser`)}
                </div>
                <div className="so-user-card">
                  <PostulantAvatar photo={postulant.photo} initials={postulant.initials}
                    avatarClass={meta.avatarClass} size={34} />
                  <div className="so-user-card__info">
                    <span className="so-user-card__name">{postulant.name}</span>
                    <span className="so-user-card__id">
                      {t(`${o}.profileId`)} {postulant.id ?? "—"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="so-section">
                <div className="so-section__label">
                  <FileText size={14} /> {t(`${o}.sectionDescription`)}
                </div>
                <p className="so-section__text">{description}</p>
              </section>

              <section className="so-section">
                <div className="so-section__label">
                  <MessageCircle size={14} /> {t(`${o}.sectionNote`)}
                </div>
                <textarea className="so-section__textarea"
                  placeholder={t(`${o}.notePlaceholder`)}
                  rows={3} value={note}
                  onChange={(e) => setNote(e.target.value)} />
              </section>

              {actionError && (
                <div className="so-action-error">
                  <AlertCircle size={14} /> {actionError}
                </div>
              )}
            </div>

            <aside className="so-aside">
              <div className="so-detail-card">
                <div className="so-detail-card__title">{t(`${o}.detailsTitle`)}</div>
                <div className="so-detail-row">
                  <Tag size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">{t(`${o}.detailType`)}</span>
                  <span className={`rp-badge ${meta.badgeClass}`}>{meta.badge}</span>
                </div>
                <div className="so-detail-row">
                  <Clock size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">{t(`${o}.detailStatus`)}</span>
                  {ctxLoading
                    ? <span className="so-skeleton so-skeleton--sm" />
                    : <AttendedBadge state={attended?.state ?? "pending"} t={t} />}
                </div>
                <div className="so-detail-row">
                  <Calendar size={13} className="so-detail-row__icon" />
                  <span className="so-detail-row__label">{t(`${o}.detailDate`)}</span>
                  <span className="so-detail-row__value">{formattedDate}</span>
                </div>
              </div>

              <div className="so-detail-card">
                <div className="so-detail-card__title">
                  {t(`${o}.historyTitle`)} {postulant.name}
                </div>
                {ctxLoading ? (
                  <div className="so-skeleton-wrap">
                    <span className="so-skeleton" />
                    <span className="so-skeleton" />
                    <span className="so-skeleton" />
                  </div>
                ) : ctxError ? (
                  <p className="so-detail-card__hint so-detail-card__hint--error">
                    {t(`${o}.historyLoadError`)}
                  </p>
                ) : (
                  <>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--blue" />
                      <span className="so-history-stat__label">{t(`${o}.historyActive`)}</span>
                      <span className="so-history-stat__value">{postulantHistory?.total_activas ?? 0}</span>
                    </div>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--amber" />
                      <span className="so-history-stat__label">{t(`${o}.historyDiscussion`)}</span>
                      <span className="so-history-stat__value">{postulantHistory?.in_discussion ?? 0}</span>
                    </div>
                    <div className="so-history-stat">
                      <span className="so-history-stat__dot so-history-stat__dot--purple" />
                      <span className="so-history-stat__label">{t(`${o}.historyEscalated`)}</span>
                      <span className="so-history-stat__value">{postulantHistory?.escaladas ?? 0}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="so-detail-card so-detail-card--info">
                <div className="so-detail-card__title">
                  <ShieldCheck size={13} /> {t(`${o}.attendanceTitle`)}
                </div>
                {ctxLoading ? (
                  <div className="so-skeleton-wrap">
                    <span className="so-skeleton" />
                    <span className="so-skeleton so-skeleton--short" />
                  </div>
                ) : ctxError ? (
                  <p className="so-detail-card__hint so-detail-card__hint--error">
                    {t(`${o}.attendanceUnavailable`)}
                  </p>
                ) : !attended?.exists ? (
                  <p className="so-detail-card__hint">{t(`${o}.attendanceNever`)}</p>
                ) : (
                  <>
                    <p className="so-detail-card__hint">
                      {t(`${o}.attendanceBy`)}{" "}
                      <strong>{attended.admin?.name ?? t(`${o}.attendanceUnknown`)}</strong>
                    </p>
                    <div className="so-detail-row so-detail-row--sm">
                      <Calendar size={12} className="so-detail-row__icon" />
                      <span className="so-detail-row__label">{t(`${o}.attendanceCreation`)}</span>
                      <span className="so-detail-row__value">{attended.created_at ?? "—"}</span>
                    </div>
                    <div className="so-detail-row so-detail-row--sm">
                      <Calendar size={12} className="so-detail-row__icon" />
                      <span className="so-detail-row__label">{t(`${o}.attendanceModification`)}</span>
                      <span className="so-detail-row__value">{attended.updated_at ?? "—"}</span>
                    </div>
                    {attended.note && (
                      <p className="so-detail-card__note">"{attended.note}"</p>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>

          {/* Footer */}
          <div className="so-footer">
            <div className="so-footer__left">
              <button className="so-action-btn so-action-btn--reject"
                onClick={() => { setActionError(""); setShowRejectModal(true); }}
                disabled={busy}>
                <XCircle size={15} /> {t(`${o}.btnReject`)}
              </button>
              <button className="so-action-btn so-action-btn--ignore"
                onClick={handleIgnore} disabled={busy}>
                {busy ? <Loader size={14} className="so-spin" /> : null}
                {t(`${o}.btnIgnore`)}
              </button>
            </div>
            <div className="so-footer__right">
              <button className="so-action-btn so-action-btn--accept"
                onClick={() => { setActionError(""); setShowAcceptModal(true); }}
                disabled={busy}>
                <CheckCircle size={15} /> {t(`${o}.btnAccept`)}
              </button>
              <button className="so-action-btn so-action-btn--escalate"
                onClick={() => { setActionError(""); setShowEscalateModal(true); }}
                disabled={busy}>
                <ArrowUpCircle size={15} /> {t(`${o}.btnEscalate`)}
              </button>
              <button className="so-action-btn so-action-btn--close" onClick={onClose}>
                <X size={15} /> {t(`${o}.btnClose`)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SugerenciaAceptModal sugerencia={sugerencia} isOpen={showAcceptModal}
        isBusy={busy} error={actionError}
        onClose={() => setShowAcceptModal(false)}
        onBack={() => setShowAcceptModal(false)}
        onConfirm={handleConfirmAccept} />

      <SugerenciaDeleteModal sugerencia={sugerencia} isOpen={showRejectModal}
        isBusy={busy} error={actionError}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject} />

      <SugerenciaRedirectedModal sugerencia={sugerencia} isOpen={showEscalateModal}
        isBusy={busy} error={actionError}
        onClose={() => setShowEscalateModal(false)}
        onConfirm={handleConfirmEscalate} />
    </>
  );
}