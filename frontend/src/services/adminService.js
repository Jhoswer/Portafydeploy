import { apiClient } from "./http/httpClient";
import config from "../config";
import { getToken } from "./sessionService";


/**
 * Crea un nuevo usuario y le asigna el rol de administrador.
 * Flujo:
 *   1. POST /admin/users        → crea USER + CREDENTIAL
 *   2. POST /admin/users/role   → asigna USER_ROLE con id_role de "administrador"
 *
 * @param {{ name, last_name, email, number, pais, ciudad, password }} data
 */
export async function crearAdministrador(data) {
  return apiClient.post(
    "admin/users",
    {
      nombre: data.name,
      apellido: data.last_name,
      email: data.email,
      numero: data.number,
      pais: data.pais,
      ciudad: data.ciudad,
      password: data.password,
      password_confirmation: data.password,
    },
    {
      fallbackMessage: "No se pudo crear el administrador.",
    }
  );
}


export async function listarAdministradores() {
  const payload = await apiClient.get("admin/users?role=administrador", {
    fallbackMessage: "No se pudo cargar la lista de administradores.",
  });

  return Array.isArray(payload?.data) ? payload.data : payload;
}

export async function buscarUsuariosEdicion({ query, role }) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (role && role !== "todos") params.set("role", role);

  const payload = await apiClient.get(`admin/users/search?${params.toString()}`, {
    fallbackMessage: "No se pudo buscar usuarios para edicion.",
  });

  return Array.isArray(payload?.data) ? payload.data : payload;
}

export async function buscarUsuariosHistorial({ query, rol, ciudad, profesion }) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (rol) params.set("rol", rol);
  if (ciudad) params.set("ciudad", ciudad);
  if (profesion) params.set("profesion", profesion);

  const payload = await apiClient.get(`admin/historial/usuarios?${params.toString()}`, {
    fallbackMessage: "No se pudo cargar el historial de usuarios.",
  });

  return Array.isArray(payload?.data) ? payload.data : payload;
}

export async function obtenerUsuarioHistorial(id) {
  return apiClient.get(`admin/historial/usuarios/${id}`, {
    fallbackMessage: "No se pudo cargar la informacion del usuario.",
  });
}

export async function buscarUsuariosSuspension({ query }) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);

  const payload = await apiClient.get(`admin/suspension/users?${params.toString()}`, {
    fallbackMessage: "No se pudo cargar la busqueda de usuarios para suspension.",
  });

  return Array.isArray(payload?.data) ? payload.data : payload;
}

export async function suspenderUsuario(data) {
  return apiClient.post("admin/suspension", data, {
    fallbackMessage: "No se pudo aplicar la suspension.",
  });
}

export async function buscarUsuariosPermisos({ query }) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);

  const payload = await apiClient.get(`admin/permissions/users?${params.toString()}`, {
    fallbackMessage: "No se pudo cargar la busqueda de usuarios para permisos.",
  });

  return Array.isArray(payload?.data) ? payload.data : payload;
}

export async function obtenerPermisosUsuario(userId) {
  return apiClient.get(`admin/permissions/users/${userId}`, {
    fallbackMessage: "No se pudo cargar los permisos del usuario.",
  });
}

export async function actualizarPermisosUsuario(userId, permissions) {
  return apiClient.put(`admin/permissions/users/${userId}`, { permissions }, {
    fallbackMessage: "No se pudieron actualizar los permisos.",
  });
}

export async function listarBackups() {
  const payload = await apiClient.get("admin/backups", {
    fallbackMessage: "No se pudo cargar la lista de backups.",
  });

  return {
    items: Array.isArray(payload?.data) ? payload.data : [],
    meta: payload?.meta ?? {},
  };
}

export async function generarBackup() {
  return apiClient.post("admin/backups", {}, {
    fallbackMessage: "No se pudo generar el backup.",
  });
}

function buildBackupUrl(filename, action = "download") {
  const safeName = encodeURIComponent(String(filename ?? "").trim());
  return `${config.apiUrl}/admin/backups/${safeName}/${action}`;
}

async function fetchBinaryBackup(filename, action = "download") {
  const token = getToken();
  const response = await fetch(buildBackupUrl(filename, action), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const fallbackMessage = action === "download"
      ? "No se pudo descargar el backup."
      : "No se pudo completar la solicitud del backup.";

    let message = fallbackMessage;

    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch {
      try {
        const text = await response.text();
        if (text.trim()) message = text.trim();
      } catch {
        // ignore parsing fallbacks
      }
    }

    throw new Error(message);
  }

  return response;
}

function resolveFilenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallback;
}

export async function descargarBackup(filename) {
  const response = await fetchBinaryBackup(filename, "download");
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");

  return {
    blob,
    filename: resolveFilenameFromDisposition(contentDisposition, String(filename ?? "backup.sql")),
  };
}

export async function eliminarBackup(filename) {
  return apiClient.delete(`admin/backups/${encodeURIComponent(String(filename ?? "").trim())}`, {
    fallbackMessage: "No se pudo eliminar el backup.",
  });
}
