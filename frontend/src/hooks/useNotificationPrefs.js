import { useCallback, useEffect, useState } from "react";
import {
  getNotificationPrefs,
  saveNotificationPrefs,
} from "../services/notificationService";

export const PREF_CATEGORIES = [
  {
    key:         "activity_notifications",
    label:       "Actividad Social",
    description: "Likes, comentarios y menciones en tus publicaciones",
  },
  {
    key:         "portfolio_notifications",
    label:       "Portafolios de usuarios seguidos",
    description: "Actualizaciones de proyectos y experiencias",
  },
  {
    key:         "offer_notifications",
    label:       "Nuevas convocatorias",
    description: "Ofertas laborales que coincidan con tu perfil",
  },
  {
    key:         "support_notifications",
    label:       "Mensajes de soporte",
    description: "Respuestas y actualizaciones de soporte",
  },
  {
    key:         "platform_notifications",
    label:       "Notificaciones de la plataforma",
    description: "Anuncios y novedades de Portafy",
  },
];

export function useNotificationPrefs() {
  const [prefs,   setPrefs]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const data  = await getNotificationPrefs();
      setPrefs(data);
    } catch (err) {
      console.error("[useNotificationPrefs] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrefs(); }, [fetchPrefs]);

  const toggle = useCallback((key) => {
    const cat = PREF_CATEGORIES.find((c) => c.key === key);
    if (cat?.locked) return;
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    if (!dirty || !prefs) return;
    setSaving(true);
    try {
      await saveNotificationPrefs(prefs);
      setDirty(false);
    } catch (err) {
      console.error("[useNotificationPrefs] save error:", err);
    } finally {
      setSaving(false);
    }
  }, [prefs, dirty]);

  return { prefs, loading, saving, dirty, toggle, save };
}