import { getTheme, applyTheme, listThemes, persistTheme } from '../engine/themes.js';
import { auth } from '../firebase.js';

export function initThemeControls() {
  const toggle = document.getElementById('theme-toggle');
  const selector = document.getElementById('theme-selector');

  if (toggle) {
    toggle.addEventListener('click', async () => {
      const themes = listThemes();
      const current = getTheme();
      const nextIndex = (themes.findIndex((t) => t.id === current) + 1) % themes.length;
      const next = themes[nextIndex].id;
      applyTheme(next);
      await persistTheme(auth.currentUser?.uid, next);
      renderSelector(selector);
    });
  }

  renderSelector(selector);
}

function renderSelector(container) {
  if (!container) return;
  const themes = listThemes();
  const current = getTheme();

  container.innerHTML = themes
    .map((theme) => {
      const isActive = theme.id === current;
      return `
        <div class="theme-option">
          <span>${theme.label}</span>
          <button data-theme="${theme.id}">${isActive ? 'Active' : 'Use'}</button>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('button[data-theme]').forEach((button) => {
    button.addEventListener('click', async () => {
      const themeId = button.dataset.theme;
      applyTheme(themeId);
      await persistTheme(auth.currentUser?.uid, themeId);
      renderSelector(container);
    });
  });
}
