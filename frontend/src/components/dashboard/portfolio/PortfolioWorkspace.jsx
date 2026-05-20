import { ArrowLeft, CheckCircle2, PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
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

export default function PortfolioWorkspace(props) {
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
    onCloseConfirm,
    onConfirmAction,
  } = props;

  const viewport = useViewport();
  const isTablet = viewport < 1080;
  const isMobile = viewport < 760;

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
                Volver al portafolio
              </button>
              <span style={breadcrumbSep}>/</span>
              <span style={breadcrumbCurrent}>Mis {activeMeta.title.toLowerCase()}</span>
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
                      Estacion activa / {activeMeta.title}
                    </div>
                    <h1 style={{ ...title, marginBottom: 0, fontSize: isMobile ? "1.35rem" : "1.78rem", color: "#fff", letterSpacing: "-0.055em" }}>
                      Gestion de {activeMeta.title.toLowerCase()}
                    </h1>
                  </div>

                  <InteractiveButton variant="primary" onClick={onCreate} compact disabled={isBusy}>
                    <Plus size={14} />
                    Agregar {activeMeta.singular}
                  </InteractiveButton>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ ...statPill, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.13)", color: "rgba(255,255,255,.82)" }}>
                    <CheckCircle2 size={14} color="var(--blue-mid)" />
                    {activeItems.length} {activeItems.length === 1 ? "registro" : "registros"}
                  </span>
                  <span style={{ ...statPill, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.13)", color: "rgba(255,255,255,.82)" }}>
                    <Sparkles size={14} color="var(--blue-mid)" />
                    {activeMeta.singular} editable
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
                <div style={panelEyebrow}>Listado</div>
                <div style={panelTitle}>
                  {activeItems.length} {activeItems.length === 1 ? "registro" : "registros"}
                </div>
              </div>
            </div>

            <div style={contentStyle}>
              <div style={listStyle}>
                <div className="portfolio-list-scroll" style={listScrollStyle}>
                  {activeItems.map((item) => {
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
                              <div style={itemSubtitle}>{getItemSubtitle(activeMeta.key, item)}</div>
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
                        <div style={panelEyebrow}>Vista</div>
                        <div style={detailTitle}>{getItemTitle(activeMeta.key, selectedItem)}</div>
                        {activeMeta.key === "projects" ? (
                          <ProjectStatusPill status={selectedItem.status} />
                        ) : (
                          <div style={detailMeta}>{getItemSubtitle(activeMeta.key, selectedItem)}</div>
                        )}
                      </div>

                      {selectedItem.status && activeMeta.key !== "projects" ? <span style={statusBadge}>{selectedItem.status}</span> : null}
                    </div>

                    <DetailContent activeKey={activeMeta.key} item={selectedItem} />

                    <div style={detailActions}>
                      <InteractiveButton variant="secondary" onClick={() => onEdit(selectedItem)} disabled={isBusy}>
                        <PencilLine size={15} />
                        Editar
                      </InteractiveButton>
                      <InteractiveButton variant="danger" onClick={() => onDelete(selectedItem.id)} disabled={isBusy}>
                        <Trash2 size={15} />
                        Eliminar
                      </InteractiveButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={detailHeader}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={panelEyebrow}>{mode === "edit" ? "Edicion" : "Nuevo registro"}</div>
                        <div style={detailTitle}>
                          {mode === "edit" ? `Editar ${activeMeta.singular}` : `Agregar ${activeMeta.singular}`}
                        </div>
                        <div style={detailMeta}>Completa solo esta seccion, sin seguir un flujo pesado.</div>
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
                        Cancelar
                      </InteractiveButton>
                      <InteractiveButton variant="primary" onClick={onSave} loading={isBusy}>
                        {isBusy
                          ? (mode === "edit" ? "Guardando cambios" : "Guardando registro")
                          : (mode === "edit" ? "Guardar cambios" : "Agregar")}
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
