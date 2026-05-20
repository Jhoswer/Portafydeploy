import { apiClient } from "./http/httpClient";

export async function getAdminProfileTable(idProfile, resource) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/tables/${resource}`,
    { fallbackMessage: "No se pudo cargar la tabla solicitada." }
  );

  return {
    rows: Array.isArray(response?.data) ? response.data : [],
    meta: response?.meta ?? {},
  };
}

export async function getAdminCv(idProfile, idCv) {
  const response = await apiClient.get(`admin/profile/${idProfile}/cv/${idCv}`, {
    fallbackMessage: "No se pudo cargar el CV seleccionado.",
  });

  return response?.data ?? { cv: null, details: [] };
}

export async function updateAdminCv(idProfile, idCv, payload) {
  const response = await apiClient.put(`admin/profile/${idProfile}/cv/${idCv}`, payload, {
    fallbackMessage: "No se pudieron guardar los cambios del CV.",
  });

  return response?.data ?? response;
}

/* ── EXPERIENCIAS ─────────────────────────────────────────────── */
export async function getAdminExperience(idProfile, idExperience) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/experience/${idExperience}`,
    { fallbackMessage: "No se pudo cargar la experiencia seleccionada." }
  );

  return response?.data ?? { experience: null };
}

export async function updateAdminExperience(idProfile, idExperience, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/experience/${idExperience}`,
    payload,
    { fallbackMessage: "No se pudieron guardar los cambios de la experiencia." }
  );

  return response?.data ?? response;
}

/* ── HABILIDADES ──────────────────────────────────────────────── */
export async function getAdminSkill(idProfile, idSkillProfile) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/skill/${idSkillProfile}`,
    { fallbackMessage: "No se pudo cargar la habilidad seleccionada." }
  );

  return response?.data ?? { skill: null };
}

export async function updateAdminSkill(idProfile, idSkillProfile, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/skill/${idSkillProfile}`,
    payload,
    { fallbackMessage: "No se pudieron guardar los cambios de la habilidad." }
  );

  return response?.data ?? response;
}

/* ── OFERTAS ──────────────────────────────────────────────────── */
export async function getAdminOffer(idProfile, idOffer) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/offer/${idOffer}`,
    { fallbackMessage: "No se pudo cargar la oferta seleccionada." }
  );

  return response?.data ?? { offer: null, details: [] };
}

export async function updateAdminOffer(idProfile, idOffer, payload, isFormData = false) {
  if (isFormData) {
    // FormData con _method=PUT → enviar como POST
    return apiClient.post(`admin/profile/${idProfile}/offer/${idOffer}`, payload);
  }
  return apiClient.put(`admin/profile/${idProfile}/offer/${idOffer}`, payload);
}

// ── POSTULACIONES ──────────────────────────────────────────────
export async function getAdminPostulation(idProfile, idPostulation) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/postulation/${idPostulation}`,
    { fallbackMessage: "No se pudo cargar la postulación seleccionada." }
  );

  return response?.data ?? { postulation: null };
}

export async function updateAdminPostulation(idProfile, idPostulation, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/postulation/${idPostulation}`,
    payload,
    { fallbackMessage: "No se pudieron guardar los cambios de la postulación." }
  );

  return response?.data ?? response;
}

export async function getAdminPreference(idProfile, idPreference) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/preference/${idPreference}`,
    { fallbackMessage: "No se pudo cargar la preferencia seleccionada." }
  );
 
  return response?.data ?? { preference: null };
}
 
export async function updateAdminPreference(idProfile, idPreference, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/preference/${idPreference}`,
    payload,
    { fallbackMessage: "No se pudieron guardar los cambios de la preferencia." }
  );
 
  return response?.data ?? response;
}

export async function getAdminAcademico(idProfile) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/academico`,
    { fallbackMessage: "No se pudieron cargar los datos académicos." }
  );
 
  return response?.data ?? {
    profile:             null,
    university_careers:  [],
    catalogs:            { job_titles: [], universities: [], careers: [] },
  };
}
 
export async function updateAdminAcademico(idProfile, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/academico`,
    payload,
    { fallbackMessage: "No se pudieron guardar los datos académicos." }
  );
 
  return response?.data ?? response;
}

export async function getAdminProject(idProfile, idProject) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/project/${idProject}`,
    { fallbackMessage: "No se pudo cargar el proyecto seleccionado." }
  );
 
  return response?.data ?? { project: null, skills: [], catalogs: { skills: [] } };
}
 
export async function updateAdminProject(idProfile, idProject, payload, isFormData = false) {
  if (isFormData) {
    return apiClient.post(
      `admin/profile/${idProfile}/project/${idProject}`,
      payload,
      { fallbackMessage: "No se pudieron guardar los cambios del proyecto." }
    );
  }

  // ← Cambia put por post y agrega _method manualmente
  const form = new FormData();
  form.append("_method", "PUT");
  Object.entries(payload).forEach(([key, val]) => {
    if (val === null || val === undefined) return;
    if (key === "skills") { form.append(key, JSON.stringify(val)); return; }
    // Incluir _delete_photo aunque sea false para que el backend lo reciba
    if (key === "_delete_photo") { form.append(key, val ? "1" : "0"); return; }
    form.append(key, typeof val === "boolean" ? (val ? "1" : "0") : String(val));
  });

  return apiClient.post(
    `admin/profile/${idProfile}/project/${idProject}`,
    form,
    { fallbackMessage: "No se pudieron guardar los cambios del proyecto." }
  );
}

export async function getAdminPublication(idProfile, idPublication) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/publication/${idPublication}`,
    { fallbackMessage: "No se pudo cargar la publicación seleccionada." }
  );
 
  return response?.data ?? {
    publication: null,
    detail:      null,
    audiences:   [],
    catalogs:    {},
  };
}
 
export async function updateAdminPublication(idProfile, idPublication, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/publication/${idPublication}`,
    payload,
    { fallbackMessage: "No se pudieron guardar los cambios de la publicación." }
  );
 
  return response?.data ?? response;
}

export async function getAdminSocials(idProfile) {
  const response = await apiClient.get(
    `admin/profile/${idProfile}/socials`,
    { fallbackMessage: "No se pudieron cargar las redes sociales." }
  );
 
  return response?.data ?? { socials: [], platforms: [] };
}
 
export async function createAdminSocial(idProfile, payload) {
  const response = await apiClient.post(
    `admin/profile/${idProfile}/socials`,
    payload,
    { fallbackMessage: "No se pudo crear la red social." }
  );
 
  return response?.data ?? response;
}
 
export async function updateAdminSocial(idProfile, idSocial, payload) {
  const response = await apiClient.put(
    `admin/profile/${idProfile}/social/${idSocial}`,
    payload,
    { fallbackMessage: "No se pudo actualizar la red social." }
  );
 
  return response?.data ?? response;
}
 
export async function deleteAdminSocial(idProfile, idSocial) {
  const response = await apiClient.delete(
    `admin/profile/${idProfile}/social/${idSocial}`,
    { fallbackMessage: "No se pudo eliminar la red social." }
  );
 
  return response?.data ?? response;
}

export async function syncAdminSocials(idProfile, { socials = [] }) {
  const promises = socials.map((s) => {
    if (s._delete && s.id_social_networks) {
      // Eliminar
      return deleteAdminSocial(idProfile, s.id_social_networks);
    }
    if (s._isNew) {
      // Crear
      return createAdminSocial(idProfile, {
        id_platform: Number(s.id_platform),
        url:         s.url,
        public:      s.public,
      });
    }
    if (s._isDirty && s.id_social_networks) {
      // Actualizar
      return updateAdminSocial(idProfile, s.id_social_networks, {
        id_platform: Number(s.id_platform),
        url:         s.url,
        public:      s.public,
      });
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
}