import config from "../../config";
import { getToken } from "../sessionService";

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${config.apiUrl}/${String(endpoint || "").replace(/^\/+/, "")}`;
}

function buildHeaders(headers = {}, body, auth) {
  const nextHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`;
    }
  }

  if (body instanceof FormData || body == null || nextHeaders["Content-Type"]) {
    return nextHeaders;
  }

  nextHeaders["Content-Type"] = "application/json";
  return nextHeaders;
}

async function parseBody(response) {
  const clone = response.clone();
  const json = await response.json().catch(() => null);

  if (json !== null) {
    return { data: json, rawText: "" };
  }

  const rawText = await clone.text().catch(() => "");
  return { data: null, rawText };
}

function buildErrorMessage(data, rawText, fallbackMessage) {
  if (data?.message) return data.message;
  if (typeof rawText === "string" && rawText.trim() && !rawText.trim().startsWith("<")) {
    return rawText.trim();
  }
  return fallbackMessage;
}

function buildAbortError(message) {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

export async function httpRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers,
    auth = true,
    fallbackMessage = "No se pudo completar la solicitud.",
    signal,
    timeoutMs = 180000,
  } = options;

  const finalHeaders = buildHeaders(headers, body, auth);
  const finalBody =
    body instanceof FormData || body == null || typeof body === "string"
      ? body
      : JSON.stringify(body);
  const controller = !signal && timeoutMs ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let response;

  try {
    response = await fetch(buildUrl(endpoint), {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: signal || controller?.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw buildAbortError(fallbackMessage);
    }

    throw new Error(fallbackMessage);
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }

  const { data, rawText } = await parseBody(response);

  if (!response.ok) {
    const error = new Error(buildErrorMessage(data, rawText, fallbackMessage));
    error.status = response.status;
    error.data = data;
    error.validationErrors = data?.errors ?? {};
    throw error;
  }

  return data;
}

export const apiClient = {
  get(endpoint, options = {}) {
    return httpRequest(endpoint, { ...options, method: "GET" });
  },
  post(endpoint, body, options = {}) {
    return httpRequest(endpoint, { ...options, method: "POST", body });
  },
  put(endpoint, body, options = {}) {
    return httpRequest(endpoint, { ...options, method: "PUT", body });
  },
  patch(endpoint, body, options = {}) {
    return httpRequest(endpoint, { ...options, method: "PATCH", body });
  },
  delete(endpoint, options = {}) {
    return httpRequest(endpoint, { ...options, method: "DELETE" });
  },
};
