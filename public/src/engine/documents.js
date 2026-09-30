import { apiFetch } from '../api.js';

export async function createDocumentRecord(payload) { return apiFetch('/documents', { method: 'POST', body: JSON.stringify(payload) }); }
export async function updateDocumentStatus(id, status) { return apiFetch(`/documents/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ status }) }); }
export async function updateDocumentRecord(id, updates) { return apiFetch(`/documents/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) }); }
export async function logOperation(id, operation) { return apiFetch(`/documents/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ metadata: { lastOperation: operation } }) }); }
export async function listUserDocuments() { return (await apiFetch('/documents')).documents || []; }
