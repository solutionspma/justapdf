import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Register() {
  return `
    ${Header()}
    <main class="page auth-page">
      <h1>Create Account</h1>
      <div class="card auth-card">
        <label>Email</label>
        <input type="email" placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" placeholder="••••••••" />
        <button class="primary">Create Account</button>
        <a class="ghost-link" href="/login" data-link>Already have an account?</a>
      </div>
    </main>
    ${Footer()}
  `;
}
