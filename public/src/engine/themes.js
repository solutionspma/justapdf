import { THEMES } from '../themes.js';
import { apiFetch } from '../api.js';

const THEME_KEY = 'theme';
export function getTheme() { const stored = localStorage.getItem(THEME_KEY); return THEMES.some((theme) => theme.id === stored) ? stored : 'dark'; }
export function applyTheme(themeId) { const resolved = THEMES.some((theme) => theme.id === themeId) ? themeId : 'dark'; document.documentElement.dataset.theme = resolved; localStorage.setItem(THEME_KEY, resolved); }
export async function persistTheme(_userId, themeId) { try { await apiFetch('/users/me', { method: 'PUT', body: JSON.stringify({ theme: themeId }) }); } catch (error) { console.warn('Unable to save theme:', error); } }
export function listThemes() { return THEMES; }
