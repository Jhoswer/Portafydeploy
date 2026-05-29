import { BellOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmptyNotifications() {
  const { t } = useTranslation();
  return (
    <div className="pf-notif__empty">
      <BellOff size={32} className="pf-notif__empty-icon" />
      <p className="pf-notif__empty-title">{t("notificationBell.empty.title")}</p>
      <p className="pf-notif__empty-sub">{t("notificationBell.empty.sub")}</p>
    </div>
  );
}