const TOKEN_KEY = 'justapdf_token';
const USER_KEY = 'justapdf_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

export function setSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.currentUser = user || null;
  window.dispatchEvent(new CustomEvent('justapdf-auth-change', { detail: window.currentUser }));
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.currentUser = null;
  window.dispatchEvent(new CustomEvent('justapdf-auth-change', { detail: null }));
}

export function onAuthChange(handler) {
  const listener = (event) => handler(event.detail || null);
  window.addEventListener('justapdf-auth-change', listener);
  handler(getCurrentUser());
  return () => window.removeEventListener('justapdf-auth-change', listener);
}

