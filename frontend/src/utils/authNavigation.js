export function getPostAuthRedirectPath(user) {
  if (!user) return "/login";

  const role = user.rol?.toLowerCase();
  if (role === "super administrador" || role === "administrador") {
    return "/dashboard";
  }

  if (user.perfil_completado) {
    return "/feed";
  }

  if (role === "profesional") {
    return "/profesional/forms";
  }

  if (role === "reclutador") {
    return "/reclutador/forms";
  }

  return "/forms";
}
