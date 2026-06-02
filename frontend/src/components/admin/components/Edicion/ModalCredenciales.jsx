import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Save, KeyRound, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { apiClient } from "../../../../services/http/httpClient";

function PasswordField({ fieldKey, label, placeholder, value, visible, onChange, onToggle,
  readOnly = false, hasError = false, hasSuccess = false, hint = null, hintType = "error" }) {
  return (
    <div className="edicion-modal__field">
      <label className="edicion-modal__label">{label}</label>
      <div className="edicion-modal__password-wrap">
        <input
          className={["edicion-modal__input edicion-modal__input--password",
            hasError ? "edicion-modal__input--error" : "",
            hasSuccess ? "edicion-modal__input--success" : ""].join(" ").trim()}
          type={visible ? "text" : "password"} value={value}
          onChange={(ev) => onChange(fieldKey, ev.target.value)}
          placeholder={placeholder} autoComplete="new-password" maxLength={255} readOnly={readOnly}
        />
        <button type="button" className="edicion-modal__eye-btn"
          onClick={() => onToggle(fieldKey)} tabIndex={-1}>
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && (
        <span className={`edicion-modal__field-hint edicion-modal__field-hint--${hintType}`}
          role={hintType === "error" ? "alert" : undefined}>
          {hintType === "error" ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
          {hint}
        </span>
      )}
    </div>
  );
}

export default function ModalCredenciales({ user, onClose, onSave }) {
  const { t } = useTranslation();
  const e = "adminEdicion.credenciales";

  const [formData, setFormData] = useState({ password: "", password_confirm: "", keyword: "" });
  const [originalKeyword, setOriginalKeyword] = useState("");
  const [show, setShow] = useState({ password: false, password_confirm: false, keyword: false });
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const passwordFilled  = formData.password.trim().length > 0;
  const confirmFilled   = formData.password_confirm.trim().length > 0;
  const passwordsMatch  = formData.password === formData.password_confirm;
  const passwordMismatch = passwordFilled && confirmFilled && !passwordsMatch;
  const passwordOk      = passwordFilled && confirmFilled && passwordsMatch;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        if (!user?.id_profile) throw new Error(t(`${e}.errorLoad`));
        const data = await apiClient.get(`/admin/credentials/${user.id_profile}`,
          { fallbackMessage: t(`${e}.errorLoad`) });
        setFormData({ password: "", password_confirm: "", keyword: data.keyword ?? "" });
        setOriginalKeyword(data.keyword ?? "");
      } catch (err) {
        setError(err?.message || t(`${e}.errorLoad`));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const toggleShow   = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const buildResumen = () => {
    const cambios = [];
    if (formData.password.trim())
      cambios.push({ label: t(`${e}.resumen.password`), value: t(`${e}.resumen.passwordValue`) });
    if ((formData.keyword ?? "").trim() !== (originalKeyword ?? "").trim())
      cambios.push({ label: t(`${e}.resumen.keyword`), value: formData.keyword.trim() || "—" });
    return cambios;
  };

  const handleSaveClick = () => {
    if (passwordFilled && !passwordsMatch) return;
    setConfirmError(""); setShowConfirm(true);
  };

  const handleConfirmedSave = async () => {
    setIsSaving(true); setConfirmError("");
    try {
      if (!user?.id_profile) throw new Error(t(`${e}.errorLoad`));
      const payload = {};
      if (formData.password.trim()) payload.password = formData.password;
      if ((formData.keyword ?? "").trim() !== (originalKeyword ?? "").trim())
        payload.keyword = formData.keyword;
      const response = await apiClient.patch(`/admin/credentials/${user.id_profile}`, payload,
        { fallbackMessage: t(`${e}.errorLoad`) });
      const updated = response?.data ?? response;
      setFormData({ password: "", password_confirm: "", keyword: updated.keyword ?? "" });
      setOriginalKeyword(updated.keyword ?? "");
      onSave?.(updated); setShowConfirm(false); onClose?.();
    } catch (err) {
      setConfirmError(err?.message || t(`${e}.errorLoad`));
    } finally {
      setIsSaving(false);
    }
  };

  const subtitle = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();
  const confirmHint = passwordMismatch ? t(`${e}.mismatch`) : passwordOk ? t(`${e}.match`) : null;
  const confirmHintType = passwordMismatch ? "error" : "success";
  const saveDisabled = isSaving || isLoading || (passwordFilled && !passwordsMatch);

  return (
    <>
      {createPortal(
        <div className="edicion-modal-overlay"
          onClick={(ev) => ev.target === ev.currentTarget && !isSaving && onClose?.()}>
          <div className="edicion-modal edicion-modal--credenciales">

            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <KeyRound size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">{t(`${e}.title`)}</h2>
                  <p className="edicion-modal__subtitle">{subtitle}</p>
                </div>
              </div>
              <button className="edicion-modal__close" onClick={onClose}
                aria-label={t("adminEdicion.common.close")} disabled={isSaving}>
                <X size={16} />
              </button>
            </div>

            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>{t(`${e}.loadingMsg`)}</span>
                </div>
              )}
              {error && !isLoading && <div className="edicion-modal__error">{error}</div>}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">
                  <PasswordField fieldKey="password" label={t(`${e}.newPasswordLabel`)}
                    placeholder={t(`${e}.newPasswordPh`)} value={formData.password}
                    visible={show.password} onChange={handleChange} onToggle={toggleShow} />

                  {passwordFilled && (
                    <PasswordField fieldKey="password_confirm" label={t(`${e}.confirmLabel`)}
                      placeholder={t(`${e}.confirmPh`)} value={formData.password_confirm}
                      visible={show.password_confirm} onChange={handleChange} onToggle={toggleShow}
                      hasError={passwordMismatch} hasSuccess={passwordOk}
                      hint={confirmHint} hintType={confirmHintType} />
                  )}

                  {passwordFilled && <div className="edicion-modal__divider" />}

                  <PasswordField fieldKey="keyword" label={t(`${e}.keywordLabel`)}
                    placeholder={t(`${e}.keywordPh`)} value={formData.keyword}
                    visible={show.keyword} onChange={handleChange} onToggle={toggleShow} />

                  <p className="edicion-modal__note">{t(`${e}.note`)}</p>
                </div>
              )}
            </div>

            <div className="edicion-modal__footer">
              <button className="edicion-modal__btn-cancel" onClick={onClose} disabled={isSaving}>
                <X size={13} /> {t("adminEdicion.common.close")}
              </button>
              <button className="edicion-modal__btn-save" onClick={handleSaveClick}
                disabled={saveDisabled}
                title={passwordFilled && !passwordsMatch ? t(`${e}.mismatch`) : undefined}>
                {isSaving ? (
                  <><Loader2 size={13} className="edicion-modal__spinner" /> {t("adminEdicion.common.saving")}</>
                ) : (
                  <><Save size={13} /> {t("adminEdicion.common.save")}</>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <EdicionConfirmModal
        isOpen={showConfirm} isBusy={isSaving}
        entidad={t(`${e}.confirmEntity`)} accion="actualizar"
        resumen={buildResumen()} error={confirmError}
        confirmLabel={t(`${e}.confirmLabel2`)} busyLabel={t(`${e}.confirmBusy`)}
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}