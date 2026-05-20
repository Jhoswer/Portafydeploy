import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

import { formatCvDate } from "../../../features/dashboard-cv/cvUtils";
import { cvUi as s } from "../../../styles/components/dashboard/cvStyles";

export default function CvCard({ cv, onToggleVisible, onConfirmDelete, navigate }) {
  return (
    <div style={s.card}>
      <div style={s.cardPreview(cv.template)}>
        <div style={s.cardPreviewLines}>
          <div style={s.previewLine("55%", 0.9)} />
          <div style={s.previewLine("38%", 0.5)} />
          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={s.previewLine("90%", 0.25)} />
            <div style={s.previewLine("75%", 0.25)} />
          </div>
        </div>
        <div style={s.cardBadge}>
          <Sparkles size={9} /> Generado
        </div>
      </div>
      <div style={s.cardBody}>
        <div style={s.cardName}>{cv.name_cv}</div>
        {cv.description && <div style={s.cardDesc}>{cv.description}</div>}
        <div style={s.cardMeta}>
          <Clock size={11} />
          Actualizado {formatCvDate(cv.updated_at)}
        </div>
      </div>
      <div style={s.cardFooter}>
        <div style={s.visibleBadge(cv.visible)}>
          {cv.visible ? (
            <>
              <CheckCircle2 size={10} /> Visible
            </>
          ) : (
            <>
              <EyeOff size={10} /> Oculto
            </>
          )}
        </div>
        <div style={s.iconGroup}>
          <button
            type="button"
            style={s.iconBtn}
            title={cv.visible ? "Ocultar" : "Hacer visible"}
            onClick={() => onToggleVisible(cv.id_cv)}
          >
            {cv.visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            type="button"
            style={s.iconBtn}
            title="Editar"
            onClick={() => navigate(`/dashboard/cv/editor?id=${cv.id_cv}`)}
          >
            <Pencil size={13} />
          </button>
          <button type="button" style={s.iconBtn} title="Descargar PDF">
            <Download size={13} />
          </button>
          <button
            type="button"
            style={{
              ...s.iconBtn,
              color: "#ef5759",
              borderColor: "rgba(239,87,89,.18)",
            }}
            title="Eliminar"
            onClick={() => onConfirmDelete(cv.id_cv)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
