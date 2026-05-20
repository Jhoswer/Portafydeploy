import { BellOff } from "lucide-react";

export default function EmptyNotifications() {
  return (
    <div className="pf-notif__empty">
      <BellOff size={32} className="pf-notif__empty-icon" />
      <p className="pf-notif__empty-title">Sin notificaciones</p>
      <p className="pf-notif__empty-sub">
        Cuando alguien interactúe con tu contenido, aparecerá aquí.
      </p>
    </div>
  );
}