import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export default function Editor() {
  return `
    ${Header()}
    <main class="page editor-page">
      <h1>Editor</h1>
      <div class="editor-shell" data-state="empty">
        <div class="editor-status" id="editor-status">Drop a PDF to begin.</div>

        <div class="card editor-auth" id="editor-auth">
          <p>Sign in to upload and manage documents.</p>
          <a class="primary" href="/login" data-link>Sign In</a>
        </div>

        <div class="card editor-dropzone" id="editor-dropzone">
          <p>Drag a PDF here or click to upload.</p>
          <input type="file" id="editor-file" accept="application/pdf" />
        </div>

        <div class="card editor-progress" id="editor-progress">
          <p>Uploading...</p>
          <div class="progress-bar">
            <div class="progress-fill" id="editor-progress-fill"></div>
          </div>
        </div>

        <div class="card editor-document" id="editor-document">
          <p id="editor-filename">Document loaded.</p>
          <p class="muted">Status: <span id="editor-doc-status">ready</span></p>
        </div>

        <div class="card editor-preview" id="editor-preview-card">
          <div class="editor-preview-header">
            <div>
              <p class="muted">Preview</p>
              <p class="editor-preview-meta" id="editor-preview-meta">No PDF loaded.</p>
            </div>
            <button class="ghost" id="editor-export" type="button">Export</button>
          </div>
          <iframe class="editor-preview-frame" id="editor-preview-frame" title="PDF preview"></iframe>
        </div>

        <div class="editor-tooling">
          <div class="editor-tools" id="editor-tools">
            <div class="editor-tools-header">
              <div>
                <h2>Tool system</h2>
                <p class="muted">Run real PDF operations and export the result.</p>
              </div>
              <div class="editor-tools-badges" id="editor-tools-badges"></div>
            </div>
            <div class="editor-tools-grid" id="editor-tools-grid"></div>
          </div>
          <aside class="editor-tool-panel" id="editor-tool-panel" aria-live="polite">
            <div class="editor-tool-panel-header">
              <div>
                <p class="tool-panel-kicker">Tool detail</p>
                <h3 id="tool-panel-title">Select a tool</h3>
                <p class="muted" id="tool-panel-desc">Click any tool to see what it does.</p>
              </div>
              <button class="ghost tool-panel-close" id="tool-panel-close" type="button">Close</button>
            </div>
            <div class="editor-tool-panel-meta">
              <span class="tool-chip" id="tool-panel-group">Core</span>
              <span class="tool-chip tool-chip-status" id="tool-panel-status">Standby</span>
              <span class="tool-chip" id="tool-panel-credits">Credits: —</span>
            </div>
            <div class="editor-tool-panel-state" id="tool-panel-state">Pick a tool to preview its readiness.</div>
            <div class="editor-tool-panel-actions">
              <button class="primary" id="tool-panel-action" type="button" disabled>Run tool</button>
            </div>
          </aside>
        </div>

        <div class="card editor-history" id="editor-history">
          <p>No operations yet.</p>
        </div>
      </div>
    </main>
    ${Footer()}
  `;
}

export function mountEditor() {
  const status = document.getElementById('editor-status');
  const shell = document.querySelector('.editor-shell');
  const authBlock = document.getElementById('editor-auth');
  const dropzone = document.getElementById('editor-dropzone');
  const fileInput = document.getElementById('editor-file');
  const progress = document.getElementById('editor-progress');
  const progressFill = document.getElementById('editor-progress-fill');
  const docStatus = document.getElementById('editor-doc-status');
  const filename = document.getElementById('editor-filename');
  const toolsGrid = document.getElementById('editor-tools-grid');
  const toolsBadges = document.getElementById('editor-tools-badges');
  const history = document.getElementById('editor-history');
  const previewCard = document.getElementById('editor-preview-card');
  const previewFrame = document.getElementById('editor-preview-frame');
  const previewMeta = document.getElementById('editor-preview-meta');
  const exportButton = document.getElementById('editor-export');
  const toolPanel = document.getElementById('editor-tool-panel');
  const toolPanelTitle = document.getElementById('tool-panel-title');
  const toolPanelDesc = document.getElementById('tool-panel-desc');
  const toolPanelGroup = document.getElementById('tool-panel-group');
  const toolPanelStatus = document.getElementById('tool-panel-status');
  const toolPanelCredits = document.getElementById('tool-panel-credits');
  const toolPanelState = document.getElementById('tool-panel-state');
  const toolPanelAction = document.getElementById('tool-panel-action');
  const toolPanelClose = document.getElementById('tool-panel-close');
  const mergeInput = document.createElement('input');
  mergeInput.type = 'file';
  mergeInput.accept = 'application/pdf';
  mergeInput.multiple = true;

  let currentUser = null;
  let currentDocId = null;
  let isInternalUser = false;
  let selectedToolId = null;
  let currentStoragePath = null;
  let currentDownloadUrl = null;

  const INTERNAL_EMAILS = ['hdmila@icloud.com'];
  const TOOL_GROUPS = [
    {
      id: 'core',
      label: 'Core',
      description: 'Everyday PDF fundamentals.',
      tools: [
        { id: 'upload_pdf', label: 'Upload PDF', description: 'Bring in a PDF to start working.', creditCost: 0, status: 'available' },
        { id: 'merge_documents', label: 'Merge PDFs', description: 'Combine multiple PDFs into one file.', creditCost: 1, unit: 'document', status: 'available' },
        { id: 'split_pages', label: 'Split PDF', description: 'Extract selected pages into a new PDF.', creditCost: 1, unit: 'page', status: 'available' },
        { id: 'export_pdf', label: 'Export PDF', description: 'Download the latest version instantly.', creditCost: 0, status: 'available' }
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      description: 'Precision edits that keep layout intact.',
      tools: [
        { id: 'rotate_pages', label: 'Rotate pages', description: 'Rotate selected pages by 90°.', creditCost: 1, unit: 'page', status: 'available' },
        { id: 'delete_pages', label: 'Delete pages', description: 'Remove pages from the document.', creditCost: 1, unit: 'page', status: 'available' }
      ]
    },
    {
      id: 'sign',
      label: 'Sign & Secure',
      description: 'Signatures, access, and protections.',
      tools: [
        { id: 'watermark', label: 'Add watermark', description: 'Stamp documents with identifiers.', creditCost: 1, unit: 'document', status: 'available' }
      ]
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'High-end automation and cleanup.',
      tools: [
        { id: 'normalize_pdf', label: 'Normalize PDF', description: 'Rebuild the PDF for consistent structure.', creditCost: 1, unit: 'document', status: 'available' }
      ]
    }
  ];
  const TOOL_INDEX = new Map(
    TOOL_GROUPS.flatMap((group) =>
      group.tools.map((tool) => [tool.id, { ...tool, groupId: group.id, groupLabel: group.label }])
    )
  );

  function setState(state, message) {
    shell.dataset.state = state;
    if (message) status.textContent = message;
  }

  function renderToolBadges() {
    if (!toolsBadges) return;
    if (isInternalUser) {
      toolsBadges.innerHTML = `
        <span class="tool-badge">Internal access</span>
        <span class="tool-badge">Credits unlocked</span>
      `;
      return;
    }
    toolsBadges.innerHTML = `<span class="tool-badge">All tools visible</span>`;
  }

  function renderTools() {
    if (!toolsGrid) return;
    toolsGrid.innerHTML = TOOL_GROUPS.map((group) => `
      <section class="tool-group" data-group="${group.id}">
        <div class="tool-group-header">
          <div>
            <h3>${group.label}</h3>
            <p class="muted">${group.description}</p>
          </div>
        </div>
        <div class="tool-group-grid">
          ${group.tools.map((tool) => `
            <button class="tool-button" type="button" data-tool-id="${tool.id}">
              <span class="tool-button-label">${tool.label}</span>
              <span class="tool-button-meta">Ready</span>
            </button>
          `).join('')}
        </div>
      </section>
    `).join('');

    toolsGrid.querySelectorAll('[data-tool-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const toolId = button.dataset.toolId;
        const tool = TOOL_INDEX.get(toolId);
        if (!tool) return;
        selectedToolId = toolId;
        toolsGrid.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('is-selected'));
        button.classList.add('is-selected');
        openToolPanel(tool);
      });
    });
  }

  function openToolPanel(tool) {
    toolPanelTitle.textContent = tool.label;
    toolPanelDesc.textContent = tool.description;
    toolPanelGroup.textContent = tool.groupLabel;
    toolPanelStatus.textContent = 'Ready';
    toolPanelStatus.classList.add('is-ready');
    toolPanelStatus.classList.remove('is-coming');
    if (isInternalUser) {
      toolPanelCredits.textContent = 'Credits: Unlimited';
    } else if (tool.creditCost > 0) {
      toolPanelCredits.textContent = `Credits: ${tool.creditCost}${tool.unit ? ` / ${tool.unit}` : ''}`;
    } else {
      toolPanelCredits.textContent = 'Credits: Free';
    }

    let stateMessage = 'Pick a tool to preview its readiness.';
    let actionLabel = 'Run tool';
    let actionEnabled = false;

    if (tool.id === 'upload_pdf') {
      stateMessage = currentUser ? 'Ready to upload a new PDF.' : 'Sign in to upload a PDF.';
      actionLabel = currentUser ? 'Upload PDF' : 'Sign in required';
      actionEnabled = !!currentUser;
    } else if (tool.id === 'export_pdf') {
      stateMessage = currentDocId ? 'Ready to download the latest PDF.' : 'Upload a PDF to export.';
      actionLabel = 'Export PDF';
      actionEnabled = !!currentDocId;
    } else if (!currentDocId) {
      stateMessage = 'Upload a PDF to run this tool.';
      actionLabel = 'Upload required';
    } else {
      stateMessage = 'Ready to run on your current document.';
      actionLabel = 'Run tool';
      actionEnabled = true;
    }

    toolPanelState.textContent = stateMessage;
    toolPanelAction.textContent = actionLabel;
    toolPanelAction.disabled = !actionEnabled;
  }

  toolPanelClose.addEventListener('click', () => {
    selectedToolId = null;
    toolsGrid.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('is-selected'));
    toolPanelTitle.textContent = 'Select a tool';
    toolPanelDesc.textContent = 'Click any tool to see what it does.';
    toolPanelGroup.textContent = 'Core';
    toolPanelStatus.textContent = 'Standby';
    toolPanelStatus.classList.remove('is-ready', 'is-coming');
    toolPanelCredits.textContent = 'Credits: —';
    toolPanelState.textContent = 'Pick a tool to preview its readiness.';
    toolPanelAction.textContent = 'Run tool';
    toolPanelAction.disabled = true;
  });

  toolPanelAction.addEventListener('click', async () => {
    const toolId = selectedToolId;
    const tool = TOOL_INDEX.get(toolId);
    if (!tool) return;
    if (tool.id === 'upload_pdf') {
      if (!currentUser) {
        setState('empty', 'Sign in to upload a PDF.');
        return;
      }
      fileInput.click();
      return;
    }
    if (tool.id === 'export_pdf') {
      await handleExport();
      return;
    }
    if (!currentDocId) {
      setState('empty', 'Upload a PDF to run this tool.');
      return;
    }

    await runToolOperation(tool);
  });

  import('../firebase.js').then(({ auth, onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      isInternalUser = !!user && INTERNAL_EMAILS.includes(user.email?.toLowerCase());
      renderToolBadges();
      if (selectedToolId) {
        const tool = TOOL_INDEX.get(selectedToolId);
        if (tool) openToolPanel(tool);
      }
      if (!user) {
        authBlock.style.display = 'block';
        dropzone.style.display = 'none';
        exportButton.disabled = true;
        setState('empty', 'Sign in to upload a PDF. Tools are ready.');
        return;
      }
      authBlock.style.display = 'none';
      dropzone.style.display = 'block';
      exportButton.disabled = !currentDocId;
      setState('empty', 'Drop a PDF to begin. Tools are ready.');
    });
  });

  function setPreviewMeta(metaText) {
    previewMeta.textContent = metaText;
  }

  async function getPdfLib() {
    return await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
  }

  async function fetchPdfBytes(storagePath) {
    const firebase = await import('../firebase.js');
    const storageRef = firebase.ref(firebase.storage, storagePath);
    const url = await firebase.getDownloadURL(storageRef);
    const response = await fetch(url);
    return { url, bytes: new Uint8Array(await response.arrayBuffer()) };
  }

  async function uploadPdfBytes(bytes, path) {
    const firebase = await import('../firebase.js');
    const storageRef = firebase.ref(firebase.storage, path);
    const uploadTask = firebase.uploadBytesResumable(storageRef, bytes, { contentType: 'application/pdf' });
    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed', () => {}, reject, resolve);
    });
    return path;
  }

  async function refreshPreview(storagePath, label) {
    const { url } = await fetchPdfBytes(storagePath);
    previewFrame.src = url;
    currentDownloadUrl = url;
    setPreviewMeta(label);
  }

  function parsePageSelection(input, totalPages) {
    if (!input || !input.trim()) {
      return Array.from({ length: totalPages }, (_, index) => index);
    }
    const pages = new Set();
    input.split(',').forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((value) => parseInt(value.trim(), 10));
        if (Number.isNaN(start) || Number.isNaN(end)) return;
        const safeStart = Math.max(1, Math.min(start, totalPages));
        const safeEnd = Math.max(1, Math.min(end, totalPages));
        for (let page = Math.min(safeStart, safeEnd); page <= Math.max(safeStart, safeEnd); page += 1) {
          pages.add(page - 1);
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
          pages.add(page - 1);
        }
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  }

  async function updateDocumentWorking(path, pageCount) {
    const { updateDocumentRecord, logOperation } = await import('../engine/documents.js');
    await updateDocumentRecord(currentDocId, {
      storagePathWorking: path,
      pageCount,
      status: 'ready'
    });
    await logOperation(currentDocId, selectedToolId || 'operation');
  }

  async function runToolOperation(tool) {
    setState('running_operation', 'Running operation...');
    const { PDFDocument, degrees, rgb } = await getPdfLib();
    const { bytes } = await fetchPdfBytes(currentStoragePath);
    const pdfDoc = await PDFDocument.load(bytes);
    let resultDoc = pdfDoc;
    let operationCancelled = false;

    if (tool.id === 'merge_documents') {
      mergeInput.click();
      await new Promise((resolve) => {
        mergeInput.onchange = async () => {
          const files = Array.from(mergeInput.files || []).filter((file) => file.type === 'application/pdf');
          mergeInput.value = '';
          if (!files.length) {
            setState('ready', 'Merge cancelled.');
            operationCancelled = true;
            resolve();
            return;
          }
          const mergedDoc = await PDFDocument.create();
          const basePages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
          basePages.forEach((page) => mergedDoc.addPage(page));
          for (const file of files) {
            const buffer = await file.arrayBuffer();
            const incomingDoc = await PDFDocument.load(buffer);
            const incomingPages = await mergedDoc.copyPages(incomingDoc, incomingDoc.getPageIndices());
            incomingPages.forEach((page) => mergedDoc.addPage(page));
          }
          resultDoc = mergedDoc;
          resolve();
        };
      });
      if (operationCancelled) {
        return;
      }
    }

    if (tool.id === 'split_pages') {
      const pageCount = pdfDoc.getPageCount();
      const selection = prompt(`Pages to extract (1-${pageCount}, ex: 1-2,4):`, '1');
      if (!selection) {
        setState('ready', 'Split cancelled.');
        return;
      }
      const indices = parsePageSelection(selection, pageCount);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(pdfDoc, indices);
      pages.forEach((page) => newDoc.addPage(page));
      resultDoc = newDoc;
    }

    if (tool.id === 'rotate_pages') {
      const pageCount = pdfDoc.getPageCount();
      const degreesInput = prompt('Rotate by degrees (90, 180, 270):', '90');
      if (!degreesInput) {
        setState('ready', 'Rotate cancelled.');
        return;
      }
      const rotation = parseInt(degreesInput, 10);
      if (![90, 180, 270].includes(rotation)) {
        setState('ready', 'Rotate cancelled: invalid degrees.');
        return;
      }
      const selection = prompt(`Pages to rotate (1-${pageCount}, blank for all):`, '');
      const indices = parsePageSelection(selection, pageCount);
      indices.forEach((index) => {
        const page = pdfDoc.getPage(index);
        page.setRotation(degrees(rotation));
      });
    }

    if (tool.id === 'delete_pages') {
      const pageCount = pdfDoc.getPageCount();
      const selection = prompt(`Pages to delete (1-${pageCount}, ex: 2,4-5):`, '');
      if (!selection) {
        setState('ready', 'Delete cancelled.');
        return;
      }
      const indices = parsePageSelection(selection, pageCount);
      if (!indices.length) {
        setState('ready', 'Delete cancelled.');
        return;
      }
      if (indices.length >= pageCount) {
        setState('ready', 'Delete cancelled: cannot remove all pages.');
        return;
      }
      indices.reverse().forEach((index) => {
        pdfDoc.removePage(index);
      });
    }

    if (tool.id === 'watermark') {
      const text = prompt('Watermark text:', 'CONFIDENTIAL');
      if (!text) {
        setState('ready', 'Watermark cancelled.');
        return;
      }
      pdfDoc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width * 0.2,
          y: height * 0.5,
          size: Math.min(width, height) / 12,
          color: rgb(0.8, 0.1, 0.1),
          opacity: 0.3,
          rotate: degrees(-30)
        });
      });
    }

    if (tool.id === 'normalize_pdf') {
      resultDoc = pdfDoc;
    }

    const outputBytes = await resultDoc.save();
    const outputPath = `uploads/users/${currentUser.uid}/working/${currentDocId}/${tool.id}/${Date.now()}.pdf`;
    await uploadPdfBytes(outputBytes, outputPath);
    currentStoragePath = outputPath;
    const pageCount = resultDoc.getPageCount();
    await updateDocumentWorking(outputPath, pageCount);
    await refreshPreview(outputPath, `${pageCount} page${pageCount === 1 ? '' : 's'}`);
    history.innerHTML = `<p>Last operation: ${tool.label}</p>`;
    setState('ready', 'Operation complete.');
  }

  async function handleExport() {
    if (!currentDocId || !currentStoragePath) {
      setState('empty', 'Upload a PDF to export.');
      return;
    }
    const { bytes } = await fetchPdfBytes(currentStoragePath);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.textContent.replace('Document: ', '') || 'justapdf-export.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function handleFiles(files) {
    if (!currentUser) {
      setState('empty', 'Sign in to upload a PDF.');
      return;
    }
    const file = files[0];
    if (!file) return;
    const docId = crypto.randomUUID();
    currentDocId = docId;
    setState('uploading', 'Uploading PDF...');
    progressFill.style.width = '0%';

    Promise.all([
      import('../firebase.js'),
      import('../engine/documents.js'),
      import('../operations.js')
    ]).then(async ([firebase, documents, operations]) => {
      const path = `uploads/users/${currentUser.uid}/original/${docId}/${file.name}`;
      const storageRef = firebase.ref(firebase.storage, path);
      const uploadTask = firebase.uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progressFill.style.width = `${percent}%`;
      }, (error) => {
        setState('empty', error.message || 'Upload failed.');
      }, async () => {
        const { PDFDocument } = await getPdfLib();
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer);
        const pageCount = doc.getPageCount();
        await documents.createDocumentRecord({
          id: docId,
          ownerType: 'user',
          ownerId: currentUser.uid,
          filename: file.name,
          storagePathOriginal: path,
          availableOperations: operations.OPERATIONS.map((op) => op.id)
        });
        await documents.updateDocumentRecord(docId, {
          storagePathWorking: path,
          status: 'ready',
          pageCount
        });
        filename.textContent = `Document: ${file.name}`;
        docStatus.textContent = 'ready';
        currentStoragePath = path;
        await refreshPreview(path, `${pageCount} page${pageCount === 1 ? '' : 's'}`);
        exportButton.disabled = false;
        setState('ready', 'Document ready.');
      });
    });
  }

  renderToolBadges();
  renderTools();

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => handleFiles(event.target.files));
  exportButton.addEventListener('click', handleExport);

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('is-dragging');
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
    handleFiles(event.dataTransfer.files);
  });
}
