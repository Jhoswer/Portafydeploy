import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  MapPin, GraduationCap, Camera, FileText, Briefcase,
  CheckCircle2, ArrowLeft, Plus, X, BookOpen
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { completarPerfil, fetchProfile, guardarFormacion } from "../../services/authService";
import { LATIN_AMERICA_LOCATIONS, getCitiesForCountry } from "../../data/locations/latinAmericaLocations";
void motion;


function StepWrapper({ children, stepKey }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

function IconCircle({ children }) {
  return (
    <div className="forms-icon-circle">
      {children}
    </div>
  );
}

function Actions({ onNext, nextLabel, onBack, backLabel, onSkip, skipLabel, loading }) {
  return (
    <div className="forms-actions">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="forms-back-btn"
        >
          <ArrowLeft size={13} /> {backLabel}
        </button>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={loading}
        className="forms-submit"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }}
          />
        ) : nextLabel}
      </motion.button>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="forms-skip-btn"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

export default function Forms() {
  const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { markProfileCompleted, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const previousPadding = document.body.style.paddingTop;
    document.body.style.paddingTop = "0px";
    return () => {
      document.body.style.paddingTop = previousPadding;
    };
  }, []);

  const [step, setStep] = useState(0);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [biografia, setBiografia] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formaciones, setFormaciones] = useState([]);
  const [mostrarFormFormacion, setMostrarFormFormacion] = useState(false);
  const [formacionActual, setFormacionActual] = useState({
    tipo_formacion: "",
    institucion: "",
    nombre_carrera: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setNombre(user.nombre || user.name || "");
      setApellido(user.apellido || user.lastName || "");
      if (user.foto_perfil) setFotoPreview(user.foto_perfil);
    }
  }, []);

  useEffect(() => {
    if (!pais) {
      setCiudad("");
      return;
    }
    const ciudadesPermitidas = getCitiesForCountry(pais);
    if (ciudad && !ciudadesPermitidas.includes(ciudad)) setCiudad("");
  }, [pais, ciudad]);

  const STEPS = [
    { label: t("forms.steps.photo") },
    { label: t("forms.steps.bio") },
    { label: t("forms.steps.formation") },
    { label: t("forms.steps.location") },
  ];

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setFoto(null);
      setFotoPreview(null);
      setError("La foto de perfil no puede superar los 2 MB.");
      e.target.value = "";
      return;
    }
    setError("");
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const agregarFormacion = () => {
    if (!formacionActual.institucion || !formacionActual.nombre_carrera) return;
    setFormaciones([...formaciones, formacionActual]);
    setFormacionActual({ tipo_formacion: "", institucion: "", nombre_carrera: "", fecha_inicio: "", fecha_fin: "" });
    setMostrarFormFormacion(false);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (nombre)   formData.append("nombre", nombre);
      if (apellido) formData.append("apellido", apellido);
      if (foto)     formData.append("foto_perfil", foto);
      if (biografia) formData.append("biografia", biografia);
      const ubicacion = [ciudad, pais].filter(Boolean).join(", ");
      if (ubicacion) formData.append("ubicacion", ubicacion);
      if (ciudad)   formData.append("ciudad", ciudad);
      if (pais)     formData.append("pais", pais);
      await completarPerfil(formData);

      for (const f of formaciones) {
        await guardarFormacion(f);
      }

      try {
        const profile = await fetchProfile();
        updateUser((current) => ({
          ...current,
          ...profile,
          perfil_completado: Boolean(profile?.perfil_completado),
        }));
      } catch {
        markProfileCompleted();
      }

      setStep(4);
      window.setTimeout(() => navigate("/feed"), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="forms-progress">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={[
            "forms-progress__segment",
            i < step  ? "forms-progress__segment--done"
            : i === step ? "forms-progress__segment--active"
            : "forms-progress__segment--pending",
          ].join(" ")}
        />
      ))}
    </div>
  );

  return (
    <div className="forms-page">
      <div className="forms-bg" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}
      >
        <div className="forms-card" style={{ padding: "40px 40px 36px" }}>

          {step < 4 && <ProgressBar />}

          <AnimatePresence>

            {/* PASO 1 — Foto */}
            {step === 0 && (
              <StepWrapper stepKey="paso-foto">
                <IconCircle><Camera size={24} color="white" /></IconCircle>

                <h2 className="forms-card__title" style={{ textAlign: "center" }}>
                  {t("forms.step1.title")}
                </h2>
                <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
                  {t("forms.step1.sub")}
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="forms-avatar-btn"
                >
                  {fotoPreview
                    ? <img src={fotoPreview} alt="preview" />
                    : <Camera size={28} color="var(--color-muted-text)" />
                  }
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFoto}
                  style={{ display: "none" }}
                />

                <p className="forms-avatar-hint">
                  {fotoPreview ? t("forms.step1.tapChange") : t("forms.step1.tap")}
                </p>

                <div className="forms-field" style={{ marginTop: 20 }}>
                  <label className="forms-label">Nombre</label>
                  <div className="forms-input-wrap">
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre"
                      className="forms-input forms-input--no-icon"
                    />
                  </div>
                </div>

                <div className="forms-field" style={{ marginTop: 10 }}>
                  <label className="forms-label">Apellido</label>
                  <div className="forms-input-wrap">
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Apellido"
                      className="forms-input forms-input--no-icon"
                    />
                  </div>
                </div>

                {error && (
                  <div className="forms-alert" style={{ marginTop: 12 }}>
                    {error}
                  </div>
                )}

                <Actions
                  onNext={() => setStep(1)}
                  nextLabel={t("forms.actions.next")}
                  onSkip={() => setStep(1)}
                  skipLabel={t("forms.actions.skip")}
                />
              </StepWrapper>
            )}

            {/* PASO 2 — Biografía */}
            {step === 1 && (
              <StepWrapper stepKey="paso-bio">
                <IconCircle><FileText size={24} color="white" /></IconCircle>
                <h2 className="forms-card__title" style={{ textAlign: "center" }}>
                  {t("forms.step2.title")}
                </h2>
                <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
                  {t("forms.step2.sub")}
                </p>

                <div className="forms-field">
                  <div className="forms-input-wrap forms-input-wrap--textarea">
                    <FileText size={15} className="forms-input-icon" />
                    <textarea
                      value={biografia}
                      onChange={(e) => setBiografia(e.target.value)}
                      placeholder={t("forms.step2.placeholder")}
                      maxLength={150}
                      rows={4}
                      className="forms-input"
                    />
                  </div>
                  <p className="forms-char-count">{biografia.length} / 150</p>
                </div>

                <Actions
                  onNext={() => setStep(2)}
                  nextLabel={t("forms.actions.next")}
                  onBack={() => setStep(0)}
                  backLabel={t("forms.actions.back")}
                  onSkip={() => { setBiografia(""); setStep(2); }}
                  skipLabel={t("forms.actions.skip")}
                />
              </StepWrapper>
            )}

            {/* PASO 3 — Formación académica */}
            {step === 2 && (
              <StepWrapper stepKey="paso-formacion">
                <IconCircle><GraduationCap size={24} color="white" /></IconCircle>
                <h2 className="forms-card__title" style={{ textAlign: "center" }}>
                  {t("forms.step3.title")}
                </h2>
                <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 16 }}>
                  {t("forms.step3.sub")}
                </p>

                {formaciones.length > 0 && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {formaciones.map((f, i) => (
                      <div key={i} className="forms-formacion-item">
                        <div>
                          <p className="forms-formacion-item__name">{f.institucion}</p>
                          <p className="forms-formacion-item__sub">
                            {f.nombre_carrera}{f.tipo_formacion && ` — ${t(`forms.step3.tipos.${f.tipo_formacion}`)}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormaciones(formaciones.filter((_, idx) => idx !== i))}
                          className="forms-formacion-item__remove"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mostrarFormFormacion && (
                  <div className="forms-formacion-form" style={{ marginBottom: 12 }}>

                    <div className="forms-field">
                      <label className="forms-label">{t("forms.step3.tipoLabel")}</label>
                      <div className="forms-input-wrap">
                        <BookOpen size={15} className="forms-input-icon" />
                        <select
                          value={formacionActual.tipo_formacion}
                          onChange={(e) => setFormacionActual({ ...formacionActual, tipo_formacion: e.target.value })}
                          className="forms-input"
                        >
                          <option value="">{t("forms.step3.tipoPlaceholder")}</option>
                          {["universitaria","tecnica","posgrado","maestria","doctorado","curso","certificacion"].map(tipo => (
                            <option key={tipo} value={tipo}>{t(`forms.step3.tipos.${tipo}`)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="forms-field">
                      <label className="forms-label">{t("forms.step3.institucionLabel")}</label>
                      <div className="forms-input-wrap">
                        <GraduationCap size={15} className="forms-input-icon" />
                        <input
                          type="text"
                          value={formacionActual.institucion}
                          onChange={(e) => setFormacionActual({ ...formacionActual, institucion: e.target.value })}
                          placeholder={t("forms.step3.institucionPlaceholder")}
                          className="forms-input"
                        />
                      </div>
                    </div>

                    <div className="forms-field">
                      <label className="forms-label">{t("forms.step3.carreraLabel")}</label>
                      <div className="forms-input-wrap">
                        <Briefcase size={15} className="forms-input-icon" />
                        <input
                          type="text"
                          value={formacionActual.nombre_carrera}
                          onChange={(e) => setFormacionActual({ ...formacionActual, nombre_carrera: e.target.value })}
                          placeholder={t("forms.step3.carreraPlaceholder")}
                          className="forms-input"
                        />
                      </div>
                    </div>

                    <div className="forms-row">
                      <div className="forms-field">
                        <label className="forms-label">{t("forms.step3.fechaInicio")}</label>
                        <input
                          type="date"
                          value={formacionActual.fecha_inicio}
                          onChange={(e) => setFormacionActual({ ...formacionActual, fecha_inicio: e.target.value })}
                          className="forms-input forms-input--no-icon"
                        />
                      </div>
                      <div className="forms-field">
                        <label className="forms-label">{t("forms.step3.fechaFin")}</label>
                        <input
                          type="date"
                          value={formacionActual.fecha_fin}
                          onChange={(e) => setFormacionActual({ ...formacionActual, fecha_fin: e.target.value })}
                          className="forms-input forms-input--no-icon"
                        />
                      </div>
                    </div>

                    <div className="forms-formacion-form__actions">
                      <button
                        type="button"
                        onClick={agregarFormacion}
                        className="forms-submit"
                        style={{ flex: 1, fontSize: 13 }}
                      >
                        {t("forms.step3.agregar")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMostrarFormFormacion(false)}
                        className="forms-formacion-form__cancel"
                      >
                        {t("forms.step3.cancelar")}
                      </button>
                    </div>
                  </div>
                )}

                {!mostrarFormFormacion && (
                  <button
                    type="button"
                    onClick={() => setMostrarFormFormacion(true)}
                    className="forms-add-btn"
                  >
                    <Plus size={15} /> {t("forms.step3.btnAgregar")}
                  </button>
                )}

                <Actions
                  onNext={() => setStep(3)}
                  nextLabel={t("forms.actions.next")}
                  onBack={() => setStep(1)}
                  backLabel={t("forms.actions.back")}
                  onSkip={() => { setFormaciones([]); setStep(3); }}
                  skipLabel={t("forms.actions.skip")}
                />
              </StepWrapper>
            )}

            {/* PASO 4 — Ubicación */}
            {step === 3 && (
              <StepWrapper stepKey="paso-ubicacion">
                <IconCircle><MapPin size={24} color="white" /></IconCircle>
                <h2 className="forms-card__title" style={{ textAlign: "center" }}>
                  {t("forms.step4.title")}
                </h2>
                <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 24 }}>
                  {t("forms.step4.sub")}
                </p>

                <div className="forms-field">
                  <label className="forms-label">País</label>
                  <div className="forms-input-wrap" style={{ marginBottom: 12 }}>
                    <MapPin size={15} className="forms-input-icon" />
                    <select
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      className="forms-input"
                    >
                      <option value="">Selecciona un país</option>
                      {LATIN_AMERICA_LOCATIONS.map((item) => (
                        <option key={item.country} value={item.country}>
                          {item.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="forms-label">Ciudad</label>
                  <div className="forms-input-wrap">
                    <MapPin size={15} className="forms-input-icon" />
                    <select
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      className="forms-input"
                      disabled={!pais}
                    >
                      <option value="">
                        {!pais ? "Primero selecciona un país" : "Selecciona una ciudad"}
                      </option>
                      {getCitiesForCountry(pais).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="forms-alert" style={{ marginTop: 12 }}>{error}</div>
                )}

                <Actions
                  onNext={handleFinish}
                  nextLabel={t("forms.actions.finish")}
                  onBack={() => setStep(2)}
                  backLabel={t("forms.actions.back")}
                  onSkip={() => { setPais(""); setCiudad(""); handleFinish(); }}
                  skipLabel={t("forms.actions.skipFinish")}
                  loading={loading}
                />
              </StepWrapper>
            )}

            {/* ÉXITO */}
            {step === 4 && (
              <StepWrapper stepKey="paso-exito">
                <div className="forms-success-icon">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="forms-card__title" style={{ textAlign: "center" }}>
                  {t("forms.success.title")}
                </h2>
                <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 28 }}>
                  {t("forms.success.sub")}
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/feed")}
                  className="forms-submit"
                >
                  {t("forms.success.btn")}
                </motion.button>
              </StepWrapper>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}