import { useState } from "react";
import { motion } from "framer-motion";
import { X, Video, MapPin, Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function InterviewModal({ postulant, onConfirm, onCancel }) {
  const [type, setType]       = useState("virtual");
  const [link, setLink]       = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("");

  const handleConfirm = () => {
    if (type === "virtual" && !link.trim()) {
      toast.error("Añade el enlace de la entrevista virtual");
      return;
    }
    if (type === "presencial" && !address.trim()) {
      toast.error("Añade la dirección de la entrevista");
      return;
    }
    onConfirm({
    type,
    link: type === "virtual" ? link.trim() : null,
    address: type === "presencial" ? address.trim() : null,
    interview_date: date,
    interview_time: time,
    });
  };

  return (
    <div className="profile-overlay" onClick={onCancel}>
      <motion.div
        className="profile-modal"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="profile-modal__header">
          <div>
            <h2 className="profile-modal__name">Agendar entrevista</h2>
            <p className="profile-modal__career">{postulant.name}</p>
          </div>
          <button className="profile-modal__close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="profile-modal__body" style={{ gap: 16 }}>
          {/* Tipo */}
          <div className="profile-section">
            <p className="profile-section__label">Tipo de entrevista</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["virtual", "presencial"].map((t) => (
                <button
                  key={t}
                  className={`profile-state-btn${type === t ? " profile-state-btn--active" : ""}`}
                  style={type === t ? {
                    background: "rgba(99,102,241,0.1)",
                    border: "1.5px solid #6366f1",
                    color: "#6366f1",
                  } : {}}
                  onClick={() => setType(t)}
                >
                  {t === "virtual" ? <Video size={13} /> : <Building2 size={13} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="profile-section">
            <p className="profile-section__label">Fecha y hora</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="pc-search__input" style={{ flex: 1 }} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="pc-search__input" style={{ flex: 1 }} />
            </div>
          </div>

          {/* Campo dinámico según tipo */}
          {type === "virtual" ? (
            <div className="profile-section">
              <p className="profile-section__label">Enlace de la reunión</p>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="pc-search__input"
                style={{ width: "100%" }}
              />
            </div>
          ) : (
            <div className="profile-section">
              <p className="profile-section__label">Dirección</p>
              <input
                type="text"
                placeholder="Av. Ejemplo 123, Cochabamba"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pc-search__input"
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
            <button className="profile-state-btn" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="profile-state-btn profile-state-btn--active"
              style={{ background: "rgba(16,185,129,0.1)", border: "1.5px solid #10b981", color: "#10b981" }}
              onClick={handleConfirm}
            >
              <CheckCircle size={13} /> Confirmar entrevista
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}