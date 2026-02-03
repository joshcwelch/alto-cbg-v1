const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const STORAGE_SESSION_KEY = "mock_session";

function getToken(): string | null {
  const raw = localStorage.getItem(STORAGE_SESSION_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw) as { accessToken?: string };
      if (session?.accessToken) return session.accessToken;
    } catch {
      // Ignore corrupted storage and fall back to legacy keys.
    }
  }
  return localStorage.getItem("accessToken");
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return (await res.json()) as T;
}
