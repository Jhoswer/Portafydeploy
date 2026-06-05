import { ArrowLeft, PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  breadcrumb,
  breadcrumbCurrent,
  breadcrumbLink,
  breadcrumbSep,
  detailActions,
  detailColumn,
  detailHeader,
  detailMeta,
  detailTitle,
  eyebrow,
  helperText,
  itemMainButton,
  itemSubtitle,
  itemTitle,
  listColumn,
  listHeader,
  panelEyebrow,
  panelTitle,
  rowActions,
  rowLayout,
  singlePanel,
  statPill,
  statusBadge,
  subtleDivider,
  title,
  unifiedCard,
  unifiedContent,
  workspaceHero,
  workspaceShell,
} from "../../../features/dashboard-portfolio/portfolioStyles";
import {
  ConfirmModal,
  HoverRow,
  InteractiveButton,
  InteractiveIconButton,
  PlatformIconGlyph,
  ProjectStatusPill,
  SkillDots,
  useViewport,
} from "../../../features/dashboard-portfolio/portfolioWorkspaceControls";
import {
  DetailContent,
  FormContent,
  getItemSubtitle,
  getItemTitle,
} from "../../../features/dashboard-portfolio/portfolioWorkspaceContent";

const EMPTY_FILTERS = {
  projects: { status: "", technology: "" },
  experience: { type: "", roleArea: "" },
  skills: { category: "" },
  social: { platform: "" },
  education: { level: "" },
};

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function buildFilterOptions(sectionKey, items) {
  if (sectionKey === "projects") {
    return {
      status: uniqueSorted(items.map((item) => item.status)),
      technology: uniqueSorted(items.flatMap((item) => item.tags || [])),
    };
  }

  if (sectionKey === "experience") {
    return {
      type: uniqueSorted(items.map((item) => item.type)),
      roleArea: uniqueSorted(items.map((item) => item.roleArea)),
    };
  }

  if (sectionKey === "skills") {
    return {
      category: uniqueSorted(items.map((item) => item.category)),
    };
  }

  if (sectionKey === "social") {
    return {
      platform: uniqueSorted(items.map((item) => item.platform)),
    };
  }

  if (sectionKey === "education") {
    return {
      level: uniqueSorted(items.map((item) => item.level)),
    };
  }

  return {};
}

function itemMatchesFilters(sectionKey, item, filters) {
  if (sectionKey === "projects") {
    const status = normalizeFilterValue(filters.status);
    const technology = normalizeFilterValue(filters.technology);
    return (
      (!status || normalizeFilterValue(item.status) === status) &&
      (!technology || (item.tags || []).some((tag) => normalizeFilterValue(tag) === technology))
    );
  }

  if (sectionKey === "experience") {
    const type = normalizeFilterValue(filters.type);
    const roleArea = normalizeFilterValue(filters.roleArea);
    return (
      (!type || normalizeFilterValue(item.type) === type) &&
      (!roleArea || normalizeFilterValue(item.roleArea) === roleArea)
    );
  }

  if (sectionKey === "skills") {
    return !filters.category || normalizeFilterValue(item.category) === normalizeFilterValue(filters.category);
  }

  if (sectionKey === "social") {
    return !filters.platform || normalizeFilterValue(item.platform) === normalizeFilterValue(filters.platform);
  }

  if (sectionKey === "education") {
    return !filters.level || normalizeFilterValue(item.level) === normalizeFilterValue(filters.level);
  }

  return true;
}

function formatFilterOption(sectionKey, key, value, t) {
  if (sectionKey === "education" && key === "level") {
    const normalized = normalizeFilterValue(value);
    return t(`appI18n.portfolio.educationLevels.${normalized}`, value);
  }

  return value;
}

function PortfolioListFilters({
  sectionKey,
  filters,
  options,
  filteredCount,
  totalCount,
  onChange,
  onClear,
}) {
  const { t } = useTranslation();
  const fieldsBySection = {
    projects: [
      { key: "status", label: t("appI18n.portfolio.filters.projectStatus", "Estado") },
      { key: "technology", label: t("appI18n.portfolio.filters.technology", "Tecnologia") },
    ],
    experience: [
      { key: "type", label: t("appI18n.portfolio.filters.experienceType", "Tipo") },
      { key: "roleArea", label: t("appI18n.portfolio.filters.area", "Area") },
    ],
    skills: [
      { key: "category", label: t("appI18n.portfolio.filters.skillCategory", "Categoria") },
    ],
    social: [
      { key: "platform", label: t("appI18n.portfolio.filters.platform", "Plataforma") },
    ],
    education: [
      { key: "level", label: t("appI18n.portfolio.filters.educationType", "Tipo de formacion") },
    ],
  };
  const fields = fieldsBySection[sectionKey] || [];
  const hasOptions = fields.some((field) => (options[field.key] || []).length > 0);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  if (!hasOptions) return null;

  return (
    <div className="portfolio-list-filters">
      <div className="portfolio-list-filters__header">
        <span>{t("appI18n.portfolio.filters.title", "Filtrar registros")}</span>
        <span>
          {t("appI18n.portfolio.filters.summary", {
            count: filteredCount,
            total: totalCount,
            defaultValue: `${filteredCount}/${totalCount}`,
          })}
        </span>
      </div>
      <div className="portfolio-list-filters__grid">
        {fields.map((field) => (
          <label key={field.key} className="portfolio-list-filters__field">
            <span>{field.label}</span>
            <select
              value={filters[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
            >
              <option value="">{t("appI18n.portfolio.filters.all", "Todos")}</option>
              {(options[field.key] || []).map((option) => (
                <option key={option} value={option}>
                  {formatFilterOption(sectionKey, field.key, option, t)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {hasActiveFilters ? (
        <button type="button" className="portfolio-list-filters__clear" onClick={onClear}>
          {t("appI18n.portfolio.filters.clear", "Limpiar filtros")}
        </button>
      ) : null}
    </div>
  );
}

export default function PortfolioWorkspace(props) {
  const { t } = useTranslation();
  const {
    activeMeta,
    activeItems,
    extraData,
    selectedId,
    selectedItem,
    mode,
    draft,
    fieldErrors,
    syncMessage,
    isBusy,
    confirmState,
    onBack,
    onCreate,
    onView,
    onEdit,
    onDelete,
    onDraftChange,
    onExtraChange,
    onCancel,
    onSave,
    onClearSelection,
    onCloseConfirm,
    onConfirmAction,
  } = props;

  const [filtersBySection, setFiltersBySection] = useState(EMPTY_FILTERS);
  const viewport = useViewport();
  const isTablet = viewport < 1080;
  const isMobile = viewport < 760;
  const sectionTitle = t(`appI18n.portfolio.sections.${activeMeta.key}.title`, activeMeta.title);
  const sectionSingular = t(`appI18n.portfolio.sections.${activeMeta.key}.singular`, activeMeta.singular);
  const activeFilters = useMemo(
    () => filtersBySection[activeMeta.key] || EMPTY_FILTERS[activeMeta.key] || {},
    [activeMeta.key, filtersBySection]
  );
  const filterOptions = useMemo(
    () => buildFilterOptions(activeMeta.key, activeItems),
    [activeMeta.key, activeItems]
  );
  const filteredItems = useMemo(
    () => activeItems.filter((item) => itemMatchesFilters(activeMeta.key, item, activeFilters)),
    [activeMeta.key, activeItems, activeFilters]
  );
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const recordsLabel = t(
    activeItems.length === 1 ? "appI18n.portfolio.recordCount" : "appI18n.portfolio.recordsCount",
    { count: activeItems.length }
  );
  const filteredRecordsLabel = t(
    filteredItems.length === 1 ? "appI18n.portfolio.recordCount" : "appI18n.portfolio.recordsCount",
    { count: filteredItems.length }
  );

  useEffect(() => {
    if (mode !== "view" || !hasActiveFilters) return;
    const selectedStillVisible = filteredItems.some((item) => item.id === selectedId);

    if (selectedStillVisible) return;
    if (filteredItems[0]) {
      onView(filteredItems[0]);
      return;
    }

    if (selectedId) onClearSelection?.();
  }, [filteredItems, hasActiveFilters, mode, onClearSelection, onView, selectedId]);

  const shellStyle = {
    ...workspaceShell,
    gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : workspaceShell.gridTemplateColumns,
  };
  const contentStyle = {
    ...unifiedContent,
    gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : unifiedContent.gridTemplateColumns,
    gap: isMobile ? 16 : unifiedContent.gap,
  };
  const listStyle = {
    ...listColumn,
    paddingRight: isMobile ? 0 : listColumn.paddingRight,
  };
  const dividerStyle = {
    ...subtleDivider,
    display: isTablet ? "none" : "block",
  };
  const listScrollStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: isMobile ? "min(52vh, 460px)" : isTablet ? "min(56vh, 560px)" : "min(58vh, 680px)",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: isMobile ? 2 : 8,
    paddingBottom: 2,
    minHeight: 0,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(162,214,249,.55) rgba(255,255,255,.45)",
  };
  const compactHeaderStyle = {
    ...workspaceHero,
    marginBottom: 14,
    padding: isMobile ? "16px" : "18px 20px",
    borderRadius: 26,
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.14)",
    background: `radial-gradient(circle at 92% 10%, ${activeMeta.color}4a 0%, transparent 28%), linear-gradient(135deg, #07111f 0%, #121f36 58%, #1f3151 100%)`,
    boxShadow: "0 24px 54px rgba(7,17,31,.18), inset 0 1px 0 rgba(255,255,255,.12)",
  };

  return (
    <>
      <div style={shellStyle}>
        <section style={singlePanel}>
          <div style={unifiedCard}>
            <div style={breadcrumb}>
              <button type="button" onClick={onBack} style={breadcrumbLink} className="portfolio-breadcrumb-link">
                <ArrowLeft size={15} />
                {t("appI18n.portfolio.back")}
              </button>
              <span style={breadcrumbSep}>/</span>
              <span style={breadcrumbCurrent}>{t("appI18n.portfolio.mySection", { section: sectionTitle.toLowerCase() })}</span>
              <style>{`
                .portfolio-breadcrumb-link:hover {
                  transform: translateX(-2px);
                  background: rgba(49,87,213,.12) !important;
                  border-color: rgba(49,87,213,.24) !important;
                  box-shadow: 0 8px 18px rgba(49,87,213,.10), inset 0 1px 0 rgba(255,255,255,.78) !important;
                }
              `}</style>
            </div>

            <div style={compactHeaderStyle}>
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  width: 150,
                  height: 150,
                  right: -58,
                  top: -72,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${activeMeta.color}24 0%, transparent 68%)`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ display: "grid", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...eyebrow, marginBottom: 6, color: "rgba(232,240,255,.58)" }}>
                      {t("appI18n.portfolio.activeStation", { section: sectionTitle })}
                    </div>
                    <h1 style={{ ...title, marginBottom: 0, fontSize: isMobile ? "1.35rem" : "1.78rem", color: "#fff", letterSpacing: "-0.055em" }}>
                      {t("appI18n.portfolio.manage", { section: sectionTitle.toLowerCase() })}
                    </h1>
                  </div>

                  <InteractiveButton variant="primary" onClick={onCreate} compact disabled={isBusy}>
                    <Plus size={14} />
                    {t("appI18n.portfolio.add", { singular: sectionSingular })}
                  </InteractiveButton>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ ...statPill, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.13)", color: "rgba(255,255,255,.82)" }}>
                    {recordsLabel}
                  </span>
                  {syncMessage ? (
                    <span style={{ ...statPill, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.13)", color: "rgba(255,255,255,.82)" }}>
                      {syncMessage}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={listHeader}>
              <div>
                <div style={panelEyebrow}>{t("appI18n.portfolio.list")}</div>
                <div style={panelTitle}>
                  {hasActiveFilters ? filteredRecordsLabel : recordsLabel}
                </div>
              </div>
            </div>

            <div style={contentStyle}>
              <div style={listStyle}>
                <PortfolioListFilters
                  sectionKey={activeMeta.key}
                  filters={activeFilters}
                  options={filterOptions}
                  filteredCount={filteredItems.length}
                  totalCount={activeItems.length}
                  onChange={(key, value) => {
                    setFiltersBySection((prev) => ({
                      ...prev,
                      [activeMeta.key]: {
                        ...(prev[activeMeta.key] || {}),
                        [key]: value,
                      },
                    }));
                  }}
                  onClear={() => {
                    setFiltersBySection((prev) => ({
                      ...prev,
                      [activeMeta.key]: EMPTY_FILTERS[activeMeta.key] || {},
                    }));
                  }}
                />
                <div className="portfolio-list-scroll" style={listScrollStyle}>
                  {filteredItems.length === 0 ? (
                    <div className="portfolio-list-empty">
                      <strong>{t("appI18n.portfolio.filters.emptyTitle", "Sin coincidencias")}</strong>
                      <span>{t("appI18n.portfolio.filters.emptyText", "Ajusta o limpia los filtros para ver mas registros.")}</span>
                    </div>
                  ) : null}
                  {filteredItems.map((item) => {
                    const isActive = selectedId === item.id && mode !== "create";
                    return (
                      <HoverRow key={item.id} active={isActive} accentColor={activeMeta.color}>
                        <div style={rowLayout}>
                          <button type="button" onClick={() => onView(item)} style={itemMainButton}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {activeMeta.key === "social" ? <PlatformIconGlyph platform={item.platform} /> : null}
                              <div style={{ ...itemTitle, color: isActive ? "var(--blue-mid)" : "var(--text)" }}>
                                {getItemTitle(activeMeta.key, item)}
                              </div>
                            </div>
                            {activeMeta.key === "projects" ? (
                              <ProjectStatusPill status={item.status} compact />
                            ) : (
                              <div style={itemSubtitle}>{getItemSubtitle(activeMeta.key, item, t)}</div>
                            )}
                            {activeMeta.key === "skills" && <SkillDots level={item.level} />}
                          </button>

                          <div className="row-actions" style={rowActions}>
                            <InteractiveIconButton onClick={() => onEdit(item)} tone="default" disabled={isBusy}>
                              <PencilLine size={15} />
                            </InteractiveIconButton>
                            <InteractiveIconButton onClick={() => onDelete(item.id)} tone="danger" disabled={isBusy}>
                              <Trash2 size={15} />
                            </InteractiveIconButton>
                          </div>
                        </div>
                      </HoverRow>
                    );
                  })}
                </div>
              </div>

              <div aria-hidden="true" style={dividerStyle} />

              <div style={detailColumn}>
                {mode === "view" && selectedItem ? (
                  <>
                    <div style={detailHeader}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={panelEyebrow}>{t("appI18n.portfolio.view")}</div>
                        <div style={detailTitle}>{getItemTitle(activeMeta.key, selectedItem)}</div>
                        {activeMeta.key === "projects" ? (
                          <ProjectStatusPill status={selectedItem.status} />
                        ) : (
                          <div style={detailMeta}>{getItemSubtitle(activeMeta.key, selectedItem, t)}</div>
                        )}
                      </div>

                      {selectedItem.status && activeMeta.key !== "projects" ? <span style={statusBadge}>{selectedItem.status}</span> : null}
                    </div>

                    <DetailContent activeKey={activeMeta.key} item={selectedItem} />

                    <div style={detailActions}>
                      <InteractiveButton variant="secondary" onClick={() => onEdit(selectedItem)} disabled={isBusy}>
                        <PencilLine size={15} />
                        {t("appI18n.portfolio.edit")}
                      </InteractiveButton>
                      <InteractiveButton variant="danger" onClick={() => onDelete(selectedItem.id)} disabled={isBusy}>
                        <Trash2 size={15} />
                        {t("appI18n.portfolio.delete")}
                      </InteractiveButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={detailHeader}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={panelEyebrow}>{mode === "edit" ? t("appI18n.portfolio.edition") : t("appI18n.portfolio.newRecord")}</div>
                        <div style={detailTitle}>
                          {mode === "edit"
                            ? t("appI18n.portfolio.editItem", { singular: sectionSingular })
                            : t("appI18n.portfolio.addItem", { singular: sectionSingular })}
                        </div>
                        {fieldErrors?._form ? <div style={{ ...helperText, color: "#d53638", marginTop: 6 }}>{fieldErrors._form}</div> : null}
                      </div>
                    </div>

                    <FormContent
                      activeMeta={activeMeta}
                      draft={draft}
                      extraData={extraData}
                      fieldErrors={fieldErrors}
                      onDraftChange={onDraftChange}
                      onExtraChange={onExtraChange}
                    />

                    <div style={detailActions}>
                      <InteractiveButton variant="ghost" onClick={onCancel} disabled={isBusy}>
                        {t("appI18n.common.cancel")}
                      </InteractiveButton>
                      <InteractiveButton variant="primary" onClick={onSave} loading={isBusy}>
                        {isBusy
                          ? (mode === "edit" ? t("appI18n.portfolio.savingChanges") : t("appI18n.portfolio.savingRecord"))
                          : (mode === "edit" ? t("appI18n.portfolio.saveTitle") : t("appI18n.portfolio.addButton"))}
                      </InteractiveButton>
                    </div>
                  </>
                )}
              </div>
            </div>
            <style>{`
              .portfolio-list-scroll::-webkit-scrollbar {
                width: 8px;
              }

              .portfolio-list-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,.46);
                border-radius: 999px;
              }

              .portfolio-list-scroll::-webkit-scrollbar-thumb {
                background: rgba(127,198,243,.62);
                border-radius: 999px;
                border: 2px solid rgba(255,255,255,.62);
              }

              .portfolio-list-filters {
                display: grid;
                gap: 10px;
                margin-bottom: 12px;
                padding: 12px;
                border-radius: 18px;
                border: 1px solid var(--dashboard-card-border);
                background: color-mix(in srgb, var(--dashboard-soft-bg) 72%, transparent);
                box-shadow: inset 0 1px 0 rgba(255,255,255,.58);
              }

              .portfolio-list-filters__header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                font-family: var(--f-ui);
                font-size: .68rem;
                font-weight: 900;
                letter-spacing: .08em;
                text-transform: uppercase;
                color: var(--muted);
              }

              .portfolio-list-filters__grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 8px;
              }

              .portfolio-list-filters__field {
                display: grid;
                gap: 5px;
                min-width: 0;
              }

              .portfolio-list-filters__field span {
                font-family: var(--f-ui);
                font-size: .7rem;
                font-weight: 800;
                color: var(--muted);
              }

              .portfolio-list-filters__field select {
                width: 100%;
                height: 38px;
                border-radius: 13px;
                border: 1px solid var(--dashboard-card-border);
                background: var(--dashboard-card-bg);
                color: var(--text);
                font-family: var(--f-body);
                font-size: .82rem;
                font-weight: 700;
                padding: 0 10px;
                outline: none;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.62);
                transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
              }

              .portfolio-list-filters__field select:hover,
              .portfolio-list-filters__field select:focus {
                border-color: rgba(49,87,213,.36);
                box-shadow: 0 8px 18px rgba(49,87,213,.08), inset 0 1px 0 rgba(255,255,255,.72);
              }

              .portfolio-list-filters__clear {
                justify-self: start;
                border: 0;
                border-radius: 999px;
                padding: 7px 10px;
                background: rgba(49,87,213,.10);
                color: var(--blue-mid);
                font-family: var(--f-ui);
                font-size: .72rem;
                font-weight: 900;
                cursor: pointer;
                transition: transform .16s ease, background .16s ease;
              }

              .portfolio-list-filters__clear:hover {
                transform: translateY(-1px);
                background: rgba(49,87,213,.16);
              }

              .portfolio-list-empty {
                display: grid;
                gap: 5px;
                padding: 16px;
                border-radius: 18px;
                border: 1px dashed var(--dashboard-card-border);
                color: var(--muted);
                background: color-mix(in srgb, var(--dashboard-soft-bg) 72%, transparent);
              }

              .portfolio-list-empty strong {
                color: var(--text);
                font-family: var(--f-title);
                font-size: .96rem;
              }

              .portfolio-list-empty span {
                font-family: var(--f-body);
                font-size: .84rem;
                line-height: 1.45;
              }

              @media (max-width: 640px) {
                .portfolio-list-filters__grid {
                  grid-template-columns: minmax(0, 1fr);
                }
              }
            `}</style>
          </div>
        </section>
      </div>

      {confirmState ? (
        <ConfirmModal
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.kind === "delete" ? "danger" : "primary"}
          onCancel={onCloseConfirm}
          onConfirm={onConfirmAction}
          isBusy={isBusy}
        />
      ) : null}
    </>
  );
}
