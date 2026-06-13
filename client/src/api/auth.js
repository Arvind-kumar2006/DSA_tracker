import { apiFetch, setToken, clearToken } from './client.js';

export async function register(name, email, password) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function fetchMe() {
  return apiFetch('/api/auth/me');
}

export function logout() {
  clearToken();
}
