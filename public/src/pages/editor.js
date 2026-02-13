/**
 * Editor page - redirects to the PDF Power Editor (React app at /editor/)
 * The React app is built from pdf-power-editor and served at /editor/
 */
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Editor() {
  return `
    ${Header()}
    <main class="glyph-editor-page">
      <section class="glyph-hero">
        <div>
          <p class="muted">Just a PDF</p>
          <h1>Loading the editor…</h1>
          <p class="hero-subhead">If you're not redirected automatically, <a href="/editor/">click here</a>.</p>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}

export function mountEditor() {
  // If we're seeing this, we're in the main app - redirect to the React editor
  const url = new URL(location.href);
  if (url.searchParams.get('_noredirect')) {
    return; // Already tried redirect, show the fallback message
  }
  url.pathname = '/editor/';
  url.searchParams.set('_noredirect', '1');
  window.location.replace(url.toString());
}
