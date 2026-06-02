import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  PencilLine,
} from "lucide-react";

import {
  actualizarPerfil,
  clearProfileOverviewCache,
  fetchFormaciones,
  fetchProfile,
  fetchProfileOverview as fetchPublicProfileOverview,
} from "../../services/authService";
import {
  clearPortfolioOverviewCache,
  fetchPortfolioOverview,
  fetchPortfolioSection,
  normalizeOverviewPayload,
} from "../../services/portfolioService";
import {
  FEED_UPDATED_EVENT,
  COMMENT_MAX_LENGTH,
  commentFeedPost,
  fetchFeedPost,
  fetchMyFeedPosts,
  publishExperienceToFeed,
  publishProjectToFeed,
  sanitizeCommentInput,
  unshareFeedPost,
  validateCommentText,
} from "../../services/feedService";
import { isContactPublic } from "../../services/settingsService";
import { isAdministrativeRole } from "../../services/searchService";
import { useAuth } from "../../context/useAuth";
import { hasPermission, PERMISSION_NAMES } from "../../utils/permissions";
import { useViewport } from "../../hooks/useViewport";
import {
  Card,
  EmptyCard,
  EducationItem,
  ExperienceItem,
  FolderKanban,
  MessageBox,
  MetaItem,
  ProjectCard,
  SocialItem,
  SkillChip,
  StateBox,
  StatCard,
  SummaryCard,
  BriefcaseBusiness,
} from "./profile/ProfileSections";
import ProfileHero from "./profile/ProfileHero";
import ProfilePublicationCard from "./profile/ProfilePublicationCard";
import { PostCommentsModal } from "../feed2/FeedPostCard";
import { ReportPublicationModal } from "../feed2/ReportPublicationModal";
import { normalizeFeedPost } from "../../features/feed/feedMappers";
import { createCommentReport } from "../../services/reportService";
import { ConfirmModal } from "../../features/dashboard-portfolio/portfolioWorkspaceControls";
import { profileUi as ui } from "../../styles/components/dashboard/profileStyles";
import { dashboardShell } from "../../styles/components/dashboardShell";
import {
  groupSkills,
  educationHeadline,
  makeDraft,
  normalizeEducationList,
  PROFILE_IMAGE_MAX_BYTES,
  resolveMediaUrl,
} from "../../features/dashboard-profile/profileUtils";
import {
  buildStats,
  clearImageDrafts,
  publicationIds,
  upsertPublication,
} from "../../features/dashboard-profile/profileDashboardUtils";
import DashboardCv from "./cv/DashboardCv";
import {
  ConfirmUnfollowModal,
  ProfileViewsModal,
  RelationListModal,
  ReportProfileModal,
} from "./profile/ProfileTrustModals";
import {
  createProfileReport,
  fetchFollowStatus,
  fetchProfileViews,
  fetchRelations,
  followProfile,
  recordAnalyticsEvent,
  recordProfileView,
  unfollowProfile,
} from "../../services/profileTrustService";

const PORTFOLIO_UPDATED_EVENT = "portfolio:updated";
const DASHBOARD_PROFILE_CACHE_TTL_MS = 90000;

let dashboardProfileViewCache = {
  expiresAt: 0,
  value: null,
};

function isDashboardProfileCacheFresh() {
  return (
    dashboardProfileViewCache.value &&
    dashboardProfileViewCache.expiresAt > Date.now()
  );
}

export default function DashboardProfile({ userId = null, readOnly = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();
  const width = useViewport();
  const isTablet = width < 1100;
  const isMobile = width < 760;
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const trackedPublicSectionsRef = useRef(new Set());
  const trackedPublicProjectsRef = useRef(new Set());
  const isPublicProfile = Boolean(userId);
  const canEdit = !readOnly && !isPublicProfile;
  const canPublishFeed = hasPermission(user, PERMISSION_NAMES.FEED_PUBLISH);
  const cachedSnapshot =
    !isPublicProfile && !readOnly && isDashboardProfileCacheFresh()
      ? dashboardProfileViewCache.value
      : null;
  const hasInitialCachedSnapshot = useRef(Boolean(cachedSnapshot)).current;

  const [profile, setProfile] = useState(cachedSnapshot?.profile ?? null);
  const [projects, setProjects] = useState(cachedSnapshot?.projects ?? []);
  const [experience, setExperience] = useState(
    cachedSnapshot?.experience ?? [],
  );
  const [skills, setSkills] = useState(cachedSnapshot?.skills ?? []);
  const [education, setEducation] = useState(cachedSnapshot?.education ?? []);
  const [social, setSocial] = useState(cachedSnapshot?.social ?? []);
  const [cv, setCv] = useState(cachedSnapshot?.cv ?? { cvUrl: "" });
  const [tab, setTab] = useState("feed");
  const [loading, setLoading] = useState(!cachedSnapshot?.profile);
  const [error, setError] = useState("");
  const [profileLoadAttempt, setProfileLoadAttempt] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [sharingProjectId, setSharingProjectId] = useState("");
  const [sharedProjectIds, setSharedProjectIds] = useState(() =>
    publicationIds(cachedSnapshot?.profilePosts ?? [], "projectId"),
  );
  const [sharingExperienceId, setSharingExperienceId] = useState("");
  const [sharedExperienceIds, setSharedExperienceIds] = useState(() =>
    publicationIds(cachedSnapshot?.profilePosts ?? [], "experienceId"),
  );
  const [unsharingPublicationId, setUnsharingPublicationId] = useState(null);
  const [pendingUnsharePost, setPendingUnsharePost] = useState(null);
  const [profilePosts, setProfilePosts] = useState(
    cachedSnapshot?.profilePosts ?? [],
  );
  const [relationModal, setRelationModal] = useState(null);
  const [relations, setRelations] = useState([]);
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [pendingUnfollowUser, setPendingUnfollowUser] = useState(null);
  const [relationBusy, setRelationBusy] = useState(false);
  const [relationError, setRelationError] = useState("");
  const [profileViewsOpen, setProfileViewsOpen] = useState(false);
  const [profileViews, setProfileViews] = useState([]);
  const [profileViewsLoading, setProfileViewsLoading] = useState(false);
  const [reportProfileOpen, setReportProfileOpen] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState("");
  const [followState, setFollowState] = useState({ isFollowing: false, busy: false });
  const [profileUnfollowOpen, setProfileUnfollowOpen] = useState(false);
  const [profileFollowError, setProfileFollowError] = useState("");
  const [expandedPublicationId, setExpandedPublicationId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [commentingPublicationId, setCommentingPublicationId] = useState(null);
  const [commentsModalPost, setCommentsModalPost] = useState(null);
  const [commentsModalLoadingId, setCommentsModalLoadingId] = useState(null);
  const [pendingReportComment, setPendingReportComment] = useState(null);
  const [commentReportBusyId, setCommentReportBusyId] = useState(null);
  const [commentReportError, setCommentReportError] = useState("");
  const [loadingPublicationCommentsId, setLoadingPublicationCommentsId] =
    useState(null);
  const [sectionLoading, setSectionLoading] = useState({});
  const [loadedSections, setLoadedSections] = useState(
    cachedSnapshot?.loadedSections ?? {},
  );
  const [draft, setDraft] = useState(
    makeDraft(cachedSnapshot?.profile ?? null),
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [mediaVersion, setMediaVersion] = useState(0);
  const applyFeedPosts = useCallback((posts) => {
    setProfilePosts(posts);
    setSharedProjectIds(publicationIds(posts, "projectId"));
    setSharedExperienceIds(publicationIds(posts, "experienceId"));
  }, []);

  const mergeProfilePost = useCallback((post) => {
    setProfilePosts((prev) => upsertPublication(prev, post));
  }, []);

  const markSectionLoaded = useCallback((sectionKey) => {
    setLoadedSections((prev) => ({ ...prev, [sectionKey]: true }));
  }, []);

  const removeSharedPost = useCallback(
    (publicationId, projectId = null, experienceId = null) => {
      setProfilePosts((prev) =>
        prev.filter(
          (post) => String(post.publicationId) !== String(publicationId),
        ),
      );

      if (projectId) {
        setSharedProjectIds((prev) => {
          const next = new Set(prev);
          next.delete(String(projectId));
          return next;
        });
      }

      if (experienceId) {
        setSharedExperienceIds((prev) => {
          const next = new Set(prev);
          next.delete(String(experienceId));
          return next;
        });
      }
    },
    [],
  );

  const findSharedPost = useCallback(
    (sourceType, id) =>
      profilePosts.find((post) =>
        sourceType === "project"
          ? String(post.projectId) === String(id)
          : String(post.experienceId) === String(id),
      ),
    [profilePosts],
  );

  const setSectionBusy = useCallback((sectionKey, value) => {
    setSectionLoading((prev) => ({ ...prev, [sectionKey]: value }));
  }, []);

  const loadOwnSection = useCallback(
    async (sectionKey, { force = false } = {}) => {
      if (isPublicProfile || readOnly || (!force && loadedSections[sectionKey]))
        return;

      setSectionBusy(sectionKey, true);

      try {
        if (sectionKey === "projects") {
          const [items, posts] = await Promise.all([
            fetchPortfolioSection("projects"),
            fetchMyFeedPosts({ limit: 30 }).catch(() => []),
          ]);
          setProjects(items);
          applyFeedPosts(posts);
        }

        if (sectionKey === "experience") {
          const [items, posts] = await Promise.all([
            fetchPortfolioSection("experience"),
            fetchMyFeedPosts({ limit: 30 }).catch(() => []),
          ]);
          setExperience(items);
          applyFeedPosts(posts);
        }

        if (sectionKey === "profile-side") {
          const [skillItems, socialItems, educationItems] = await Promise.all([
            fetchPortfolioSection("skills"),
            fetchPortfolioSection("social"),
            fetchFormaciones(),
          ]);
          setSkills(skillItems);
          setSocial(socialItems);
          setEducation(normalizeEducationList(educationItems));
          // cvUrl ya está disponible en el profile cargado
          setCv({ cvUrl: profile?.url_cv || "" });
        }

        if (sectionKey === "feed") {
          applyFeedPosts(await fetchMyFeedPosts({ limit: 30 }));
        }

        markSectionLoaded(sectionKey);
      } finally {
        setSectionBusy(sectionKey, false);
      }
    },
    [
      applyFeedPosts,
      isPublicProfile,
      loadedSections,
      markSectionLoaded,
      readOnly,
      setSectionBusy,
      profile?.url_cv,
    ],
  );

  const togglePublicationComments = useCallback(
    async (post) => {
      const willOpen = expandedPublicationId !== post.publicationId;
      setExpandedPublicationId(willOpen ? post.publicationId : null);

      if (!willOpen || post.comments?.length || (post.commentsCount ?? 0) === 0)
        return;

      setLoadingPublicationCommentsId(post.publicationId);

      try {
        mergeProfilePost(await fetchFeedPost(post.publicationId));
      } finally {
        setLoadingPublicationCommentsId(null);
      }
    },
    [expandedPublicationId, mergeProfilePost],
  );

  const openProfileFromPublication = useCallback((targetUserId) => {
    if (!targetUserId) return;
    navigate(`/perfil-profesional?usuario=${targetUserId}`);
  }, [navigate]);

  const openAllPublicationComments = useCallback(async (post) => {
    if (!post?.publicationId) return;

    setCommentsModalPost(normalizeFeedPost(post));

    const loadedCount = Array.isArray(post.comments) ? post.comments.length : 0;
    if (loadedCount >= Number(post.commentsCount || 0)) return;

    setCommentsModalLoadingId(post.publicationId);
    try {
      const nextPost = await fetchFeedPost(post.publicationId);
      if (nextPost) {
        mergeProfilePost(nextPost);
        setCommentsModalPost(normalizeFeedPost(nextPost));
      }
    } finally {
      setCommentsModalLoadingId(null);
    }
  }, [mergeProfilePost]);

  const updateCommentDraft = useCallback((publicationId, value) => {
    const sanitized = sanitizeCommentInput(value);

    setCommentDrafts((prev) => ({
      ...prev,
      [publicationId]: sanitized,
    }));
    setCommentErrors((prev) => ({
      ...prev,
      [publicationId]: "",
    }));
  }, []);

  const submitPublicationComment = useCallback(
    async (post, event) => {
      event.preventDefault();

      const publicationId = post?.publicationId;
      const text = String(commentDrafts[publicationId] || "").trim();
      const validationError = validateCommentText(text);

      if (!publicationId || commentingPublicationId === publicationId) {
        return;
      }

      if (validationError) {
        setCommentErrors((prev) => ({
          ...prev,
          [publicationId]: validationError,
        }));
        return;
      }

      setCommentingPublicationId(publicationId);

      try {
        const nextPost = await commentFeedPost(publicationId, text);
        if (nextPost) {
          mergeProfilePost(nextPost);
        }
        setCommentDrafts((prev) => ({ ...prev, [publicationId]: "" }));
        setCommentErrors((prev) => ({ ...prev, [publicationId]: "" }));
        setExpandedPublicationId(publicationId);
      } finally {
        setCommentingPublicationId(null);
      }
    },
    [commentDrafts, commentingPublicationId, mergeProfilePost],
  );

  const reportPublicationComment = useCallback(async (payload) => {
    if (!pendingReportComment?.id || commentReportBusyId) return;

    setCommentReportBusyId(pendingReportComment.id);
    setCommentReportError("");

    try {
      await createCommentReport(pendingReportComment.id, payload);
      setPendingReportComment(null);
      setShareMessage(t("appI18n.profile.messages.reportSent"));
    } catch (err) {
      setCommentReportError(err.message || t("appI18n.profile.errors.commentReport"));
    } finally {
      setCommentReportBusyId(null);
    }
  }, [commentReportBusyId, pendingReportComment, t]);

  /* function tryParseCache(key) {
    try {
      if (sectionKey === "projects") {
        const [items, posts] = await Promise.all([
          fetchPortfolioSection("projects"),
          fetchMyFeedPosts({ limit: 30 }).catch(() => []),
        ]);
        setProjects(items);
        applyFeedPosts(posts);
      }

      if (sectionKey === "experience") {
        const [items, posts] = await Promise.all([
          fetchPortfolioSection("experience"),
          fetchMyFeedPosts({ limit: 30 }).catch(() => []),
        ]);
        setExperience(items);
        applyFeedPosts(posts);
      }

      if (sectionKey === "profile-side") {
        const [skillItems, socialItems] = await Promise.all([
          fetchPortfolioSection("skills"),
          fetchPortfolioSection("social"),
        ]);
        setSkills(skillItems);
        setSocial(socialItems);
      }

      if (sectionKey === "feed") {
        applyFeedPosts(await fetchMyFeedPosts({ limit: 30 }));
      }

      markSectionLoaded(sectionKey);
    } finally {
      setSectionBusy(sectionKey, false);
    }
  } */

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async (options = {}) => {
      if (!options.silent && !hasInitialCachedSnapshot) {
        setLoading(true);
      }
      try {
        let portfolioOverview;

        if (isPublicProfile) {
          portfolioOverview = normalizeOverviewPayload(
            await fetchPublicProfileOverview(userId),
          );
        } else {
          try {
            const rawProfile = await fetchProfile();
            portfolioOverview = {
              profile: rawProfile,
              projects: [],
              experience: [],
              skills: [],
              formacion: [],
              social: [],
              socialExtra: { cvUrl: rawProfile?.url_cv || "" },
              profilePosts: [],
            };
          } catch (profileError) {
            try {
              portfolioOverview = await fetchPortfolioOverview();
            } catch (overviewError) {
              throw profileError?.message ? profileError : overviewError;
            }
          }
        }

        if (cancelled) return;
        setProfile(portfolioOverview.profile || {});
        setDraft(makeDraft(portfolioOverview.profile || {}));

        if (isPublicProfile) {
          setProjects(portfolioOverview.projects);
          setExperience(portfolioOverview.experience);
          setSkills(portfolioOverview.skills);
          setEducation(portfolioOverview.formacion);
          setSocial(portfolioOverview.social);
          setCv(portfolioOverview.socialExtra);
          applyFeedPosts(portfolioOverview.profilePosts || []);
          recordProfileView(userId).catch(() => {});
          fetchFollowStatus(userId)
            .then((payload) => setFollowState((prev) => ({ ...prev, isFollowing: Boolean(payload.is_following) })))
            .catch(() => {});
        } else {
          setProjects(portfolioOverview.projects || []);
          setExperience(portfolioOverview.experience || []);
          setSkills(portfolioOverview.skills || []);
          setEducation(portfolioOverview.formacion || []);
          setSocial(portfolioOverview.social || []);
          setCv(portfolioOverview.socialExtra || { cvUrl: "" });
          applyFeedPosts(portfolioOverview.profilePosts || []);
          setLoadedSections({});
        }

        setError("");
      } catch (loadError) {
        if (cancelled) return;
        if (!dashboardProfileViewCache.value) {
          setError(loadError.message || t("appI18n.profile.errors.loadProfile"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile({ silent: hasInitialCachedSnapshot });

    const handlePortfolioUpdated = () => {
      if (isPublicProfile || readOnly) return;
      clearPortfolioOverviewCache();
      dashboardProfileViewCache = { expiresAt: 0, value: null };
      setLoadedSections({});
      loadProfile({ silent: true });
    };

    if (!isPublicProfile && !readOnly) {
      window.addEventListener(PORTFOLIO_UPDATED_EVENT, handlePortfolioUpdated);
    }

    return () => {
      cancelled = true;
      if (!isPublicProfile && !readOnly) {
        window.removeEventListener(
          PORTFOLIO_UPDATED_EVENT,
          handlePortfolioUpdated,
        );
      }
    };
  }, [
    applyFeedPosts,
    hasInitialCachedSnapshot,
    isPublicProfile,
    profileLoadAttempt,
    readOnly,
    t,
    userId,
  ]);

  useEffect(() => {
    if (isPublicProfile || readOnly || !profile) return;

    dashboardProfileViewCache = {
      expiresAt: Date.now() + DASHBOARD_PROFILE_CACHE_TTL_MS,
      value: {
        profile,
        projects,
        experience,
        skills,
        education,
        social,
        cv,
        profilePosts,
        loadedSections,
      },
    };
  }, [
    cv,
    education,
    experience,
    isPublicProfile,
    loadedSections,
    profile,
    profilePosts,
    projects,
    readOnly,
    skills,
    social,
  ]);

  useEffect(() => {
    if (isPublicProfile || readOnly || loading || !profile) return;
    loadOwnSection("profile-side");
    loadOwnSection("projects");
    loadOwnSection("feed");
  }, [isPublicProfile, loadOwnSection, loading, profile, readOnly]);

  useEffect(() => {
    if (isPublicProfile || readOnly || loading || !profile) return;

    if (tab === "experience") {
      loadOwnSection("experience");
    }

    if (tab === "feed") {
      loadOwnSection("feed");
    }

    if (tab === "summary") {
      loadOwnSection("experience");
      loadOwnSection("projects");
      loadOwnSection("profile-side");
    }
  }, [isPublicProfile, loadOwnSection, loading, profile, readOnly, tab]);

  useEffect(() => {
    const ownerProfileId = profile?.profile_id;
    if (!isPublicProfile || loading || !ownerProfileId) return;
    if (tab !== "projects" && tab !== "experience") return;
    if (trackedPublicSectionsRef.current.has(tab)) return;
    trackedPublicSectionsRef.current.add(tab);
    recordAnalyticsEvent({
      owner_profile_id: ownerProfileId,
      event_type: tab === "projects" ? "project_view" : "experience_view",
      target_type: tab === "projects" ? "project_section" : "experience_section",
      metadata: { source: "profile_tab" },
    }).catch(() => {});
  }, [isPublicProfile, loading, profile?.profile_id, tab]);

  useEffect(() => {
    if (isPublicProfile || readOnly) return undefined;

    const handleFeedUpdated = (event) => {
      const post = event.detail?.post;
      const removedPublicationId = event.detail?.removedPublicationId;

      if (removedPublicationId) {
        removeSharedPost(
          removedPublicationId,
          event.detail?.projectId,
          event.detail?.experienceId,
        );
        return;
      }

      if (!post?.publicationId) return;

      setProfilePosts((prev) =>
        prev.some((item) => item.publicationId === post.publicationId)
          ? upsertPublication(prev, post)
          : prev,
      );
    };

    window.addEventListener(FEED_UPDATED_EVENT, handleFeedUpdated);
    return () =>
      window.removeEventListener(FEED_UPDATED_EVENT, handleFeedUpdated);
  }, [isPublicProfile, readOnly, removeSharedPost]);

  const unsharePublication = async (post) => {
    if (!post?.publicationId || unsharingPublicationId === post.publicationId)
      return;

    const previousPosts = profilePosts;
    const previousProjectIds = sharedProjectIds;
    const previousExperienceIds = sharedExperienceIds;

    setUnsharingPublicationId(post.publicationId);
    removeSharedPost(post.publicationId, post.projectId, post.experienceId);
    setShareMessage("Quitando de tu vitrina...");

    try {
      await unshareFeedPost(post.publicationId);
      setPendingUnsharePost(null);
      setShareMessage("Contenido retirado de tu vitrina");
      setTimeout(() => setShareMessage(""), 1800);
    } catch (shareError) {
      setProfilePosts(previousPosts);
      setSharedProjectIds(previousProjectIds);
      setSharedExperienceIds(previousExperienceIds);
      setShareMessage(shareError.message || t("appI18n.profile.errors.unshare"));
      setTimeout(() => setShareMessage(""), 2200);
    } finally {
      setUnsharingPublicationId(null);
    }
  };

  const shownProfile = profile || {};
  const isAdministrativeProfile = isAdministrativeRole(shownProfile.rol || shownProfile.role);
  const groupedSkills = useMemo(() => groupSkills(skills), [skills]);
  const stats = useMemo(
    () => buildStats(projects, experience, skills, shownProfile.metrics || {}, { showProfileViews: canEdit })
      .map((stat) => ({
        ...stat,
        label: t(`appI18n.profile.stats.${stat.key}`, stat.label),
      })),
    [projects, experience, skills, shownProfile.metrics, canEdit, t],
  );
  const fullName =
    [shownProfile.nombre, shownProfile.apellido]
      .filter(Boolean)
      .join(" ")
      .trim() || "Tu nombre aparecera aqui";
  const headline = shownProfile.profesion?.trim() || "";
  const displayHeadline = headline || educationHeadline(education);
  const profilePhoto =
    avatarPreview ||
    resolveMediaUrl(
      shownProfile.foto_perfil_url,
      shownProfile.foto_perfil,
      mediaVersion,
    );
  const coverPhoto =
    coverPreview ||
    resolveMediaUrl(
      shownProfile.foto_portada_url,
      shownProfile.foto_portada,
      mediaVersion,
    );
  const publicUrl = `${window.location.origin}/perfil-profesional${userId ? `?usuario=${userId}` : ""}`;
  const showContact = !isPublicProfile || isContactPublic(shownProfile);
  const profileCopy = {
    bioFallback: t(`appI18n.profile.empty.bio.${isPublicProfile ? "public" : "own"}`),
    linksEmpty: t(`appI18n.profile.empty.links.${isPublicProfile ? "public" : "own"}`),
    skillsEmpty: t(`appI18n.profile.empty.skills.${isPublicProfile ? "public" : "own"}`),
    educationEmpty: t(`appI18n.profile.empty.education.${isPublicProfile ? "public" : "own"}`),
    projectsEmptyTitle: t(`appI18n.profile.empty.projectsTitle.${isPublicProfile ? "public" : "own"}`),
    projectsEmptyText: t(`appI18n.profile.empty.projectsText.${isPublicProfile ? "public" : "own"}`),
    experienceEmptyTitle: t(`appI18n.profile.empty.experienceTitle.${isPublicProfile ? "public" : "own"}`),
    experienceEmptyText: t(`appI18n.profile.empty.experienceText.${isPublicProfile ? "public" : "own"}`),
    feedEmptyTitle: t(`appI18n.profile.empty.feedTitle.${isPublicProfile ? "public" : "own"}`),
    feedEmptyText: t(`appI18n.profile.empty.feedText.${isPublicProfile ? "public" : "own"}`),
  };

  const resetEditState = () => {
    clearImageDrafts({
      setAvatarFile,
      setCoverFile,
      setAvatarPreview,
      setCoverPreview,
    });
    setFormError("");
  };

  const beginEdit = () => {
    setDraft(makeDraft(shownProfile));
    resetEditState();
    setSaveMessage("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(makeDraft(shownProfile));
    resetEditState();
  };

  const onImageChange = (kind, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError(t("appI18n.profile.errors.invalidImage"));
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      setFormError(
        "La imagen supera el limite actual de 2 MB del servidor. Elige una mas liviana.",
      );
      event.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormError("");

    if (kind === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(preview);
      return;
    }

    setCoverFile(file);
    setCoverPreview(preview);
  };

  const saveProfile = async () => {
    setSaving(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("nombre", draft.nombre.trim());
      formData.append("apellido", draft.apellido.trim());
      formData.append("profesion", draft.profesion.trim());
      formData.append("biografia", draft.biografia.trim());
      formData.append("ubicacion", draft.ubicacion?.trim() ?? "");

      if (avatarFile) formData.append("foto_perfil", avatarFile);
      if (coverFile) formData.append("foto_portada", coverFile);

      await actualizarPerfil(formData);
      clearPortfolioOverviewCache();
      clearProfileOverviewCache();
      const refreshedProfile = await fetchProfile();

      setProfile(refreshedProfile);
      setDraft(makeDraft(refreshedProfile));
      setMediaVersion(Date.now());
      setCv((prev) => ({
        ...prev,
        cvUrl: refreshedProfile.url_cv || prev.cvUrl || "",
      }));
      updateUser((storedUser) => ({
        ...storedUser,
        nombre: refreshedProfile.nombre,
        apellido: refreshedProfile.apellido,
        profesion: refreshedProfile.profesion,
        biografia: refreshedProfile.biografia,
        foto_perfil: refreshedProfile.foto_perfil,
        foto_perfil_url: refreshedProfile.foto_perfil_url,
        foto_portada: refreshedProfile.foto_portada,
        photoUrl: resolveMediaUrl(
          refreshedProfile.foto_perfil_url,
          refreshedProfile.foto_perfil,
          Date.now(),
        ),
      }));

      setEditing(false);
      clearImageDrafts({
        setAvatarFile,
        setCoverFile,
        setAvatarPreview,
        setCoverPreview,
      });
      setSaveMessage("Perfil actualizado correctamente.");
      setTimeout(() => setSaveMessage(""), 2200);
    } catch (saveError) {
      setFormError(saveError.message || t("appI18n.profile.errors.updateProfile"));
    } finally {
      setSaving(false);
    }
  };

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setShareMessage("Enlace copiado");
      setTimeout(() => setShareMessage(""), 1600);
    } catch {
      setShareMessage(t("appI18n.profile.errors.copy"));
      setTimeout(() => setShareMessage(""), 1600);
    }
  };

  const openRelations = async (type) => {
    const targetUserId = userId || shownProfile.user_id;
    if (!targetUserId) return;
    setRelationModal(type);
    setRelations([]);
    setRelationsLoading(true);
    setRelationError("");

    try {
      const payload = await fetchRelations(targetUserId, type);
      setRelations(payload.items || []);
    } catch (err) {
      setRelationError(err.message || t("appI18n.profile.errors.loadList"));
      setRelations([]);
    } finally {
      setRelationsLoading(false);
    }
  };

  const loadOwnViews = async () => {
    if (isPublicProfile) return;
    setProfileViewsOpen(true);
    setProfileViewsLoading(true);
    try {
      const payload = await fetchProfileViews();
      setProfileViews(payload.items || []);
    } finally {
      setProfileViewsLoading(false);
    }
  };

  const openProfileFromModal = (person) => {
    const targetUserId = person?.user_id;
    if (!targetUserId) return;
    window.location.href = `/perfil-profesional?usuario=${targetUserId}`;
  };

  const followFromModal = async (person) => {
    if (!person?.user_id || relationBusy) return;
    setRelationBusy(true);
    try {
      await followProfile(person.user_id);
      setRelations((prev) => prev.map((item) => item.profile_id === person.profile_id ? { ...item, is_following: true } : item));
    } finally {
      setRelationBusy(false);
    }
  };

  const updateProfileFollowMetrics = (isFollowing, summary = null) => {
    setProfile((prev) => {
      if (!prev) return prev;

      const currentMetrics = prev.metrics || {};
      const followers = summary
        ? summary.followers
        : Math.max(0, Number(currentMetrics.followers || 0) + (isFollowing ? 1 : -1));

      return {
        ...prev,
        metrics: {
          ...currentMetrics,
          followers,
          following: summary?.following ?? currentMetrics.following ?? 0,
          is_following: summary?.is_following ?? isFollowing,
        },
      };
    });
  };

  const toggleFollowProfile = async () => {
    if (!userId || followState.busy) return;

    if (followState.isFollowing) {
      setProfileFollowError("");
      setProfileUnfollowOpen(true);
      return;
    }

    setProfileFollowError("");
    setFollowState({ isFollowing: true, busy: true });
    updateProfileFollowMetrics(true);

    try {
      const payload = await followProfile(userId);
      const nextFollowing = Boolean(payload.summary?.is_following ?? true);
      setFollowState({ isFollowing: nextFollowing, busy: false });
      if (payload.summary) {
        updateProfileFollowMetrics(nextFollowing, payload.summary);
      }
    } catch (err) {
      setFollowState({ isFollowing: false, busy: false });
      updateProfileFollowMetrics(false);
      setProfileFollowError(err.message || t("appI18n.profile.errors.followProfile"));
    }
  };

  const confirmProfileUnfollow = async () => {
    if (!userId || followState.busy) return;
    setProfileFollowError("");
    setProfileUnfollowOpen(false);
    setFollowState({ isFollowing: false, busy: true });
    updateProfileFollowMetrics(false);

    try {
      const payload = await unfollowProfile(userId);
      const nextFollowing = Boolean(payload.summary?.is_following ?? false);
      setFollowState({ isFollowing: nextFollowing, busy: false });
      if (payload.summary) {
        updateProfileFollowMetrics(nextFollowing, payload.summary);
      }
    } catch (err) {
      setFollowState({ isFollowing: true, busy: false });
      updateProfileFollowMetrics(true);
      setProfileFollowError(err.message || t("appI18n.profile.errors.unfollowProfile"));
    }
  };

  const confirmUnfollow = async () => {
    if (!pendingUnfollowUser?.user_id || relationBusy) return;
    setRelationBusy(true);
    setRelationError("");
    try {
      await unfollowProfile(pendingUnfollowUser.user_id);
      setRelations((prev) => (
        relationModal === "following"
          ? prev.filter((item) => item.profile_id !== pendingUnfollowUser.profile_id)
          : prev.map((item) => (
              item.profile_id === pendingUnfollowUser.profile_id
                ? { ...item, is_following: false }
                : item
            ))
      ));
      setPendingUnfollowUser(null);
    } catch (err) {
      setRelationError(err.message || t("appI18n.profile.errors.unfollow"));
    } finally {
      setRelationBusy(false);
    }
  };

  const submitProfileReport = async (payload) => {
    if (!userId || reportBusy) return;
    setReportBusy(true);
    setReportError("");
    try {
      await createProfileReport(userId, payload);
      setReportProfileOpen(false);
      setShareMessage(t("appI18n.profile.messages.reportSent"));
      setTimeout(() => setShareMessage(""), 1800);
    } catch (err) {
      setReportError(err.message || t("appI18n.profile.errors.report"));
    } finally {
      setReportBusy(false);
    }
  };

  const trackPublicProfileEvent = useCallback((eventType, extra = {}) => {
    if (!isPublicProfile || !shownProfile.profile_id) return;
    recordAnalyticsEvent({
      owner_profile_id: shownProfile.profile_id,
      event_type: eventType,
      target_type: "profile",
      target_id: shownProfile.profile_id,
      metadata: extra,
    }).catch(() => {});
  }, [isPublicProfile, shownProfile.profile_id]);

  const trackPublicProjectView = useCallback((project) => {
    const projectId = project?.id;
    if (!isPublicProfile || !shownProfile.profile_id || !projectId) return;
    const key = String(projectId);
    if (trackedPublicProjectsRef.current.has(key)) return;
    trackedPublicProjectsRef.current.add(key);

    recordAnalyticsEvent({
      owner_profile_id: shownProfile.profile_id,
      event_type: "project_view",
      target_type: "project",
      target_id: Number(projectId),
      metadata: { source: "profile_project_card" },
    }).catch(() => {});
  }, [isPublicProfile, shownProfile.profile_id]);

  const shareProject = async (project) => {
    if (!project?.id || sharingProjectId) return;
    if (!canPublishFeed) {
      setShareMessage("No tienes permisos para publicar en el feed.");
      setTimeout(() => setShareMessage(""), 2200);
      return;
    }

    const sharedPost = findSharedPost("project", project.id);
    if (sharedPost) {
      setPendingUnsharePost(sharedPost);
      return;
    }

    setSharingProjectId(String(project.id));
    setShareMessage("");

    try {
      const post = await publishProjectToFeed(project.id);
      setSharedProjectIds((prev) => new Set(prev).add(String(project.id)));
      if (post) {
        setProfilePosts((prev) => upsertPublication(prev, post));
      }
      setShareMessage(t("appI18n.profile.messages.projectShared"));
      setTimeout(() => setShareMessage(""), 1800);
    } catch (shareError) {
      setShareMessage(shareError.message || t("appI18n.profile.errors.shareProject"));
      setTimeout(() => setShareMessage(""), 2200);
    } finally {
      setSharingProjectId("");
    }
  };

  const shareExperience = async (item) => {
    if (!item?.id || sharingExperienceId) return;
    if (!canPublishFeed) {
      setShareMessage("No tienes permisos para publicar en el feed.");
      setTimeout(() => setShareMessage(""), 2200);
      return;
    }

    const sharedPost = findSharedPost("experience", item.id);
    if (sharedPost) {
      setPendingUnsharePost(sharedPost);
      return;
    }

    setSharingExperienceId(String(item.id));
    setShareMessage("");

    try {
      const post = await publishExperienceToFeed(item.id);
      setSharedExperienceIds((prev) => new Set(prev).add(String(item.id)));
      if (post) {
        setProfilePosts((prev) => upsertPublication(prev, post));
      }
      setShareMessage(t("appI18n.profile.messages.experienceShared"));
      setTimeout(() => setShareMessage(""), 1800);
    } catch (shareError) {
      setShareMessage(
        shareError.message || t("appI18n.profile.errors.shareExperience"),
      );
      setTimeout(() => setShareMessage(""), 2200);
    } finally {
      setSharingExperienceId("");
    }
  };

  if (loading)
    return (
      <StateBox
        title={t("appI18n.profile.loadingProfile")}
        text={t("appI18n.profile.loadingProfileText")}
      />
    );
  if (!profile)
    return (
      <StateBox
        title={error ? t("appI18n.profile.loadErrorTitle") : t("appI18n.profile.preparing")}
        text={
          error
            ? error
            : t("appI18n.profile.preparingText")
        }
        action={
          error ? (
            <button
              type="button"
              onClick={() => {
                clearProfileOverviewCache();
                clearPortfolioOverviewCache();
                dashboardProfileViewCache = { expiresAt: 0, value: null };
                setError("");
                setLoading(true);
                setProfileLoadAttempt((value) => value + 1);
              }}
              style={{
                ...ui.primaryButton,
                width: "fit-content",
                minHeight: 42,
                padding: "0 18px",
              }}
            >
              {t("appI18n.profile.retry")}
            </button>
          ) : null
        }
      />
    );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <ProfileHero
        avatarRef={avatarRef}
        beginEdit={beginEdit}
        canEdit={canEdit}
        cancelEdit={cancelEdit}
        coverPhoto={coverPhoto}
        coverRef={coverRef}
        cv={cv}
        draft={draft}
        editing={editing}
        formError={formError}
        fullName={fullName}
        headline={displayHeadline}
        isMobile={isMobile}
        onImageChange={onImageChange}
        profilePhoto={profilePhoto}
        saveMessage={saveMessage}
        saveProfile={saveProfile}
        saving={saving}
        setDraft={setDraft}
        shareMessage={shareMessage}
        shareProfile={shareProfile}
        showContact={showContact}
        shownProfile={shownProfile}
        stats={stats}
        canReport={!canEdit && Boolean(userId) && !isAdministrativeProfile}
        canFollow={!canEdit && Boolean(userId) && !isAdministrativeProfile}
        followBusy={followState.busy}
        isFollowing={followState.isFollowing}
        onToggleFollow={toggleFollowProfile}
        onReportProfile={() => {
          setReportError("");
          setReportProfileOpen(true);
        }}
        onAnalyticsEvent={trackPublicProfileEvent}
        onStatClick={(action) => {
          if (action === "followers" || action === "following") openRelations(action);
          if (action === "views" && canEdit) loadOwnViews();
        }}
      />
      {profileFollowError && !profileUnfollowOpen ? (
        <MessageBox color="red" text={profileFollowError} fit />
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isTablet
            ? "minmax(0, 1fr)"
            : "300px minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <aside style={{ display: "grid", gap: 16 }}>
          <section style={ui.section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={ui.title}>{t("appI18n.profile.about")}</div>
              {canEdit && editing ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#ef5759",
                    fontFamily: "var(--f-ui)",
                    fontSize: ".78rem",
                    fontWeight: 700,
                  }}
                >
                  <PencilLine size={14} />
                  {t("appI18n.profile.editing")}
                </span>
              ) : null}
            </div>
            {canEdit && editing ? (
              <textarea
                value={draft.biografia}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    biografia: event.target.value,
                  }))
                }
                placeholder={t("appI18n.profile.aboutPlaceholder")}
                rows={5}
                style={ui.textarea}
              />
            ) : (
              <p style={ui.body}>
                {shownProfile.biografia ||
                  profileCopy.bioFallback}
              </p>
            )}
          </section>

          <Card title={t("appI18n.profile.links")}>
            <div style={{ display: "grid", gap: 10 }}>
              {sectionLoading["profile-side"] && !social.length ? (
                <div style={ui.muted}>{t("appI18n.profile.loadingLinks")}</div>
              ) : null}
              {social.length ? (
                social.map((item) => (
                  <SocialItem
                    key={`${item.platform}-${item.url}`}
                    item={item}
                  />
                ))
              ) : !sectionLoading["profile-side"] ? (
                <div style={ui.muted}>
                  {profileCopy.linksEmpty}
                </div>
              ) : null}
            </div>
          </Card>

          <Card title={t("appI18n.profile.skills")}>
            <div style={{ display: "grid", gap: 14 }}>
              {sectionLoading["profile-side"] && !skills.length ? (
                <div style={ui.muted}>{t("appI18n.profile.loadingSkills")}</div>
              ) : null}

              {Object.keys(groupedSkills).length ? (
                Object.entries(groupedSkills).map(([group, items]) => (
                  <div key={group} style={{ display: "grid", gap: 8 }}>
                    <div
                      style={{
                        fontFamily: "var(--f-ui)",
                        fontSize: ".76rem",
                        fontWeight: 800,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                      }}
                    >
                      {group}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {items.slice(0, 6).map((skill) => (
                        <SkillChip
                          key={`${group}-${skill.name}`}
                          skill={skill}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : !sectionLoading["profile-side"] ? (
                <div style={ui.muted}>{profileCopy.skillsEmpty}</div>
              ) : null}
            </div>
          </Card>

          <Card title={t("appI18n.profile.education")}>
            <div style={{ display: "grid", gap: 10 }}>
              {sectionLoading["profile-side"] && !education.length ? (
                <div style={ui.muted}>{t("appI18n.profile.loadingEducation")}</div>
              ) : null}

              {education.length ? (
                education.map((item) => (
                  <EducationItem key={item.id} item={item} />
                ))
              ) : !sectionLoading["profile-side"] ? (
                <div style={ui.muted}>{profileCopy.educationEmpty}</div>
              ) : null}
            </div>
          </Card>

        </aside>

        <section style={{ ...ui.section, padding: 16 }}>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 18,
                borderBottom: "1px solid rgba(162,214,249,.16)",
                overflowX: "auto",
              }}
            >
              {[
                { key: "feed", label: t("appI18n.profile.tabs.showcase") },
                { key: "projects", label: t("appI18n.profile.tabs.projects") },
                { key: "experience", label: t("appI18n.profile.tabs.experience") },
                !isPublicProfile ? { key: "summary", label: t("appI18n.profile.tabs.summary") } : null,
              ]
                .filter(Boolean)
                .map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    style={dashboardShell.tabButton(tab === item.key)}
                  >
                    {item.label}
                  </button>
                ))}
            </div>

            {tab === "projects" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: 16,
                }}
              >
                {sectionLoading.projects && !projects.length ? (
                  <StateBox
                    title={t("appI18n.profile.loadingSections.projectsTitle")}
                    text={t("appI18n.profile.loadingSections.projectsText")}
                  />
                ) : null}
                {projects.length ? (
                  projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onShare={canEdit && canPublishFeed ? shareProject : null}
                      sharing={sharingProjectId === String(project.id)}
                      shared={sharedProjectIds.has(String(project.id))}
                      onViewed={isPublicProfile ? trackPublicProjectView : null}
                    />
                  ))
                ) : !sectionLoading.projects ? (
                  <EmptyCard
                    icon={FolderKanban}
                    title={profileCopy.projectsEmptyTitle}
                    text={profileCopy.projectsEmptyText}
                  />
                ) : null}
              </div>
            ) : null}

            {tab === "experience" ? (
              <div style={{ display: "grid", gap: 18 }}>
                {sectionLoading.experience && !experience.length ? (
                  <StateBox
                    title={t("appI18n.profile.loadingSections.experienceTitle")}
                    text={t("appI18n.profile.loadingSections.experienceText")}
                  />
                ) : null}
                {experience.length ? (
                  experience.map((item, index) => (
                    <ExperienceItem
                      key={item.id || `${item.title}-${index}`}
                      item={item}
                      last={index === experience.length - 1}
                      onShare={canEdit && canPublishFeed ? shareExperience : null}
                      sharing={sharingExperienceId === String(item.id)}
                      shared={sharedExperienceIds.has(String(item.id))}
                    />
                  ))
                ) : !sectionLoading.experience ? (
                  <EmptyCard
                    icon={BriefcaseBusiness}
                    title={profileCopy.experienceEmptyTitle}
                    text={profileCopy.experienceEmptyText}
                  />
                ) : null}
              </div>
            ) : null}

            {tab === "feed" ? (
              <div style={{ display: "grid", gap: 14 }}>
                {sectionLoading.feed && !profilePosts.length ? (
                  <StateBox
                    title={t("appI18n.profile.loadingSections.showcaseTitle")}
                    text={t("appI18n.profile.loadingSections.showcaseText")}
                  />
                ) : null}
                {profilePosts.length ? (
                  profilePosts.map((post) => (
                    <ProfilePublicationCard
                      key={post.publicationId || post.id}
                      post={post}
                      expanded={expandedPublicationId === post.publicationId}
                      loadingComments={
                        loadingPublicationCommentsId === post.publicationId
                      }
                      owner={canEdit}
                      commentDraft={commentDrafts[post.publicationId] || ""}
                      commentError={commentErrors[post.publicationId] || ""}
                      commentMaxLength={COMMENT_MAX_LENGTH}
                      isCommenting={
                        commentingPublicationId === post.publicationId
                      }
                      isLoadingAllComments={
                        commentsModalLoadingId === post.publicationId
                      }
                      unsharing={unsharingPublicationId === post.publicationId}
                      onOpenProfile={openProfileFromPublication}
                      onViewAllComments={() => openAllPublicationComments(post)}
                      currentUserId={user?.id ?? null}
                      onFollowAuthor={!canEdit && userId ? toggleFollowProfile : null}
                      isFollowingAuthor={Boolean(followState.isFollowing)}
                      isFollowAuthorBusy={Boolean(followState.busy)}
                      onReportComment={(comment) => {
                        setCommentReportError("");
                        setPendingReportComment({ ...comment, post: normalizeFeedPost(post) });
                      }}
                      onCommentDraftChange={(value) =>
                        updateCommentDraft(post.publicationId, value)
                      }
                      onSubmitComment={(event) =>
                        submitPublicationComment(post, event)
                      }
                      onUnshare={() => setPendingUnsharePost(post)}
                      onToggleComments={() => togglePublicationComments(post)}
                    />
                  ))
                ) : !sectionLoading.feed ? (
                  <EmptyCard
                    icon={FolderKanban}
                    title={profileCopy.feedEmptyTitle}
                    text={profileCopy.feedEmptyText}
                  />
                ) : null}
              </div>
            ) : null}

            {tab === "summary" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <SummaryCard
                  title={t("appI18n.profile.summary.strengths")}
                  text={
                    skills.length
                      ? t("appI18n.profile.summary.strengthsText", {
                          skills: skills.length,
                          categories: Object.keys(groupedSkills).length,
                        })
                      : t("appI18n.profile.summary.noSkills")
                  }
                />
                <SummaryCard
                  title={t("appI18n.profile.summary.portfolio")}
                  text={
                    projects.length
                      ? t("appI18n.profile.summary.portfolioText", { count: projects.length })
                      : t("appI18n.profile.summary.noProjects")
                  }
                />
                <SummaryCard
                  title={t("appI18n.profile.summary.path")}
                  text={
                    experience.length
                      ? t("appI18n.profile.summary.pathText", { count: experience.length })
                      : t("appI18n.profile.summary.noExperience")
                  }
                />
              </div>
            ) : null}

            {tab === "cv" ? <DashboardCv /> : null}
        </section>
      </div>

      {pendingUnsharePost ? (
        <ConfirmModal
          title={t("appI18n.profile.unshare.title")}
          description={t("appI18n.profile.unshare.description")}
          confirmLabel={t("appI18n.profile.unshare.confirm")}
          tone="danger"
          onCancel={() => setPendingUnsharePost(null)}
          onConfirm={() => unsharePublication(pendingUnsharePost)}
          isBusy={unsharingPublicationId === pendingUnsharePost.publicationId}
        />
      ) : null}

      {relationModal ? (
        <RelationListModal
          title={relationModal === "followers" ? t("appI18n.profile.relations.followers") : t("appI18n.profile.relations.following")}
          type={relationModal}
          readonly={!canEdit}
          loading={relationsLoading}
          items={relations}
          onClose={() => setRelationModal(null)}
          onFollow={followFromModal}
          onAskUnfollow={(person) => {
            setRelationError("");
            setPendingUnfollowUser(person);
          }}
          onOpenProfile={openProfileFromModal}
        />
      ) : null}

      {pendingUnfollowUser ? (
        <ConfirmUnfollowModal
          user={pendingUnfollowUser}
          busy={relationBusy}
          error={relationError}
          onCancel={() => setPendingUnfollowUser(null)}
          onConfirm={confirmUnfollow}
        />
      ) : null}

      {profileUnfollowOpen ? (
        <ConfirmUnfollowModal
          user={{ name: fullName }}
          busy={followState.busy}
          error={profileFollowError}
          onCancel={() => setProfileUnfollowOpen(false)}
          onConfirm={confirmProfileUnfollow}
        />
      ) : null}

      {profileViewsOpen ? (
        <ProfileViewsModal
          views={profileViews}
          loading={profileViewsLoading}
          onClose={() => setProfileViewsOpen(false)}
          onOpenProfile={openProfileFromModal}
        />
      ) : null}

      {commentsModalPost ? (
        <PostCommentsModal
          post={commentsModalPost}
          isLoading={commentsModalLoadingId === commentsModalPost.publicationId}
          onClose={() => setCommentsModalPost(null)}
          onOpenProfile={openProfileFromPublication}
          currentUserId={user?.id ?? null}
          onReportComment={(comment) => {
            setCommentReportError("");
            setPendingReportComment({ ...comment, post: commentsModalPost });
          }}
        />
      ) : null}

      {pendingReportComment ? (
        <ReportPublicationModal
          key={`profile-comment-${pendingReportComment.id}`}
          post={pendingReportComment.post}
          comment={pendingReportComment}
          reportKind="comment"
          isOpen
          isBusy={commentReportBusyId === pendingReportComment.id}
          error={commentReportError}
          onClose={() => {
            if (commentReportBusyId) return;
            setPendingReportComment(null);
            setCommentReportError("");
          }}
          onSubmit={reportPublicationComment}
        />
      ) : null}

      {reportProfileOpen ? (
        <ReportProfileModal
          targetName={fullName}
          busy={reportBusy}
          error={reportError}
          onClose={() => setReportProfileOpen(false)}
          onSubmit={submitProfileReport}
        />
      ) : null}
    </div>
  );
}
