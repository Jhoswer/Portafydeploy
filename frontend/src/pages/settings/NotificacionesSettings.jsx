import { useNotificationPrefs, PREF_CATEGORIES } from "../../hooks/useNotificationPrefs";

export default function NotificationSettingsPage() {
  const { prefs, loading, saving, dirty, toggle, save } = useNotificationPrefs();

  if (loading) return <div className="pf-settings-notif">Cargando preferencias...</div>;

  return (
    <div className="pf-settings-notif">
      {/* Header */}
      <div className="pf-settings-notif__header">
        <div>
          <h2 className="pf-settings-notif__title">Configuración</h2>
          <p className="pf-settings-notif__sub">
            Elige una categoría y ajusta solo lo necesario.
          </p>
        </div>
        <button
          type="button"
          className={`pf-btn pf-btn--red${!dirty ? " pf-btn--disabled" : ""}`}
          onClick={save}
          disabled={!dirty || saving}
        >
          {saving ? "Guardando..." : "✓ Guardar cambios"}
        </button>
      </div>

      {/* Toggles */}
      <div className="pf-settings-notif__list">
        {PREF_CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className={`pf-settings-notif__row${cat.locked ? " pf-settings-notif__row--locked" : ""}`}
          >
            <div className="pf-settings-notif__info">
              <span className="pf-settings-notif__label">{cat.label}</span>
              <span className="pf-settings-notif__desc">{cat.description}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs?.[cat.key] ?? true}
              disabled={cat.locked}
              className={`pf-toggle${prefs?.[cat.key] ? " pf-toggle--on" : ""}${cat.locked ? " pf-toggle--locked" : ""}`}
              onClick={() => toggle(cat.key)}
            >
              <span className="pf-toggle__thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}