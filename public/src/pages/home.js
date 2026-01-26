import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Home() {
  return `
    ${Header()}
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <h1>It’s just a PDF, damn.</h1>
          <p>Fast edits, clear pricing, no subscriptions hiding basic tools.</p>
          <div class="hero-actions">
            <a class="primary" href="/editor" data-link>Open Editor</a>
            <a class="ghost" href="/pricing" data-link>See Pricing</a>
          </div>
        </div>
        <div class="hero-art">
          <img src="/assets/branding/logo/just-a-pdf-main.png" alt="Just a PDF">
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}
