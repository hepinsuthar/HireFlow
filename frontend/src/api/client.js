const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Centralized API client with automatic JWT token attachment and error handling.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("hireflow_token");
  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type if sending FormData (browser automatically sets multipart boundary)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      // Auto-logout on 401 token expiration
      if (response.status === 401 && !endpoint.includes("/auth/login")) {
        localStorage.removeItem("hireflow_token");
        localStorage.removeItem("hireflow_user");
        window.dispatchEvent(new Event("hireflow:auth_expired"));
      }
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    // Network or connection failure
    const networkError = new Error("Unable to connect to server. Please check your network connection.");
    networkError.status = 0;
    throw networkError;
  }
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "DELETE" }),
};
