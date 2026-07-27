export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Centralized fetch wrapper: prefixes the API base URL, always sends
 * cookies, and throws an ApiError with the server's message on non-2xx.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Response had no JSON body
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
