import { apiRequest } from './api';
import { clearSession, saveSession } from '@/lib/session';

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  await saveSession(data.access_token, data.refresh_token);
  return data;
}

export async function signup(email: string, password: string) {
  return apiRequest<unknown>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  try {
    await apiRequest<void>('/api/v1/auth/logout', {
      method: 'POST',
      auth: true,
    });
  } finally {
    // Aunque falle la request (token vencido, sin red), la sesión local se borra
    await clearSession();
  }
}