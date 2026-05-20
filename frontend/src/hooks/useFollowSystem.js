import { useState, useCallback } from "react";
import {
  fetchFollowStatus,
  fetchRelations,
  followProfile,
  unfollowProfile,
} from "../services/profileTrustService";

export function useFollowSystem(userId) {
  const [isFollowing, setIsFollowing]     = useState(false);
  const [busy, setBusy]                   = useState(false);
  const [error, setError]                 = useState("");
  const [followers, setFollowers]         = useState(0);
  const [following, setFollowing]         = useState(0);

  // Modal lista
  const [relationModal, setRelationModal] = useState(null); 
  const [relations, setRelations]         = useState([]);
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [relationError, setRelationError] = useState("");

  // Modal confirmar unfollow
  const [unfollowOpen, setUnfollowOpen]   = useState(false);
  const [pendingUnfollow, setPendingUnfollow] = useState(null); // user del modal lista, o null = el perfil principal

  // Carga inicial
  const init = useCallback(async (metrics = {}) => {
    setFollowers(Number(metrics.followers ?? 0));
    setFollowing(Number(metrics.following ?? 0));

    if (!userId) return;
    try {
      const payload = await fetchFollowStatus(userId);
      setIsFollowing(Boolean(payload.is_following));
    } catch {
      // silencioso
    }
  }, [userId]);

  // Actualiza contadores optimistamente
  const adjustMetrics = useCallback((delta) => {
    setFollowers((n) => Math.max(0, n + delta));
  }, []);

  // Seguir el perfil principal
  const follow = useCallback(async () => {
    if (!userId || busy) return;
    setError("");
    setIsFollowing(true);
    adjustMetrics(+1);
    setBusy(true);
    try {
      const payload = await followProfile(userId);
      const next = Boolean(payload.summary?.is_following ?? true);
      setIsFollowing(next);
      if (payload.summary) {
        setFollowers(Number(payload.summary.followers ?? 0));
        setFollowing(Number(payload.summary.following ?? 0));
      }
    } catch (err) {
      setIsFollowing(false);
      adjustMetrics(-1);
      setError(err.message || "No se pudo seguir este perfil.");
    } finally {
      setBusy(false);
    }
  }, [userId, busy, adjustMetrics]);

  // Abrir modal de confirmación para dejar de seguir el perfil principal
  const askUnfollow = useCallback(() => {
    if (!userId || busy) return;
    setPendingUnfollow(null); // null = perfil principal
    setUnfollowOpen(true);
  }, [userId, busy]);

  // Confirmar dejar de seguir (perfil principal o usuario del modal lista)
  const confirmUnfollow = useCallback(async () => {
    const targetId = pendingUnfollow?.user_id ?? userId;
    if (!targetId || busy) return;
    setError("");
    setBusy(true);

    const isMainProfile = !pendingUnfollow;

    if (isMainProfile) {
      setIsFollowing(false);
      adjustMetrics(-1);
    } else {
      setRelations((prev) =>
        relationModal === "following"
          ? prev.filter((u) => u.profile_id !== pendingUnfollow.profile_id)
          : prev.map((u) =>
              u.profile_id === pendingUnfollow.profile_id
                ? { ...u, is_following: false }
                : u,
            ),
      );
    }

    try {
      const payload = await unfollowProfile(targetId);
      if (isMainProfile) {
        const next = Boolean(payload.summary?.is_following ?? false);
        setIsFollowing(next);
        if (payload.summary) {
          setFollowers(Number(payload.summary.followers ?? 0));
          setFollowing(Number(payload.summary.following ?? 0));
        }
      }
    } catch (err) {
      // revertir
      if (isMainProfile) {
        setIsFollowing(true);
        adjustMetrics(+1);
      } else {
        setRelations((prev) =>
          prev.map((u) =>
            u.profile_id === pendingUnfollow?.profile_id
              ? { ...u, is_following: true }
              : u,
          ),
        );
      }
      setError(err.message || "No se pudo dejar de seguir.");
    } finally {
      setBusy(false);
      setUnfollowOpen(false);
      setPendingUnfollow(null);
    }
  }, [pendingUnfollow, userId, busy, adjustMetrics, relationModal]);

  // Abrir modal lista seguidores/seguidos
  const openRelations = useCallback(async (type) => {
    setRelationModal(type);
    setRelations([]);
    setRelationsLoading(true);
    setRelationError("");
    try {
      const payload = await fetchRelations(userId, type);
      setRelations(payload.items || []);
    } catch (err) {
      setRelationError(err.message || "No se pudo cargar la lista.");
    } finally {
      setRelationsLoading(false);
    }
  }, [userId]);

  // Seguir a alguien desde el modal lista
  const followFromList = useCallback(async (user) => {
    if (!user?.user_id) return;
    try {
      await followProfile(user.user_id);
      setRelations((prev) =>
        prev.map((u) =>
          u.profile_id === user.profile_id ? { ...u, is_following: true } : u,
        ),
      );
    } catch {
      // silencioso
    }
  }, []);

  // Pedir confirmación para dejar de seguir desde el modal lista
  const askUnfollowFromList = useCallback((user) => {
    setPendingUnfollow(user);
    setUnfollowOpen(true);
  }, []);

  const toggle = isFollowing ? askUnfollow : follow;

  return {
    // estado
    isFollowing, busy, error,
    followers, following,
    // modal lista
    relationModal, relations, relationsLoading, relationError,
    // modal confirmar unfollow
    unfollowOpen, pendingUnfollow,
    // acciones
    init,
    toggle,
    follow,
    askUnfollow,
    confirmUnfollow,
    cancelUnfollow: () => { setUnfollowOpen(false); setPendingUnfollow(null); },
    openRelations,
    closeRelations: () => setRelationModal(null),
    followFromList,
    askUnfollowFromList,
  };
}