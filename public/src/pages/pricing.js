import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Pricing() {
  return `
    ${Header()}
    <main class="page">
      <h1>Fair pricing, by actual usage.</h1>
      <p>PDFs are built from objects and streams. When you edit a PDF, the system performs real operations on those objects.</p>
      <p>We charge per operation, not per month.</p>

      <section class="section">
        <h2>What counts as an operation</h2>
        <ul class="plain-list">
          <li>Editing text objects</li>
          <li>Modifying page structure</li>
          <li>Re-encoding streams</li>
          <li>Adding annotations or signatures</li>
          <li>Creating OCR text layers</li>
        </ul>
      </section>

      <section class="section">
        <h2>What does NOT cost anything</h2>
        <ul class="plain-list">
          <li>Uploading files</li>
          <li>Previewing changes</li>
          <li>Canceling before processing</li>
          <li>Failed operations</li>
        </ul>
      </section>

      <section class="section">
        <h2>Credits, not subscriptions.</h2>
        <p>Credits represent actual PDF work.</p>
        <ul class="plain-list">
          <li>You buy them when you need them</li>
          <li>You don’t lose them if something fails</li>
          <li>You don’t pay just to “have access”</li>
        </ul>
        <p>Use a few today. Come back in six months. Your credits are still there.</p>
      </section>

      <section class="section">
        <h2>Want predictability? We have that too.</h2>
        <p>Some people like subscriptions. That’s fine.</p>
        <p>Plans include:</p>
        <ul class="plain-list">
          <li>Monthly credit allowance</li>
          <li>Lower per-operation cost</li>
          <li>Priority processing</li>
        </ul>
        <p>But nothing essential is locked behind them. You can always pay as you go.</p>
      </section>
    </main>
    ${Footer()}
  `;
}
