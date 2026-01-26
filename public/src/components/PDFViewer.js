export default function PDFViewer() {
  return `
    <div class="pdf-viewer">
      <div class="empty-state">
        <img src="/assets/branding/mascot/layered-assets-sheet.png" alt="Just a PDF mascot">
        <p>No PDF loaded yet. It’s just a PDF.</p>
        <button class="primary">Upload PDF</button>
      </div>
    </div>
  `;
}
