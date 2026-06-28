import { API, apiFetch } from '@/lib/api/client';
import { AuditLog, AuthResponse, User } from '@/types/api';

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>(API.auth, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    fullName: string;
    email: string;
    password: string;
    gender?: string;
  }) =>
    apiFetch<AuthResponse>(API.auth, '/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiFetch<User>(API.auth, '/auth/me'),

  listUsers: () => apiFetch<User[]>(API.auth, '/users'),

  updateUser: (id: string, data: Partial<User>) =>
    apiFetch<User>(API.auth, `/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  auditLogs: () => apiFetch<AuditLog[]>(API.auth, '/audit-logs'),
};
