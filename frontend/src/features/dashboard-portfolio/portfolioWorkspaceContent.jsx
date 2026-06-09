/* eslint-disable react-refresh/only-export-components */
import config from "../../config";
import { HelpCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  detailBlock,
  detailLabel,
  detailText,
  fieldLabel,
  helperText,
  tagChip,
  tagList,
} from "./portfolioStyles";
import {
  CatalogSelectField,
  CatalogTagsField,
  CompactSelectField,
  displayFileValue,
  FieldError,
  FileUploadField,
  inputWithError,
  PlatformIconGlyph,
  projectStatusMeta,
  ProjectStatusPicker,
  ProjectStatusPill,
  renderDateField,
  renderSocialPlatformField,
  SkillDots,
  SkillLevelPicker,
  textareaWithError,
} from "./portfolioWorkspaceControls";

const FIELD_HELP = {
  projects: {
    title: "title",
    description: "description",
    techCategory: "techCategory",
    tags: "tags",
    repoUrl: "repoUrl",
    demoUrl: "demoUrl",
    status: "status",
    cover: "cover",
  },
  experience: {
    type: "type",
    roleArea: "roleArea",
    title: "title",
    company: "company",
    description: "description",
    startDate: "startDate",
    endDate: "endDate",
    isCurrent: "isCurrent",
  },
  skills: {
    category: "category",
    name: "name",
    level: "level",
  },
  social: {
    platform: "platform",
    url: "url",
  },
  education: {
    level: "level",
    program: "program",
    institution: "institution",
    startDate: "startDate",
    endDate: "endDate",
    isCurrent: "isCurrent",
    supportDocument: "supportDocument",
  },
};

function compactUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return String(url).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function assetUrl(path) {
  if (!path || path instanceof File) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/^public\//, "").replace(/^storage\//, "").replace(/^\/+/, "");
  return `${config.apiUrl.replace(/\/api\/?$/, "")}/storage/${normalized}`;
}

export function getItemTitle(activeKey, item) {
  if (activeKey === "skills") return item.name;
  if (activeKey === "social") return item.platform;
  if (activeKey === "education") return item.program;
  return item.title;
}

export function getItemSubtitle(activeKey, item, t) {
  if (activeKey === "projects") return projectStatusMeta(item.status, t).label;
  if (activeKey === "experience") return `${item.type} · ${item.company}`;
  if (activeKey === "skills") return item.category ? `${item.category} · ${item.level}` : item.level;
  if (activeKey === "social") return compactUrl(item.url);
  if (activeKey === "education") return [item.institution, formatEducationLevel(item.level, t)].filter(Boolean).join(" · ");
  return "";
}

export function DetailContent({ activeKey, item }) {
  const { t } = useTranslation();
  if (activeKey === "projects") {
    return (
      <>
        <ProjectCoverBlock cover={item.cover} title={item.title} />
        <InfoBlock label={t("appI18n.portfolio.fields.description")} text={item.description} />
        <InfoBlock label={t("appI18n.portfolio.fields.techCategory")} text={item.techCategory || t("appI18n.portfolio.detail.noCategory")} />
        <TagsBlock label={t("appI18n.portfolio.fields.tags")} tags={item.tags} />
        <InfoBlock label={t("appI18n.portfolio.fields.repoUrl")} text={item.repoUrl || t("appI18n.portfolio.detail.noRepository")} />
        <InfoBlock label={t("appI18n.portfolio.fields.demoUrl")} text={item.demoUrl || t("appI18n.portfolio.detail.noDemo")} />
      </>
    );
  }

  if (activeKey === "experience") {
    return (
      <>
        <InfoBlock label={t("appI18n.portfolio.fields.type")} text={item.type || t("appI18n.feed.post.professional")} />
        <InfoBlock label={t("appI18n.portfolio.fields.roleArea")} text={item.roleArea || t("appI18n.portfolio.detail.noArea")} />
        <InfoBlock label={t("appI18n.portfolio.fields.description")} text={item.description} />
        <InfoBlock
          label={t("appI18n.portfolio.detail.dates")}
          text={`${formatDateLabel(item.startDate)} - ${item.isCurrent ? t("appI18n.portfolio.detail.current") : formatDateLabel(item.endDate) || t("appI18n.portfolio.detail.undefined")}`}
        />
      </>
    );
  }

  if (activeKey === "skills") {
    return (
      <>
        <InfoBlock label={t("appI18n.portfolio.fields.category")} text={item.category || t("appI18n.portfolio.detail.noCategory")} />
        <InfoBlock label={t("appI18n.portfolio.fields.description")} text={item.description || t("appI18n.portfolio.detail.noDescription")} />
        <InfoBlock label={t("appI18n.portfolio.fields.level")} text={item.level} />
        <div style={detailBlock}>
          <div style={detailLabel}>{t("appI18n.portfolio.detail.visual")}</div>
          <SkillDots level={item.level} />
        </div>
      </>
    );
  }

  if (activeKey === "education") {
    return (
      <>
        <InfoBlock label={t("appI18n.portfolio.fields.program")} text={item.program || t("appI18n.portfolio.detail.noProgram")} />
        <InfoBlock label={t("appI18n.portfolio.fields.institution")} text={item.institution || t("appI18n.portfolio.detail.noInstitution")} />
        <InfoBlock label={t("appI18n.portfolio.fields.type")} text={formatEducationLevel(item.level, t) || t("appI18n.portfolio.detail.noType")} />
        <InfoBlock
          label={t("appI18n.portfolio.detail.dates")}
          text={`${formatDateLabel(item.startDate) || t("appI18n.portfolio.detail.noStart")} - ${item.isCurrent ? t("appI18n.portfolio.detail.present") : formatDateLabel(item.endDate) || t("appI18n.portfolio.detail.undefined")}`}
        />
        <EducationSupportBlock item={item} />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          ...detailBlock,
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr) auto",
          alignItems: "center",
          gap: 12,
          background: "var(--dashboard-soft-bg)",
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(79,140,255,.12)",
            color: "var(--blue-mid)",
            flex: "0 0 auto",
          }}
        >
          <PlatformIconGlyph platform={item.platform} />
        </span>
        <div style={{ minWidth: 0, display: "grid", gap: 3 }}>
          <div style={{ fontFamily: "var(--f-title)", fontWeight: 850, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.platform}
          </div>
          <div style={{ fontFamily: "var(--f-body)", color: "var(--muted)", fontSize: ".82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {compactUrl(item.url)}
          </div>
        </div>
        <span style={{ fontFamily: "var(--f-ui)", fontSize: ".72rem", fontWeight: 850, color: "var(--blue-mid)", padding: "5px 8px", borderRadius: 999, background: "rgba(79,140,255,.10)" }}>
          {t("appI18n.portfolio.detail.active")}
        </span>
      </div>
      <InfoBlock label={t("appI18n.portfolio.detail.destination")} text={compactUrl(item.url) || t("appI18n.portfolio.detail.noUrl")} />
    </>
  );
}

export function FormContent({ activeMeta, draft, extraData, fieldErrors, onDraftChange, onExtraChange }) {
  const { t } = useTranslation();
  const visibleFields = activeMeta.fields.filter((field, index) => {
    if (activeMeta.key !== "skills") return true;
    if (field.key === "description") return false;
    if (field.key === "category" && field.type === "text" && index > 0) return false;
    return true;
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {activeMeta.extraFields?.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {activeMeta.extraFields.map((field) => (
            <label key={field.key} style={{ display: "grid", gap: 6 }}>
              <FieldLabelWithHelp
                label={t(`appI18n.portfolio.fields.${field.key}`, field.label)}
                help={getFieldHelp(activeMeta.key, field.key, t)}
              />
              {renderExtraField(field, extraData[field.key] ?? "", fieldErrors?.[field.key], onExtraChange, t)}
            </label>
          ))}
        </div>
      ) : null}

      {visibleFields.map((field) => (
        <label key={field.key} style={{ display: "grid", gap: 6 }}>
          <FieldLabelWithHelp
            label={t(`appI18n.portfolio.fields.${field.key}`, field.label)}
            help={getFieldHelp(activeMeta.key, field.key, t)}
          />
          {renderField(field, draft[field.key], draft, fieldErrors?.[field.key], onDraftChange, activeMeta, extraData, t)}
        </label>
      ))}
    </div>
  );
}

function renderExtraField(field, value, errorMessage, onExtraChange, t) {
  const placeholder = t(`appI18n.portfolio.placeholders.extra.${field.key}`, field.placeholder || "");
  if (field.type === "file") {
    return (
      <FileUploadField
        accept=".pdf"
        helperLabel={t("appI18n.portfolio.controls.uploadFile")}
        helperTextValue={displayFileValue(value, "")}
        emptyLabel={t("appI18n.portfolio.controls.noFile")}
        buttonLabel={t("appI18n.portfolio.controls.chooseFile")}
        errorMessage={errorMessage}
        onChange={(nextFile) => onExtraChange(field.key, nextFile)}
      />
    );
  }

  return (
    <>
      <input
        type={field.type === "url" ? "url" : "text"}
        value={value}
        onChange={(event) => onExtraChange(field.key, event.target.value)}
        placeholder={placeholder}
        style={inputWithError(errorMessage)}
      />
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </>
  );
}

function renderField(field, value, draft, errorMessage, onDraftChange, activeMeta, extraData = {}, t) {
  const placeholder = t(`appI18n.portfolio.placeholders.${activeMeta.key}.${field.key}`, field.placeholder || "");
  if (field.type === "textarea") {
    const isLockedDescription = field.key === "description" && (activeMeta.key === "experience" || activeMeta.key === "projects");
    return (
      <>
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onDraftChange(field.key, event.target.value)}
          placeholder={placeholder}
          maxLength={field.maxLength}
          style={{
            ...textareaWithError(errorMessage),
            resize: isLockedDescription ? "none" : "vertical",
            minHeight: isLockedDescription ? 120 : 110,
            maxHeight: isLockedDescription ? 120 : undefined,
          }}
        />
        {renderFieldMeta(field, value, t)}
        {errorMessage ? <FieldError message={errorMessage} /> : null}
      </>
    );
  }

  if (field.type === "select") {
    const dynamicOptions = field.optionsFromExtra ? extraData[field.optionsFromExtra] ?? [] : null;
    const options = dynamicOptions ?? field.optionsByType?.[draft.type] ?? field.options ?? [];

    if (activeMeta.key === "skills" && field.key === "level") {
      return (
        <>
          <SkillLevelPicker value={value} onChange={(nextValue) => onDraftChange(field.key, nextValue)} />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </>
      );
    }

    if (field.key === "platform") {
      return renderSocialPlatformField({ field, value, onDraftChange, t });
    }

    return (
      <>
        <CompactSelectField
          value={value}
          options={options}
          placeholder={placeholder || t("appI18n.portfolio.controls.selectOption")}
          errorMessage={errorMessage}
          onChange={(nextValue) => onDraftChange(field.key, nextValue)}
        />
        {errorMessage ? <FieldError message={errorMessage} /> : null}
      </>
    );
  }

  if (field.type === "project-status") {
    return (
      <ProjectStatusPicker
        value={value}
        options={field.options}
        errorMessage={errorMessage}
        onChange={(nextValue) => onDraftChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <>
        <label style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--body)", fontFamily: "var(--f-ui)" }}>
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onDraftChange(field.key, event.target.checked)} />
          {t(`appI18n.portfolio.fields.${field.key}`, field.label || "")}
        </label>
        {errorMessage ? <FieldError message={errorMessage} /> : null}
      </>
    );
  }

  if (field.type === "date") {
    return (
      <>
        {renderDateField({ value, field, onDraftChange, t })}
        {errorMessage ? <FieldError message={errorMessage} /> : null}
      </>
    );
  }

  if (field.type === "catalog-tags") {
    const selectedCategory = draft[field.categoryKey];
    const options = selectedCategory && selectedCategory !== "Otra" ? field.library[selectedCategory] ?? [] : [];
    return (
      <CatalogTagsField
        value={Array.isArray(value) ? value : []}
        selectedCategory={selectedCategory}
        options={options}
        placeholder={placeholder}
        maxTags={field.maxTags}
        maxTagLength={field.maxTagLength}
        errorMessage={errorMessage}
        onChange={(nextValue) => onDraftChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "catalog-select") {
    const selectedCategory = draft[field.categoryKey];
    const options = selectedCategory && selectedCategory !== "Otra" ? field.library[selectedCategory] ?? [] : [];
    return (
      <CatalogSelectField
        value={value}
        selectedCategory={selectedCategory}
        options={options}
        placeholder={placeholder}
        errorMessage={errorMessage}
        onChange={(nextValue) => onDraftChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "file") {
    const isSupportDocument = field.key === "supportDocument";
    return (
      <FileUploadField
        accept={field.accept || "image/*"}
        helperTextValue={displayFileValue(value, "")}
        helperLabel={
          isSupportDocument
            ? t("appI18n.portfolio.controls.educationSupportHelper", "Respaldo academico")
            : t("appI18n.portfolio.controls.projectCoverHelper")
        }
        emptyLabel={
          isSupportDocument
            ? t("appI18n.portfolio.controls.educationSupportEmpty", "Sin respaldo adjunto. PDF o imagen, maximo 6 MB.")
            : t("appI18n.portfolio.controls.projectCoverEmpty")
        }
        buttonLabel={
          isSupportDocument
            ? t("appI18n.portfolio.controls.uploadSupport", "Subir respaldo")
            : t("appI18n.portfolio.controls.uploadCover")
        }
        errorMessage={errorMessage}
        onChange={(nextFile) => onDraftChange(field.key, nextFile)}
      />
    );
  }

  return (
    <>
      <input
        type={field.type === "url" ? "url" : "text"}
        value={value}
        onChange={(event) => onDraftChange(field.key, event.target.value)}
        placeholder={placeholder}
        maxLength={field.maxLength}
        style={inputWithError(errorMessage)}
      />
      {renderFieldMeta(field, value, t)}
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </>
  );
}

function FieldLabelWithHelp({ label, help }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, width: "fit-content", position: "relative" }}>
      <span style={fieldLabel}>{label}</span>
      {help ? <FieldHelpDot text={help} /> : null}
    </span>
  );
}

function FieldHelpDot({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{
        position: "relative",
        width: 18,
        height: 18,
        borderRadius: "50%",
        display: "inline-grid",
        placeItems: "center",
        color: "#2563eb",
        background: "rgba(37,99,235,.12)",
        border: "1px solid rgba(37,99,235,.22)",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <HelpCircle size={12} />
      {open ? (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 30,
            width: 230,
            padding: "9px 10px",
            borderRadius: 12,
            background: "var(--dashboard-card-bg)",
            border: "1px solid var(--dashboard-card-border)",
            boxShadow: "0 18px 40px rgba(14,30,60,.18)",
            color: "var(--body)",
            fontFamily: "var(--f-body)",
            fontSize: ".76rem",
            lineHeight: 1.45,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function getFieldHelp(sectionKey, fieldKey, t) {
  const helpKey = FIELD_HELP[sectionKey]?.[fieldKey];
  return helpKey ? t(`appI18n.portfolio.help.${sectionKey}.${helpKey}`, "") : "";
}

function renderFieldMeta(field, value, t) {
  if (!field.maxLength && !field.minLength) return null;
  const length = String(value || "").length;
  const maxLabel = field.maxLength ? `${length}/${field.maxLength}` : "";
  const minLabel = field.minLength && length < field.minLength
    ? t("appI18n.portfolio.controls.minCharacters", { count: field.minLength })
    : "";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, ...helperText, fontSize: "0.72rem" }}>
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  );
}

function InfoBlock({ label, text }) {
  return (
    <div style={detailBlock}>
      <div style={detailLabel}>{label}</div>
      <div style={detailText}>{text}</div>
    </div>
  );
}

function ProjectCoverBlock({ cover, title }) {
  const { t } = useTranslation();
  const coverSrc = assetUrl(cover);

  return (
    <div style={{ ...detailBlock, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          minHeight: 180,
          position: "relative",
          display: "grid",
          alignItems: "end",
          padding: 16,
          background: coverSrc
            ? "linear-gradient(135deg, #0d1f3c 0%, #1e3a5f 55%, #7fc6f3 100%)"
            : "linear-gradient(135deg, #0d1f3c 0%, #3157d5 62%, #7fc6f3 100%)",
        }}
      >
        {coverSrc ? (
          <>
            <img
              src={coverSrc}
              alt={title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                background: "rgba(8,20,44,.18)",
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(14,30,60,.02) 0%, rgba(14,30,60,.28) 100%)",
              }}
            />
          </>
        ) : null}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "fit-content",
            maxWidth: "100%",
            padding: "8px 11px",
            borderRadius: 999,
            background: "var(--dashboard-card-bg)",
            border: "1px solid var(--dashboard-card-border)",
            color: coverSrc ? "var(--text)" : "#2048a8",
            fontFamily: "var(--f-ui)",
            fontSize: ".78rem",
            fontWeight: 850,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {coverSrc ? t("appI18n.portfolio.detail.coverOf", { title }) : t("appI18n.portfolio.detail.noCover")}
        </div>
      </div>
    </div>
  );
}

function TagsBlock({ label, tags }) {
  const { t } = useTranslation();
  return (
    <div style={detailBlock}>
      <div style={detailLabel}>{label}</div>
      <div style={tagList}>
        {tags?.length ? (
          tags.map((tag) => (
            <span key={tag} style={tagChip}>
              {tag}
            </span>
          ))
        ) : (
          <span style={detailText}>{t("appI18n.portfolio.detail.noTechnologies")}</span>
        )}
      </div>
    </div>
  );
}

function formatDateLabel(value) {
  if (!value) return "";

  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return normalized;
}

function EducationSupportBlock({ item }) {
  const { t } = useTranslation();
  const status = item.supportStatus || item.support_status || (item.supportDocumentUrl ? "pending" : "none");
  const verified = Boolean(item.supportIsVerified || item.support_is_verified || status === "approved");
  const hasSupport = Boolean(item.supportDocumentUrl || item.support_document_url || status !== "none");
  const rejectionReason = String(item.supportRejectionReason || item.support_rejection_reason || "").trim();

  if (!hasSupport) return null;

  return (
    <div style={{ ...detailBlock, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          color: verified ? "#2563eb" : "#64748b",
          background: verified ? "rgba(37,99,235,.12)" : "rgba(100,116,139,.10)",
          border: `1px solid ${verified ? "rgba(37,99,235,.22)" : "rgba(100,116,139,.18)"}`,
        }}
      >
        <ShieldCheck size={17} fill={verified ? "rgba(37,99,235,.16)" : "transparent"} />
      </span>
      <span style={{ display: "grid", gap: 2 }}>
        <span style={detailLabel}>{t("appI18n.portfolio.fields.supportDocument", "Respaldo")}</span>
        <span style={detailText}>
          {verified
            ? t("appI18n.portfolio.detail.supportApproved", "Respaldo autenticado")
            : status === "rejected"
              ? t("appI18n.portfolio.detail.supportRejected", "Respaldo observado")
              : t("appI18n.portfolio.detail.supportPending", "Respaldo en revision")}
        </span>
        {status === "rejected" && rejectionReason ? (
          <span
            style={{
              ...detailText,
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 12,
              background: "rgba(239,68,68,.08)",
              color: "#b91c1c",
              border: "1px solid rgba(239,68,68,.14)",
              lineHeight: 1.45,
            }}
          >
            {rejectionReason}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function formatEducationLevel(value, t) {
  const normalized = String(value || "").trim().toLowerCase();
  return t(`appI18n.portfolio.educationLevels.${normalized}`, value || "");
}
