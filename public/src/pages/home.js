import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Home() {
  return `
    ${Header()}
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <h1>It’s just a PDF.</h1>
          <p>Edit it. Fix it. Sign it. Move on.</p>
          <p>No subscriptions for basic stuff. No paying to download your own file.</p>
          <div class="hero-actions">
            <a class="primary" href="/editor" data-link>Fix a PDF</a>
            <a class="ghost" href="/pricing" data-link>How pricing works</a>
          </div>
        </div>
        <div class="hero-art">
          <img src="/assets/branding/logo/just-a-pdf-main.png" alt="Just a PDF">
        </div>
      </section>

      <section class="section">
        <h2>What is JustaPDF?</h2>
        <p>JustaPDF is a simple, pay-for-what-you-use PDF tool.</p>
        <p>You don’t rent software. You don’t unlock features. You don’t get trapped in a subscription just to fix one file.</p>
        <p>You run a PDF operation. We charge for the work it actually does. That’s it.</p>
      </section>

      <section class="section">
        <h2>Common things people actually need</h2>
        <ul class="plain-list">
          <li>Edit text</li>
          <li>Merge or split files</li>
          <li>Add signatures</li>
          <li>Redact information</li>
          <li>Add pages or remove pages</li>
          <li>OCR scanned documents</li>
        </ul>
        <p>No feature maze. No “Pro vs Ultimate vs Ultra” nonsense.</p>
      </section>

      <section class="section">
        <h2>Why not just use Acrobat?</h2>
        <p>Adobe built PDF. They also turned it into a subscription.</p>
        <p>If you use PDFs all day, every day, and your company pays for it — Acrobat makes sense.</p>
        <p>If you just need to fix a PDF and get on with your life, it doesn’t.</p>
        <p>JustaPDF exists for the other 98% of people.</p>
      </section>

      <section class="section">
        <h2>No tricks. No hostage pricing.</h2>
        <ul class="plain-list">
          <li>You can download your files</li>
          <li>You can leave anytime</li>
          <li>We don’t auto-renew behind your back</li>
          <li>We don’t scare you into upgrading</li>
        </ul>
        <p>If something wouldn’t feel fair to someone fixing one PDF, we don’t charge for it.</p>
      </section>
    </main>
    ${Footer()}
  `;
}
