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
    updateHeaderAuthState(user);
    if (user) {
      await seedOperations();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().theme) {
        applyTheme(userDoc.data().theme);
      }
      if (['/login', '/register'].includes(window.location.pathname)) {
        window.history.replaceState(null, '', '/editor');
        render('/editor');
      }
      return;
    }
    if (!['/login', '/register'].includes(window.location.pathname)) {
      window.history.replaceState(null, '', '/login');
      render('/login');
    }
  });

  render(location.pathname);
  updateHeaderAuthState(window.currentUser);
});
