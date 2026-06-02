import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  Download,
  Flag,
  FolderKanban,
  ImagePlus,
  Mail,
  MapPin,
  MoreHorizontal,
  PencilLine,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { MessageBox, MetaItem, StatCard } from "./ProfileSections";
import { profileUi as ui } from "../../../styles/components/dashboard/profileStyles";

function useCloseOnOutside(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  return ref;
}

export default function ProfileHero({
  avatarRef,
  beginEdit,
  canEdit,
  cancelEdit,
  coverPhoto,
  coverRef,
  cv,
  draft,
  editing,
  formError,
  fullName,
  headline,
  isMobile,
  onImageChange,
  profilePhoto,
  saveMessage,
  saveProfile,
  saving,
  setDraft,
  shareMessage,
  shareProfile,
  showContact,
  shownProfile,
  stats,
  canReport = false,
  canFollow = false,
  followBusy = false,
  isFollowing = false,
  onToggleFollow,
  onAnalyticsEvent,
  onReportProfile,
  onStatClick,
}) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useCloseOnOutside(menuOpen, () => setMenuOpen(false));
  const contactEmail = shownProfile.email && showContact ? shownProfile.email : "";
  const initials = `${shownProfile.nombre?.[0] ?? "P"}${shownProfile.apellido?.[0] ?? "F"}`;
  const verified = shownProfile.verification?.is_verified;
  const primaryStats = stats.filter((stat) => stat.action === "followers" || stat.action === "following");
  const secondaryStats = stats.filter((stat) => stat.action !== "followers" && stat.action !== "following");

  return (
    <section style={heroShell}>
      <div
        style={{
          ...coverStyle,
          ...(coverPhoto
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(8,20,44,.56), rgba(37,99,235,.20)), url(${coverPhoto})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        <div style={coverTexture} />
        {canEdit && editing ? (
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            style={coverButtonStyle}
          >
            <ImagePlus size={14} />
            {t("appI18n.profile.cover")}
          </button>
        ) : null}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          onChange={(event) => onImageChange("cover", event)}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ padding: isMobile ? "0 18px 20px" : "0 24px 24px" }}>
        <div style={{ ...identityGrid, gridTemplateColumns: isMobile ? "1fr" : "auto minmax(0, 1fr) auto" }}>
          <div style={{ ...avatarWrap, justifySelf: isMobile ? "center" : "start" }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt={fullName} style={avatarStyle(isMobile)} />
            ) : (
              <div style={avatarFallbackStyle(isMobile)}>{initials}</div>
            )}

            {canEdit && editing ? (
              <>
                <button type="button" onClick={() => avatarRef.current?.click()} style={ui.avatarAction}>
                  <Camera size={14} />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => onImageChange("avatar", event)}
                  style={{ display: "none" }}
                />
              </>
            ) : null}
          </div>

          <div style={{ minWidth: 0, paddingTop: isMobile ? 0 : 22, textAlign: isMobile ? "center" : "left" }}>
            {canEdit && editing ? (
              <EditNameFields draft={draft} setDraft={setDraft} isMobile={isMobile} />
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
                  <h1 style={nameStyle}>{fullName}</h1>
                  {verified ? <VerifiedBadge /> : null}
                </div>

                {headline ? <div style={headlineStyle}>{headline}</div> : null}
              </>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, justifyContent: isMobile ? "center" : "flex-start" }}>
              <MetaItem icon={<MapPin size={14} />} text={shownProfile.ubicacion || t("appI18n.profile.locationFallback")} />
              {contactEmail ? <MetaItem icon={<Mail size={14} />} text={contactEmail} /> : null}
            </div>
          </div>

          <div style={{ ...actionWrap, justifyContent: isMobile ? "center" : "flex-end", paddingTop: isMobile ? 0 : 18 }}>
            {canEdit && editing ? (
              <>
                <button type="button" onClick={cancelEdit} style={ui.secondary}>
                  <X size={14} />
                  {t("appI18n.profile.cancel")}
                </button>
                <button type="button" onClick={saveProfile} style={ui.primary}>
                  <Save size={14} />
                  {saving ? t("appI18n.profile.saving") : t("appI18n.common.save")}
                </button>
              </>
            ) : (
              <>
                {canFollow ? (
                  <button
                    type="button"
                    onClick={onToggleFollow}
                    disabled={followBusy}
                    style={isFollowing ? followingButtonStyle : followButtonStyle}
                  >
                    {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
                    {isFollowing ? t("appI18n.profile.following") : followBusy ? t("appI18n.profile.processing") : t("appI18n.profile.follow")}
                  </button>
                ) : null}

                {canEdit ? (
                  <button type="button" onClick={beginEdit} style={editButtonStyle}>
                    <PencilLine size={15} />
                    {t("appI18n.profile.editProfile")}
                  </button>
                ) : null}

                <div style={{ position: "relative" }} ref={menuRef}>
                  <button type="button" onClick={() => setMenuOpen((value) => !value)} style={menuButtonStyle} aria-label={t("appI18n.profile.moreOptions")}>
                    <MoreHorizontal size={17} />
                  </button>
                  {menuOpen ? (
                    <div style={menuStyle}>
                      {!canEdit && contactEmail ? (
                        <button type="button" onClick={() => { setMenuOpen(false); onAnalyticsEvent?.("contact_click"); window.location.href = `mailto:${contactEmail}`; }} style={menuItem}>
                          <Mail size={14} /> {t("appI18n.profile.contact")}
                        </button>
                      ) : null}
                      <button type="button" onClick={() => { setMenuOpen(false); onAnalyticsEvent?.("cv_click"); if (cv.cvUrl) window.open(cv.cvUrl, "_blank"); else window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: "cv" })); }} style={menuItem}>
                        <Download size={14} /> {cv.cvUrl ? t("appI18n.profile.viewCv") : t("appI18n.profile.manageCv")}
                      </button>
                      <button type="button" onClick={() => { setMenuOpen(false); shareProfile(); }} style={menuItem}>
                        <Share2 size={14} /> {t("appI18n.profile.shareProfile")}
                      </button>
                      {canReport ? (
                        <button type="button" onClick={() => { setMenuOpen(false); onReportProfile?.(); }} style={{ ...menuItem, color: "#dc2626" }}>
                          <Flag size={14} /> {t("appI18n.profile.reportProfile")}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {formError ? <MessageBox color="red" text={formError} /> : null}
        {saveMessage ? <MessageBox color="green" text={saveMessage} /> : null}

        <div style={{ ...primaryStatsGridStyle, gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(2, minmax(220px, 1fr))" }}>
          {primaryStats.map((stat) => (
            <StatCard
              key={stat.key || stat.label}
              label={stat.label}
              statKey={stat.key || stat.action}
              value={stat.value}
              onClick={stat.action ? () => onStatClick?.(stat.action) : null}
            />
          ))}
        </div>

        {secondaryStats.length ? (
          <div style={secondaryStatsStyle}>
            {secondaryStats.map((stat) => {
              const metric = compactMetricMeta(stat.key || stat.action || stat.label);

              return (
                <CompactMetric
                  key={stat.key || stat.label}
                  stat={stat}
                  metric={metric}
                  onClick={stat.action ? () => onStatClick?.(stat.action) : undefined}
                />
              );
            })}
          </div>
        ) : null}

        {shareMessage ? <MessageBox color="blue" text={shareMessage} fit /> : null}
      </div>
    </section>
  );
}

function VerifiedBadge() {
  const [open, setOpen] = useState(false);

  return (
    <span
      tabIndex={0}
      aria-label="Profesional verificado por PortaFy"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={verifiedBadgeWrapStyle}
    >
      <span style={verifiedBadgeStyle}>
        <ShieldCheck size={20} strokeWidth={2.6} fill="rgba(37,99,235,.14)" />
      </span>
      {open ? (
        <span style={verifiedTooltipStyle}>
          <ShieldCheck size={14} strokeWidth={2.5} fill="rgba(37,99,235,.12)" />
          Profesional verificado por PortaFy
        </span>
      ) : null}
    </span>
  );
}

function CompactMetric({ stat, metric, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = metric.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={compactMetricStyle(Boolean(onClick), metric, hovered)}
    >
      <span style={compactMetricIconStyle(metric, hovered)}>
        <Icon size={14} />
      </span>
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <strong style={compactMetricValueStyle}>{stat.value}</strong>
        <span style={compactMetricLabelStyle}>{stat.label}</span>
      </span>
    </button>
  );
}

function EditNameFields({ draft, setDraft, isMobile }) {
  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <input value={draft.nombre} onChange={(event) => setDraft((prev) => ({ ...prev, nombre: event.target.value }))} placeholder="Nombre" style={ui.input} />
        <input value={draft.apellido} onChange={(event) => setDraft((prev) => ({ ...prev, apellido: event.target.value }))} placeholder="Apellido" style={ui.input} />
      </div>
    </div>
  );
}

const heroShell = {
  ...ui.shell,
  overflow: "hidden",
  borderRadius: 26,
  background: "var(--dashboard-card-bg)",
  boxShadow: "0 22px 55px rgba(14,30,60,.12)",
};

const coverStyle = {
  minHeight: 116,
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #132848 0%, #234d86 58%, #8bd3f7 100%)",
};

const coverTexture = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(90deg, rgba(255,255,255,.05), transparent 38%), repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 1px, transparent 1px 15px)",
};

const coverButtonStyle = {
  position: "absolute",
  right: 18,
  top: 16,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid rgba(255,255,255,.34)",
  borderRadius: 14,
  padding: "9px 12px",
  background: "rgba(255,255,255,.16)",
  color: "#fff",
  fontWeight: 850,
  cursor: "pointer",
  backdropFilter: "blur(8px)",
};

const identityGrid = {
  display: "grid",
  gap: 18,
  alignItems: "start",
};

const avatarWrap = {
  position: "relative",
  marginTop: -58,
  width: 120,
};

const avatarStyle = (isMobile) => ({
  width: isMobile ? 108 : 120,
  height: isMobile ? 108 : 120,
  borderRadius: "50%",
  objectFit: "cover",
  border: "5px solid var(--dashboard-card-bg)",
  boxShadow: "0 22px 40px rgba(14,30,60,.22)",
  background: "var(--dashboard-card-bg)",
});

const avatarFallbackStyle = (isMobile) => ({
  ...avatarStyle(isMobile),
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #244fbd 0%, #7fc6f3 56%, #fb4050 100%)",
  color: "#fff",
  fontFamily: "var(--f-title)",
  fontSize: isMobile ? "1.65rem" : "1.9rem",
  fontWeight: 950,
});

const nameStyle = {
  margin: 0,
  fontFamily: "var(--f-title)",
  fontSize: "clamp(1.65rem, 2.7vw, 2.28rem)",
  lineHeight: 1.05,
  fontWeight: 950,
  color: "var(--text)",
};

const headlineStyle = {
  marginTop: 7,
  fontFamily: "var(--f-ui)",
  color: "var(--body)",
  fontSize: ".96rem",
  fontWeight: 850,
};

const verifiedBadgeWrapStyle = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  outline: "none",
};

const verifiedBadgeStyle = {
  width: 28,
  height: 28,
  display: "grid",
  placeItems: "center",
  borderRadius: "50%",
  color: "#2563eb",
  background: "linear-gradient(135deg, rgba(37,99,235,.13), rgba(14,165,233,.08))",
  border: "none",
  boxShadow: "0 10px 22px rgba(37,99,235,.16)",
};

const verifiedTooltipStyle = {
  position: "absolute",
  left: "50%",
  top: "calc(100% + 10px)",
  transform: "translateX(-50%)",
  zIndex: 30,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  width: "max-content",
  maxWidth: 260,
  padding: "9px 12px",
  borderRadius: 999,
  color: "#1d4ed8",
  background: "var(--dashboard-card-bg)",
  border: "1px solid rgba(37,99,235,.20)",
  boxShadow: "0 18px 38px rgba(14,30,60,.16)",
  fontFamily: "var(--f-ui)",
  fontSize: ".78rem",
  fontWeight: 900,
  pointerEvents: "none",
};

const actionWrap = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const menuButtonStyle = {
  ...ui.icon,
  width: 44,
  height: 44,
  borderRadius: 14,
  boxShadow: "0 10px 24px rgba(14,30,60,.08)",
};

const editButtonStyle = {
  ...ui.primary,
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 14,
  boxShadow: "0 16px 30px rgba(232,72,74,.20)",
};

const followButtonStyle = {
  ...ui.primary,
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
  boxShadow: "0 16px 30px rgba(37,99,235,.18)",
};

const followingButtonStyle = {
  ...ui.secondary,
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 14,
  color: "#2563eb",
  background: "rgba(37,99,235,.08)",
  border: "1px solid rgba(37,99,235,.20)",
};

const menuStyle = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  zIndex: 20,
  width: 220,
  display: "grid",
  gap: 4,
  padding: 8,
  borderRadius: 16,
  background: "var(--dashboard-card-bg)",
  border: "1px solid var(--dashboard-card-border)",
  boxShadow: "0 18px 40px rgba(14,30,60,.16)",
};

const menuItem = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  border: 0,
  background: "transparent",
  padding: "10px 10px",
  borderRadius: 12,
  color: "var(--text)",
  fontFamily: "var(--f-ui)",
  fontSize: ".84rem",
  fontWeight: 850,
  cursor: "pointer",
  textAlign: "left",
};

const primaryStatsGridStyle = {
  display: "grid",
  gap: 16,
  marginTop: 26,
  maxWidth: 600,
};

const secondaryStatsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 16,
};

const compactMetricStyle = (clickable, metric, hovered = false) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  minHeight: 50,
  minWidth: 132,
  padding: "9px 13px 9px 10px",
  borderRadius: 16,
  border: `1px solid ${hovered ? metric.borderStrong : metric.border}`,
  background: hovered ? `linear-gradient(135deg, ${metric.iconBg} 0%, var(--dashboard-card-bg) 100%)` : "var(--dashboard-soft-bg)",
  color: "var(--body)",
  cursor: clickable ? "pointer" : "default",
  fontFamily: "var(--f-ui)",
  textAlign: "left",
  boxShadow: hovered ? `0 15px 28px ${metric.shadow}` : `0 12px 24px ${metric.shadow}`,
  transform: hovered ? "translateY(-1px)" : "translateY(0)",
  transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
});

const compactMetricIconStyle = (metric, hovered = false) => ({
  width: 32,
  height: 32,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  color: metric.color,
  background: hovered ? metric.iconBgStrong : metric.iconBg,
  border: `1px solid ${metric.border}`,
  transform: hovered ? "scale(1.04)" : "scale(1)",
  transition: "transform .16s ease, background .16s ease",
  flexShrink: 0,
});

const compactMetricValueStyle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.05rem",
  lineHeight: 1,
  fontWeight: 950,
  color: "var(--text)",
};

const compactMetricLabelStyle = {
  fontSize: ".72rem",
  lineHeight: 1.1,
  fontWeight: 850,
  color: "var(--muted)",
  whiteSpace: "nowrap",
};

function compactMetricMeta(label) {
  const key = String(label || "").toLowerCase();

  if (key === "projects" || key.includes("proyecto")) {
    return {
      icon: FolderKanban,
      color: "#2563eb",
      soft: "rgba(239,246,255,.96)",
      iconBg: "rgba(37,99,235,.10)",
      iconBgStrong: "rgba(37,99,235,.16)",
      border: "rgba(37,99,235,.20)",
      borderStrong: "rgba(37,99,235,.34)",
      shadow: "rgba(37,99,235,.07)",
    };
  }

  if (key === "experienceyears" || key.includes("exp")) {
    return {
      icon: BriefcaseBusiness,
      color: "#0f766e",
      soft: "rgba(240,253,250,.96)",
      iconBg: "rgba(15,118,110,.10)",
      iconBgStrong: "rgba(15,118,110,.16)",
      border: "rgba(15,118,110,.20)",
      borderStrong: "rgba(15,118,110,.34)",
      shadow: "rgba(15,118,110,.07)",
    };
  }

  if (key === "companies" || key.includes("empresa")) {
    return {
      icon: Building2,
      color: "#7c3aed",
      soft: "rgba(245,243,255,.96)",
      iconBg: "rgba(124,58,237,.10)",
      iconBgStrong: "rgba(124,58,237,.16)",
      border: "rgba(124,58,237,.20)",
      borderStrong: "rgba(124,58,237,.34)",
      shadow: "rgba(124,58,237,.07)",
    };
  }

  return {
    icon: Sparkles,
    color: "#e11d48",
    soft: "rgba(255,241,242,.96)",
    iconBg: "rgba(225,29,72,.09)",
    iconBgStrong: "rgba(225,29,72,.15)",
    border: "rgba(225,29,72,.18)",
    borderStrong: "rgba(225,29,72,.32)",
    shadow: "rgba(225,29,72,.06)",
  };
}
