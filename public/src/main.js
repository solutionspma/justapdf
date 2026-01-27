import { render } from './app.js';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase.js';
import { seedOperations } from './engine/operations.js';
import { applyTheme, getTheme } from './engine/themes.js';

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
  applyTheme(getTheme());

  onAuthStateChanged(auth, async (user) => {
    window.currentUser = user || null;
    if (user) {
      await seedOperations();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().theme) {
        applyTheme(userDoc.data().theme);
      }
    }
  });

  render(location.pathname);
});
