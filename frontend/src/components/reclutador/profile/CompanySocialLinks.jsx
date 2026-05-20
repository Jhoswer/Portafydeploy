/* ============================================================
   src/components/company/CompanySocialLinks.jsx
   Card de redes sociales con edición inline.
   Guarda via apiClient igual que CompanyHeader.
   ============================================================ */

import { useState } from "react";
import {
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube,
  Pencil, Check, X, Plus, ExternalLink, Link2,
} from "lucide-react";
import { Button } from "../../ui/button";
import { useAuth } from "../../../context/useAuth";
import { apiClient } from "../../../services/http/httpClient";

/* ── Config de redes ────────────────────────────────────────── */
const REDES = [
  {
    key:         "linkedin",
    label:       "LinkedIn",
    Icon:        Linkedin,
    color:       "#0A66C2",
    placeholder: "https://linkedin.com/company/nombre",
    prefix:      "linkedin.com/company/",
  },
  {
    key:         "twitter",
    label:       "Twitter / X",
    Icon:        Twitter,
    color:       "#000000",
    placeholder: "https://twitter.com/empresa",
    prefix:      "twitter.com/",
  },
  {
    key:         "github",
    label:       "GitHub",
    Icon:        Github,
    color:       "#24292F",
    placeholder: "https://github.com/empresa",
    prefix:      "github.com/",
  },
  {
    key:         "instagram",
    label:       "Instagram",
    Icon:        Instagram,
    color:       "#E1306C",
    placeholder: "https://instagram.com/empresa",
    prefix:      "instagram.com/",
  },
  {
    key:         "facebook",
    label:       "Facebook",
    Icon:        Facebook,
    color:       "#1877F2",
    placeholder: "https://facebook.com/empresa",
    prefix:      "facebook.com/",
  },
  {
    key:         "youtube",
    label:       "YouTube",
    Icon:        Youtube,
    color:       "#FF0000",
    placeholder: "https://youtube.com/@empresa",
    prefix:      "youtube.com/@",
  },
];

/* ── Helpers ────────────────────────────────────────────────── */
function isValidUrl(url) {
  if (!url) return true; // vacío es válido (significa "quitar")
  try { new URL(url); return true; } catch { return false; }
}

function shortLabel(url, prefix) {
  if (!url) return null;
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(prefix, "") || url;
}

/* ── Componente ─────────────────────────────────────────────── */
export function CompanySocialLinks() {
  const { company, updateCompany } = useAuth();

  const initialLinks = () =>
    Object.fromEntries(REDES.map(r => [r.key, company?.[`social_${r.key}`] ?? ""]));

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState(initialLinks);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [serverError, setServerError] = useState("");

  /* Links activos (con URL) */
  const activeLinks = REDES.filter(r => company?.[`social_${r.key}`]);

  const handleEdit = () => {
    setForm(initialLinks());
    setErrors({});
    setServerError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setServerError("");
  };

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    REDES.forEach(r => {
      if (form[r.key] && !isValidUrl(form[r.key]))
        errs[r.key] = "URL inválida";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setServerError("");
    try {
      const payload = new FormData();
      payload.append("_method", "PUT");
      REDES.forEach(r => payload.append(`social_${r.key}`, form[r.key] ?? ""));

      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Redes sociales</h3>
        </div>
        {!editing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            {activeLinks.length === 0 ? "Agregar" : "Editar"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs">
              <Check className="w-3.5 h-3.5 mr-1" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="px-5 py-4">

        {/* Error servidor */}
        {serverError && (
          <p className="text-xs text-red-500 mb-3">{serverError}</p>
        )}

        {/* Modo lectura */}
        {!editing && (
          <>
            {activeLinks.length === 0 ? (
              <button
                onClick={handleEdit}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-all group"
              >
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Agrega tus redes sociales
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {activeLinks.map(({ key, label, Icon, color, prefix }) => {
                  const url = company?.[`social_${key}`];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {shortLabel(url, prefix)}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modo edición */}
        {editing && (
          <div className="flex flex-col gap-3">
            {REDES.map(({ key, label, Icon, color, placeholder }) => (
              <div key={key}>
                <div className="flex items-center gap-3">
                  {/* Ícono */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>

                  {/* Input */}
                  <div className="flex-1">
                    <input
                      type="url"
                      value={form[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full text-xs bg-muted/40 border rounded-lg px-3 py-2 outline-none transition-all
                        placeholder:text-muted-foreground/50
                        focus:bg-background focus:ring-2
                        ${errors[key]
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-border focus:border-primary/50 focus:ring-primary/10"
                        }`}
                    />
                  </div>

                  {/* Quitar */}
                  {form[key] && (
                    <button
                      type="button"
                      onClick={() => handleChange(key, "")}
                      className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {errors[key] && (
                  <p className="text-xs text-red-400 mt-1 ml-11">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}