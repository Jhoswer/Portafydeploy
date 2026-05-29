import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Video, Building2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function InterviewModal({ postulant, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [type,    setType]    = useState("virtual");
  const [link,    setLink]    = useState("");
  const [address, setAddress] = useState("");
  const [date,    setDate]    = useState("");
  const [time,    setTime]    = useState("");

  const handleConfirm = () => {
    if (type === "virtual" && !link.trim()) {
      toast.error(t("interviewModal.errorLink"));
      return;
    }
    if (type === "presencial" && !address.trim()) {
      toast.error(t("interviewModal.errorAddress"));
      return;
    }
    onConfirm({
      type,
      link:           type === "virtual"   ? link.trim()    : null,
      address:        type === "presencial" ? address.trim() : null,
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
            <h2 className="profile-modal__name">{t("interviewModal.title")}</h2>
            <p className="profile-modal__career">{postulant.name}</p>
          </div>
          <button className="profile-modal__close" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="profile-modal__body" style={{ gap: 16 }}>

          {/* Tipo */}
          <div className="profile-section">
            <p className="profile-section__label">{t("interviewModal.typeLabel")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["virtual", "presencial"].map((opt) => (
                <button
                  key={opt}
                  className={`profile-state-btn${type === opt ? " profile-state-btn--active" : ""}`}
                  style={type === opt ? {
                    background: "rgba(99,102,241,0.1)",
                    border: "1.5px solid #6366f1",
                    color: "#6366f1",
                  } : {}}
                  onClick={() => setType(opt)}
                >
                  {opt === "virtual" ? <Video size={13} /> : <Building2 size={13} />}
                  {t(`interviewModal.${opt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="profile-section">
            <p className="profile-section__label">{t("interviewModal.dateTime")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="pc-search__input" style={{ flex: 1 }} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="pc-search__input" style={{ flex: 1 }} />
            </div>
          </div>

          {/* Campo dinámico */}
          {type === "virtual" ? (
            <div className="profile-section">
              <p className="profile-section__label">{t("interviewModal.linkLabel")}</p>
              <input
                type="url"
                placeholder={t("interviewModal.linkPlaceholder")}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="pc-search__input"
                style={{ width: "100%" }}
              />
            </div>
          ) : (
            <div className="profile-section">
              <p className="profile-section__label">{t("interviewModal.addressLabel")}</p>
              <input
                type="text"
                placeholder={t("interviewModal.addressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pc-search__input"
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
            <button className="profile-state-btn" onClick={onCancel}>
              {t("interviewModal.cancel")}
            </button>
            <button
              className="profile-state-btn profile-state-btn--active"
              style={{ background: "rgba(16,185,129,0.1)", border: "1.5px solid #10b981", color: "#10b981" }}
              onClick={handleConfirm}
            >
              <CheckCircle size={13} /> {t("interviewModal.confirm")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}