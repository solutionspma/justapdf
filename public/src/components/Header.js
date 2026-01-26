export default function Header() {
  return `
    <header class="app-header">
      <a href="/" class="brand" data-link>
        <img class="brand-logo" src="/assets/branding/logo/just-a-pdf-main.png" alt="Just a PDF">
        <span class="brand-name">Just a PDF</span>
      </a>
      <nav class="nav-links">
        <a href="/" data-link>Home</a>
        <a href="/editor" data-link>Editor</a>
        <a href="/pricing" data-link>Pricing</a>
        <a href="/account" data-link>Account</a>
      </nav>
      <div class="nav-actions">
        <a class="ghost" href="/login" data-link>Sign In</a>
        <a class="primary" href="/register" data-link>Get Started</a>
      </div>
    </header>
  `;
}
