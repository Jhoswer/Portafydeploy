/**
 * Adapta la respuesta de /api/cv/importar al formato que usan
 * los formularios existentes del dashboard (experiencia, formación,
 * habilidades, perfil y sociales).
 *
 * Regla: los componentes nunca dependen de la estructura cruda del backend.
 * Esta capa absorbe cualquier cambio futuro en el contrato de la API.
 */

// ─── Perfil general ──────────────────────────────────────────────────────────

export function normalizarPerfil(data) {
  return {
    nombre:           data.nombre           ?? '',
    apellido:         data.apellido          ?? '',
    profesion:        data.profesion         ?? '',
    biografia:        data.biografia         ?? '',
    ubicacion:        data.ubicacion         ?? '',
    fecha_nacimiento: data.fecha_nacimiento  ?? '',
  };
}

// ─── Habilidades ─────────────────────────────────────────────────────────────

export function normalizarHabilidades(data) {
  if (!Array.isArray(data?.habilidades)) return [];

  return data.habilidades.map((h) => ({
    nombre:      h.nombre      ?? '',
    tipo:        h.tipo        ?? 'tecnica',   // enum: 'tecnica' | 'blanda'
    nivel_texto: h.nivel_texto ?? null,        // enum o null
  }));
}

// ─── Experiencias ─────────────────────────────────────────────────────────────

export function normalizarExperiencias(data) {
  if (!Array.isArray(data?.experiencias)) return [];

  return data.experiencias.map((e) => ({
    empresa:      e.empresa      ?? '',
    cargo:        e.cargo        ?? '',
    descripcion:  e.descripcion  ?? '',
    fecha_inicio: e.fecha_inicio ?? '',
    fecha_fin:    e.fecha_fin    ?? '',
    actualmente:  e.actualmente  ?? false,
  }));
}

// ─── Formaciones ──────────────────────────────────────────────────────────────

export function normalizarFormaciones(data) {
  if (!Array.isArray(data?.formaciones)) return [];

  return data.formaciones.map((f) => ({
    institucion:      f.institucion      ?? '',
    nombre_programa:  f.nombre_programa  ?? '',
    nivel_formacion:  f.nivel_formacion  ?? 'otro', // enum
    fecha_inicio:     f.fecha_inicio     ?? '',
    fecha_fin:        f.fecha_fin        ?? '',
    actualmente:      f.actualmente      ?? false,
  }));
}

// ─── Sociales ─────────────────────────────────────────────────────────────────

export function normalizarSociales(data) {
  if (!Array.isArray(data?.sociales)) return [];

  return data.sociales.map((s) => ({
    plataforma: s.plataforma ?? 'otro', // enum
    url:        s.url        ?? '',
  }));
}

// ─── Normalizador completo (entrada única para el modal) ─────────────────────

export function normalizarCvImportado(data) {
  return {
    perfil:       normalizarPerfil(data),
    habilidades:  normalizarHabilidades(data),
    experiencias: normalizarExperiencias(data),
    formaciones:  normalizarFormaciones(data),
    sociales:     normalizarSociales(data),
  };
}