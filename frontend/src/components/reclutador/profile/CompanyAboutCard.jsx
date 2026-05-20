import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "../../ui/button";
import { useAuth } from "../../../context/useAuth";
import { apiClient } from "../../../services/http/httpClient";

export function CompanyAboutCard() {
  const { company, updateCompany } = useAuth();

  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    description: company?.description ?? "",
    mission:     company?.mission     ?? "",
    vision:      company?.vision      ?? "",
  });

  const handleEdit = () => {
    setForm({
      description: company?.description ?? "",
      mission:     company?.mission     ?? "",
      vision:      company?.vision      ?? "",
    });
    setServerError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setServerError("");
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");
    try {
      const payload = new FormData();
      payload.append("_method",     "PUT");
      payload.append("description", form.description);
      payload.append("mission",     form.mission);
      payload.append("vision",      form.vision);

      const data = await apiClient.post("company", payload);
      updateCompany(data.company);
      setEditing(false);
    } catch (err) {
      setServerError(err.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="about-card">

      {/* Header */}
      <div className="about-card__header">
        <h3 className="about-card__title">Sobre la empresa</h3>

        {!editing ? (
          <button className="about-card__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> Editar
          </button>
        ) : (
          <div className="about-card__header-actions">
            <button
              className="about-card__cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={13} /> Cancelar
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={13} />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="about-card__body">

        {serverError && (
          <p className="about-card__error">{serverError}</p>
        )}

        {/* Descripción */}
        {editing ? (
          <div>
            <textarea
              className="about-card__textarea"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              maxLength={500}
              placeholder="Describe tu empresa, qué hace y cuál es su cultura..."
            />
            <p className="about-card__char-count">{form.description.length} / 500</p>
          </div>
        ) : (
          <p className="about-card__desc">
            {company?.description || "Sin descripción disponible."}
          </p>
        )}

        {/* Misión y Visión */}
        <div className="about-card__mv-grid">
          <div>
            <p className="about-card__mv-label">Misión</p>
            {editing ? (
              <div>
                <textarea
                  className="about-card__textarea"
                  value={form.mission}
                  onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  placeholder="¿Cuál es el propósito de tu empresa?"
                />
                <p className="about-card__char-count">{form.mission.length} / 500</p>
              </div>
            ) : (
              <p className="about-card__mv-text">
                {company?.mission || "No definida"}
              </p>
            )}
          </div>

          <div>
            <p className="about-card__mv-label">Visión</p>
            {editing ? (
              <div>
                <textarea
                  className="about-card__textarea"
                  value={form.vision}
                  onChange={e => setForm(f => ({ ...f, vision: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  placeholder="¿A dónde quiere llegar tu empresa?"
                />
                <p className="about-card__char-count">{form.vision.length} / 500</p>
              </div>
            ) : (
              <p className="about-card__mv-text">
                {company?.vision || "No definida"}
              </p>
            )}
          </div>
        </div>

        {/* Tags — solo lectura */}
        {!editing && (company?.industry || company?.size) && (
          <div className="about-card__tags">
            {company?.industry && (
              <span className="about-card__tag">Industria: {company.industry}</span>
            )}
            {company?.size && (
              <span className="about-card__tag">Tamaño: {company.size}</span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}