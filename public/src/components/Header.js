export default function Header() {
  return `
    <header class="app-header">
      <a href="/" class="brand" data-link>
        <img class="brand-logo" src="/assets/branding/logo/just-a-pdf-main.png" alt="Just a PDF">
        <span class="brand-name">Just a PDF</span>
      </a>
      <nav class="nav-links" id="desktop-nav">
        <a href="/" data-link>Home</a>
        <a href="/editor" data-link>Editor</a>
        <a href="/pricing" data-link>Pricing</a>
        <a href="/account" data-link>Account</a>
      </nav>
      <div class="nav-actions">
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">☰</button>
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">🌓</button>
        <div class="header-editor-toggles">
          <button class="ghost header-panel-toggle" id="header-toggle-tools" type="button">Tools</button>
          <button class="ghost header-panel-toggle" id="header-toggle-details" type="button">Details</button>
        </div>
        <span class="nav-account" data-auth="account" hidden></span>
        <a class="ghost" href="/login" data-link data-auth="signin">Sign In</a>
        <a class="primary" href="/register" data-link data-auth="signup">Get Started</a>
        <button class="ghost" id="header-signout" type="button" data-auth="signout" hidden>Sign Out</button>
      </div>
      <div class="mobile-nav" id="mobile-nav">
        <a href="/" data-link>Home</a>
        <a href="/editor" data-link>Editor</a>
        <a href="/pricing" data-link>Pricing</a>
        <a href="/account" data-link>Account</a>
      </div>
    </header>
  `;
}
