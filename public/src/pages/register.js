import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { apiFetch } from '../api.js';
import { setSession } from '../auth.js';

export default function Register() {
  return `
    ${Header()}
    <main class="page auth-page">
      <h1>Create Account</h1>
      <div class="card auth-card">
        <label>Email</label>
        <input type="email" id="register-email" placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" id="register-password" placeholder="••••••••" />
        <button class="primary" id="register-submit">Create Account</button>
        <p class="auth-status" id="register-status"></p>
        <a class="ghost-link" href="/login" data-link>Already have an account?</a>
      </div>
    </main>
    ${Footer()}
  `;
}

export function mountRegister() {
  const email = document.getElementById('register-email');
  const password = document.getElementById('register-password');
  const submit = document.getElementById('register-submit');
  const status = document.getElementById('register-status');

  if (!submit) return;

  submit.addEventListener('click', async () => {
    if (!email.value || !password.value) {
      status.textContent = 'Enter email and password.';
      return;
    }
    status.textContent = 'Creating account...';
    try {
      const result = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) });
      setSession(result);
      status.textContent = 'Account created. Redirecting...';
      window.history.pushState(null, '', '/editor');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      status.textContent = error.message || 'Registration failed.';
    }
  });
}
