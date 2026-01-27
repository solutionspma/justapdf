import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

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
    const { auth, createUserWithEmailAndPassword, doc, setDoc, db, serverTimestamp } = await import('../firebase.js');
    try {
      const result = await createUserWithEmailAndPassword(auth, email.value, password.value);
      await setDoc(doc(db, 'users', result.user.uid), {
        id: result.user.uid,
        email: result.user.email,
        createdAt: serverTimestamp()
      });
      status.textContent = 'Account created. Redirecting...';
      window.history.pushState(null, '', '/editor');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      status.textContent = error.message || 'Registration failed.';
    }
  });
}
