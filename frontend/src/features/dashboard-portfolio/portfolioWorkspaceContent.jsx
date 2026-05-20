/* eslint-disable react-refresh/only-export-components */
import config from "../../config";
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
  return item.title;
}

export function getItemSubtitle(activeKey, item) {
  if (activeKey === "projects") return item.status;
  if (activeKey === "experience") return `${item.type} · ${item.company}`;
  if (activeKey === "skills") return item.category ? `${item.category} · ${item.level}` : item.level;
  if (activeKey === "social") return compactUrl(item.url);
  return "";
}

export function DetailContent({ activeKey, item }) {
  if (activeKey === "projects") {
    return (
      <>
        <ProjectCoverBlock cover={item.cover} title={item.title} />
        <InfoBlock label="Descripcion" text={item.description} />
        <InfoBlock label="Categoria tecnica" text={item.techCategory || "Sin categoria"} />
        <TagsBlock label="Tecnologias" tags={item.tags} />
        <InfoBlock label="Repositorio URL" text={item.repoUrl || "Sin repositorio"} />
        <InfoBlock label="Demo URL" text={item.demoUrl || "Sin demo URL"} />
      </>
    );
  }

  if (activeKey === "experience") {
    return (
      <>
        <InfoBlock label="Tipo" text={item.type || "Profesional"} />
        <InfoBlock label="Area" text={item.roleArea || "Sin area"} />
        <InfoBlock label="Descripcion" text={item.description} />
        <InfoBlock
          label="Fechas"
          text={`${formatDateLabel(item.startDate)} - ${item.isCurrent ? "Actualidad" : formatDateLabel(item.endDate) || "Sin definir"}`}
        />
      </>
    );
  }

  if (activeKey === "skills") {
    return (
      <>
        <InfoBlock label="Categoria" text={item.category || "Sin categoria"} />
        <InfoBlock label="Descripcion" text={item.description || "Sin descripcion"} />
        <InfoBlock label="Nivel" text={item.level} />
        <div style={detailBlock}>
          <div style={detailLabel}>Visual</div>
          <SkillDots level={item.level} />
        </div>
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
          background: "linear-gradient(135deg, rgba(255,255,255,.96), rgba(247,251,255,.92))",
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
          Activo
        </span>
      </div>
      <InfoBlock label="Destino" text={compactUrl(item.url) || "Sin URL"} />
    </>
  );
}

export function FormContent({ activeMeta, draft, extraData, fieldErrors, onDraftChange, onExtraChange }) {
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
              <span style={fieldLabel}>{field.label}</span>
              {renderExtraField(field, extraData[field.key] ?? "", fieldErrors?.[field.key], onExtraChange)}
            </label>
          ))}
        </div>
      ) : null}

      {visibleFields.map((field) => (
        <label key={field.key} style={{ display: "grid", gap: 6 }}>
          <span style={fieldLabel}>{field.label}</span>
          {renderField(field, draft[field.key], draft, fieldErrors?.[field.key], onDraftChange, activeMeta)}
        </label>
      ))}
    </div>
  );
}

function renderExtraField(field, value, errorMessage, onExtraChange) {
  if (field.type === "file") {
    return (
      <FileUploadField
        accept=".pdf"
        helperLabel="Adjunta un archivo"
        helperTextValue={displayFileValue(value, "")}
        emptyLabel="Aun no seleccionaste un archivo."
        buttonLabel="Elegir archivo"
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
        placeholder={field.placeholder}
        style={inputWithError(errorMessage)}
      />
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </>
  );
}

function renderField(field, value, draft, errorMessage, onDraftChange, activeMeta) {
  if (field.type === "textarea") {
    const isLockedDescription = field.key === "description" && (activeMeta.key === "experience" || activeMeta.key === "projects");
    return (
      <>
        <textarea
          rows={4}
          value={value}
          onChange={(event) => onDraftChange(field.key, event.target.value)}
          placeholder={field.placeholder}
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
    const options = field.optionsByType?.[draft.type] ?? field.options ?? [];

    if (activeMeta.key === "skills" && field.key === "level") {
      return (
        <>
          <SkillLevelPicker value={value} onChange={(nextValue) => onDraftChange(field.key, nextValue)} />
          {errorMessage ? <FieldError message={errorMessage} /> : null}
        </>
      );
    }

    if (field.key === "platform") {
      return renderSocialPlatformField({ field, value, onDraftChange });
    }

    return (
      <>
        <select value={value} onChange={(event) => onDraftChange(field.key, event.target.value)} style={selectWithError(errorMessage)}>
          <option value="">Selecciona una opcion</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
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
          Sigo actualmente en este lugar
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
        placeholder={field.placeholder}
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
        placeholder={field.placeholder}
        errorMessage={errorMessage}
        onChange={(nextValue) => onDraftChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === "file") {
    return (
      <FileUploadField
        accept="image/*"
        helperLabel="Sube una portada para mostrar mejor tu proyecto"
        helperTextValue={displayFileValue(value, "")}
        emptyLabel="Sin portada seleccionada. Opcional, maximo 2 MB."
        buttonLabel="Subir portada"
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
        placeholder={field.placeholder}
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
            background: "rgba(255,255,255,.92)",
            border: "1px solid rgba(255,255,255,.66)",
            color: coverSrc ? "#10213d" : "#2048a8",
            fontFamily: "var(--f-ui)",
            fontSize: ".78rem",
            fontWeight: 850,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {coverSrc ? `Portada de ${title}` : "Sin portada personalizada"}
        </div>
      </div>
    </div>
  );
}

function TagsBlock({ label, tags }) {
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
          <span style={detailText}>Sin tecnologias</span>
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
