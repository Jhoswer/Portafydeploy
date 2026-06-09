import { useTranslation } from "react-i18next";
import { PREF_CATEGORIES } from "../../../../hooks/useNotificationPrefs";

export default function NotificationsSection({ prefs, notifsLoading, toggle }) {
  const { t } = useTranslation();

  if (notifsLoading) {
    return <div className="pf-settings-notif">{t("notificationSettings.loading")}</div>;
  }

  return (
    <div className="pf-settings-notif">
      <div className="pf-settings-notif__list">
        {PREF_CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className={`pf-settings-notif__row${cat.locked ? " pf-settings-notif__row--locked" : ""}`}
          >
            <div className="pf-settings-notif__info">
              {/* CAMBIO: texto resuelto via i18n en lugar de cat.label / cat.description */}
              <span className="pf-settings-notif__label">
                {t(`notificationSettings.categories.${cat.key}.label`)}
              </span>
              <span className="pf-settings-notif__desc">
                {t(`notificationSettings.categories.${cat.key}.description`)}
              </span>
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