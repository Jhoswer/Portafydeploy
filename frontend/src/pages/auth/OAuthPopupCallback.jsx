import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../context/useAuth";
import { fetchProfile } from "../../services/authService";
import { getPostAuthRedirectPath } from "../../utils/authNavigation";

function parsePayload() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const params = new URLSearchParams(hash);
  const rawPayload = params.get("payload");

  if (!rawPayload) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(rawPayload));
  } catch {
    return null;
  }
}

function resolveHandler(type, handlers) {
  if (type === "GOOGLE_AUTH_SUCCESS") return handlers.loginWithGoogle;
  if (type === "GITHUB_AUTH_SUCCESS") return handlers.loginWithGitHub;
  if (type === "LINKEDIN_AUTH_SUCCESS") return handlers.loginWithLinkedIn;
  return null;
}

export default function OAuthPopupCallback() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGitHub, loginWithLinkedIn, updateUser } = useAuth();
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    const completeAuth = async () => {
      const payload = parsePayload();
      const oauthResultKey = config.authStorageKeys.oauthResult;

      if (!payload) {
        navigate("/login", { replace: true });
        return;
      }

      if (payload.type?.endsWith("_ERROR")) {
        localStorage.setItem(oauthResultKey, JSON.stringify(payload));

        try {
          if (window.opener) {
            window.opener.postMessage(payload, window.location.origin);
          }
          window.close();
          return;
        } catch {
          // Ignore popup communication issues and fall back to local navigation.
        }

        navigate("/login", { replace: true });
        return;
      }

      const handler = resolveHandler(payload.type, {
        loginWithGoogle,
        loginWithGitHub,
        loginWithLinkedIn,
      });

      const nextUser = handler?.(payload) ?? payload.user;
      let resolvedUser = nextUser || payload.user;
      localStorage.setItem(oauthResultKey, JSON.stringify({
        ...payload,
        user: resolvedUser,
      }));

      try {
        const profile = await fetchProfile();
        resolvedUser = updateUser((current) => ({
          ...current,
          ...profile,
          perfil_completado: Boolean(profile?.perfil_completado),
        })) || resolvedUser;
      } catch {
        // Profile hydration is best-effort for OAuth responses.
      }

      const resolvedPayload = {
        ...payload,
        user: resolvedUser,
      };
      const nextPath = getPostAuthRedirectPath(resolvedUser);

      localStorage.setItem(oauthResultKey, JSON.stringify(resolvedPayload));

      try {
        if (window.opener) {
          window.opener.postMessage(resolvedPayload, window.location.origin);
          window.opener.location.replace(nextPath);
          window.opener.focus?.();
        }
        window.close();
        return;
      } catch {
        // If the popup cannot close or message the opener, continue in-app.
      }

      navigate(nextPath, { replace: true });
    };

    completeAuth();
  }, [loginWithGitHub, loginWithGoogle, loginWithLinkedIn, navigate, updateUser]);

  return (
    <div className="app-shell-loading">
      <div className="app-shell-spinner" />
      <p>Completando acceso...</p>
    </div>
  );
}
