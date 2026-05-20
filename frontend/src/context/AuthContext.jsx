/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState, useContext } from "react";
import { fetchProfile, loginUser } from "../services/authService";
import {
  clearSession,
  getStoredUser,
  markStoredProfileCompleted,
  persistSession,
  updateStoredUser,
  getStoredCompany,
  persistCompany,
  clearCompany,
} from "../services/sessionService";
import { listarCvs } from "../services/cvService";
import { AuthContext } from "./auth-context";

export const useAuth = () => {
  return useContext(AuthContext);
};

/* ── helpers para persistir CVs en sessionStorage ── */
const CV_KEY = "user_cvs";

function getStoredCvs() {
  try {
    const raw = sessionStorage.getItem(CV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCvs(cvs) {
  try {
    sessionStorage.setItem(CV_KEY, JSON.stringify(cvs));
  } catch { /* quota */ }
  return cvs;
}

function clearCvs() {
  sessionStorage.removeItem(CV_KEY);
}

function normalizeCvs(raw = []) {
  return raw.map(cv => ({
    id:        cv.id_cv ?? cv.id,
    name:      cv.name_cv ?? cv.name ?? `CV ${cv.id_cv ?? cv.id}`,
    updatedAt: cv.updated_at ?? null,
  }));
}

/* ─────────────────────────────────────────────────── */

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => getStoredUser());
  const [company, setCompany] = useState(() => getStoredCompany());
  const [cvs, setCvs]         = useState(() => getStoredCvs());   // ← nuevo

  /* Sincronizar tabs */
  useEffect(() => {
    const syncSessionFromStorage = (event) => {
      if (event.key && !["user", "token", "AUTH_TOKEN", "company"].includes(event.key)) return;
      setUser(getStoredUser());
      setCompany(getStoredCompany());
    };
    window.addEventListener("storage", syncSessionFromStorage);
    return () => window.removeEventListener("storage", syncSessionFromStorage);
  }, []);

  /* Cargar CVs cuando hay usuario pero no están cacheados */
  useEffect(() => {
    if (!user || cvs.length > 0) return;
    listarCvs()
      .then(data => {
        const normalized = normalizeCvs(data ?? []);
        persistCvs(normalized);
        setCvs(normalized);
      })
      .catch(() => { /* silencioso */ });
  }, [user]);             // ← solo se dispara al montar con usuario activo

  /* ── Helpers internos ── */
  const loadAndStoreCvs = async () => {
    try {
      const data = await listarCvs();
      const normalized = normalizeCvs(data ?? []);
      persistCvs(normalized);
      setCvs(normalized);
    } catch { /* silencioso */ }
  };

  const applyAuthResult = (data) => {
    const nextUser = persistSession(data?.user, data?.token);
    setUser(nextUser);
    if (data?.company) {
      persistCompany(data.company);
      setCompany(data.company);
    }
    // Cargar CVs en paralelo tras login
    loadAndStoreCvs();
    return nextUser;
  };

  /* ── Auth actions ── */
  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      const nextUser = applyAuthResult(data);
      return { ok: true, token: data?.token || "", user: nextUser };
    } catch (error) {
      return { ok: false, error: error.message || "Error de conexión." };
    }
  };

  const updateCompany = (data) => {
    const next = persistCompany(data);
    setCompany(next);
    return next;
  };

  const loginWithGoogle   = (data) => applyAuthResult(data);
  const loginWithLinkedIn = (data) => applyAuthResult(data);
  const loginWithGitHub   = (data) => applyAuthResult(data);

  const markProfileCompleted = () => {
    const nextUser = markStoredProfileCompleted();
    if (nextUser) setUser(nextUser);
    return nextUser;
  };

  const updateUser = useCallback((updater) => {
    const nextUser = updateStoredUser(updater);
    if (nextUser) setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;

    fetchProfile()
      .then((profile) => {
        if (cancelled || !profile) return;

        updateUser((current) => ({
          ...current,
          ...profile,
          active_permissions: Array.isArray(profile.active_permissions)
            ? profile.active_permissions
            : current.active_permissions,
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [updateUser, user?.token]);

  const logout = () => {
    clearSession();
    clearCvs();       // ← limpiar CVs al cerrar sesión
    setUser(null);
    setCvs([]);
    clearCompany();
    setCompany(null);
  };

  /* Permite refrescar CVs desde cualquier parte (ej: después de crear uno) */
  const refreshCvs = () => loadAndStoreCvs();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        company,
        updateCompany,
        loginWithLinkedIn,
        loginWithGitHub,
        loginWithGoogle,
        markProfileCompleted,
        updateUser,
        logout,
        cvs,
        refreshCvs,  
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}