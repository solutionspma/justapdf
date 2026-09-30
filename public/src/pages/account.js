import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { apiFetch } from '../api.js';
import { getCurrentUser } from '../auth.js';

export default function Account() {
  return `
    ${Header()}
    <main class="page">
      <h1>Account</h1>
      <p class="account-status" id="account-status">Sign in required to access the editor.</p>
      <section class="section"><h2>Credit balance</h2><div class="card" id="account-balance"><p>Loading balance…</p><p>Credits never expire. Failed operations never charge.</p></div></section>
      <section class="section"><h2>Documents</h2><div class="card account-docs" id="account-docs"><p>Loading documents…</p></div></section>
      <section class="section"><h2>Theme</h2><div class="card theme-selector" id="theme-selector"></div></section>
    </main>
    ${Footer()}
  `;
}

export async function mountAccount() {
  const user = getCurrentUser();
  const status = document.getElementById('account-status');
  const docs = document.getElementById('account-docs');
  const balance = document.getElementById('account-balance');
  if (!user) return;
  status.textContent = `Signed in as ${user.email}`;
  try {
    const [documentResult, balanceResult] = await Promise.all([
      apiFetch('/documents'),
      apiFetch('/billing/credits/balance')
    ]);
    balance.innerHTML = `<p>Balance: ${Number(balanceResult.balance || 0)} credits</p><p>Credits never expire. Failed operations never charge.</p>`;
    const items = documentResult.documents || [];
    docs.innerHTML = items.length ? items.map((document) => `<div class="doc-row"><span>${document.filename}</span><span>${document.status}</span></div>`).join('') : '<p>No documents yet.</p>';
  } catch (error) {
    status.textContent = error.message || 'Unable to load account data.';
  }
}
