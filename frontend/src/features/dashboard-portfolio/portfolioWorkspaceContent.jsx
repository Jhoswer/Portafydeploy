/* eslint-disable react-refresh/only-export-components */
import config from "../../config";
import { useTranslation } from "react-i18next";
import {
  detailBlock,
  detailLabel,
  detailText,
  fieldLabel,
  tagChip,
  tagList,
} from "./portfolioStyles";
import {
  CatalogSelectField,
  CatalogTagsField,
  displayFileValue,
  FieldError,
  FileUploadField,
  inputWithError,
  PlatformIconGlyph,
  ProjectStatusPill,
  renderDateField,
  renderSocialPlatformField,
  selectWithError,
  SkillDots,
  SkillLevelPicker,
  textareaWithError,
} from "./portfolioWorkspaceControls";

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
  if (activeKey === "projects") return item.status;
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
              <span style={fieldLabel}>{t(`appI18n.portfolio.fields.${field.key}`, field.label)}</span>
              {renderExtraField(field, extraData[field.key] ?? "", fieldErrors?.[field.key], onExtraChange, t)}
            </label>
          ))}
        </div>
      ) : null}

      {visibleFields.map((field) => (
        <label key={field.key} style={{ display: "grid", gap: 6 }}>
          <span style={fieldLabel}>{t(`appI18n.portfolio.fields.${field.key}`, field.label)}</span>
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
          style={{
            ...textareaWithError(errorMessage),
            resize: isLockedDescription ? "none" : "vertical",
            minHeight: isLockedDescription ? 120 : 110,
            maxHeight: isLockedDescription ? 120 : undefined,
          }}
        />
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
        <select value={value} onChange={(event) => onDraftChange(field.key, event.target.value)} style={selectWithError(errorMessage)}>
          <option value="">{placeholder || t("appI18n.portfolio.controls.selectOption")}</option>
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
        {errorMessage ? <FieldError message={errorMessage} /> : null}
      </>
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
        {renderDateField({ value, field, onDraftChange })}
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
    return (
      <FileUploadField
        accept="image/*"
        helperTextValue={displayFileValue(value, "")}
        helperLabel={t("appI18n.portfolio.controls.projectCoverHelper")}
        emptyLabel={t("appI18n.portfolio.controls.projectCoverEmpty")}
        buttonLabel={t("appI18n.portfolio.controls.uploadCover")}
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
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </>
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
          display: "grid",
          alignItems: "end",
          padding: 16,
          background: coverSrc
            ? `linear-gradient(180deg, rgba(14,30,60,.04) 0%, rgba(14,30,60,.52) 100%), url(${coverSrc})`
            : "linear-gradient(135deg, #0d1f3c 0%, #3157d5 62%, #7fc6f3 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
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

function formatEducationLevel(value, t) {
  const normalized = String(value || "").trim().toLowerCase();
  return t(`appI18n.portfolio.educationLevels.${normalized}`, value || "");
}
