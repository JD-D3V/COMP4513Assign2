const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Fetches data from the Assignment 1 Node/Express API.
 *
 * @param {string} path - API path, e.g. '/api/artists'
 * @returns {Promise<any>} Parsed JSON response body
 * @throws {Error} If the HTTP response status is not ok
 */
export async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
