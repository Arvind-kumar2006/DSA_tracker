import { apiFetch } from './client.js';

const API = '/api/questions';

export const fetchQuestions = () => apiFetch(API);
export const fetchStats = () => apiFetch(`${API}/stats`);
export const fetchMistakePatterns = () => apiFetch(`${API}/mistake-patterns`);
export const fetchPracticeQueue = () => apiFetch(`${API}/practice`);
export const fetchConfidenceHistory = (id) => apiFetch(`${API}/${id}/history`);
export const fetchSimilarQuestions = (id) => apiFetch(`${API}/${id}/similar`);

export const createQuestion = (data) =>
  apiFetch(API, { method: 'POST', body: JSON.stringify(data) });

export const updateQuestion = (id, data) =>
  apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const markAsRevised = (id, confidenceLevel) =>
  apiFetch(`${API}/${id}/revise`, {
    method: 'PATCH',
    body: JSON.stringify(confidenceLevel ? { confidenceLevel } : {}),
  });

export const deleteQuestion = (id) =>
  apiFetch(`${API}/${id}`, { method: 'DELETE' });

export const restoreQuestion = (data) =>
  apiFetch(`${API}/restore`, { method: 'POST', body: JSON.stringify(data) });

export const bulkRevise = (ids) =>
  apiFetch(`${API}/bulk/revise`, { method: 'PATCH', body: JSON.stringify({ ids }) });

export const bulkDelete = (ids) =>
  apiFetch(`${API}/bulk`, { method: 'DELETE', body: JSON.stringify({ ids }) });

export const exportData = () => apiFetch(`${API}/export`);

export const importData = (payload) =>
  apiFetch(`${API}/import`, { method: 'POST', body: JSON.stringify(payload) });
