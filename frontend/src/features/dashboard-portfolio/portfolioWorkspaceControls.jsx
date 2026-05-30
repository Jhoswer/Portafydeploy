/* eslint-disable react-refresh/only-export-components */
import { ImageUp, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Dribbble,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Link2,
  Plus,
  PauseCircle,
  Share2,
  Sparkles,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { SOCIAL_PLATFORM_LIBRARY } from "./portfolioConfig";
import {
  chipButton,
  dangerButton,
  detailActions,
  fieldCard,
  ghostButton,
  helperText,
  iconAction,
  iconDelete,
  inlineFieldRow,
  input,
  miniPrimaryButton,
  modalCard,
  modalOverlay,
  modalText,
  modalTitle,
  primaryButton,
  secondaryButton,
  tagChip,
  tagList,
  textarea,
} from "./portfolioStyles";

export function PlatformIconGlyph({ platform }) {
  const value = String(platform || "").toLowerCase();
  const iconProps = { size: 16, color: "currentColor", strokeWidth: 2.2 };

  if (value.includes("github")) return <Github {...iconProps} />;
  if (value.includes("linkedin")) return <Linkedin {...iconProps} />;
  if (value.includes("instagram")) return <Instagram {...iconProps} />;
  if (value.includes("facebook")) return <Facebook {...iconProps} />;
  if (value.includes("dribbble")) return <Dribbble {...iconProps} />;
  if (value.includes("behance")) return <Sparkles {...iconProps} />;
  if (value.includes("youtube")) return <Tv {...iconProps} />;
  if (value === "x" || value.includes("twitter")) return <X {...iconProps} />;
  if (value.includes("tiktok")) return <Share2 {...iconProps} />;
  if (value.includes("web") || value.includes("sitio") || value.includes("portafolio") || value.includes("portfolio")) {
    return <Globe {...iconProps} />;
  }

  return <Link2 {...iconProps} />;
}

export function ProjectStatusPill({ status, compact = false }) {
  const normalized = String(status || "").toLowerCase();
  const meta = normalized.includes("paus")
    ? {
        label: "Pausado",
        Icon: PauseCircle,
        color: "#b7791f",
        background: "rgba(251,191,36,.15)",
        border: "rgba(251,191,36,.26)",
      }
    : normalized.includes("complet") || normalized.includes("completo")
      ? {
          label: "Completo",
          Icon: CheckCircle2,
          color: "#15803d",
          background: "rgba(34,197,94,.14)",
          border: "rgba(34,197,94,.24)",
        }
      : {
          label: "En proceso",
          Icon: CircleDashed,
          color: "#3157d5",
          background: "rgba(79,140,255,.13)",
          border: "rgba(79,140,255,.24)",
        };
  const Icon = meta.Icon;

  return (
    <span
      style={{
        width: "fit-content",
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 5 : 7,
        padding: compact ? "4px 8px" : "6px 10px",
        borderRadius: 999,
        background: meta.background,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        fontFamily: "var(--f-ui)",
        fontSize: compact ? "0.72rem" : "0.78rem",
        fontWeight: 850,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={compact ? 13 : 15} />
      {meta.label}
    </span>
  );
}

export function SkillDots({ level }) {
  const count = level === "Senior" ? 3 : level === "Mid" ? 2 : 1;
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        marginTop: 6,
        marginBottom: 0,
        minHeight: 14,
        alignItems: "center",
        paddingBottom: 2,
      }}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: index < count ? "#4f8cff" : "rgba(162,214,249,.35)",
            flex: "0 0 auto",
          }}
        />
      ))}
    </div>
  );
}

export function SkillLevelPicker({ value, onChange }) {
  const [hoveredLevel, setHoveredLevel] = useState("");
  const activeLevel = hoveredLevel || value;
  const levels = [
    { label: "Junior", count: 1 },
    { label: "Mid", count: 2 },
    { label: "Senior", count: 3 },
  ];

  return (
    <div style={fieldCard}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {levels.map((levelItem) => {
          const isActive = activeLevel === levelItem.label;
          return (
            <button
              key={levelItem.label}
              type="button"
              onClick={() => onChange(levelItem.label)}
              onMouseEnter={() => setHoveredLevel(levelItem.label)}
              onMouseLeave={() => setHoveredLevel("")}
              style={{
                display: "grid",
                gap: 8,
                padding: "10px 12px",
                minWidth: 94,
                borderRadius: 16,
                border: isActive ? "1px solid rgba(91,124,250,.30)" : "1px solid var(--dashboard-card-border)",
                background: isActive ? "rgba(91,124,250,.12)" : "var(--dashboard-card-bg)",
                cursor: "pointer",
                transition: "transform .18s ease, border-color .18s ease, box-shadow .18s ease",
                boxShadow: isActive ? "0 10px 22px rgba(14,30,60,.06)" : "none",
              }}
            >
              <span style={{ fontFamily: "var(--f-ui)", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
                {levelItem.label}
              </span>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: index < levelItem.count ? "#4f8cff" : "rgba(162,214,249,.28)",
                      transform: isActive && index < levelItem.count ? "scale(1.05)" : "scale(1)",
                      transition: "transform .18s ease, background .18s ease",
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CatalogTagsField({ value, selectedCategory, options, placeholder, errorMessage, onChange }) {
  const { t } = useTranslation();
  const canUseCatalog = selectedCategory && selectedCategory !== "Otra";
  const useManualOnly = selectedCategory === "Otra";

  const addTag = (tag) => {
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const removeTag = (tag) => onChange(value.filter((currentTag) => currentTag !== tag));

  return (
    <div style={fieldCardWithError(errorMessage)}>
      {canUseCatalog ? (
        <div>
          <select
            defaultValue=""
            onChange={(event) => {
              addTag(event.target.value);
              event.target.value = "";
            }}
            style={selectWithError(errorMessage)}
          >
            <option value="">{t("appI18n.portfolio.controls.selectTechnology")}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {useManualOnly ? (
        <ManualValueAdder
          buttonLabel={t("appI18n.portfolio.addButton")}
          placeholder={placeholder}
          errorMessage={errorMessage}
          onAdd={addTag}
        />
      ) : null}

      <div style={tagList}>
        {value.length ? (
          value.map((tag) => (
            <span key={tag} style={tagChip}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} style={chipButton}>
                <Trash2 size={12} />
              </button>
            </span>
          ))
        ) : (
          <span style={helperText}>{t("appI18n.portfolio.detail.noTechnologies")}</span>
        )}
      </div>
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </div>
  );
}

export function CatalogSelectField({ value, selectedCategory, options, placeholder, errorMessage, onChange }) {
  const { t } = useTranslation();
  const showCatalog = selectedCategory && selectedCategory !== "Otra";
  const showManualInput = selectedCategory === "Otra";

  return (
    <div style={fieldCardWithError(errorMessage)}>
      {showCatalog ? (
        <select value={options.includes(value) ? value : ""} onChange={(event) => onChange(event.target.value)} style={selectWithError(errorMessage)}>
          <option value="">{t("appI18n.portfolio.controls.selectSkill")}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {showManualInput ? (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={inputWithError(errorMessage)}
        />
      ) : null}
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </div>
  );
}

export function ManualValueAdder({ buttonLabel, placeholder, errorMessage, onAdd }) {
  const [draftValue, setDraftValue] = useState("");

  const handleClick = () => {
    const nextValue = draftValue.trim();
    if (!nextValue) return;
    onAdd(nextValue);
    setDraftValue("");
  };

  return (
    <div style={inlineFieldRow}>
      <input
        type="text"
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        placeholder={placeholder}
        style={inputWithError(errorMessage)}
      />
      <button type="button" onClick={handleClick} style={miniPrimaryButton}>
        <Plus size={14} />
        {buttonLabel}
      </button>
    </div>
  );
}

export function HoverRow({ children, active = false, accentColor = "#4f8cff" }) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = hovered || active;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        flex: "0 0 auto",
        padding: "14px 12px 14px 15px",
        border: active ? `1px solid ${accentColor}32` : "1px solid var(--dashboard-card-border)",
        background: active
          ? `linear-gradient(135deg, ${accentColor}13 0%, var(--dashboard-card-bg) 52%)`
          : hovered
            ? "var(--dashboard-card-bg)"
            : "var(--dashboard-soft-bg)",
        borderRadius: 20,
        overflow: "hidden",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "background .18s ease, transform .18s ease, box-shadow .18s ease, border-color .18s ease",
        boxShadow: active
          ? `0 16px 32px ${accentColor}18`
          : hovered
            ? "0 12px 28px rgba(14,30,60,.06)"
            : "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 10,
          bottom: 10,
          width: 4,
          borderRadius: "0 999px 999px 0",
          background: isHighlighted ? accentColor : "rgba(162,214,249,.28)",
          boxShadow: isHighlighted ? `0 0 18px ${accentColor}42` : "none",
          transition: "background .18s ease, box-shadow .18s ease",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 78,
          height: 78,
          right: -38,
          top: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          opacity: isHighlighted ? 1 : 0,
          transition: "opacity .18s ease",
        }}
      />
      <div style={{ display: "contents" }}>{children}</div>
      <style>{`
        .row-actions {
          opacity: ${isHighlighted ? 1 : 0.52};
          pointer-events: auto;
          transform: translateX(${isHighlighted ? "0" : "6px"});
          transition: opacity .18s ease, transform .18s ease;
        }

        @media (hover: none) {
          .row-actions {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}

export function FileUploadField({
  accept,
  helperLabel,
  helperTextValue,
  emptyLabel,
  buttonLabel,
  errorMessage,
  onChange,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...fieldCardWithError(errorMessage),
        cursor: "pointer",
        width: "min(100%, 320px)",
        padding: "10px 11px",
        borderStyle: "dashed",
        borderWidth: 1.5,
        borderColor: errorMessage
          ? "rgba(227, 88, 118, .40)"
          : hovered
            ? "rgba(91,124,250,.34)"
            : "rgba(162,214,249,.26)",
        background: hovered ? "var(--dashboard-card-bg)" : "var(--dashboard-soft-bg)",
        boxShadow: hovered ? "0 14px 28px rgba(79,140,255,.08)" : fieldCardWithError(errorMessage).boxShadow,
        transition: "border-color .18s ease, box-shadow .18s ease, transform .18s ease, background .18s ease",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8 }}>
        <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, ...helperText, fontSize: "0.73rem" }}>
            <ImageUp size={14} />
            {helperLabel}
          </div>
          <span
            style={{
              ...helperText,
              fontSize: "0.74rem",
              color: "var(--body)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {helperTextValue || emptyLabel}
          </span>
        </div>
        <span
          style={{
            ...miniPrimaryButton,
            pointerEvents: "none",
            padding: "6px 10px",
            fontSize: "0.72rem",
            boxShadow: hovered ? "0 10px 22px rgba(232,72,74,.18)" : "0 6px 18px rgba(232,72,74,.12)",
          }}
        >
          <ImageUp size={12} />
          {buttonLabel}
        </span>
      </div>
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </label>
  );
}

export function InteractiveButton({ children, onClick, variant = "primary", compact = false, disabled = false, loading = false }) {
  const [hovered, setHovered] = useState(false);
  const baseStyle =
    variant === "danger"
      ? dangerButton
      : variant === "secondary"
        ? secondaryButton
        : variant === "ghost"
          ? ghostButton
          : compact
            ? miniPrimaryButton
            : primaryButton;

  return (
    <button
      type="button"
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => !disabled && !loading && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        ...baseStyle,
        transform: hovered && !disabled && !loading ? "translateY(-1px)" : "translateY(0)",
        filter: hovered && !disabled && !loading && (variant === "primary" || compact) ? "brightness(1.02)" : "none",
        boxShadow: hovered && !disabled && !loading && variant !== "ghost" ? "0 10px 24px rgba(14,30,60,.10)" : baseStyle.boxShadow ?? "none",
        borderColor: hovered && !disabled && !loading && (variant === "secondary" || variant === "ghost") ? "rgba(91,124,250,.28)" : undefined,
        opacity: disabled || loading ? 0.72 : 1,
        cursor: disabled || loading ? "not-allowed" : baseStyle.cursor ?? "pointer",
      }}
    >
      {loading ? <LoaderCircle size={15} style={{ animation: "portfolio-spin .8s linear infinite" }} /> : null}
      {children}
      <style>{`
        @keyframes portfolio-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

export function InteractiveIconButton({ children, onClick, tone = "default", disabled = false }) {
  const [hovered, setHovered] = useState(false);
  const baseStyle = tone === "danger" ? iconDelete : iconAction;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        ...baseStyle,
        transform: hovered && !disabled ? "translateY(-1px)" : "translateY(0)",
        background:
          tone === "danger"
            ? hovered && !disabled
              ? "rgba(232,72,74,.10)"
              : baseStyle.background
            : hovered && !disabled
              ? "rgba(247,250,255,.98)"
              : baseStyle.background,
        borderColor:
          tone === "danger"
            ? hovered && !disabled
              ? "rgba(213,54,56,.24)"
              : "rgba(213,54,56,.14)"
            : hovered && !disabled
              ? "rgba(91,124,250,.22)"
              : "rgba(162,214,249,.16)",
        boxShadow: hovered && !disabled ? "0 8px 18px rgba(14,30,60,.08)" : "none",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function ConfirmModal({ title, description, confirmLabel, tone, onCancel, onConfirm, isBusy = false }) {
  const { t } = useTranslation();
  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div style={modalTitle}>{title}</div>
        <div style={modalText}>{description}</div>
        <div style={detailActions}>
          <InteractiveButton variant="ghost" onClick={onCancel} disabled={isBusy}>
            {t("appI18n.common.cancel")}
          </InteractiveButton>
          <InteractiveButton variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={isBusy}>
            {confirmLabel}
          </InteractiveButton>
        </div>
      </div>
    </div>
  );
}

export function FieldError({ message }) {
  return (
    <span
      style={{
        fontFamily: "var(--f-ui)",
        fontSize: "0.76rem",
        fontWeight: 700,
        color: "#d53638",
      }}
    >
      {message}
    </span>
  );
}

export function inputWithError(errorMessage) {
  return errorMessage
    ? {
        ...input,
        borderColor: "rgba(227, 88, 118, .48)",
        background: "rgba(255, 247, 249, .98)",
        boxShadow: "0 0 0 3px rgba(227, 88, 118, .10)",
      }
    : input;
}

export function textareaWithError(errorMessage) {
  return errorMessage
    ? {
        ...textarea,
        borderColor: "rgba(227, 88, 118, .48)",
        background: "rgba(255, 247, 249, .98)",
        boxShadow: "0 0 0 3px rgba(227, 88, 118, .10)",
      }
    : textarea;
}

export function fieldCardWithError(errorMessage) {
  return errorMessage
    ? {
        ...fieldCard,
        borderColor: "rgba(227, 88, 118, .32)",
        boxShadow: "0 0 0 3px rgba(227, 88, 118, .08)",
      }
    : fieldCard;
}

export function selectWithError(errorMessage) {
  return {
    ...inputWithError(errorMessage),
    cursor: "pointer",
  };
}

export function displayFileValue(value, fallback) {
  if (!value) return fallback;
  if (value instanceof File) return value.name;
  return value;
}

export function useViewport() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export function renderSocialPlatformField({ field, value, onDraftChange, t }) {
  const selectValue = SOCIAL_PLATFORM_LIBRARY.includes(value) ? value : value ? "Otra" : "";
  return (
    <div style={fieldCard}>
      <select
        value={selectValue}
        onChange={(event) => onDraftChange(field.key, event.target.value === "Otra" ? "" : event.target.value)}
        style={{ ...input, cursor: "pointer" }}
      >
        <option value="">{t("appI18n.portfolio.controls.selectOption")}</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {selectValue === "Otra" || (value && !SOCIAL_PLATFORM_LIBRARY.includes(value)) ? (
        <input
          type="text"
          value={value}
          onChange={(event) => onDraftChange(field.key, event.target.value)}
          placeholder={t("appI18n.portfolio.controls.writePlatform")}
          style={input}
        />
      ) : null}
    </div>
  );
}

export function renderDateField({ value, field, onDraftChange }) {
  return (
    <div style={fieldCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...helperText }}>
        <CalendarDays size={15} />
        Usa el calendario para elegir una fecha de forma mas intuitiva.
      </div>
      <input
        type="date"
        value={value}
        onChange={(event) => onDraftChange(field.key, event.target.value)}
        style={{ ...input, cursor: "pointer" }}
      />
    </div>
  );
}
