// src/hooks/useCompanyFollowSystem.js
import { useState, useCallback } from "react";
import { fetchCompanyFollowStatus, followCompany, unfollowCompany, fetchCompanyFollowers, fetchCompanyFollowing } from "../services/companyTrustService";


export function useCompanyFollowSystem(companyId) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState("");
  const [followers, setFollowers]     = useState(0);
  const [following, setFollowing] = useState(0);

  // Modal lista seguidores
  const [relationModal, setRelationModal]           = useState(null);
  const [relations, setRelations]                   = useState([]);
  const [relationsLoading, setRelationsLoading]     = useState(false);

  // Modal confirmar unfollow
  const [unfollowOpen, setUnfollowOpen]   = useState(false);
  const [pendingUnfollow, setPendingUnfollow] = useState(null);

  // Carga inicial — igual que useFollowSystem.init()
  const init = useCallback(async (metrics = {}) => {
    setFollowers(Number(metrics.followers ?? 0));
    setFollowing(Number(metrics.following ?? 0));

    if (!companyId) return;
    try {
      const payload = await fetchCompanyFollowStatus(companyId);
      setIsFollowing(Boolean(payload.is_following));
      setFollowers(Number(payload.followers ?? metrics.followers ?? 0));
      setFollowing(Number(payload.following ?? metrics.following ?? 0));
    } catch {
      // silencioso
    }
  }, [companyId]);

  const openFollowing = useCallback(async () => {
    setRelationModal("following");
    setRelations([]);
    setRelationsLoading(true);
    try {
        const payload = await fetchCompanyFollowing(companyId);
        setRelations(payload.items || []);
    } catch {
        setRelations([]);
    } finally {
        setRelationsLoading(false);
    }
}, [companyId]);

  const adjustFollowers = useCallback((delta) => {
    setFollowers(n => Math.max(0, n + delta));
  }, []);

  // Seguir
  const follow = useCallback(async () => {
    if (!companyId || busy) return;
    setError("");
    setIsFollowing(true);
    adjustFollowers(+1);
    setBusy(true);
    try {
      const payload = await followCompany(companyId);
      setIsFollowing(Boolean(payload.summary?.is_following ?? true));
      if (payload.summary) setFollowers(Number(payload.summary.followers ?? 0));
    } catch (err) {
      setIsFollowing(false);
      adjustFollowers(-1);
      setError(err.message || "No se pudo seguir esta empresa.");
    } finally {
      setBusy(false);
    }
  }, [companyId, busy, adjustFollowers]);

  // Pedir confirmación para dejar de seguir
  const askUnfollow = useCallback(() => {
    if (!companyId || busy) return;
    setPendingUnfollow(null);
    setUnfollowOpen(true);
  }, [companyId, busy]);

  // Confirmar dejar de seguir
  const confirmUnfollow = useCallback(async () => {
    if (!companyId || busy) return;
    setError("");
    setIsFollowing(false);
    adjustFollowers(-1);
    setBusy(true);
    try {
      const payload = await unfollowCompany(companyId);
      setIsFollowing(Boolean(payload.summary?.is_following ?? false));
      if (payload.summary) setFollowers(Number(payload.summary.followers ?? 0));
    } catch (err) {
      setIsFollowing(true);
      adjustFollowers(+1);
      setError(err.message || "No se pudo dejar de seguir esta empresa.");
    } finally {
      setBusy(false);
      setUnfollowOpen(false);
      setPendingUnfollow(null);
    }
  }, [companyId, busy, adjustFollowers]);

  // Abrir modal lista de seguidores
  const openRelations = useCallback(async () => {
    setRelationModal("followers");
    setRelations([]);
    setRelationsLoading(true);
    try {
      const payload = await fetchCompanyFollowers(companyId);
      setRelations(payload.followers || []);
    } catch {
      setRelations([]);
    } finally {
      setRelationsLoading(false);
    }
  }, [companyId]);

  const toggle = isFollowing ? askUnfollow : follow;

  return {
    // estado
    isFollowing, busy, error,
    followers,
    // modal lista
    relationModal, relations, relationsLoading,
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
    following,  
    openFollowing,   
  };
}