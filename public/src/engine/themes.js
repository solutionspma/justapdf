import { THEMES } from '../themes.js';
import { db, doc, updateDoc } from '../firebase.js';

const THEME_KEY = 'theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark_default';
}

export function applyTheme(themeId) {
  document.documentElement.dataset.theme = themeId;
  localStorage.setItem(THEME_KEY, themeId);
}

export async function persistTheme(userId, themeId) {
  if (!userId) return;
  await updateDoc(doc(db, 'users', userId), { theme: themeId });
}

export function listThemes() {
  return THEMES;
}
