// THIS IS A STATIC VANILLA JS PROJECT — NO FRAMEWORKS OR BUNDLERS.
import { render } from './app.js';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase.js';
import { seedOperations } from './engine/operations.js';
import { applyTheme, getTheme } from './engine/themes.js';

function updateHeaderAuthState(user) {
  const signIn = document.querySelector('[data-auth="signin"]');
  const signUp = document.querySelector('[data-auth="signup"]');
  const signOut = document.querySelector('[data-auth="signout"]');

  if (signIn) signIn.hidden = !!user;
  if (signUp) signUp.hidden = !!user;
  if (signOut) signOut.hidden = !user;

  if (signOut) {
    signOut.onclick = async () => {
      await import('./firebase.js').then(({ signOut }) => signOut(auth));
      window.location.reload();
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
    }
  });

  render(location.pathname);
  updateHeaderAuthState(window.currentUser);
});
