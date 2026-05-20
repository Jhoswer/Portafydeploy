import { useCallback, useEffect, useState } from "react";
import {
  getNotificationPrefs,
  saveNotificationPrefs,
} from "../services/notificationService";

export const PREF_CATEGORIES = [
  {
    key:         "social",
    label:       "Actividad Social",
    description: "Comentarios, seguidores y menciones",
  },
  {
    key:         "portfolio",
    label:       "Portafolio",
    description: "Cambios en convocatorias y portafolio",
  },
  //{key:         "security" label:       "Seguridad",description: "Alertas de seguridad de tu cuenta",locked:      true,},
  //{key:         "admin",label:       "Administración",description: "Notificaciones administrativas",locked:      true,},
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