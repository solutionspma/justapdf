import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Account() {
  return `
    ${Header()}
    <main class="page">
      <h1>Account</h1>
      <p>Sign in required to access the editor.</p>
      <div class="card">
        <button class="primary">Sign In</button>
      </div>
    </main>
    ${Footer()}
  `;
}
