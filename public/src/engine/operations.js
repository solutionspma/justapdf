import { apiFetch } from '../api.js';

export async function seedOperations() {
  try { return (await apiFetch('/registry/operations')).operations || []; } catch (error) {
    console.warn('Unable to load operation catalog:', error);
    return [];
  }
}
