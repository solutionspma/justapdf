import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { apiFetch } from '../api.js';

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
          <p>Recent documents will appear here.</p>
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
  mergeInput.multiple = false;

  let currentUser = null;
  let currentDocId = null;
  let isInternalUser = false;
  let selectedToolId = null;
  let currentStoragePath = null;
  let currentDownloadUrl = null;
  let authReady = false;

  const INTERNAL_ADMIN_UID = window.__ENV__?.INTERNAL_ADMIN_UID || '';
  const GROUP_CONFIG = [
    {
      id: 'core',
      label: 'Core',
      description: 'Everyday PDF fundamentals.',
      toolIds: ['upload_pdf', 'merge_documents', 'split_pages', 'export_pdf']
    },
    {
      id: 'edit',
      label: 'Edit',
      description: 'Precision edits that keep layout intact.',
      toolIds: ['rotate_pages', 'delete_pages']
    },
    {
      id: 'sign',
      label: 'Sign & Secure',
      description: 'Signatures, access, and protections.',
      toolIds: ['watermark']
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'High-end automation and cleanup.',
      toolIds: ['normalize_pdf']
    }
  ];
  let toolGroups = [];
  let toolIndex = new Map();
  let operationCatalog = [];

  function setState(state, message) {
    shell.dataset.state = state;
    if (message) status.textContent = message;
  }

  function buildToolGroups(operations) {
    const operationsById = new Map(operations.map((operation) => [operation.id, operation]));
    const groups = [];
    const used = new Set();

    GROUP_CONFIG.forEach((group) => {
      const tools = group.toolIds
        .map((id) => operationsById.get(id))
        .filter(Boolean)
        .map((tool) => ({ ...tool, groupId: group.id, groupLabel: group.label }));
      tools.forEach((tool) => used.add(tool.id));
      if (tools.length) {
        groups.push({ ...group, tools });
      }
    });

    const remaining = operations
      .filter((tool) => !used.has(tool.id))
      .map((tool) => ({ ...tool, groupId: 'other', groupLabel: 'Other' }));
    if (remaining.length) {
      groups.push({
        id: 'other',
        label: 'Other',
        description: 'Additional operations.',
        tools: remaining
      });
    }

    return groups;
  }

  function refreshToolIndex() {
    toolIndex = new Map(
      toolGroups.flatMap((group) =>
        group.tools.map((tool) => [tool.id, { ...tool, groupId: group.id, groupLabel: group.label }])
      )
    );
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
    toolsBadges.innerHTML = `<span class="tool-badge">${toolIndex.size} tools loaded</span>`;
  }

  function renderTools() {
    if (!toolsGrid) return;
    toolsGrid.innerHTML = toolGroups.map((group) => `
      <section class="tool-group" data-group="${group.id}">
        <div class="tool-group-header">
          <div>
            <h3>${group.label}</h3>
            <p class="muted">${group.description}</p>
          </div>
        </div>
        <div class="tool-group-grid">
          ${group.tools.map((tool) => `
            <button class="tool-button" type="button" data-tool-id="${tool.id}" data-requires-upload="${tool.requiresUpload}">
              <span class="tool-button-label">${tool.name}</span>
              <span class="tool-button-meta">${tool.requiresUpload ? 'Requires PDF' : 'Ready'}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `).join('');

    toolsGrid.querySelectorAll('[data-tool-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const toolId = button.dataset.toolId;
        const tool = toolIndex.get(toolId);
        if (!tool) return;
        selectedToolId = toolId;
        toolsGrid.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('is-selected'));
        button.classList.add('is-selected');
        openToolPanel(tool);
      });
    });

    syncToolAvailability();
  }

  function syncToolAvailability() {
    if (!toolsGrid) return;
    toolsGrid.querySelectorAll('[data-tool-id]').forEach((button) => {
      const toolId = button.dataset.toolId;
      const tool = toolIndex.get(toolId);
      if (!tool) return;
      const disabled = tool.requiresUpload && !currentDocId;
      button.disabled = disabled;
      button.classList.toggle('is-disabled', disabled);
      const meta = button.querySelector('.tool-button-meta');
      if (meta) {
        meta.textContent = disabled ? 'Upload required' : 'Ready';
      }
    });
  }

  function openToolPanel(tool) {
    const requiresUpload = tool.requiresUpload && !currentDocId && tool.id !== 'upload_pdf';
    toolPanelTitle.textContent = tool.name;
    toolPanelDesc.textContent = tool.description;
    toolPanelGroup.textContent = tool.groupLabel;
    toolPanelStatus.textContent = requiresUpload ? 'Waiting for PDF' : 'Ready';
    toolPanelStatus.classList.toggle('is-ready', !requiresUpload);
    toolPanelStatus.classList.toggle('is-coming', requiresUpload);
    toolPanel.classList.add('is-open');
    if (isInternalUser) {
      toolPanelCredits.textContent = 'Credits: Unlimited';
    } else if (tool.creditCost > 0) {
      toolPanelCredits.textContent = `Credits: ${tool.creditCost}`;
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
    } else if (tool.requiresUpload && !currentDocId) {
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
    toolPanel.classList.remove('is-open');
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
    const tool = toolIndex.get(toolId);
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

  async function loadOperations() {
    try {
      const response = await apiFetch('/registry/operations');
      operationCatalog = response.operations || [];
      toolGroups = buildToolGroups(operationCatalog);
      refreshToolIndex();
      renderTools();
      renderToolBadges();
    } catch (error) {
      if (toolsGrid) {
        toolsGrid.innerHTML = '<p class="muted">Unable to load tools right now.</p>';
      }
      setState('empty', 'Unable to load tools.');
    }
  }

  async function loadUserDocuments(userId) {
    if (!history) return;
    const { listUserDocuments } = await import('../engine/documents.js');
    const documents = await listUserDocuments(userId);
    if (!documents.length) {
      history.innerHTML = '<p>No documents yet. Upload a PDF to get started.</p>';
      return;
    }

    history.innerHTML = `
      <div class="doc-list">
        ${documents.map((doc) => `
          <button class="doc-row" type="button" data-doc-id="${doc.id}">
            <span>${doc.filename || doc.name || 'Untitled PDF'}</span>
            <span>${doc.status || 'ready'}</span>
          </button>
        `).join('')}
      </div>
    `;

    history.querySelectorAll('[data-doc-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const doc = documents.find((item) => item.id === button.dataset.docId);
        if (doc) {
          selectDocument(doc);
        }
      });
    });
  }

  async function selectDocument(doc) {
    currentDocId = doc.id;
    currentStoragePath = doc.storagePathWorking || doc.storagePathOriginal || null;
    const docLabel = doc.filename || doc.name || 'Document';
    filename.textContent = `Document: ${docLabel}`;
    docStatus.textContent = doc.status || 'ready';

    if (doc.storageUrlWorking || doc.storageUrlOriginal) {
      refreshPreviewWithUrl(
        doc.storageUrlWorking || doc.storageUrlOriginal,
        doc.pageCount ? `${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}` : 'PDF loaded'
      );
    } else if (currentStoragePath) {
      await refreshPreview(
        currentStoragePath,
        doc.pageCount ? `${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}` : 'PDF loaded'
      );
    }

    exportButton.disabled = !currentStoragePath;
    syncToolAvailability();
    setState('ready', 'Document loaded.');
  }

  import('../firebase.js').then(({ auth, onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      authReady = true;
      currentUser = user;
      isInternalUser = !!user && INTERNAL_ADMIN_UID && user.uid === INTERNAL_ADMIN_UID;
      renderToolBadges();
      if (selectedToolId) {
        const tool = toolIndex.get(selectedToolId);
        if (tool) openToolPanel(tool);
      }
      if (!user) {
        authBlock.style.display = 'block';
        dropzone.style.display = 'none';
        exportButton.disabled = true;
        setState('empty', 'Sign in to upload a PDF.');
        window.history.replaceState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }
      authBlock.style.display = 'none';
      dropzone.style.display = 'block';
      exportButton.disabled = !currentDocId;
      setState('empty', 'Drop a PDF to begin. Tools are loading.');
      loadOperations().then(() => syncToolAvailability());
      loadUserDocuments(user.uid);
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

  async function refreshPreview(storagePath, label) {
    const { url } = await fetchPdfBytes(storagePath);
    previewFrame.src = url;
    currentDownloadUrl = url;
    setPreviewMeta(label);
  }

  function refreshPreviewWithUrl(url, label) {
    previewFrame.src = url;
    currentDownloadUrl = url;
    setPreviewMeta(label);
  }

  async function markDocumentQueued(operationId) {
    const { updateDocumentRecord, logOperation } = await import('../engine/documents.js');
    await updateDocumentRecord(currentDocId, {
      status: 'queued',
      lastOperation: operationId
    });
    await logOperation(currentDocId, operationId);
  }

  async function selectSecondaryFile() {
    mergeInput.value = '';
    return await new Promise((resolve) => {
      mergeInput.onchange = () => {
        const file = (mergeInput.files || [])[0] || null;
        resolve(file);
      };
      mergeInput.click();
    });
  }

  async function uploadSecondaryFile(file) {
    const firebase = await import('../firebase.js');
    const safeName = file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`;
    const path = `uploads/users/${currentUser.uid}/secondary/${currentDocId}/${Date.now()}-${safeName}`;
    const storageRef = firebase.ref(firebase.storage, path);
    const uploadTask = firebase.uploadBytesResumable(storageRef, file);
    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed', () => {}, reject, resolve);
    });
    return path;
  }

  async function runToolOperation(tool) {
    if (tool.requiresUpload && !currentDocId) {
      setState('empty', 'Upload a PDF to run this tool.');
      return;
    }

    setState('running_operation', 'Queuing operation...');
    let secondaryStoragePath = null;

    if (tool.requiresSecondFile) {
      const file = await selectSecondaryFile();
      if (!file) {
        setState('ready', 'Operation cancelled.');
        return;
      }
      secondaryStoragePath = await uploadSecondaryFile(file);
    }

    try {
      const response = await apiFetch(`/documents/${currentDocId}/execute`, {
        method: 'POST',
        body: JSON.stringify({
          operationId: tool.id,
          storagePath: currentStoragePath,
          secondaryStoragePath
        })
      });

      docStatus.textContent = response.status || 'queued';
      history.innerHTML = `<p>Queued: ${tool.name}</p>`;
      await markDocumentQueued(tool.id);
      setState('ready', `${tool.name} queued.`);
    } catch (error) {
      setState('ready', error.message || 'Failed to queue operation.');
    }
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
    if (!authReady) {
      setState('empty', 'Waiting for authentication...');
      return;
    }
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
      import('../engine/documents.js')
    ]).then(async ([firebase, documents]) => {
      const authedUser = firebase.auth.currentUser;
      if (!authedUser) {
        console.error('Upload blocked: auth.currentUser is null');
        setState('empty', 'Sign in to upload a PDF.');
        return;
      }
      currentUser = authedUser;
      if (!operationCatalog.length) {
        await loadOperations();
      }
      const sanitizedName = file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`;
      const path = `uploads/users/${authedUser.uid}/original/${docId}/${sanitizedName}`;
      const storageRef = firebase.ref(firebase.storage, path);
      const uploadTask = firebase.uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        progressFill.style.width = `${percent}%`;
      }, (error) => {
        console.error('Upload failed:', error);
        setState('empty', error.message || 'Upload failed.');
      }, async () => {
        const { PDFDocument } = await getPdfLib();
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer);
        const pageCount = doc.getPageCount();
        const downloadUrl = await firebase.getDownloadURL(storageRef);
        await documents.createDocumentRecord({
          id: docId,
          ownerType: 'user',
          ownerId: authedUser.uid,
          filename: sanitizedName,
          storagePathOriginal: path,
          availableOperations: operationCatalog.map((op) => op.id)
        });
        await documents.updateDocumentRecord(docId, {
          storagePathWorking: path,
          storageUrlOriginal: downloadUrl,
          storageUrlWorking: downloadUrl,
          status: 'ready',
          pageCount
        });
        filename.textContent = `Document: ${file.name}`;
        docStatus.textContent = 'ready';
        currentStoragePath = path;
        refreshPreviewWithUrl(downloadUrl, `${pageCount} page${pageCount === 1 ? '' : 's'}`);
        exportButton.disabled = false;
        setState('ready', 'Document ready.');
        syncToolAvailability();
        loadUserDocuments(authedUser.uid);
      });
    });
  }

  if (toolsGrid) {
    toolsGrid.innerHTML = '<p class="muted">Loading tools...</p>';
  }
  renderToolBadges();

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
