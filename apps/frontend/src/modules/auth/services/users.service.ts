import { apiRequest as request } from '../util/api-request.util';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface UserPage {
  items: UserSummary[];
  page: number;
  perPage: number;
  total: number;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
}

export function listUsers(token: string | null, page: number, perPage: number): Promise<UserPage> {
  return request<UserPage>(`/users?page=${page}&perPage=${perPage}`, token);
}

export function getUser(token: string | null, id: string): Promise<UserSummary> {
  return request<UserSummary>(`/users/${encodeURIComponent(id)}`, token);
}

export function createUser(token: string | null, data: UserFormData): Promise<void> {
  return request<void>('/users', token, { method: 'POST', body: JSON.stringify(data) });
}

export function updateUser(token: string | null, id: string, data: UserFormData): Promise<void> {
  return request<void>(`/users/${encodeURIComponent(id)}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteUser(token: string | null, id: string): Promise<void> {
  return request<void>(`/users/${encodeURIComponent(id)}`, token, { method: 'DELETE' });
}
