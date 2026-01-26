import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Login() {
  return `
    ${Header()}
    <main class="page auth-page">
      <h1>Sign In</h1>
      <div class="card auth-card">
        <label>Email</label>
        <input type="email" placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" placeholder="••••••••" />
        <button class="primary">Sign In</button>
        <a class="ghost-link" href="/register" data-link>Need an account?</a>
      </div>
    </main>
    ${Footer()}
  `;
}
