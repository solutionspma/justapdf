// THIS IS A STATIC VANILLA JS PROJECT — NO FRAMEWORKS OR BUNDLERS.
import { render } from './app.js';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase.js';
import { seedOperations } from './engine/operations.js';
import { applyTheme, getTheme } from './engine/themes.js';

function updateHeaderAuthState(user) {
  const signIn = document.querySelector('[data-auth="signin"]');
  const signUp = document.querySelector('[data-auth="signup"]');
  const signOut = document.querySelector('[data-auth="signout"]');
  const account = document.querySelector('[data-auth="account"]');

  if (signIn) signIn.hidden = !!user;
  if (signUp) signUp.hidden = !!user;
  if (signOut) signOut.hidden = !user;
  if (account) {
    account.hidden = !user;
    account.textContent = user?.email ? `Signed in: ${user.email}` : 'Signed in';
  }

  if (signOut) {
    signOut.onclick = async () => {
      await import('./firebase.js').then(({ signOut }) => signOut(auth));
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
  }
}

window.updateHeaderAuthState = updateHeaderAuthState;

function updateHeaderHeight() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  const height = Math.round(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${height}px`);
}

window.updateHeaderHeight = updateHeaderHeight;

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
  const PUBLIC_ROUTES = new Set(['/', '/pricing', '/login', '/register']);
  window.addEventListener('resize', updateHeaderHeight);

  render(location.pathname);
  updateHeaderHeight();
  updateHeaderAuthState(window.currentUser || null);

  onAuthStateChanged(auth, async (user) => {
    window.currentUser = user || null;
    updateHeaderAuthState(user);
    const currentPath = window.location.pathname;

    if (user) {
      await seedOperations();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().theme) {
        applyTheme(userDoc.data().theme);
      }
      if (['/login', '/register'].includes(currentPath)) {
        window.history.replaceState(null, '', '/editor');
        render('/editor');
        return;
      }
      render(currentPath);
      return;
    }

    if (!PUBLIC_ROUTES.has(currentPath)) {
      window.history.replaceState(null, '', '/login');
      render('/login');
      return;
    }

    render(currentPath);
  });
});
