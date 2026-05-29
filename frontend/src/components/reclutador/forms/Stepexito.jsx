import { useTranslation, Trans } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { StepWrapper } from "./Formui";

export default function StepExito({ empresa, onNavigate }) {
  const { t } = useTranslation();

  return (
    <StepWrapper stepKey="paso-exito">
      <div className="forms-success-icon">
        <CheckCircle2 size={32} />
      </div>

      <h2 className="forms-card__title" style={{ textAlign: "center" }}>
        {t("recruiterForms.stepExito.title")}
      </h2>
      <p className="forms-card__sub" style={{ textAlign: "center", marginBottom: 28 }}>
        <Trans
          i18nKey="recruiterForms.stepExito.subtitle"
          values={{ empresa }}
          components={{ strong: <strong /> }}
        />
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNavigate}
        className="forms-submit"
      >
        {t("recruiterForms.stepExito.cta")}
      </motion.button>
    </StepWrapper>
  );
}