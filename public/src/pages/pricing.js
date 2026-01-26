import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Pricing() {
  return `
    ${Header()}
    <main class="page">
      <h1>Pricing</h1>
      <p>Pay for real PDF object changes. Downloads are always free.</p>
      <div class="pricing-grid">
        <div class="card">
          <h2>Pay As You Go</h2>
          <p>Credits map to actual object mutations.</p>
        </div>
        <div class="card">
          <h2>Teams</h2>
          <p>Volume credits with transparent costs.</p>
        </div>
      </div>
    </main>
    ${Footer()}
  `;
}
