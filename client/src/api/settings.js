import { apiFetch } from './client.js';

export async function fetchSettings() {
  return apiFetch('/api/settings');
}

export async function updateSettings(data) {
  return apiFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
