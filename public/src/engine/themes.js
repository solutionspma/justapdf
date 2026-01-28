import { THEMES } from '../themes.js';
import { db, doc, updateDoc } from '../firebase.js';

const THEME_KEY = 'theme';

export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (!stored) return 'dark';
  if (!THEMES.some((theme) => theme.id === stored)) {
    return 'dark';
  }
  return stored;
}

export function applyTheme(themeId) {
  const resolved = THEMES.some((theme) => theme.id === themeId) ? themeId : 'dark';
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(THEME_KEY, resolved);
}

export async function persistTheme(userId, themeId) {
  if (!userId) return;
  await updateDoc(doc(db, 'users', userId), { theme: themeId });
}

export function listThemes() {
  return THEMES;
}
