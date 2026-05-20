import { useState } from "react";
import { Button } from "../../ui/button";
import { Mail, Phone, Globe, MapPin, Pencil, X, Check } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { apiClient } from "../../../services/http/httpClient";

export function CompanyContactCard({ social = [] }) {
  const { user, company, updateCompany } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    email: user?.email ?? "",
    phone_prefix: company?.phone_prefix ?? "+591",
    phone: company?.phone ?? "",
    website: company?.website ?? "",
    city: company?.city ?? "",
  });

  const displayPhone =
    form.phone_prefix && form.phone
      ? `${form.phone_prefix} ${form.phone}`
      : form.phone || "";

  const websiteUrl = form.website?.startsWith("http")
    ? form.website
    : `https://${form.website}`;

  const handleEdit = () => {
    setForm({
      email: user?.email ?? "",
      phone_prefix: company?.phone_prefix ?? "+591",
      phone: company?.phone ?? "",
      website: company?.website ?? "",
      city: company?.city ?? "",
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
      payload.append("_method", "PUT");
      payload.append("phone_prefix", form.phone_prefix);
      payload.append("phone", form.phone);
      payload.append("website", form.website);
      payload.append("city", form.city);

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
    <div className="contact-card">
      {/* Header */}
      <div className="contact-card__header">
        <h3 className="contact-card__title">Contacto y redes</h3>

        {!editing ? (
          <button className="contact-card__edit-btn" onClick={handleEdit}>
            <Pencil size={13} /> Editar
          </button>
        ) : (
          <div className="contact-card__header-actions">
            <button
              className="contact-card__cancel-btn"
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
      <div className="contact-card__body">
        {serverError && (
          <p className="contact-card__error">{serverError}</p>
        )}

        <div className="contact-card__rows">
          {/* Email */}
          <div className="contact-card__row">
            <Mail size={15} className="contact-card__row-icon" />
            {form.email ? (
              <span>{form.email}</span>
            ) : (
              <span className="contact-card__empty">Sin email</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="contact-card__row">
            <Phone size={15} className="contact-card__row-icon" />
            {editing ? (
              <div className="contact-card__input-group">
                <input
                  className="contact-card__input contact-card__input--prefix"
                  value={form.phone_prefix}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone_prefix: e.target.value,
                    }))
                  }
                  placeholder="+591"
                />
                <input
                  className="contact-card__input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Teléfono"
                />
              </div>
            ) : displayPhone ? (
              <span>{displayPhone}</span>
            ) : (
              <span className="contact-card__empty">Sin teléfono</span>
            )}
          </div>

          {/* Website */}
          <div className="contact-card__row">
            <Globe size={15} className="contact-card__row-icon" />
            {editing ? (
              <input
                className="contact-card__input"
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    website: e.target.value,
                  }))
                }
                placeholder="https://tusitio.com"
              />
            ) : form.website ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-card__link"
              >
                {form.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="contact-card__empty">Sin sitio web</span>
            )}
          </div>

          {/* Ciudad */}
          <div className="contact-card__row">
            <MapPin size={15} className="contact-card__row-icon" />
            {editing ? (
              <input
                className="contact-card__input"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    city: e.target.value,
                  }))
                }
                placeholder="Ciudad"
              />
            ) : form.city ? (
              <span>{form.city}</span>
            ) : (
              <span className="contact-card__empty">Sin ubicación</span>
            )}
          </div>
        </div>

        {/* Redes sociales */}
        {social.length > 0 && (
          <div>
            <p className="contact-card__social-label">
              Síguenos en redes
            </p>

            <div className="contact-card__social-row">
              {social.map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-card__social-link"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}