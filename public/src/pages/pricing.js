import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Pricing() {
  return `
    ${Header()}
    <main class="page pricing">
      <header class="pricing-hero">
        <h1>Pricing that doesn’t insult you.</h1>
        <p>Subscriptions include monthly credits. Need more juice? Buy credit packs. Add-ons unlock advanced features.</p>
      </header>

      <section class="pricing-section">
        <h2>Plans</h2>
        <div class="grid plans">
          <article class="card plan">
            <h3>Free</h3>
            <div class="price">$0</div>
            <div class="sub">20 credits / month</div>
            <ul>
              <li>Basic tools</li>
              <li>Watermark</li>
              <li>Standard queue</li>
            </ul>
            <button class="btn ghost">Start Free</button>
          </article>

          <article class="card plan featured">
            <h3>Starter</h3>
            <div class="price">$9<span>/mo</span></div>
            <div class="sub">250 credits / month</div>
            <ul>
              <li>No watermark</li>
              <li>All core tools</li>
              <li>Faster queue</li>
            </ul>
            <button class="btn primary">Get Starter</button>
          </article>

          <article class="card plan">
            <h3>Pro</h3>
            <div class="price">$19<span>/mo</span></div>
            <div class="sub">800 credits / month</div>
            <ul>
              <li>Priority queue</li>
              <li>Advanced tool presets</li>
              <li>Better limits</li>
            </ul>
            <button class="btn primary">Get Pro</button>
          </article>

          <article class="card plan">
            <h3>Business</h3>
            <div class="price">$49<span>/mo</span></div>
            <div class="sub">2,500 credits / month</div>
            <ul>
              <li>Highest priority</li>
              <li>Team-ready foundation</li>
              <li>Admin controls (later)</li>
            </ul>
            <button class="btn primary">Get Business</button>
          </article>
        </div>
      </section>

      <section class="pricing-section">
        <h2>Credit Packs</h2>
        <div class="grid packs">
          <article class="card"><h3>Micro</h3><div class="price">$5</div><div class="sub">100 credits</div></article>
          <article class="card"><h3>Small</h3><div class="price">$12</div><div class="sub">300 credits</div></article>
          <article class="card"><h3>Plus</h3><div class="price">$20</div><div class="sub">600 credits</div></article>
          <article class="card"><h3>Power</h3><div class="price">$45</div><div class="sub">1,500 credits</div></article>
          <article class="card"><h3>Mega</h3><div class="price">$80</div><div class="sub">3,000 credits</div></article>
          <article class="card"><h3>Boss</h3><div class="price">$150</div><div class="sub">6,500 credits</div></article>
        </div>
        <p class="fineprint">Credit packs stack on top of your plan and do not expire.</p>
      </section>

      <section class="pricing-section">
        <h2>Add-Ons</h2>
        <div class="grid addons">
          <article class="card"><h3>Bulk Boost</h3><div class="sub">$9/mo</div><p>Batch processing and higher concurrency.</p></article>
          <article class="card"><h3>Advanced Compression</h3><div class="sub">$7/mo</div><p>Stronger compression presets.</p></article>
          <article class="card"><h3>Signature Profiles</h3><div class="sub">$5/mo</div><p>Save signatures, stamps, and templates.</p></article>
          <article class="card"><h3>OCR Pack</h3><div class="sub">$15/mo</div><p>OCR tools when enabled.</p></article>
          <article class="card"><h3>Compliance Mode</h3><div class="sub">$19/mo</div><p>Metadata stripping + audit foundation.</p></article>
        </div>
      </section>

      <section class="pricing-section">
        <h2>Credit Costs</h2>
        <div class="table card">
          <div class="row"><span>Merge</span><span>2 / file</span></div>
          <div class="row"><span>Split</span><span>3 / 50 pages</span></div>
          <div class="row"><span>Compress (basic)</span><span>3 / file</span></div>
          <div class="row"><span>Compress (advanced)</span><span>6 / file</span></div>
          <div class="row"><span>Rotate / Reorder</span><span>1 / file</span></div>
          <div class="row"><span>Watermark</span><span>2 / file</span></div>
          <div class="row"><span>Flatten</span><span>3 / file</span></div>
          <div class="row"><span>Sign</span><span>5 / file</span></div>
          <div class="row"><span>OCR</span><span>10 / file</span></div>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}
