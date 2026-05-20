/* ============================================================
   src/components/recruiter/forms/StepExito.jsx
   ============================================================ */

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { StepWrapper } from "./Formui";

export default function StepExito({ empresa, onNavigate }) {
  return (
    <StepWrapper stepKey="paso-exito">
      <div className="auth-success-icon" style={{ width: 72, height: 72 }}>
        <CheckCircle2 size={32} />
      </div>
      <h2 className="auth-card__title" style={{ textAlign: "center" }}>
        ¡Perfil creado exitosamente!
      </h2>
      <p className="auth-card__sub" style={{ textAlign: "center", marginBottom: 28 }}>
        Tu empresa <strong>{empresa}</strong> ya está registrada.
        Ahora puedes publicar ofertas y encontrar candidatos.
      </p>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNavigate}
        className="auth-submit"
        style={{ marginTop: 0 }}
      >
        Ir al panel
      </motion.button>
    </StepWrapper>
  );
}