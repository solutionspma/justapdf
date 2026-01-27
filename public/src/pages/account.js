import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Account() {
  return `
    ${Header()}
    <main class="page">
      <h1>Account</h1>
      <p class="account-status" id="account-status">Sign in required to access the editor.</p>
      <section class="section">
        <h2>Credit balance</h2>
        <div class="card">
          <p>Balance: -- credits</p>
          <p>Credits never expire. Failed operations never charge.</p>
        </div>
      </section>
      <section class="section">
        <h2>Usage history</h2>
        <div class="card account-docs" id="account-docs">
          <p>No usage yet. Run an operation and it will appear here.</p>
        </div>
      </section>
      <section class="section">
        <h2>Theme</h2>
        <div class="card theme-selector" id="theme-selector"></div>
      </section>
    </main>
    ${Footer()}
  `;
}

export function mountAccount() {
  const status = document.getElementById('account-status');
  const docs = document.getElementById('account-docs');

  const { auth, onAuthStateChanged, signOut } = window.FirebaseAuth || {};

  if (!auth) {
    import('../firebase.js').then(({ auth: liveAuth, onAuthStateChanged: onAuth, signOut: signOutFn }) => {
      attachListeners(liveAuth, onAuth, signOutFn);
    });
  } else {
    attachListeners(auth, onAuthStateChanged, signOut);
  }

  function attachListeners(activeAuth, onAuth, signOutFn) {
    onAuth(activeAuth, async (user) => {
      if (!user) {
        status.textContent = 'Sign in required to access the editor.';
        return;
      }
      status.textContent = `Signed in as ${user.email}`;
      const { listUserDocuments } = await import('../engine/documents.js');
      const items = await listUserDocuments(user.uid);
      if (!items.length) {
        docs.innerHTML = '<p>No usage yet. Run an operation and it will appear here.</p>';
        return;
      }
      docs.innerHTML = items
        .map((doc) => `<div class="doc-row"><span>${doc.filename}</span><span>${doc.status}</span></div>`)
        .join('');
    });
  }
}
