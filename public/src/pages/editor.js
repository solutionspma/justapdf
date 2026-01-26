import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Toolbar from '../components/Toolbar.js';
import PDFViewer from '../components/PDFViewer.js';

export default function Editor() {
  return `
    ${Header()}
    <main class="page editor-page">
      <h1>Editor</h1>
      ${Toolbar()}
      ${PDFViewer()}
    </main>
    ${Footer()}
  `;
}
