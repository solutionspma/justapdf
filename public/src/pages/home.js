import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Home() {
  return `
    ${Header()}
    <main class="page">
      <section class="hero">
        <div class="hero-visual">
          <img src="/assets/branding/logo/just-a-pdf-main.png" alt="Just a PDF">
        </div>
        <div class="hero-copy">
          <h1>It’s just a PDF.</h1>
          <p class="hero-subhead">Edit it. Fix it. Sign it. Move on.</p>
          <p class="hero-support">No subscriptions for basic stuff. No paying to download your own file.</p>
          <div class="hero-actions">
            <a class="primary" href="/editor" data-link>Fix a PDF</a>
            <a class="ghost" href="/pricing" data-link>How pricing works</a>
          </div>
        </div>
      </section>

      <section class="section surface">
        <div class="section-inner">
          <h2>What you can do</h2>
          <div class="section-media">
            <figure class="media-card">
              <img src="https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&h=400&w=800" alt="Printed pages and tools">
            </figure>
          </div>
          <div class="card-grid">
            <div class="card">
              <span class="card-icon">✍️</span>
              <h3>Edit text</h3>
              <p>Fix typos, update clauses, and move on.</p>
            </div>
            <div class="card">
              <span class="card-icon">🔗</span>
              <h3>Merge or split files</h3>
              <p>Combine or separate pages without the mess.</p>
            </div>
            <div class="card">
              <span class="card-icon">🖊️</span>
              <h3>Add signatures</h3>
              <p>Sign once, track the history.</p>
            </div>
            <div class="card">
              <span class="card-icon">🕶️</span>
              <h3>Redact information</h3>
              <p>Remove what shouldn’t be seen.</p>
            </div>
            <div class="card">
              <span class="card-icon">📄</span>
              <h3>Add or remove pages</h3>
              <p>Restructure in minutes, not hours.</p>
            </div>
            <div class="card">
              <span class="card-icon">🔍</span>
              <h3>OCR scanned docs</h3>
              <p>Make scanned PDFs searchable.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <h2>How pricing works</h2>
          <div class="section-media">
            <figure class="media-card">
              <img src="https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&h=400&w=800" alt="Paper workflow">
            </figure>
          </div>
          <div class="step-flow">
            <div class="step">
              <span class="step-number">1</span>
              <h3>Upload</h3>
              <p>Bring your file in.</p>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <h3>Preview</h3>
              <p>See changes for free.</p>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <h3>Run operation</h3>
              <p>Only real work costs credits.</p>
            </div>
            <div class="step">
              <span class="step-number">4</span>
              <h3>Credits used (or not)</h3>
              <p>Failures never charge you.</p>
            </div>
            <div class="step">
              <span class="step-number">5</span>
              <h3>Download</h3>
              <p>Your file is always yours.</p>
            </div>
          </div>
          <div class="trust-strip">
            <span>Preview is free</span>
            <span>Failed operations don’t cost credits</span>
            <span>You always download your file</span>
          </div>
        </div>
      </section>

      <section class="section contrast">
        <div class="section-inner">
          <h2>Why not just use Acrobat?</h2>
          <p>Adobe built PDF. They also turned it into a subscription.</p>
          <p>If you use PDFs all day and your company pays for it, Acrobat makes sense.</p>
          <p>If you just need to fix a PDF and move on, it doesn’t.</p>
          <p>JustaPDF exists for the other 98%.</p>
        </div>
      </section>

      <section class="section surface">
        <div class="section-inner">
          <h2>Built for individuals. Trusted by professionals.</h2>
          <div class="section-media">
            <figure class="media-card">
              <img src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&h=400&w=800" alt="Professional review">
            </figure>
          </div>
          <div class="pro-grid">
            <div class="card">
              <h3>Legal workflows</h3>
              <ul class="plain-list">
                <li>Redaction</li>
                <li>OCR</li>
                <li>Audit logs</li>
                <li>Chain of custody</li>
              </ul>
            </div>
            <div class="card">
              <h3>Print & pre-press</h3>
              <ul class="plain-list">
                <li>Preflight</li>
                <li>Font embedding</li>
                <li>Color conversion</li>
                <li>PDF/X validation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <h2>No tricks. No hostage pricing.</h2>
          <ul class="plain-list">
            <li>You can download your files</li>
            <li>You can leave anytime</li>
            <li>We don’t auto-renew behind your back</li>
            <li>We don’t scare you into upgrading</li>
          </ul>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}
