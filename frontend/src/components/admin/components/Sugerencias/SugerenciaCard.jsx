import { useState } from "react";
import { Eye, Trash2, XCircle } from "lucide-react";
import SugerenciaOpen from "./SugerenciaOpen";
import SugerenciaDeleteModal from "./SugerenciaDeleteModal";
import "../../../../styles/components/admin/components/Sugerencias/SugerenciaCard.css";

/**
 * Avatar del usuario: muestra foto de perfil si existe,
 * si no, muestra las iniciales con el color del tipo de sugerencia.
 */
function PostulantAvatar({ photo, initials, avatarClass }) {
  const [imgError, setImgError] = useState(false);

  if (photo && !imgError) {
    return (
      <div className="sug-card__avatar sug-card__avatar--photo">
        <img
          src={photo}
          alt={initials}
          className="sug-card__avatar-img"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`sug-card__avatar ${avatarClass}`}>
      {initials}
    </div>
  );
}

export default function SugerenciaCard({
  sugerencia,
  onAccept,
  onReject,
  onDelete,
  onIgnore,
  onDiscuss,
  onEscalate,
  actionBusy,
}) {
  const [modalOpen,        setModalOpen]        = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [deleteNote,       setDeleteNote]       = useState("");
  const [ignoreBusy,       setIgnoreBusy]       = useState(false);

  const { meta, postulant, description, formattedDate } = sugerencia;

  const isIgnoring =
    ignoreBusy ||
    (actionBusy?.sugerenciaId === sugerencia.id && actionBusy?.type === "ignore");

  async function handleIgnore(item, note = null) {
    setIgnoreBusy(true);
    try {
      const handled = await onIgnore?.(item, note);
      if (handled) setModalOpen(false);
    } finally {
      setIgnoreBusy(false);
    }
  }

  function handleDelete(item) {
    // Abre el modal de confirmación de eliminación
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    const ok = await onDelete?.(sugerencia, deleteNote);
    if (ok) {
      setShowDeleteModal(false);
      setDeleteNote("");
      setModalOpen(false);
    }
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setDeleteNote("");
  }

  async function handleAccept(item, note = null) {
    const ok = await onAccept?.(item, note);
    if (ok) setModalOpen(false);
  }

  async function handleReject(item, note = null) {
    const ok = await onReject?.(item, note);
    if (ok) setModalOpen(false);
  }

  async function handleDiscuss(item, note = null) {
    const ok = await onDiscuss?.(item, note);
    if (ok) setModalOpen(false);
  }

  async function handleEscalate(item, note = null) {
    const ok = await onEscalate?.(item, note);
    if (ok) setModalOpen(false);
  }

  return (
    <>
      <div className="sug-card">

        {/* ── Avatar: foto o iniciales ── */}
        <PostulantAvatar
          photo={postulant.photo}
          initials={postulant.initials}
          avatarClass={meta.avatarClass}
        />

        {/* ── Cuerpo ── */}
        <div className="sug-card__body">

          <div className="sug-card__header">
            <span className="sug-card__name">{postulant.name}</span>
            <span className={`rp-badge ${meta.badgeClass}`}>{meta.badge}</span>
          </div>

          <p className="sug-card__meta">{formattedDate}</p>
          <p className="sug-card__desc">{description}</p>

          <div className="sug-card__actions">
            <button
              className="rp-btn rp-btn--open"
              onClick={() => setModalOpen(true)}
            >
              <Eye size={14} /> Abrir
            </button>

            <button
              className="rp-btn rp-btn--ignore"
              onClick={() => handleIgnore(sugerencia)}
              disabled={isIgnoring}
            >
              <XCircle size={14} />
              {isIgnoring ? "Procesando..." : "Ignorar"}
            </button>

            <button
              className="rp-btn rp-btn--delete"
              onClick={() => handleDelete(sugerencia)}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <SugerenciaOpen
          sugerencia={sugerencia}
          onClose={() => setModalOpen(false)}
          onAccept={handleAccept}
          onReject={handleReject}
          onDiscuss={handleDiscuss}
          onEscalate={handleEscalate}
          onIgnore={handleIgnore}
          actionBusy={actionBusy}
        />
      )}

      {/* ══════════════════════════════════════
          MODAL DE ELIMINACIÓN (Rechazo)
      ══════════════════════════════════════ */}
      <SugerenciaDeleteModal
        sugerencia={sugerencia}
        isOpen={showDeleteModal}
        isBusy={actionBusy?.sugerenciaId === sugerencia.id && actionBusy?.type === "delete"}
        error=""
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}