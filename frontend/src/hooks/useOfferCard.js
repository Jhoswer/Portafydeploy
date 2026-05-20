import { useState } from "react";
import {
  toggleFeedPostLike,
  toggleFeedPostSave,
  commentFeedPost,
  validateCommentText,
  sanitizeCommentInput,
} from "../services/feedService";

export function useOfferCard(post, onRequireAuth) {
  const [modalOpen, setModalOpen]           = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(post.appliedByMe ?? false);
  const [saved, setSaved]                   = useState(post.savedByMe ?? false);
  const [saves, setSaves]                   = useState(post.saves ?? 0);
  const [liked, setLiked]                   = useState(post.likedByMe ?? false);
  const [likes, setLikes]                   = useState(post.likes ?? 0);
  const [showComments, setShowComments]     = useState(false);
  const [commentText, setCommentText]       = useState("");
  const [commentError, setCommentError]     = useState("");
  const [comments, setComments]             = useState(post.commentsList ?? []);
  const [commentsCount, setCommentsCount]   = useState(post.comments ?? 0);
  const [busy, setBusy]                     = useState("");

  const handleLike = async () => {
    if (onRequireAuth && !onRequireAuth("like")) return;
    if (busy === "like") return;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes(n => wasLiked ? Math.max(0, n - 1) : n + 1);

    try {
      setBusy("like");
      await toggleFeedPostLike(post.publicationId);
    } catch {
      setLiked(wasLiked);
      setLikes(n => wasLiked ? n + 1 : Math.max(0, n - 1));
    } finally {
      setBusy("");
    }
  };

  const toggleSave = async () => {
    if (onRequireAuth && !onRequireAuth("guardar")) return;
    if (busy === "save") return;

    const wasSaved = saved;
    setSaved(!wasSaved);
    setSaves(n => wasSaved ? Math.max(0, n - 1) : n + 1);

    try {
      setBusy("save");
      await toggleFeedPostSave(post.publicationId);
    } catch {
      setSaved(wasSaved);
      setSaves(n => wasSaved ? n + 1 : Math.max(0, n - 1)); 
    } finally {
      setBusy("");
    }
  };

  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    if (onRequireAuth && !onRequireAuth("comentar")) return;
    if (busy === "comment") return;

    const text = commentText.trim();
    const error = validateCommentText(text);
    if (error) {
      setCommentError(error);
      return;
    }

    setCommentError("");
    setCommentText("");
    setCommentsCount(n => n + 1);

    try {
      setBusy("comment");
      const updatedPost = await commentFeedPost(post.publicationId, text);
      if (updatedPost?.commentsList?.length) {
        setComments(updatedPost.commentsList);
      }
    } catch (err) {
      setCommentsCount(n => Math.max(0, n - 1));
      setCommentError(err.message || "No se pudo publicar el comentario.");
    } finally {
      setBusy("");
    }
  };

  const handleCommentChange = (value) => {
    setCommentText(sanitizeCommentInput(value));
    if (commentError) setCommentError("");
  };

  const openPostulation = () => {
    if (onRequireAuth && !onRequireAuth("postular")) return;
    setModalOpen(true);
  };

  const toggleComments = () => {
    if (onRequireAuth && !onRequireAuth("comentar")) return;
    setShowComments(s => !s);
  };

  const handleShare = () => {
    if (onRequireAuth && !onRequireAuth("compartir")) return;
  };

  const handleApplied = () => {
    setAlreadyApplied(true);
    setModalOpen(false);
  };

  return {
    modalOpen, setModalOpen,
    alreadyApplied,
    saved, saves,
    liked, likes,
    showComments,
    commentText, setCommentText: handleCommentChange,
    commentError, comments, commentsCount,
    busy,
    handleLike, openPostulation, toggleComments, toggleSave,
    handleShare, handleApplied, handleSubmitComment,
  };
}