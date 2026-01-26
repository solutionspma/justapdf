export default function Footer() {
  return `
    <footer class="app-footer">
      <div>It’s just a PDF. &copy; ${new Date().getFullYear()}</div>
      <div class="footer-links">
        <a href="/pricing" data-link>Pricing</a>
        <a href="/account" data-link>Account</a>
      </div>
    </footer>
  `;
}
