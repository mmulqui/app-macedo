import { getAccessToken } from '@/lib/session';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://backend-proyecto.n7softwares.com';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

// Error con el status HTTP, para poder reaccionar (por ejemplo ante un 401)
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAuthError(e: unknown) {
  return e instanceof ApiError && e.status === 401;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = await getAccessToken();
    if (!token) throw new ApiError('No hay una sesión iniciada.', 401);
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Si la respuesta no es JSON válido, body queda en null
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.error?.message ?? // errores propios del backend
      body?.msg ?? // errores de Supabase Auth
      `Error HTTP ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return body as T;
}