import { useEffect, useMemo, useRef, useState } from "react";
import config from "../../config";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill="#0A66C2"
      />
    </svg>
  );
}

const PROVIDERS = {
  google: {
    popupName: "google-login",
    route: "auth/google",
    successType: "GOOGLE_AUTH_SUCCESS",
    errorType: "GOOGLE_AUTH_ERROR",
    renderIcon: () => <GoogleIcon />,
    spinnerClass: "border-t-[#4285F4]",
  },
  github: {
    popupName: "github-login",
    route: "auth/github",
    successType: "GITHUB_AUTH_SUCCESS",
    errorType: "GITHUB_AUTH_ERROR",
    renderIcon: () => <GitHubIcon />,
    spinnerClass: "border-t-gray-800",
  },
  linkedin: {
    popupName: "linkedin-login",
    route: "auth/linkedin",
    successType: "LINKEDIN_AUTH_SUCCESS",
    errorType: "LINKEDIN_AUTH_ERROR",
    renderIcon: () => <LinkedInIcon />,
    spinnerClass: "border-t-[#0A66C2]",
  },
};

export default function OAuthButton({
  provider,
  role,
  onSuccess,
  disabled,
  label,
}) {
  const [loading, setLoading] = useState(false);
  const providerConfig = useMemo(() => PROVIDERS[provider], [provider]);
  const cleanupRef = useRef(() => {});

  useEffect(() => () => {
    cleanupRef.current?.();
  }, []);

  const handleClick = () => {
    if (!providerConfig) return;

    cleanupRef.current?.();
    setLoading(true);

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${config.backendUrl}/${providerConfig.route}?role=${role}`,
      providerConfig.popupName,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      setLoading(false);
      return;
    }

    const oauthResultKey = config.authStorageKeys.oauthResult;
    let pollId = null;
    let timeoutId = null;
    let closeWatcherId = null;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      if (pollId) {
        window.clearInterval(pollId);
      }
      if (closeWatcherId) {
        window.clearInterval(closeWatcherId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setLoading(false);
      cleanupRef.current = () => {};
    };

    const consumePayload = (payload) => {
      if (!payload || settled) return;

      if (payload.type === providerConfig.successType) {
        cleanup();
        onSuccess?.(payload);
        return;
      }

      if (payload.type === providerConfig.errorType) {
        cleanup();
      }
    };

    const handleStorage = (event) => {
      if (event.key !== oauthResultKey || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue);
        localStorage.removeItem(oauthResultKey);
        consumePayload(payload);
      } catch {
        localStorage.removeItem(oauthResultKey);
      }
    };

    const handleMessage = (event) => {
      const allowedOrigins = new Set([
        window.location.origin,
        config.backendUrl,
      ]);

      if (event.origin && !allowedOrigins.has(event.origin)) {
        return;
      }

      consumePayload(event.data);
    };

    localStorage.removeItem(oauthResultKey);
    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    cleanupRef.current = cleanup;
    pollId = window.setInterval(() => {
      const rawPayload = localStorage.getItem(oauthResultKey);

      if (!rawPayload) {
        return;
      }

      try {
        const payload = JSON.parse(rawPayload);
        localStorage.removeItem(oauthResultKey);
        consumePayload(payload);
      } catch {
        localStorage.removeItem(oauthResultKey);
      }
    }, 300);

    closeWatcherId = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
      }
    }, 500);

    timeoutId = window.setTimeout(() => {
      cleanup();
    }, 120000);
  };

  if (!providerConfig) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="auth-social__btn"
    >
      {loading ? (
        <div className={`w-4 h-4 border-2 border-gray-300 rounded-full animate-spin ${providerConfig.spinnerClass}`} />
      ) : (
        providerConfig.renderIcon()
      )}
      {label}
    </button>
  );
}
