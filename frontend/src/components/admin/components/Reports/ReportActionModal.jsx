import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X, Zap, User, AlertTriangle, ShieldCheck, Hash,
  CalendarDays, FileText, ExternalLink, Paperclip,
  ChevronLeft, CheckCircle, Lock,
} from "lucide-react";
import ReportAceptModal from "./ReportAceptModal";
import "../../../../styles/components/admin/ReportActionModal.css";

export default function ReportActionModal({ report, isOpen, onClose, onAccept }) {
  const { t } = useTranslation();
  const a = "adminReports.actionModal";

  const adminName =
    localStorage.getItem("adminName") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    t(`${a}.adminFallback`);

  const [accionTomada,        setAccionTomada]        = useState("");
  const [reportedImageFailed, setReportedImageFailed] = useState(false);
  const [reporterImageFailed, setReporterImageFailed] = useState(false);
  const [pruebasEnviadas,     setPruebasEnviadas]     = useState("");
  const [showConfirm,         setShowConfirm]         = useState(false);
  const [isBusy,              setIsBusy]              = useState(false);
  const [error,               setError]               = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    const fn = (e) => { if (e.key === "Escape" && !showConfirm) onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose, showConfirm]);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    setShowConfirm(false);
    setIsBusy(false);
    setError("");
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const { id, reported_user, reporter_user, tests_url, meta } = report;

  const reportedPhoto = typeof reported_user?.photo === "string" ? reported_user.photo.trim() : "";
  const reporterPhoto = typeof reporter_user?.photo === "string" ? reporter_user.photo.trim() : "";
  const showReportedPhoto = Boolean(reportedPhoto) && !reportedImageFailed;
  const showReporterPhoto = Boolean(reporterPhoto) && !reporterImageFailed;

  function handleAceptar() {
    if (!accionTomada.trim()) { setError(t(`${a}.actionRequired`)); return; }
    setError(""); setShowConfirm(true);
  }

  async function handleConfirm() {
    setIsBusy(true);
    try {
      const handled = await onAccept?.({ action_taken: accionTomada, test_url: pruebasEnviadas });
      if (handled) setShowConfirm(false);
    } catch {
      setError(t(`${a}.actionError`)); setShowConfirm(false);
    } finally { setIsBusy(false); }
  }

  if (showConfirm) {
    return (
      <ReportAceptModal
        report={report} isOpen={showConfirm} isBusy={isBusy} error={error}
        onClose={onClose} onBack={() => setShowConfirm(false)} onConfirm={handleConfirm}
      />
    );
  }

  return createPortal(
    <div className="ram-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true"
      aria-label={t(`${a}.ariaLabel`, { id })}>
      <div className="ram-modal">

        <div className="ram-header">
          <div className="ram-header__icon-wrap"><Zap size={20} /></div>
          <div className="ram-header__text">
            <h3 className="ram-header__title">
              {t(`${a}.title`)} <span className="ram-header__id">#{id}</span>
            </h3>
            <p className="ram-header__sub">{t(`${a}.subtitle`)}</p>
          </div>
          <button className="ram-header__close" onClick={onClose}
            aria-label={t(`${a}.closeLabel`)}>
            <X size={16} />
          </button>
        </div>

        <div className="ram-body">
          <aside className="ram-meta">
            <div className="ram-meta__section">
              <p className="ram-meta__section-title">{t(`${a}.sectionUsers`)}</p>

              <div className="ram-meta__card">
                <div className={`ram-meta__avatar ${meta?.avatarClass ?? ""}`}>
                  {showReportedPhoto ? (
                    <img src={reportedPhoto} alt={reported_user?.name || ""}
                      className="ram-meta__avatar-img" onError={() => setReportedImageFailed(true)} />
                  ) : (reported_user?.initials ?? "??")}
                </div>
                <div className="ram-meta__card-info">
                  <span className="ram-meta__card-role">{t(`${a}.roleReported`)}</span>
                </div>
                <User size={13} className="ram-meta__card-icon" />
              </div>

              <div className="ram-meta__card ram-meta__card--reporter">
                <div className="ram-meta__avatar ram-meta__avatar--reporter">
                  {showReporterPhoto ? (
                    <img src={reporterPhoto} alt={reporter_user?.name || ""}
                      className="ram-meta__avatar-img" onError={() => setReporterImageFailed(true)} />
                  ) : (reporter_user?.initials ?? "??")}
                </div>
                <div className="ram-meta__card-info">
                  <span className="ram-meta__card-role">{t(`${a}.roleReporter`)}</span>
                </div>
                <AlertTriangle size={13} className="ram-meta__card-icon" />
              </div>
            </div>

            <div className="ram-meta__section">
              <p className="ram-meta__section-title">{t(`${a}.sectionManagement`)}</p>
              <div className="ram-meta__row">
                <ShieldCheck size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">{t(`${a}.attendedBy`)}</span>
                <span className="ram-meta__row-value">{adminName}</span>
              </div>
              <div className="ram-meta__row">
                <Hash size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">{t(`${a}.attendanceNumber`)}</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">{t(`${a}.undefined`)}</span>
              </div>
              <div className="ram-meta__row">
                <CalendarDays size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">{t(`${a}.creation`)}</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">{t(`${a}.undefined`)}</span>
              </div>
              <div className="ram-meta__row">
                <CalendarDays size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">{t(`${a}.modification`)}</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">{t(`${a}.undefined`)}</span>
              </div>
            </div>
          </aside>

          <div className="ram-form">
            <div className="ram-field">
              <label className="ram-field__label">
                <FileText size={13} />
                {t(`${a}.actionLabel`)}
                <span className="ram-field__required">*</span>
              </label>
              <textarea
                className={`ram-field__textarea ${error ? "ram-field__textarea--error" : ""}`}
                placeholder={t(`${a}.actionPlaceholder`)}
                rows={5} value={accionTomada}
                onChange={(e) => { setAccionTomada(e.target.value); if (error) setError(""); }}
              />
              {error ? <p className="ram-field__error-msg">{error}</p> : null}
            </div>

            <div className="ram-field">
              <label className="ram-field__label">
                <Lock size={13} />
                {t(`${a}.evidenceReadonly`)}
                <span className="ram-field__badge-readonly">{t(`${a}.evidenceReadonlyBadge`)}</span>
              </label>
              <div className="ram-field__readonly">
                {tests_url ? (
                  <a href={tests_url} target="_blank" rel="noopener noreferrer" className="ram-field__link">
                    <ExternalLink size={12} /> {tests_url}
                  </a>
                ) : (
                  <span className="ram-field__empty">{t(`${a}.noEvidence`)}</span>
                )}
              </div>
            </div>

            <div className="ram-field">
              <label className="ram-field__label">
                <Paperclip size={13} /> {t(`${a}.evidenceSent`)}
              </label>
              <input type="text" className="ram-field__input"
                placeholder={t(`${a}.evidencePlaceholder`)}
                value={pruebasEnviadas}
                onChange={(e) => setPruebasEnviadas(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ram-footer">
          <button className="ram-btn ram-btn--back" onClick={onClose} disabled={isBusy}>
            <ChevronLeft size={15} /> {t(`${a}.btnBack`)}
          </button>
          <button className="ram-btn ram-btn--accept" onClick={handleAceptar} disabled={isBusy}>
            <CheckCircle size={15} />
            {isBusy ? t(`${a}.processing`) : t(`${a}.btnAccept`)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
