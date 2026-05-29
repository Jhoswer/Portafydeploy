import { useTranslation } from "react-i18next";
import { useNotificationPrefs, PREF_CATEGORIES } from "../../hooks/useNotificationPrefs";

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
  const { prefs, loading, saving, dirty, toggle, save } = useNotificationPrefs();

  if (loading) return <div className="pf-settings-notif">{t("notificationSettings.loading")}</div>;

  return (
    <div className="pf-settings-notif">
      {/* Header */}
      <div className="pf-settings-notif__header">
        <div>
          <h2 className="pf-settings-notif__title">{t("notificationSettings.title")}</h2>
          <p className="pf-settings-notif__sub">
            {t("notificationSettings.sub")}
          </p>
        </div>
        <button
          type="button"
          className={`pf-btn pf-btn--red${!dirty ? " pf-btn--disabled" : ""}`}
          onClick={save}
          disabled={!dirty || saving}
        >
          {saving ? t("notificationSettings.saving") : t("notificationSettings.saveChanges")}
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
              <span className="pf-settings-notif__label">{t(`notificationSettings.categories.${cat.key}.label`)}</span>
              <span className="pf-settings-notif__desc">{t(`notificationSettings.categories.${cat.key}.description`)}</span>
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