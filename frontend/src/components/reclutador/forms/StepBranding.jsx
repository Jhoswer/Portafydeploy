import { useState } from "react";
import { ImageUp, X } from "lucide-react";
import { StepWrapper, IconCircle, FieldError, OptionalBadge, Actions } from "./Formui";
import ImageCropPicker from "../../ui/ImageCropPicker";

export default function StepBranding({
  logo, setLogo,
  logoPreview, setLogoPreview,
  logoName, setLogoName,
  logoError, setLogoError,
  onNext, onBack,
}) {
  const [cropOpen, setCropOpen] = useState(false);

  const handleCrop = (dataUrl) => {
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "logo.png", { type: "image/png" });
        setLogo(file);
        setLogoName("logo.png");
        setLogoPreview(dataUrl);
        setLogoError("");
        setCropOpen(false);
      });
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setLogoName("");
    setLogoError("");
  };

  return (
    <StepWrapper stepKey="paso-branding">
      <IconCircle>
        <ImageUp size={24} color="#fff" />
      </IconCircle>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        Branding
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
        Sube el logo para que los candidatos reconozcan tu empresa.
        <OptionalBadge />
      </p>

      {/* ── Vista previa ── */}
      {logoPreview ? (
        <div style={{ width: "100%", textAlign: "center", marginBottom: 12 }}>
          <img
            src={logoPreview}
            alt="Logo preview"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: 16,
              border: "1.5px solid rgba(162,214,249,.35)",
              display: "block",
              margin: "0 auto 10px",
            }}
          />
          <p className="forms-avatar-hint">{logoName}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <button
              type="button"
              onClick={() => setCropOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--color-muted-text)",
                fontFamily: "var(--font-ui)", fontWeight: 600,
              }}
            >
              <ImageUp size={12} /> Cambiar
            </button>
            <button
              type="button"
              onClick={removeLogo}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "#e24b4a",
                fontFamily: "var(--font-ui)", fontWeight: 600,
              }}
            >
              <X size={12} /> Quitar
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onClick={() => setCropOpen(true)}
          style={{
            width: "100%",
            borderRadius: 14,
            marginBottom: 12,
            border: "1.5px dashed rgba(162,214,249,.50)",
            background: "rgba(162,214,249,.05)",
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color .2s, background .2s",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(162,214,249,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <ImageUp size={22} color="var(--color-muted-text)" />
          </div>
          <p style={{
            fontSize: 13, color: "var(--color-text)",
            fontFamily: "var(--font-ui)", fontWeight: 600, marginBottom: 4,
          }}>
            Sube tu logo
          </p>
          <p style={{ fontSize: 12, color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}>
            PNG, JPG · Máximo 5 MB
          </p>
        </div>
      )}

      {logoError && <FieldError msg={logoError} />}

      <ImageCropPicker
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onCrop={handleCrop}
        outputSize={400}
        maxFileMB={5}
        accept="image/png,image/jpeg"
        shape="square"
      />

      <Actions onNext={onNext} nextLabel="Continuar" onBack={onBack} backLabel="Volver" />
    </StepWrapper>
  );
}