import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Login() {
  return `
    ${Header()}
    <main class="page auth-page">
      <h1>Sign In</h1>
      <div class="card auth-card">
        <label>Email</label>
        <input type="email" id="login-email" placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" id="login-password" placeholder="••••••••" />
        <button class="primary" id="login-submit">Sign In</button>
        <p class="auth-status" id="login-status"></p>
        <a class="ghost-link" href="/register" data-link>Need an account?</a>
      </div>
    </main>
    ${Footer()}
  `;
}

export function mountLogin() {
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const submit = document.getElementById('login-submit');
  const status = document.getElementById('login-status');

  if (!submit) return;

  submit.addEventListener('click', async () => {
    if (!email.value || !password.value) {
      status.textContent = 'Enter email and password.';
      return;
    }
    status.textContent = 'Signing in...';
    const { signInWithEmailAndPassword, auth } = await import('../firebase.js');
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      status.textContent = 'Signed in. Redirecting...';
      window.history.pushState(null, '', '/account');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      status.textContent = error.message || 'Sign in failed.';
    }
  });
}
