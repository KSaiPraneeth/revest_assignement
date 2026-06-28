import { API, ApiEnvelope } from '@/types/api';

const TOKEN_KEY = 'revest_access_token';
const USER_KEY = 'revest_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function isPublicAuthPath(path: string): boolean {
  return path.includes('/auth/login') || path.includes('/auth/register');
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (json as { message?: string | string[] }).message ?? 'Request failed';

    if (
      res.status === 401 &&
      token &&
      !isPublicAuthPath(path) &&
      typeof window !== 'undefined'
    ) {
      clearAuth();
      window.location.assign('/login?session=expired');
    }

    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : String(message),
      res.status,
    );
  }

  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }

  return json as T;
}

export { API };
