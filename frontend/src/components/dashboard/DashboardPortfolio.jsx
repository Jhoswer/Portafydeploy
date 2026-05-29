import { useEffect, useMemo, useState } from "react";
import PortfolioOverview from "./portfolio/PortfolioOverview";
import PortfolioWorkspace from "./portfolio/PortfolioWorkspace";
import {
  createEmptyForm,
  createFilledForm,
  INITIAL_EXTRA_BY_SECTION,
  INITIAL_ITEMS,
  SECTION_META,
} from "../../features/dashboard-portfolio/portfolioConfig";
import {
  clearPortfolioOverviewCache,
  createPortfolioItem,
  deletePortfolioItem,
  fetchPortfolioOverview,
  updatePortfolioItem,
} from "../../services/portfolioService";
import { getItemSubtitle, getItemTitle } from "../../features/dashboard-portfolio/portfolioWorkspaceContent";

const MAX_PROJECT_COVER_SIZE_BYTES = 2 * 1024 * 1024;
const PORTFOLIO_UPDATED_EVENT = "portfolio:updated";
const MAIN_SECTION_KEYS = ["experience", "projects", "social", "skills"];
const SAFE_EDUCATION_TEXT = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,:&()\/'-]+$/;
const SAFE_INSTITUTION_TEXT = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,&()'-]+$/;

function isBlank(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return !value.trim();
  return !value;
}

function validateSectionDraft(sectionKey, draft) {
  const errors = {};

  if (sectionKey === "experience") {
    if (isBlank(draft.type)) errors.type = "Selecciona el tipo de experiencia.";
    if (isBlank(draft.roleArea)) errors.roleArea = "Selecciona el area.";
    if (isBlank(draft.title)) errors.title = "Completa el cargo.";
    if (isBlank(draft.company)) errors.company = "Completa la empresa o institucion.";
    if (isBlank(draft.description)) errors.description = "Agrega una descripcion breve.";
    if (isBlank(draft.startDate)) errors.startDate = "Selecciona la fecha de inicio.";
    if (!draft.isCurrent && isBlank(draft.endDate)) errors.endDate = "Selecciona la fecha de fin o marca que sigues ahi.";
  }

  if (sectionKey === "projects") {
    if (isBlank(draft.title)) errors.title = "Completa el titulo del proyecto.";
    if (isBlank(draft.description)) errors.description = "Agrega una descripcion breve del proyecto.";
    if (isBlank(draft.techCategory)) errors.techCategory = "Selecciona una categoria tecnica.";
    if (isBlank(draft.tags)) errors.tags = "Agrega al menos una tecnologia.";
    if (isBlank(draft.status)) errors.status = "Selecciona el estado del proyecto.";
    if (draft.cover instanceof File) {
      if (!draft.cover.type.startsWith("image/")) {
        errors.cover = "La portada debe ser una imagen valida.";
      } else if (draft.cover.size > MAX_PROJECT_COVER_SIZE_BYTES) {
        errors.cover = "La portada no debe superar 2 MB.";
      }
    }
  }

  if (sectionKey === "skills") {
    if (isBlank(draft.category)) errors.category = "Selecciona una categoria.";
    if (isBlank(draft.name)) errors.name = "Selecciona o escribe una habilidad.";
    if (isBlank(draft.level)) errors.level = "Selecciona el nivel.";
  }

  if (sectionKey === "social") {
    if (isBlank(draft.platform)) errors.platform = "Selecciona o escribe una plataforma.";
    if (isBlank(draft.url)) errors.url = "Completa la URL del enlace.";
  }

  if (sectionKey === "education") {
    if (isBlank(draft.level)) errors.level = "Selecciona el tipo de formacion.";
    if (isBlank(draft.program)) errors.program = "Completa el programa o carrera.";
    if (!isBlank(draft.program) && draft.program.length > 140) errors.program = "Maximo 140 caracteres.";
    if (!isBlank(draft.program) && !SAFE_EDUCATION_TEXT.test(draft.program)) errors.program = "Usa solo letras, numeros y signos basicos.";
    if (isBlank(draft.institution)) errors.institution = "Completa la institucion.";
    if (!isBlank(draft.institution) && draft.institution.length > 120) errors.institution = "Maximo 120 caracteres.";
    if (!isBlank(draft.institution) && !SAFE_INSTITUTION_TEXT.test(draft.institution)) errors.institution = "La institucion contiene caracteres no validos.";
    if (isBlank(draft.startDate)) errors.startDate = "Selecciona la fecha de inicio.";
    if (!draft.isCurrent && isBlank(draft.endDate)) errors.endDate = "Selecciona la fecha de fin o marca que sigue vigente.";
    if (draft.startDate && draft.endDate && !draft.isCurrent && draft.endDate < draft.startDate) {
      errors.endDate = "La fecha de fin no puede ser anterior al inicio.";
    }
  }

  if (Object.keys(errors).length > 0) {
    errors._form = "Faltan campos obligatorios por completar.";
  }

  return errors;
}

export default function DashboardPortfolio() {
  const [itemsBySection, setItemsBySection] = useState(INITIAL_ITEMS);
  const [extraBySection, setExtraBySection] = useState(INITIAL_EXTRA_BY_SECTION);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState(createEmptyForm("projects"));
  const [confirmState, setConfirmState] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadPortfolio = async () => {
      setIsSyncing(true);
      setLoadError("");

      try {
        const { skills, experience, projects, social, education, formacion, socialExtra } = await fetchPortfolioOverview();

        if (cancelled) return;

        setItemsBySection({
          skills,
          experience,
          projects,
          social,
          education: education ?? formacion ?? [],
        });

        setExtraBySection((prev) => ({
          ...prev,
          social: {
            ...(prev.social ?? {}),
            ...socialExtra,
          },
        }));
        setFieldErrors({});
      } catch {
        if (!cancelled) {
          setLoadError("No se pudo cargar el portafolio en este momento.");
        }
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeMeta = activeSection ? SECTION_META[activeSection] : null;
  const activeItems = activeSection ? itemsBySection[activeSection] : [];
  const selectedItem = activeItems.find((item) => item.id === selectedId) ?? null;

  const overviewCards = useMemo(
    () =>
      Object.values(SECTION_META).map((section) => ({
        ...section,
        count: itemsBySection[section.key].length,
      })).filter((section) => MAIN_SECTION_KEYS.includes(section.key)),
    [itemsBySection]
  );
  const educationSummary = useMemo(
    () => ({
      ...SECTION_META.education,
      count: itemsBySection.education?.length ?? 0,
      latest: itemsBySection.education?.[0] ?? null,
    }),
    [itemsBySection.education]
  );
  const portfolioProgress = useMemo(() => {
    const totalSections = Object.keys(SECTION_META).length;
    const completedSections = Object.values(SECTION_META).filter((section) => {
      const items = itemsBySection[section.key] ?? [];
      return items.length > 0;
    }).length;

    return {
      completedSections,
      totalSections,
      percent: Math.round((completedSections / totalSections) * 100),
    };
  }, [itemsBySection]);
  const recentHighlights = useMemo(
    () =>
      Object.values(SECTION_META).map((section) => {
        const latestItem = itemsBySection[section.key]?.[0] ?? null;

        return {
          key: section.key,
          title: section.title,
          singular: section.singular,
          color: section.color,
          icon: section.icon,
          count: itemsBySection[section.key]?.length ?? 0,
          latestTitle: latestItem ? getItemTitle(section.key, latestItem) : "",
          latestSubtitle: latestItem ? getItemSubtitle(section.key, latestItem) : "",
        };
      }),
    [itemsBySection]
  );

  const openSection = (sectionKey) => {
    const nextItems = itemsBySection[sectionKey];
    setActiveSection(sectionKey);
    setSelectedId(nextItems[0]?.id ?? null);
    setMode("view");
    setDraft(createEmptyForm(sectionKey));
    setFieldErrors({});
  };

  const openCreate = () => {
    setMode("create");
    setSelectedId(null);
    setDraft(createEmptyForm(activeSection));
    setFieldErrors({});
  };

  const openEdit = (item) => {
    setMode("edit");
    setSelectedId(item.id);
    setDraft(createFilledForm(activeSection, item));
    setFieldErrors({});
  };

  const openView = (item) => {
    setMode("view");
    setSelectedId(item.id);
    setDraft(createEmptyForm(activeSection));
    setFieldErrors({});
  };

  const deleteItemFromState = (itemId) => {
    setItemsBySection((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].filter((item) => item.id !== itemId),
    }));

    if (selectedId === itemId) {
      const remaining = activeItems.filter((item) => item.id !== itemId);
      setSelectedId(remaining[0]?.id ?? null);
      setMode("view");
    }
  };

  const handleDelete = (itemId) => {
    if (isSyncing) return;
    const target = activeItems.find((item) => item.id === itemId);
    setConfirmState({
      kind: "delete",
      itemId,
      title: "Eliminar registro",
      description: `Se eliminara ${target ? `"${target.title ?? target.name ?? target.platform ?? target.program}"` : "este registro"}. Esta accion no se puede deshacer.`,
      confirmLabel: "Si, eliminar",
    });
  };

  const buildCleanDraft = () =>
    Object.fromEntries(
      Object.entries(draft).map(([key, value]) => {
        if (Array.isArray(value)) return [key, value.filter(Boolean)];
        if (typeof value === "string") return [key, value.trim()];
        return [key, value];
      })
    );

  const commitSave = async (cleanDraft) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLoadError("");

    try {
      if (mode === "edit" && selectedId) {
        const updatedItem = await updatePortfolioItem(
          activeSection,
          selectedId,
          cleanDraft,
          extraBySection[activeSection] ?? {}
        );

        setItemsBySection((prev) => ({
          ...prev,
          [activeSection]: prev[activeSection].map((item) =>
            item.id === selectedId ? updatedItem : item
          ),
        }));
        clearPortfolioOverviewCache();
        window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
        setFieldErrors({});
        setMode("view");
        return;
      }

      const newItem = await createPortfolioItem(
        activeSection,
        cleanDraft,
        extraBySection[activeSection] ?? {}
      );

      setItemsBySection((prev) => ({
        ...prev,
        [activeSection]: [newItem, ...prev[activeSection]],
      }));
      clearPortfolioOverviewCache();
      window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
      setSelectedId(newItem.id);
      setFieldErrors({});
      setMode("view");
    } catch (error) {
      const nextErrors = error.validationErrors || {};
      setFieldErrors(nextErrors);
      setLoadError(
        Object.keys(nextErrors).length
          ? "Corrige los campos marcados para continuar."
          : error.message || "No se pudo guardar el registro en este momento."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (isSyncing) return;
    const cleanDraft = buildCleanDraft();
    const nextErrors = validateSectionDraft(activeSection, cleanDraft);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLoadError("");
      return;
    }

    if (mode === "edit" && selectedId) {
      setConfirmState({
        kind: "edit",
        cleanDraft,
        title: "Guardar cambios",
        description: "Se actualizara este registro con la informacion del formulario. Confirma si deseas continuar.",
        confirmLabel: "Si, guardar",
      });
      return;
    }

    await commitSave(cleanDraft);
  };

  const handleConfirm = async () => {
    if (!confirmState || isSyncing) return;

    if (confirmState.kind === "delete") {
      try {
        setIsSyncing(true);
        setLoadError("");
        await deletePortfolioItem(activeSection, confirmState.itemId);
        deleteItemFromState(confirmState.itemId);
        clearPortfolioOverviewCache();
        window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
        setFieldErrors({});
      } catch (error) {
        setLoadError(error.message || "No se pudo eliminar el registro");
      } finally {
        setIsSyncing(false);
      }
    }

    if (confirmState.kind === "edit") {
      await commitSave(confirmState.cleanDraft);
    }

    setConfirmState(null);
  };

  if (!activeSection) {
    return (
      <PortfolioOverview
        overviewCards={overviewCards}
        progress={portfolioProgress}
        recentHighlights={recentHighlights}
        educationSummary={educationSummary}
        onOpenSection={openSection}
      />
    );
  }

  return (
    <PortfolioWorkspace
      activeMeta={activeMeta}
      activeItems={activeItems}
      extraData={extraBySection[activeSection] ?? {}}
      selectedId={selectedId}
      selectedItem={selectedItem}
      mode={mode}
      draft={draft}
      fieldErrors={fieldErrors}
      isBusy={isSyncing}
      syncMessage={isSyncing ? "Sincronizando con la base de datos..." : loadError}
      onBack={() => setActiveSection(null)}
      onCreate={() => {
        if (isSyncing) return;
        openCreate();
      }}
      onView={(item) => {
        if (isSyncing) return;
        openView(item);
      }}
      onEdit={(item) => {
        if (isSyncing) return;
        openEdit(item);
      }}
      onDelete={handleDelete}
      onDraftChange={(key, value) =>
        {
          setDraft((prev) => ({
            ...prev,
            [key]: value,
            ...(activeSection === "experience" && key === "type"
              ? { roleArea: "", title: "" }
              : {}),
            ...(activeSection === "experience" && key === "roleArea"
              ? { title: "" }
              : {}),
          }));
          setFieldErrors((prev) => {
            if (!prev[key] && !prev._form) return prev;
            const next = { ...prev };
            delete next[key];
            delete next._form;
            return next;
          });
        }
      }
      onExtraChange={(key, value) =>
        {
          setExtraBySection((prev) => ({
            ...prev,
            [activeSection]: {
              ...(prev[activeSection] ?? {}),
              [key]: value,
            },
          }));
          setFieldErrors((prev) => {
            if (!prev[key] && !prev._form) return prev;
            const next = { ...prev };
            delete next[key];
            delete next._form;
            return next;
          });
        }
      }
      onCancel={() => {
        if (isSyncing) return;
        setMode("view");
        setDraft(createEmptyForm(activeSection));
        setFieldErrors({});
      }}
      onSave={handleSave}
      confirmState={confirmState}
      onCloseConfirm={() => setConfirmState(null)}
      onConfirmAction={handleConfirm}
    />
  );
}
