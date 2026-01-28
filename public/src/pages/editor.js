import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { apiFetch } from '../api.js';

export default function Editor() {
  return `
    ${Header()}
    <main class="editor-shell editor-page" id="editor-shell" data-state="empty">
      <div id="editor-overlay">Upload a PDF to power the tools.</div>
      <aside class="editor-tools-left">
        <div class="editor-sidebar-header">
          <span class="muted">Tools</span>
          <button class="ghost panel-toggle" id="toggle-left-panel" type="button">Hide</button>
        </div>
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
      </aside>

      <section class="editor-workspace">
        <div class="editor-utility-bar">
          <button class="ghost panel-toggle" id="toggle-left-panel-alt" type="button">Hide tools</button>
          <button class="ghost panel-toggle" id="toggle-right-panel-alt" type="button">Hide details</button>
        </div>
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

        <div class="editor-canvas">
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
        </div>

        <div class="card editor-history" id="editor-history">
          <p>Recent documents will appear here.</p>
        </div>
      </section>

      <aside class="editor-tools-right">
        <div class="editor-sidebar-header">
          <span class="muted">Tool detail</span>
          <button class="ghost panel-toggle" id="toggle-right-panel" type="button">Hide</button>
        </div>
        <div class="editor-tool-panel" id="editor-tool-panel" aria-live="polite">
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
          <div class="editor-tool-panel-inputs" id="tool-panel-inputs"></div>
          <div class="editor-tool-panel-state" id="tool-panel-state">Pick a tool to preview its readiness.</div>
          <div class="editor-tool-panel-actions">
            <button class="primary" id="tool-panel-action" type="button" disabled>Run tool</button>
          </div>
        </div>
      </aside>
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
  const layout = document.getElementById('editor-shell');
  const leftPanel = document.querySelector('.editor-tools-left');
  const rightPanel = document.querySelector('.editor-tools-right');
  const toggleLeft = document.getElementById('toggle-left-panel');
  const toggleRight = document.getElementById('toggle-right-panel');
  const toggleLeftAlt = document.getElementById('toggle-left-panel-alt');
  const toggleRightAlt = document.getElementById('toggle-right-panel-alt');
  const headerToggleLeft = document.getElementById('header-toggle-tools');
  const headerToggleRight = document.getElementById('header-toggle-details');
  const toolPanel = document.getElementById('editor-tool-panel');
  const toolPanelTitle = document.getElementById('tool-panel-title');
  const toolPanelDesc = document.getElementById('tool-panel-desc');
  const toolPanelGroup = document.getElementById('tool-panel-group');
  const toolPanelStatus = document.getElementById('tool-panel-status');
  const toolPanelCredits = document.getElementById('tool-panel-credits');
  const toolPanelState = document.getElementById('tool-panel-state');
  const toolPanelAction = document.getElementById('tool-panel-action');
  const toolPanelClose = document.getElementById('tool-panel-close');
  const toolPanelInputs = document.getElementById('tool-panel-inputs');
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
  let localOutputUrls = [];

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
  const LOCAL_OPERATIONS = [
    {
      id: 'upload_pdf',
      name: 'Upload PDF',
      description: 'Upload a PDF to begin working.',
      creditCost: 0,
      requiresUpload: false,
      requiresSecondFile: false
    },
    {
      id: 'merge_documents',
      name: 'Merge PDFs',
      description: 'Combine multiple PDFs into a single file.',
      creditCost: 2,
      requiresUpload: true,
      requiresSecondFile: true
    },
    {
      id: 'split_pages',
      name: 'Split PDF',
      description: 'Split into smaller PDFs or page ranges.',
      creditCost: 3,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'rotate_pages',
      name: 'Rotate pages',
      description: 'Rotate selected pages by 90, 180, or 270 degrees.',
      creditCost: 1,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'delete_pages',
      name: 'Delete pages',
      description: 'Remove selected pages from the document.',
      creditCost: 1,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'reorder',
      name: 'Reorder pages',
      description: 'Reorder pages into a new sequence.',
      creditCost: 1,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'watermark',
      name: 'Add watermark',
      description: 'Apply a text or image watermark.',
      creditCost: 2,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'normalize_pdf',
      name: 'Normalize PDF',
      description: 'Rebuild the PDF for consistent structure.',
      creditCost: 3,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'metadata_view',
      name: 'View metadata',
      description: 'List metadata stored in the PDF.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'metadata_edit',
      name: 'Edit metadata',
      description: 'Write metadata key/value pairs.',
      creditCost: 1,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'metadata_strip',
      name: 'Strip metadata',
      description: 'Remove metadata keys or strip all.',
      creditCost: 2,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'encrypt',
      name: 'Encrypt PDF',
      description: 'Apply a user and owner password.',
      creditCost: 3,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'decrypt',
      name: 'Decrypt PDF',
      description: 'Remove password protection.',
      creditCost: 3,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'permissions',
      name: 'Set permissions',
      description: 'Restrict printing, copying, or editing.',
      creditCost: 2,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'export_pdf',
      name: 'Export PDF',
      description: 'Download the latest PDF output.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false
    }
  ];
  let toolGroups = [];
  let toolIndex = new Map();
  let operationCatalog = [];

  function setState(state, message) {
    shell.dataset.state = state;
    if (message) status.textContent = message;
  }

  function updatePanelToggle(button, collapsed, label) {
    if (!button) return;
    button.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
    button.textContent = collapsed ? `Show ${label}` : `Hide ${label}`;
  }

  function isOverlayMode() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function setPanelCollapsed(side, collapsed) {
    if (!layout) return;
    layout.classList.toggle(`is-${side}-collapsed`, collapsed);
    if (side === 'left') {
      updatePanelToggle(toggleLeft, collapsed, 'tools');
      updatePanelToggle(toggleLeftAlt, collapsed, 'tools');
    }
    if (side === 'right') {
      updatePanelToggle(toggleRight, collapsed, 'details');
      updatePanelToggle(toggleRightAlt, collapsed, 'details');
    }
  }

  function setPanelActive(side, active) {
    const panel = side === 'left' ? leftPanel : rightPanel;
    if (!panel) return;
    panel.classList.toggle('active', active);
    if (active) {
      const otherPanel = side === 'left' ? rightPanel : leftPanel;
      otherPanel?.classList.remove('active');
    }
    if (side === 'left') {
      updatePanelToggle(toggleLeft, !active, 'tools');
      updatePanelToggle(toggleLeftAlt, !active, 'tools');
      updatePanelToggle(headerToggleLeft, !active, 'tools');
    }
    if (side === 'right') {
      updatePanelToggle(toggleRight, !active, 'details');
      updatePanelToggle(toggleRightAlt, !active, 'details');
      updatePanelToggle(headerToggleRight, !active, 'details');
    }
  }

  if (toggleLeft || toggleLeftAlt || headerToggleLeft) {
    const handler = () => {
      if (isOverlayMode()) {
        const active = leftPanel?.classList.contains('active');
        setPanelActive('left', !active);
        return;
      }
      const collapsed = layout?.classList.contains('is-left-collapsed');
      setPanelCollapsed('left', !collapsed);
    };
    if (toggleLeft) toggleLeft.addEventListener('click', handler);
    if (toggleLeftAlt) toggleLeftAlt.addEventListener('click', handler);
    if (headerToggleLeft) headerToggleLeft.addEventListener('click', handler);
  }

  if (toggleRight || toggleRightAlt || headerToggleRight) {
    const handler = () => {
      if (isOverlayMode()) {
        const active = rightPanel?.classList.contains('active');
        setPanelActive('right', !active);
        return;
      }
      const collapsed = layout?.classList.contains('is-right-collapsed');
      setPanelCollapsed('right', !collapsed);
    };
    if (toggleRight) toggleRight.addEventListener('click', handler);
    if (toggleRightAlt) toggleRightAlt.addEventListener('click', handler);
    if (headerToggleRight) headerToggleRight.addEventListener('click', handler);
  }

  setPanelCollapsed('left', false);
  setPanelCollapsed('right', false);
  setPanelActive('left', false);
  setPanelActive('right', false);

  window.addEventListener('resize', () => {
    if (!isOverlayMode()) {
      leftPanel?.classList.remove('active');
      rightPanel?.classList.remove('active');
    }
  });

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
    renderToolInputs(tool);
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
    if (toolPanelInputs) {
      toolPanelInputs.innerHTML = '';
    }
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
      operationCatalog = LOCAL_OPERATIONS;
      toolGroups = buildToolGroups(operationCatalog);
      refreshToolIndex();
      renderTools();
      renderToolBadges();
      setState('empty', 'Local tools loaded.');
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
    setCurrentDownloadUrl(url);
    setPreviewMeta(label);
  }

  function refreshPreviewWithUrl(url, label) {
    previewFrame.src = url;
    setCurrentDownloadUrl(url);
    setPreviewMeta(label);
  }

  function setCurrentDownloadUrl(url) {
    if (currentDownloadUrl && currentDownloadUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentDownloadUrl);
    }
    currentDownloadUrl = url;
  }

  function resetLocalOutputs() {
    localOutputUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    localOutputUrls = [];
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

    const payload = collectToolPayload(tool);
    if (payload === null) return;
    const ranLocal = await tryRunLocalPdfcpu(tool, payload);
    if (ranLocal) return;

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
    if (currentDownloadUrl && currentDownloadUrl.startsWith('blob:')) {
      const anchor = document.createElement('a');
      anchor.href = currentDownloadUrl;
      anchor.download = filename.textContent.replace('Document: ', '') || 'justapdf-export.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }
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

  async function tryRunLocalPdfcpu(tool, payloadOverrides) {
    const toolMap = {
      merge_documents: 'merge',
      normalize_pdf: 'normalize',
      split_pages: 'split_pages',
      rotate_pages: 'rotate',
      delete_pages: 'delete_pages',
      reorder: 'reorder',
      watermark: 'watermark',
      metadata_view: 'metadata_view',
      metadata_edit: 'metadata_edit',
      metadata_strip: 'metadata_strip',
      encrypt: 'encrypt',
      decrypt: 'decrypt',
      permissions: 'permissions'
    };
    const toolId = toolMap[tool.id];
    if (!toolId) return false;
    if (!currentStoragePath) {
      setState('empty', 'Upload a PDF to run this tool.');
      return true;
    }

    let secondaryFile = null;
    if (tool.requiresSecondFile) {
      secondaryFile = await selectSecondaryFile();
      if (!secondaryFile) {
        setState('ready', 'Operation cancelled.');
        return true;
      }
    }

    setState('running_operation', 'Running locally...');
    try {
      const { runTool } = await import('/tools/runTool.js');
      const { bytes } = await fetchPdfBytes(currentStoragePath);
      const mainFile = new File([bytes], 'document.pdf', { type: 'application/pdf' });

      let payload = { ...payloadOverrides };
      let resolvedToolId = toolId;

      if (toolId === 'merge') {
        payload.files = [mainFile, secondaryFile].filter(Boolean);
      } else {
        payload.input = mainFile;
      }

      if (toolId === 'watermark') {
        resolvedToolId = payload.mode === 'image' ? 'watermark_image' : 'watermark_text';
        if (payload.imageFile) {
          payload.image = payload.imageFile;
        }
      }

      const result = await runTool(resolvedToolId, payload);
      resetLocalOutputs();

      if (result.files && result.files.length) {
        const first = result.files[0];
        const previewFile = new File([first.data], first.name || 'output.pdf', {
          type: first.type || 'application/pdf'
        });
        const previewUrl = URL.createObjectURL(previewFile);
        localOutputUrls.push(previewUrl);
        previewFrame.src = previewUrl;
        setCurrentDownloadUrl(previewUrl);
        setPreviewMeta(`Local split (${result.files.length} files)`);
        history.innerHTML = `
          <div class="doc-list">
            ${result.files.map((file, index) => {
              const blobUrl = URL.createObjectURL(new Blob([file.data], { type: file.type }));
              localOutputUrls.push(blobUrl);
              return `
                <a class="doc-row" href="${blobUrl}" download="${file.name || `split-${index + 1}.pdf`}">
                  <span>${file.name || `Split ${index + 1}`}</span>
                  <span>Download</span>
                </a>
              `;
            }).join('')}
          </div>
        `;
      } else if (result.type === 'text/plain') {
        const text = new TextDecoder().decode(result.data);
        renderMetadataViewer(text, result.name || 'metadata.txt');
        setPreviewMeta('Metadata loaded');
      } else {
        const file = new File([result.data], result.name || 'output.pdf', {
          type: result.type || 'application/pdf'
        });
        const url = URL.createObjectURL(file);
        localOutputUrls.push(url);
        previewFrame.src = url;
        setCurrentDownloadUrl(url);
        setPreviewMeta('Local preview (unsaved)');
        history.innerHTML = `<p>Local ${tool.name} complete.</p>`;
      }

      docStatus.textContent = 'local';
      exportButton.disabled = false;
      setState('ready', `${tool.name} complete (local).`);
      return true;
    } catch (error) {
      setState('ready', error.message || 'Local operation failed.');
      return true;
    }
  }

  function renderMetadataViewer(text, filename) {
    history.innerHTML = `
      <div class="meta-viewer">
        <div class="meta-viewer-header">
          <strong>${filename}</strong>
          <a class="ghost" id="meta-download" download="${filename}">Download</a>
        </div>
        <pre class="meta-viewer-body"></pre>
      </div>
    `;
    const pre = history.querySelector('.meta-viewer-body');
    if (pre) {
      pre.textContent = text;
    }
    const download = history.querySelector('#meta-download');
    if (download) {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      localOutputUrls.push(url);
      download.href = url;
    }
  }

  function renderToolInputs(tool) {
    if (!toolPanelInputs) return;
    const toolId = tool.id;
    let content = '';

    if (toolId === 'split_pages') {
      content = `
        <label class="tool-input">
          Pages per split (optional)
          <input type="number" id="tool-input-span" min="1" placeholder="e.g. 2" />
        </label>
      `;
    }

    if (toolId === 'rotate_pages') {
      content = `
        <label class="tool-input">
          Rotation
          <select id="tool-input-rotation">
            <option value="90">90° clockwise</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
            <option value="-90">90° counter</option>
            <option value="-180">180° counter</option>
            <option value="-270">270° counter</option>
          </select>
        </label>
        <label class="tool-input">
          Pages (optional)
          <input type="text" id="tool-input-pages" placeholder="e.g. 1-3,5" />
        </label>
      `;
    }

    if (toolId === 'delete_pages') {
      content = `
        <label class="tool-input">
          Pages to delete
          <input type="text" id="tool-input-pages" placeholder="e.g. 2-4,7" />
        </label>
      `;
    }

    if (toolId === 'reorder') {
      content = `
        <label class="tool-input">
          New order
          <input type="text" id="tool-input-order" placeholder="e.g. 3,1,2" />
        </label>
      `;
    }

    if (toolId === 'watermark') {
      content = `
        <label class="tool-input">
          Watermark type
          <select id="tool-input-wm-type">
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </label>
        <label class="tool-input">
          Text
          <input type="text" id="tool-input-text" placeholder="CONFIDENTIAL" />
        </label>
        <label class="tool-input">
          Image file
          <input type="file" id="tool-input-image" accept="image/*" />
        </label>
        <label class="tool-input">
          Position
          <select id="tool-input-position">
            <option value="c">Center</option>
            <option value="tl">Top left</option>
            <option value="tc">Top center</option>
            <option value="tr">Top right</option>
            <option value="l">Left</option>
            <option value="r">Right</option>
            <option value="bl">Bottom left</option>
            <option value="bc">Bottom center</option>
            <option value="br">Bottom right</option>
          </select>
        </label>
        <label class="tool-input">
          Opacity (0-1)
          <input type="number" id="tool-input-opacity" min="0" max="1" step="0.1" placeholder="0.3" />
        </label>
        <label class="tool-input">
          Rotation
          <input type="number" id="tool-input-wm-rotation" placeholder="45" />
        </label>
      `;
    }

    toolPanelInputs.innerHTML = content;

    if (toolId === 'watermark') {
      const typeSelect = toolPanelInputs.querySelector('#tool-input-wm-type');
      const textInput = toolPanelInputs.querySelector('#tool-input-text');
      const imageInput = toolPanelInputs.querySelector('#tool-input-image');
      const toggle = () => {
        const isImage = typeSelect.value === 'image';
        if (textInput) textInput.parentElement.hidden = isImage;
        if (imageInput) imageInput.parentElement.hidden = !isImage;
      };
      typeSelect.addEventListener('change', toggle);
      toggle();
    }
  }

  function collectToolPayload(tool) {
    const toolId = tool.id;
    const payload = {
      outputName: `${toolId}-${Date.now()}.pdf`
    };

    if (!toolPanelInputs) return payload;

    if (toolId === 'split_pages') {
      const span = toolPanelInputs.querySelector('#tool-input-span')?.value;
      if (span) payload.span = span;
      return payload;
    }

    if (toolId === 'rotate_pages') {
      const rotation = toolPanelInputs.querySelector('#tool-input-rotation')?.value;
      if (!rotation) {
        setState('ready', 'Choose a rotation.');
        return null;
      }
      payload.deg = rotation;
      const pages = toolPanelInputs.querySelector('#tool-input-pages')?.value;
      if (pages) payload.pages = pages;
      return payload;
    }

    if (toolId === 'delete_pages') {
      const pages = toolPanelInputs.querySelector('#tool-input-pages')?.value;
      if (!pages) {
        setState('ready', 'Enter pages to delete.');
        return null;
      }
      payload.pages = pages;
      return payload;
    }

    if (toolId === 'reorder') {
      const order = toolPanelInputs.querySelector('#tool-input-order')?.value;
      if (!order) {
        setState('ready', 'Enter a new page order.');
        return null;
      }
      payload.order = order;
      return payload;
    }

    if (toolId === 'watermark') {
      const mode = toolPanelInputs.querySelector('#tool-input-wm-type')?.value || 'text';
      payload.mode = mode;
      const position = toolPanelInputs.querySelector('#tool-input-position')?.value || 'c';
      payload.position = position;
      const opacity = toolPanelInputs.querySelector('#tool-input-opacity')?.value;
      if (opacity) payload.opacity = opacity;
      const rotation = toolPanelInputs.querySelector('#tool-input-wm-rotation')?.value;
      if (rotation) payload.rotation = rotation;
      if (mode === 'text') {
        const text = toolPanelInputs.querySelector('#tool-input-text')?.value;
        if (!text) {
          setState('ready', 'Enter watermark text.');
          return null;
        }
        payload.text = text;
      } else {
        const imageFile = toolPanelInputs.querySelector('#tool-input-image')?.files?.[0];
        if (!imageFile) {
          setState('ready', 'Choose an image file.');
          return null;
        }
        payload.imageFile = imageFile;
      }
      return payload;
    }

    return payload;
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
