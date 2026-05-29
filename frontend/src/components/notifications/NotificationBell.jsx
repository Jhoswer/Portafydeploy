import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../../hooks/useClickOutside";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell({ mobile = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t } = useTranslation();
  const notificationState = useNotifications();
  const { unreadCount } = notificationState;

  useClickOutside(ref, open, () => setOpen(false));

  if (mobile) {
    return (
      <div ref={ref} className="pf-notif pf-notif--mobile">
        <button
          type="button"
          className="pf-btn pf-btn--ghost pf-btn--full pf-notif-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <Bell size={18} />
          <span>{t("notificationBell.title")}</span>
          {unreadCount > 0 && (
            <span className="pf-notif-mobile__badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <NotificationDropdown
            onClose={() => setOpen(false)}
            notificationState={notificationState}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="pf-notif">
      <button
        type="button"
        className="pf-notif__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notificationBell.ariaLabel")}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="pf-notif__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          notificationState={notificationState}
        />
      )}
    </div>
  );
}