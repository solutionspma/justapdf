import { render } from './app.js';
import { auth, onAuthStateChanged } from './firebase.js';
import { seedOperations } from './engine/operations.js';

function handleLinkClick(event) {
  const link = event.target.closest('a[data-link]');
  if (!link) return;

  event.preventDefault();
  history.pushState(null, '', link.href);
  render(location.pathname);
}

window.addEventListener('popstate', () => {
  render(location.pathname);
});

document.addEventListener('click', handleLinkClick);
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.dataset.theme = savedTheme;

  onAuthStateChanged(auth, async (user) => {
    window.currentUser = user || null;
    if (user) {
      await seedOperations();
    }
  });

  render(location.pathname);
});

export function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
}
