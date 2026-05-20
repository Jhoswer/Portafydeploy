import { useState, useEffect } from "react";
import {
  X,
  Zap,
  User,
  AlertTriangle,
  ShieldCheck,
  Hash,
  CalendarDays,
  FileText,
  ExternalLink,
  Paperclip,
  ChevronLeft,
  CheckCircle,
  Lock,
} from "lucide-react";
import ReportAceptModal from "./ReportAceptModal";
import "../../../../styles/components/admin/ReportActionModal.css";

export default function ReportActionModal({
  report,
  isOpen,
  onClose,
  onAccept,
}) {
  if (!isOpen || !report) return null;

  const { id, reported_user, reporter_user, tests_url, meta } = report;

  const adminName =
    localStorage.getItem("adminName") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Administrador";

  const [accionTomada, setAccionTomada] = useState("");
  const [pruebasEnviadas, setPruebasEnviadas] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape" && !showConfirm) onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, showConfirm]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleAceptar() {
    if (!accionTomada.trim()) {
      setError("Por favor, describe la accion tomada antes de continuar.");
      return;
    }
    setError("");
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setIsBusy(true);
    try {
      const handled = await onAccept?.({
        action_taken: accionTomada,
        test_url: pruebasEnviadas,
      });

      if (handled) {
        setShowConfirm(false);
      }
    } catch {
      setError("Ocurrio un error al procesar el reporte. Intenta nuevamente.");
      setShowConfirm(false);
    } finally {
      setIsBusy(false);
    }
  }

  if (showConfirm) {
    return (
      <ReportAceptModal
        report={report}
        isOpen={showConfirm}
        isBusy={isBusy}
        error={error}
        onClose={onClose}
        onBack={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <div
      className="ram-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Atencion del reporte #${id}`}
    >
      <div className="ram-modal">
        <div className="ram-header">
          <div className="ram-header__icon-wrap">
            <Zap size={20} />
          </div>

          <div className="ram-header__text">
            <h3 className="ram-header__title">
              Atencion del reporte <span className="ram-header__id">#{id}</span>
            </h3>
            <p className="ram-header__sub">
              Completa los campos para registrar la accion tomada sobre este reporte
            </p>
          </div>

          <button
            className="ram-header__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ram-body">
          <aside className="ram-meta">
            <div className="ram-meta__section">
              <p className="ram-meta__section-title">Usuarios</p>

              <div className="ram-meta__card">
                <div className={`ram-meta__avatar ${meta?.avatarClass ?? ""}`}>
                  {reporter_user?.initials ?? "??"}
                </div>
                <div className="ram-meta__card-info">
                  <span className="ram-meta__card-role">Reportado</span>
                  <span className="ram-meta__card-name">{reporter_user?.name ?? "-"}</span>
                </div>
                <User size={13} className="ram-meta__card-icon" />
              </div>

              <div className="ram-meta__card ram-meta__card--reporter">
                <div className="ram-meta__avatar ram-meta__avatar--reporter">
                  {reported_user?.initials ?? "??"}
                </div>
                <div className="ram-meta__card-info">
                  <span className="ram-meta__card-role">Reportante</span>
                  <span className="ram-meta__card-name">{reported_user?.name ?? "-"}</span>
                </div>
                <AlertTriangle size={13} className="ram-meta__card-icon" />
              </div>
            </div>

            <div className="ram-meta__section">
              <p className="ram-meta__section-title">Gestion</p>

              <div className="ram-meta__row">
                <ShieldCheck size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">Atendido por</span>
                <span className="ram-meta__row-value">{adminName}</span>
              </div>

              <div className="ram-meta__row">
                <Hash size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">Atencion #</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">Sin definir</span>
              </div>

              <div className="ram-meta__row">
                <CalendarDays size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">Creacion</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">Sin definir</span>
              </div>

              <div className="ram-meta__row">
                <CalendarDays size={13} className="ram-meta__row-icon" />
                <span className="ram-meta__row-label">Modificacion</span>
                <span className="ram-meta__row-value ram-meta__row-value--muted">Sin definir</span>
              </div>
            </div>
          </aside>

          <div className="ram-form">
            <div className="ram-field">
              <label className="ram-field__label">
                <FileText size={13} />
                Accion tomada
                <span className="ram-field__required">*</span>
              </label>
              <textarea
                className={`ram-field__textarea ${error ? "ram-field__textarea--error" : ""}`}
                placeholder="Descripcion de accion..."
                rows={5}
                value={accionTomada}
                onChange={(e) => {
                  setAccionTomada(e.target.value);
                  if (error) setError("");
                }}
              />
              {error ? <p className="ram-field__error-msg">{error}</p> : null}
            </div>

            <div className="ram-field">
              <label className="ram-field__label">
                <Lock size={13} />
                Pruebas revisadas
                <span className="ram-field__badge-readonly">Solo lectura</span>
              </label>
              <div className="ram-field__readonly">
                {tests_url ? (
                  <a
                    href={tests_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ram-field__link"
                  >
                    <ExternalLink size={12} />
                    {tests_url}
                  </a>
                ) : (
                  <span className="ram-field__empty">Sin pruebas adjuntas en el reporte.</span>
                )}
              </div>
            </div>

            <div className="ram-field">
              <label className="ram-field__label">
                <Paperclip size={13} />
                Pruebas enviadas
              </label>
              <input
                type="text"
                className="ram-field__input"
                placeholder="Adjuntar pruebas..."
                value={pruebasEnviadas}
                onChange={(e) => setPruebasEnviadas(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ram-footer">
          <button
            className="ram-btn ram-btn--back"
            onClick={onClose}
            disabled={isBusy}
          >
            <ChevronLeft size={15} /> Atras
          </button>

          <button
            className="ram-btn ram-btn--accept"
            onClick={handleAceptar}
            disabled={isBusy}
          >
            <CheckCircle size={15} />
            {isBusy ? "Procesando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
