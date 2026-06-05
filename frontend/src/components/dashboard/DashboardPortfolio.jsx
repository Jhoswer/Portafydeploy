import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
const MAX_PROJECT_TECH_TAGS = 8;
const PORTFOLIO_UPDATED_EVENT = "portfolio:updated";
const MAIN_SECTION_KEYS = ["experience", "projects", "social", "skills"];
const SAFE_GENERAL_TEXT = /^[\p{L}\p{N}\s.,:;!?&()/'"@+#_-]+$/u;
const SAFE_LONG_TEXT = /^[\p{L}\p{N}\s.,:;!?&()/'"@+#_/%\-\n]+$/u;
const SAFE_TAG_TEXT = /^[\p{L}\p{N}.+#_\-\s]+$/u;
const FIELD_RULES = {
  projectTitle: { min: 4, max: 90 },
  projectDescription: { min: 30, max: 360 },
  experienceCompany: { min: 2, max: 100 },
  experienceDescription: { min: 30, max: 420 },
  tag: { min: 2, max: 28 },
};
const SAFE_EDUCATION_TEXT = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,:&()/'-]+$/;
const SAFE_INSTITUTION_TEXT = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,&()'-]+$/;

function isBlank(value) {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return !value.trim();
  return !value;
}

function validateTextField(errors, key, value, rules, t, invalidKey = "safeText", pattern = SAFE_GENERAL_TEXT) {
  if (isBlank(value) || errors[key]) return;
  const text = String(value).trim();
  if (text.length < rules.min) {
    errors[key] = t("appI18n.portfolio.validation.minChars", { count: rules.min });
    return;
  }
  if (text.length > rules.max) {
    errors[key] = t("appI18n.portfolio.validation.maxChars", { count: rules.max });
    return;
  }
  if (!pattern.test(text)) {
    errors[key] = t(`appI18n.portfolio.validation.${invalidKey}`);
  }
}

function validateSectionDraft(sectionKey, draft, t) {
  const errors = {};

  if (sectionKey === "experience") {
    if (isBlank(draft.type)) errors.type = t("appI18n.portfolio.validation.experienceType");
    if (isBlank(draft.roleArea)) errors.roleArea = t("appI18n.portfolio.validation.area");
    if (isBlank(draft.title)) errors.title = t("appI18n.portfolio.validation.role");
    if (isBlank(draft.company)) errors.company = t("appI18n.portfolio.validation.company");
    if (isBlank(draft.description)) errors.description = t("appI18n.portfolio.validation.description");
    validateTextField(errors, "company", draft.company, FIELD_RULES.experienceCompany, t, "safeCompany");
    validateTextField(errors, "description", draft.description, FIELD_RULES.experienceDescription, t, "safeLongText", SAFE_LONG_TEXT);
    if (isBlank(draft.startDate)) errors.startDate = t("appI18n.portfolio.validation.startDate");
    if (!draft.isCurrent && isBlank(draft.endDate)) errors.endDate = t("appI18n.portfolio.validation.endDate");
  }

  if (sectionKey === "projects") {
    if (isBlank(draft.title)) errors.title = t("appI18n.portfolio.validation.projectTitle");
    if (isBlank(draft.description)) errors.description = t("appI18n.portfolio.validation.projectDescription");
    if (isBlank(draft.techCategory)) errors.techCategory = t("appI18n.portfolio.validation.techCategory");
    if (isBlank(draft.tags)) errors.tags = t("appI18n.portfolio.validation.tags");
    validateTextField(errors, "title", draft.title, FIELD_RULES.projectTitle, t);
    validateTextField(errors, "description", draft.description, FIELD_RULES.projectDescription, t, "safeLongText", SAFE_LONG_TEXT);
    if (Array.isArray(draft.tags)) {
      if (draft.tags.length > MAX_PROJECT_TECH_TAGS) {
        errors.tags = t("appI18n.portfolio.validation.maxTags", { count: MAX_PROJECT_TECH_TAGS });
      } else {
        const invalidTag = draft.tags.find((tag) => {
          const text = String(tag || "").trim();
          return text.length < FIELD_RULES.tag.min || text.length > FIELD_RULES.tag.max || !SAFE_TAG_TEXT.test(text);
        });
        if (invalidTag) errors.tags = t("appI18n.portfolio.validation.safeTag");
      }
    }
    if (isBlank(draft.status)) errors.status = t("appI18n.portfolio.validation.projectStatus");
    if (draft.cover instanceof File) {
      if (!draft.cover.type.startsWith("image/")) {
        errors.cover = t("appI18n.portfolio.validation.coverType");
      } else if (draft.cover.size > MAX_PROJECT_COVER_SIZE_BYTES) {
        errors.cover = t("appI18n.portfolio.validation.coverSize");
      }
    }
  }

  if (sectionKey === "skills") {
    if (isBlank(draft.category)) errors.category = t("appI18n.portfolio.validation.category");
    if (isBlank(draft.name)) errors.name = t("appI18n.portfolio.validation.skill");
    if (isBlank(draft.level)) errors.level = t("appI18n.portfolio.validation.level");
  }

  if (sectionKey === "social") {
    if (isBlank(draft.platform)) errors.platform = t("appI18n.portfolio.validation.platform");
    if (isBlank(draft.url)) errors.url = t("appI18n.portfolio.validation.url");
  }

  if (sectionKey === "education") {
    if (isBlank(draft.level)) errors.level = t("appI18n.portfolio.validation.educationLevel");
    if (isBlank(draft.program)) errors.program = t("appI18n.portfolio.validation.program");
    if (!isBlank(draft.program) && draft.program.length > 140) errors.program = t("appI18n.portfolio.validation.max140");
    if (!isBlank(draft.program) && !SAFE_EDUCATION_TEXT.test(draft.program)) errors.program = t("appI18n.portfolio.validation.safeText");
    if (isBlank(draft.institution)) errors.institution = t("appI18n.portfolio.validation.institution");
    if (!isBlank(draft.institution) && draft.institution.length > 120) errors.institution = t("appI18n.portfolio.validation.max120");
    if (!isBlank(draft.institution) && !SAFE_INSTITUTION_TEXT.test(draft.institution)) errors.institution = t("appI18n.portfolio.validation.safeInstitution");
    if (isBlank(draft.startDate)) errors.startDate = t("appI18n.portfolio.validation.startDate");
    if (!draft.isCurrent && isBlank(draft.endDate)) errors.endDate = t("appI18n.portfolio.validation.endDateCurrent");
    if (draft.startDate && draft.endDate && !draft.isCurrent && draft.endDate < draft.startDate) {
      errors.endDate = t("appI18n.portfolio.validation.dateOrder");
    }
  }

  if (Object.keys(errors).length > 0) {
    errors._form = t("appI18n.portfolio.validation.form");
  }

  return errors;
}

export default function DashboardPortfolio() {
  const { t } = useTranslation();
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
          setLoadError(t("appI18n.portfolio.loadError"));
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
  }, [t]);

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
          latestSubtitle: latestItem ? getItemSubtitle(section.key, latestItem, t) : "",
        };
      }),
    [itemsBySection, t]
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
      title: t("appI18n.portfolio.deleteTitle"),
      description: t("appI18n.portfolio.deleteDescription", {
        item: target ? `"${target.title ?? target.name ?? target.platform ?? target.program}"` : t("appI18n.portfolio.deleteFallback"),
      }),
      confirmLabel: t("appI18n.portfolio.deleteConfirm"),
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
          ? t("appI18n.portfolio.fixFields")
          : error.message || t("appI18n.portfolio.saveError")
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (isSyncing) return;
    const cleanDraft = buildCleanDraft();
    const nextErrors = validateSectionDraft(activeSection, cleanDraft, t);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLoadError("");
      return;
    }

    if (mode === "edit" && selectedId) {
      setConfirmState({
        kind: "edit",
        cleanDraft,
        title: t("appI18n.portfolio.saveTitle"),
        description: t("appI18n.portfolio.saveDescription"),
        confirmLabel: t("appI18n.portfolio.saveConfirm"),
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
        setLoadError(error.message || t("appI18n.portfolio.deleteError"));
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
      syncMessage={isSyncing ? t("appI18n.portfolio.syncingDb") : loadError}
      onBack={() => setActiveSection(null)}
      onCreate={() => {
        if (isSyncing) return;
        openCreate();
      }}
      onView={(item) => {
        if (isSyncing) return;
        openView(item);
      }}
      onClearSelection={() => {
        if (isSyncing) return;
        setSelectedId(null);
        setMode("view");
        setDraft(createEmptyForm(activeSection));
        setFieldErrors({});
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
