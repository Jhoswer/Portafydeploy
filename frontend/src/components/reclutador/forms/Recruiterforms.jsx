import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { registrarEmpresa } from "../../../services/companyService";
import { validateStep }     from "./validation";
import { STEPS }            from "./constants";
import { ProgressBar, StepLabels } from "./Formui";
import { useAuth } from "../../../context/useAuth";

import StepIdentidad from "./StepIdentidad";
import StepBranding  from "./StepBranding";
import StepEmpresa   from "./StepEmpresa";
import StepContacto  from "./StepContacto";
import StepExito     from "./Stepexito";

export default function RecruiterForms() {
  const navigate = useNavigate();
  const { markProfileCompleted } = useAuth();

  /* ── Navegación ─────────────────────────────────────────── */
  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");

  /* ── Campos paso 0 — Identidad ──────────────────────────── */
  const [empresa, setEmpresa]         = useState("");
  const [descripcion, setDescripcion] = useState("");

  /* ── Campos paso 1 — Branding ───────────────────────────── */
  const [logo, setLogo]               = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoName, setLogoName]       = useState("");
  const [logoError, setLogoError]     = useState("");
  const [dragOver, setDragOver]       = useState(false);

  /* ── Campos paso 2 — Empresa ────────────────────────────── */
  const [rubro, setRubro]             = useState("");
  const [rubroSugs, setRubroSugs]     = useState([]);
  const [ciudad, setCiudad]           = useState("");
  const [pais, setPais]               = useState("");

  /* ── Campos paso 3 — Contacto ───────────────────────────── */
  const [prefijo, setPrefijo]         = useState("+591");
  const [telefono, setTelefono]       = useState("");
  const [sitio, setSitio]             = useState("");

  /* ── Handlers ───────────────────────────────────────────── */
  const goNext = async () => {
    const data = { empresa, descripcion, rubro, ciudad, pais, telefono, sitio };
    const errs = validateStep(step, data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    await handleFinish();
  };

  const goBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleFinish = async () => {
    setLoading(true);
    setServerError("");
    try {
      await registrarEmpresa({ empresa, descripcion, rubro, ciudad, pais, prefijo, telefono, sitio, logo });
      markProfileCompleted();
      setStep(STEPS.length);
      window.setTimeout(() => navigate("/feed"), 1200);
    } catch (err) {
      setServerError(err.message || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="forms-page">
      <div className="forms-bg" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}
      >
        <div className="forms-card" style={{ padding: "36px 40px 32px" }}>

          {step < STEPS.length && (
            <>
              <ProgressBar steps={STEPS} currentStep={step} />
              <StepLabels  steps={STEPS} currentStep={step} />
            </>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepIdentidad
                empresa={empresa}         setEmpresa={setEmpresa}
                descripcion={descripcion} setDescripcion={setDescripcion}
                errors={errors}
                onNext={goNext}
              />
            )}

            {step === 1 && (
              <StepBranding
                logo={logo}               setLogo={setLogo}
                logoPreview={logoPreview} setLogoPreview={setLogoPreview}
                logoName={logoName}       setLogoName={setLogoName}
                logoError={logoError}     setLogoError={setLogoError}
                dragOver={dragOver}       setDragOver={setDragOver}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {step === 2 && (
              <StepEmpresa
                rubro={rubro}           setRubro={setRubro}
                rubroSugs={rubroSugs}   setRubroSugs={setRubroSugs}
                ciudad={ciudad}         setCiudad={setCiudad}
                pais={pais}             setPais={setPais}
                errors={errors}         setErrors={setErrors}
                onNext={goNext}
                onBack={goBack}
              />
            )}

            {step === 3 && (
              <StepContacto
                prefijo={prefijo}       setPrefijo={setPrefijo}
                telefono={telefono}     setTelefono={setTelefono}
                sitio={sitio}           setSitio={setSitio}
                errors={errors}
                serverError={serverError}
                onNext={goNext}
                onBack={goBack}
                loading={loading}
              />
            )}

            {step === STEPS.length && (
              <StepExito
                empresa={empresa}
                onNavigate={() => navigate("/feed")}
              />
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}