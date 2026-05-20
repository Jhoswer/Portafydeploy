// src/components/admin/components/Edicion/ModalCredenciales.jsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, KeyRound, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import EdicionConfirmModal from "./EdicionConfirmModal";
import { apiClient } from "../../../../services/http/httpClient";

/* ─────────────────────────────────────────────────────────────────
   Sub-componente: campo de contraseña con ojo
───────────────────────────────────────────────────────────────── */
function PasswordField({
  fieldKey,
  label,
  placeholder,
  value,
  visible,
  onChange,
  onToggle,
  readOnly  = false,
  hasError  = false,   // borde rojo
  hasSuccess = false,  // borde verde (coincidencia)
  hint      = null,    // mensaje bajo el campo (string | null)
  hintType  = "error", // "error" | "success"
}) {
  return (
    <div className="edicion-modal__field">
      <label className="edicion-modal__label">{label}</label>
      <div className="edicion-modal__password-wrap">
        <input
          className={[
            "edicion-modal__input edicion-modal__input--password",
            hasError   ? "edicion-modal__input--error"   : "",
            hasSuccess ? "edicion-modal__input--success"  : "",
          ].join(" ").trim()}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          maxLength={255}
          readOnly={readOnly}
        />
        <button
          type="button"
          className="edicion-modal__eye-btn"
          onClick={() => onToggle(fieldKey)}
          aria-label={visible ? "Ocultar" : "Mostrar"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {/* Mensaje de validación bajo el input */}
      {hint && (
        <span
          className={`edicion-modal__field-hint edicion-modal__field-hint--${hintType}`}
          role={hintType === "error" ? "alert" : undefined}
        >
          {hintType === "error"
            ? <AlertCircle size={12} />
            : <CheckCircle2 size={12} />}
          {hint}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Modal principal
───────────────────────────────────────────────────────────────── */
export default function ModalCredenciales({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    password:        "",
    password_confirm: "",
    keyword:         "",
  });

  const [currentHashes, setCurrentHashes] = useState({
    password_hash:     "",
    old_password_hash: "",
  });
  const [originalKeyword, setOriginalKeyword] = useState("");

  const [show, setShow] = useState({
    password:         false,
    password_confirm: false,
    keyword:          false,
  });

  const [isLoading,  setIsLoading]  = useState(true);
  const [isSaving,   setIsSaving]   = useState(false);
  const [error,      setError]      = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  /* ── Validación de contraseñas ── */
  const passwordFilled   = formData.password.trim().length > 0;
  const confirmFilled    = formData.password_confirm.trim().length > 0;
  const passwordsMatch   = formData.password === formData.password_confirm;
  const passwordMismatch = passwordFilled && confirmFilled && !passwordsMatch;
  const passwordOk       = passwordFilled && confirmFilled && passwordsMatch;

  /* ── Cargar credenciales ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!user?.id_profile) throw new Error("No se encontró el perfil seleccionado.");

        const data = await apiClient.get(`/admin/credentials/${user.id_profile}`, {
          fallbackMessage: "No se pudieron cargar las credenciales.",
        });

        setFormData({ password: "", password_confirm: "", keyword: data.keyword ?? "" });
        setOriginalKeyword(data.keyword ?? "");
        setCurrentHashes({
          password_hash:     data.password_hash     ?? "",
          old_password_hash: data.old_password_hash ?? "",
        });
      } catch (err) {
        console.error("[ModalCredenciales] Error al cargar:", err);
        setError(err?.message || "No se pudieron cargar las credenciales.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  /* ── Resumen de cambios para el modal de confirmación ── */
  const buildResumen = () => {
    const cambios = [];

    if (formData.password.trim()) {
      cambios.push({ label: "Nueva contraseña", value: "Se guardará encriptada" });
    }
    if ((formData.keyword ?? "").trim() !== (originalKeyword ?? "").trim()) {
      cambios.push({ label: "Palabra clave", value: formData.keyword.trim() || "Vacía" });
    }

    return cambios;
  };

  /* ── Click en "Guardar": validar antes de abrir el confirm ── */
  const handleSaveClick = () => {
    /* Si escribió contraseña pero no coincide con la confirmación → bloquear */
    if (passwordFilled && !passwordsMatch) return; // el hint ya muestra el error visualmente

    setConfirmError("");
    setShowConfirm(true);
  };

  /* ── Confirmar y enviar al backend ── */
  const handleConfirmedSave = async () => {
    setIsSaving(true);
    setConfirmError("");

    try {
      if (!user?.id_profile) throw new Error("No se encontró el perfil seleccionado.");

      const payload = {};
      if (formData.password.trim()) {
        payload.password = formData.password;
      }
      if ((formData.keyword ?? "").trim() !== (originalKeyword ?? "").trim()) {
        payload.keyword = formData.keyword;
      }

      const response = await apiClient.patch(
        `/admin/credentials/${user.id_profile}`,
        payload,
        { fallbackMessage: "No se pudieron guardar las credenciales." }
      );
      const updated = response?.data ?? response;

      setFormData({ password: "", password_confirm: "", keyword: updated.keyword ?? "" });
      setOriginalKeyword(updated.keyword ?? "");
      setCurrentHashes({
        password_hash:     updated.password_hash     ?? "",
        old_password_hash: updated.old_password_hash ?? "",
      });

      onSave?.(updated);
      setShowConfirm(false);
      onClose?.();
    } catch (err) {
      console.error("[ModalCredenciales] Error al guardar:", err);
      setConfirmError(err?.message || "No se pudieron guardar las credenciales.");
    } finally {
      setIsSaving(false);
    }
  };

  const subtitle = `${user?.name ?? ""} ${user?.last_name ?? ""}`.trim();

  /* ── Mensajes de hint para el campo de confirmación ── */
  const confirmHint = passwordMismatch
    ? "Las contraseñas no coinciden"
    : passwordOk
    ? "Las contraseñas coinciden"
    : null;
  const confirmHintType = passwordMismatch ? "error" : "success";

  /* ── Deshabilitar el botón Guardar si hay mismatch ── */
  const saveDisabled = isSaving || isLoading || (passwordFilled && !passwordsMatch);

  return (
    <>
      {createPortal(
        <div
          className="edicion-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && !isSaving && onClose?.()}
        >
          <div className="edicion-modal edicion-modal--credenciales">

            {/* ════════ HEADER ════════ */}
            <div className="edicion-modal__header">
              <div className="edicion-modal__header-info">
                <KeyRound size={15} className="edicion-modal__header-icon" />
                <div>
                  <h2 className="edicion-modal__title">Credenciales</h2>
                  <p className="edicion-modal__subtitle">{subtitle}</p>
                </div>
              </div>
              <button
                className="edicion-modal__close"
                onClick={onClose}
                aria-label="Cerrar"
                disabled={isSaving}
              >
                <X size={16} />
              </button>
            </div>

            {/* ════════ BODY ════════ */}
            <div className="edicion-modal__body">
              {isLoading && (
                <div className="edicion-modal__loading">
                  <Loader2 size={22} className="edicion-modal__spinner" />
                  <span>Cargando credenciales…</span>
                </div>
              )}

              {error && !isLoading && (
                <div className="edicion-modal__error">{error}</div>
              )}

              {!isLoading && !error && (
                <div className="edicion-modal__fields">

                  {/* Nueva contraseña */}
                  <PasswordField
                    fieldKey="password"
                    label="Nueva contraseña"
                    placeholder="Dejar vacío para no cambiarla"
                    value={formData.password}
                    visible={show.password}
                    onChange={handleChange}
                    onToggle={toggleShow}
                  />

                  {/* Repetir contraseña — solo visible si se escribió algo */}
                  {passwordFilled && (
                    <PasswordField
                      fieldKey="password_confirm"
                      label="Repetir contraseña"
                      placeholder="Repite la nueva contraseña"
                      value={formData.password_confirm}
                      visible={show.password_confirm}
                      onChange={handleChange}
                      onToggle={toggleShow}
                      hasError={passwordMismatch}
                      hasSuccess={passwordOk}
                      hint={confirmHint}
                      hintType={confirmHintType}
                    />
                  )}

                  {/* Separador visual cuando hay ambos campos */}
                  {passwordFilled && <div className="edicion-modal__divider" />}

                  {/* Palabra clave de recuperación */}
                  <PasswordField
                    fieldKey="keyword"
                    label="Palabra clave de recuperación"
                    placeholder="Keyword de recuperación"
                    value={formData.keyword}
                    visible={show.keyword}
                    onChange={handleChange}
                    onToggle={toggleShow}
                  />

                  <p className="edicion-modal__note">
                    La nueva contraseña se guardará hasheada. Dejar el campo
                    vacío para no modificarla. La palabra clave se guarda como
                    texto normal.
                  </p>
                </div>
              )}
            </div>

            {/* ════════ FOOTER ════════ */}
            <div className="edicion-modal__footer">
              <button
                className="edicion-modal__btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                <X size={13} />
                Cerrar
              </button>
              <button
                className="edicion-modal__btn-save"
                onClick={handleSaveClick}
                disabled={saveDisabled}
                title={
                  passwordFilled && !passwordsMatch
                    ? "Las contraseñas no coinciden"
                    : undefined
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="edicion-modal__spinner" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    Guardar
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ════════ MODAL DE CONFIRMACIÓN ════════ */}
      <EdicionConfirmModal
        isOpen={showConfirm}
        isBusy={isSaving}
        entidad="Credenciales"
        accion="actualizar"
        resumen={buildResumen()}
        error={confirmError}
        confirmLabel="Guardar credenciales"
        busyLabel="Guardando credenciales…"
        onClose={() => !isSaving && setShowConfirm(false)}
        onConfirm={handleConfirmedSave}
      />
    </>
  );
}