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
        <div class="editor-menubar" id="editor-menubar">
          <button class="menubar-button" type="button" data-menu="file">File</button>
          <button class="menubar-button" type="button" data-menu="edit">Edit</button>
          <button class="menubar-button" type="button" data-menu="view">View</button>
          <button class="menubar-button" type="button" data-menu="insert">Insert</button>
          <button class="menubar-button" type="button" data-menu="tools">Tools</button>
          <button class="menubar-button" type="button" data-menu="help">Help</button>
          <div class="menubar-actions">
            <button class="ghost panel-toggle" id="toggle-left-panel-alt" type="button">Hide tools</button>
            <button class="ghost panel-toggle" id="toggle-right-panel-alt" type="button">Hide details</button>
          </div>
          <div class="menubar-menu" data-menu-panel="file">
            <button type="button" data-action="file-open">Open…</button>
            <button type="button" data-action="file-save">Save</button>
            <button type="button" data-action="file-export">Export</button>
          </div>
          <div class="menubar-menu" data-menu-panel="edit">
            <button type="button" data-action="edit-undo">Undo</button>
            <button type="button" data-action="edit-redo">Redo</button>
          </div>
          <div class="menubar-menu" data-menu-panel="view">
            <button type="button" data-action="view-fit">Fit width</button>
            <button type="button" data-action="view-zoom-in">Zoom in</button>
            <button type="button" data-action="view-zoom-out">Zoom out</button>
          </div>
          <div class="menubar-menu" data-menu-panel="insert">
            <button type="button" data-action="tool-insert_text">Text box</button>
            <button type="button" data-action="tool-insert_image">Image</button>
            <button type="button" data-action="tool-highlight">Highlight</button>
            <button type="button" data-action="tool-draw">Draw</button>
            <button type="button" data-action="tool-comment">Comment</button>
          </div>
          <div class="menubar-menu" data-menu-panel="tools">
            <button type="button" data-action="tool-edit_text">Edit text</button>
            <button type="button" data-action="panel-tools">Toggle tools panel</button>
            <button type="button" data-action="panel-details">Toggle detail panel</button>
          </div>
          <div class="menubar-menu" data-menu-panel="help">
            <button type="button" data-action="help-about">About editor</button>
          </div>
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
              <div class="editor-preview-toolbar">
                <button class="ghost" id="pdf-prev" type="button" aria-label="Previous page">◀</button>
                <div class="page-indicator">
                  <input type="number" id="pdf-page-input" min="1" value="1" aria-label="Page number" />
                  <span class="muted">/ <span id="pdf-page-total">—</span></span>
                </div>
                <button class="ghost" id="pdf-next" type="button" aria-label="Next page">▶</button>
                <select id="pdf-zoom-select" aria-label="Zoom level">
                  <option value="0.75">75%</option>
                  <option value="1" selected>100%</option>
                  <option value="1.25">125%</option>
                  <option value="1.5">150%</option>
                  <option value="2">200%</option>
                </select>
                <button class="ghost" id="pdf-fit-width" type="button">Fit width</button>
                <button class="ghost" id="editor-export" type="button">Export</button>
              </div>
            </div>
            <div class="editor-preview-frame" id="editor-preview-frame" aria-label="PDF preview">
              <div class="pdf-pages" id="pdf-pages"></div>
            </div>
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
            <button class="ghost" id="tool-panel-undo" type="button" disabled>Undo</button>
            <button class="ghost" id="tool-panel-redo" type="button" disabled>Redo</button>
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
  const pdfPages = document.getElementById('pdf-pages');
  const previewMeta = document.getElementById('editor-preview-meta');
  const exportButton = document.getElementById('editor-export');
  const pdfPrev = document.getElementById('pdf-prev');
  const pdfNext = document.getElementById('pdf-next');
  const pdfPageInput = document.getElementById('pdf-page-input');
  const pdfPageTotal = document.getElementById('pdf-page-total');
  const pdfZoomSelect = document.getElementById('pdf-zoom-select');
  const pdfFitWidth = document.getElementById('pdf-fit-width');
  const layout = document.getElementById('editor-shell');
  const leftPanel = document.querySelector('.editor-tools-left');
  const rightPanel = document.querySelector('.editor-tools-right');
  const menubar = document.getElementById('editor-menubar');
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
  const toolPanelUndo = document.getElementById('tool-panel-undo');
  const toolPanelRedo = document.getElementById('tool-panel-redo');
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
  let currentPdfBytes = null;
  let historyStack = [];
  let historyIndex = -1;
  let activeToolId = null;
  let activeSelection = null;
  let pageViewports = [];
  let editTextLimitReason = '';
  let textEditMode = 'overlay';

  function getNativeTextEditRunner() {
    return window?.JUSTAPDF_NATIVE_TEXT_EDIT || null;
  }

  function getOcrTextEditRunner() {
    return window?.JUSTAPDF_OCR_TEXT_EDIT || null;
  }
  let activeTextOverlay = null;
  let pdfDocInstance = null;
  let zoomScale = 1;
  let currentPageIndex = 0;

  const INTERNAL_ADMIN_UID = window.__ENV__?.INTERNAL_ADMIN_UID || '';
  const GROUP_CONFIG = [
    {
      id: 'basics',
      label: 'Basics',
      description: 'Everyday editing essentials.',
      toolIds: ['edit_text', 'insert_text', 'insert_image', 'highlight', 'draw', 'comment']
    },
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
      id: 'edit_text',
      name: 'Edit text',
      description: 'Edit existing text objects in place.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false,
      requiresSelection: true
    },
    {
      id: 'insert_text',
      name: 'Insert text',
      description: 'Add a new text box to the page.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'insert_image',
      name: 'Insert image',
      description: 'Place an image onto the page.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'highlight',
      name: 'Highlight',
      description: 'Highlight selected text.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false,
      requiresSelection: true
    },
    {
      id: 'draw',
      name: 'Draw',
      description: 'Freehand drawing on the page.',
      creditCost: 0,
      requiresUpload: true,
      requiresSecondFile: false
    },
    {
      id: 'comment',
      name: 'Comment',
      description: 'Add a comment pin.',
      creditCost: 0,
      requiresUpload: true,
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
  const CLIENT_ONLY_TOOL_IDS = new Set([
    'edit_text',
    'insert_text',
    'insert_image',
    'highlight',
    'draw',
    'comment'
  ]);
  const CLIENT_EDIT_TOOLS = new Set([
    'edit_text',
    'insert_text',
    'insert_image',
    'highlight',
    'draw',
    'comment'
  ]);
  let toolGroups = [];
  let toolIndex = new Map();
  let operationCatalog = [];

  function setState(state, message) {
    shell.dataset.state = state;
    if (message) status.textContent = message;
  }

  function emitAction(type, payload = {}) {
    window.dispatchEvent(new CustomEvent('editor_action', { detail: { type, ...payload } }));
  }

  function updateUndoRedo() {
    if (toolPanelUndo) {
      toolPanelUndo.disabled = historyIndex <= 0;
    }
    if (toolPanelRedo) {
      toolPanelRedo.disabled = historyIndex >= historyStack.length - 1;
    }
  }

  async function setPdfBytes(bytes, { pushHistory = true } = {}) {
    if (!bytes) return;
    currentPdfBytes = new Uint8Array(bytes);
    if (pushHistory) {
      historyStack = historyStack.slice(0, historyIndex + 1);
      historyStack.push(currentPdfBytes);
      historyIndex = historyStack.length - 1;
    }
    await renderPdf(currentPdfBytes);
    updateUndoRedo();
  }

  async function undoAction() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    currentPdfBytes = historyStack[historyIndex];
    await renderPdf(currentPdfBytes);
    emitAction('action_undo', { toolId: activeToolId });
    updateUndoRedo();
  }

  async function redoAction() {
    if (historyIndex >= historyStack.length - 1) return;
    historyIndex += 1;
    currentPdfBytes = historyStack[historyIndex];
    await renderPdf(currentPdfBytes);
    emitAction('action_commit', { toolId: activeToolId, redo: true });
    updateUndoRedo();
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
    if (currentPdfBytes) {
      renderPdf(currentPdfBytes);
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
    const iconMap = {
      upload_pdf: '⬆️',
      merge_documents: '🧩',
      split_pages: '✂️',
      export_pdf: '⬇️',
      rotate_pages: '↻',
      delete_pages: '🗑️',
      reorder: '⇅',
      watermark: '💧',
      normalize_pdf: '🧹',
      metadata_view: '🔎',
      metadata_edit: '✏️',
      metadata_strip: '🧼',
      encrypt: '🔒',
      decrypt: '🔓',
      permissions: '🛡️',
      edit_text: '✍️',
      insert_text: '🔤',
      insert_image: '🖼️',
      highlight: '🖍️',
      draw: '🖊️',
      comment: '💬'
    };

    toolsGrid.innerHTML = toolGroups.map((group, index) => `
      <section class="tool-group" data-group="${group.id}">
        <div class="tool-group-header">
          <div>
            <h3>${group.label}</h3>
            <p class="muted">${group.description}</p>
          </div>
          <button class="ghost tool-group-toggle" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
            ${index === 0 ? 'Hide' : 'Show'}
          </button>
        </div>
        <div class="tool-group-grid tool-group-grid-compact ${index === 0 ? 'is-open' : ''}">
          ${group.tools.map((tool) => `
            <button class="tool-button" type="button" data-tool-id="${tool.id}" data-requires-upload="${tool.requiresUpload}">
              <span class="tool-icon">${iconMap[tool.id] || '⚙️'}</span>
              <span class="tool-button-label">${tool.name}</span>
              <span class="tool-button-meta">${tool.requiresUpload ? 'Requires PDF' : 'Ready'}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `).join('');

    toolsGrid.querySelectorAll('.tool-group-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('.tool-group');
        const grid = group?.querySelector('.tool-group-grid');
        if (!grid || !toolsGrid) return;
        const isOpen = grid.classList.contains('is-open');
        toolsGrid.querySelectorAll('.tool-group-grid').forEach((pane) => pane.classList.remove('is-open'));
        toolsGrid.querySelectorAll('.tool-group-toggle').forEach((btn) => {
          btn.textContent = 'Show';
          btn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          grid.classList.add('is-open');
          toggle.textContent = 'Hide';
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    toolsGrid.querySelectorAll('[data-tool-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const toolId = button.dataset.toolId;
        const tool = toolIndex.get(toolId);
        if (!tool) return;
        selectedToolId = toolId;
        activeToolId = toolId;
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
      const needsUpload = tool.requiresUpload && !currentDocId;
      const needsSelection = tool.requiresSelection && !activeSelection;
      const disabled = needsUpload;
      button.disabled = disabled;
      button.classList.toggle('is-disabled', disabled);
      const meta = button.querySelector('.tool-button-meta');
      if (meta) {
        if (needsSelection) {
          meta.textContent = 'Select text';
        } else {
          meta.textContent = disabled ? 'Upload required' : 'Ready';
        }
      }
    });
  }

  function openToolPanel(tool) {
    const requiresUpload = tool.requiresUpload && !currentDocId && tool.id !== 'upload_pdf';
    const requiresSelection = tool.requiresSelection && !activeSelection;
    toolPanelTitle.textContent = tool.name;
    toolPanelDesc.textContent = tool.description;
    toolPanelGroup.textContent = tool.groupLabel;
    toolPanelStatus.textContent = requiresUpload ? 'Waiting for PDF' : requiresSelection ? 'Select text' : 'Ready';
    toolPanelStatus.classList.toggle('is-ready', !requiresUpload && !requiresSelection);
    toolPanelStatus.classList.toggle('is-coming', requiresUpload || requiresSelection);
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
    } else if (tool.requiresSelection && !activeSelection) {
      stateMessage = 'Select text to use this tool.';
      actionLabel = 'Select text';
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
    activeToolId = null;
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

  if (toolPanelUndo) {
    toolPanelUndo.addEventListener('click', undoAction);
  }

  if (toolPanelRedo) {
    toolPanelRedo.addEventListener('click', redoAction);
  }

  if (pdfPages) {
    pdfPages.addEventListener('scroll', () => {
      requestAnimationFrame(updateCurrentPageFromScroll);
    });
  }

  if (pdfPrev) {
    pdfPrev.addEventListener('click', () => {
      const next = Math.max(0, currentPageIndex - 1);
      currentPageIndex = next;
      scrollToPage(next);
      updatePreviewControls();
    });
  }

  if (pdfNext) {
    pdfNext.addEventListener('click', () => {
      const total = pdfDocInstance?.numPages || 0;
      const next = Math.min(total - 1, currentPageIndex + 1);
      currentPageIndex = next;
      scrollToPage(next);
      updatePreviewControls();
    });
  }

  if (pdfPageInput) {
    pdfPageInput.addEventListener('change', () => {
      const total = pdfDocInstance?.numPages || 0;
      const value = Math.max(1, Math.min(total, Number(pdfPageInput.value || 1)));
      currentPageIndex = value - 1;
      scrollToPage(currentPageIndex);
      updatePreviewControls();
    });
  }

  if (pdfZoomSelect) {
    pdfZoomSelect.addEventListener('change', () => {
      zoomScale = Number(pdfZoomSelect.value || 1);
      if (currentPdfBytes) {
        renderPdf(currentPdfBytes);
      }
    });
  }

  if (pdfFitWidth) {
    pdfFitWidth.addEventListener('click', () => {
      zoomScale = 1;
      if (pdfZoomSelect) pdfZoomSelect.value = '1';
      if (currentPdfBytes) {
        renderPdf(currentPdfBytes);
      }
    });
  }

  function closeMenus() {
    menubar?.querySelectorAll('.menubar-button.is-open').forEach((btn) => btn.classList.remove('is-open'));
    menubar?.querySelectorAll('.menubar-menu.is-open').forEach((menu) => menu.classList.remove('is-open'));
  }

  function openMenu(menuId, button) {
    closeMenus();
    const menu = menubar?.querySelector(`[data-menu-panel="${menuId}"]`);
    if (!menu || !button) return;
    button.classList.add('is-open');
    menu.classList.add('is-open');
  }

  if (menubar) {
    menubar.addEventListener('click', (event) => {
      const button = event.target.closest('.menubar-button');
      const actionButton = event.target.closest('[data-action]');
      if (button && button.dataset.menu) {
        if (button.classList.contains('is-open')) {
          closeMenus();
        } else {
          openMenu(button.dataset.menu, button);
        }
        return;
      }
      if (!actionButton) return;
      const action = actionButton.dataset.action;
      closeMenus();
      if (action === 'file-open') {
        fileInput?.click();
        return;
      }
      if (action === 'file-save' || action === 'file-export') {
        handleExport();
        return;
      }
      if (action === 'edit-undo') {
        undoAction();
        return;
      }
      if (action === 'edit-redo') {
        redoAction();
        return;
      }
      if (action === 'view-fit') {
        pdfFitWidth?.click();
        return;
      }
      if (action === 'view-zoom-in') {
        zoomScale = Math.min(3, zoomScale + 0.25);
        if (pdfZoomSelect) pdfZoomSelect.value = String(zoomScale);
        if (currentPdfBytes) renderPdf(currentPdfBytes);
        return;
      }
      if (action === 'view-zoom-out') {
        zoomScale = Math.max(0.5, zoomScale - 0.25);
        if (pdfZoomSelect) pdfZoomSelect.value = String(zoomScale);
        if (currentPdfBytes) renderPdf(currentPdfBytes);
        return;
      }
      if (action === 'panel-tools') {
        toggleLeftAlt?.click();
        return;
      }
      if (action === 'panel-details') {
        toggleRightAlt?.click();
        return;
      }
      if (action.startsWith('tool-')) {
        const toolId = action.replace('tool-', '');
        const tool = toolIndex.get(toolId);
        if (!tool) return;
        selectedToolId = toolId;
        activeToolId = toolId;
        toolsGrid?.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('is-selected'));
        const btn = toolsGrid?.querySelector(`[data-tool-id="${toolId}"]`);
        btn?.classList.add('is-selected');
        openToolPanel(tool);
      }
    });

    document.addEventListener('click', (event) => {
      if (!menubar.contains(event.target)) {
        closeMenus();
      }
    });
  }

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
      const existing = new Set(operationCatalog.map((op) => op.id));
      LOCAL_OPERATIONS.filter((op) => CLIENT_ONLY_TOOL_IDS.has(op.id)).forEach((op) => {
        if (!existing.has(op.id)) {
          operationCatalog.push(op);
        }
      });
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
      await refreshPreviewWithUrl(
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

  let pdfjsLib = null;

  async function getPdfJs() {
    if (pdfjsLib) return pdfjsLib;
    pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
    return pdfjsLib;
  }

  async function renderPdf(bytes) {
    if (!pdfPages || !previewFrame) return;
    pdfPages.innerHTML = '';
    pageViewports = [];
    activeSelection = null;
    syncToolAvailability();

    const pdfjs = await getPdfJs();
    const doc = await pdfjs.getDocument({ data: bytes }).promise;
    pdfDocInstance = doc;
    updatePreviewControls();
    const containerWidth = previewFrame.clientWidth || 800;

    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const baseScale = Math.max(0.5, Math.min(2.5, (containerWidth - 24) / unscaledViewport.width));
      const scale = baseScale * zoomScale;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const pageWrap = document.createElement('div');
      pageWrap.className = 'pdf-page';
      pageWrap.dataset.pageIndex = String(i - 1);
      pageWrap.style.position = 'relative';
      pageWrap.style.marginBottom = '16px';

      const overlay = document.createElement('div');
      overlay.className = 'pdf-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';

      pageWrap.appendChild(canvas);
      pageWrap.appendChild(overlay);
      pdfPages.appendChild(pageWrap);

      pageViewports.push({ pageIndex: i - 1, viewport, scale, page, overlay });
      await page.render({ canvasContext: context, viewport }).promise;

      const textContent = await page.getTextContent();
    const textItems = textContent.items
      .filter((item) => item.str && item.transform)
      .map((item) => {
          const tx = pdfjs.Util.transform(viewport.transform, item.transform);
          const x = tx[4];
          const y = tx[5];
          const height = Math.hypot(tx[2], tx[3]);
          const width = item.width * scale;
          return {
            text: item.str,
            x,
            y: y - height,
            width,
            height,
            pageIndex: i - 1
          ,fontName: item.fontName || ''
          ,transform: item.transform
          };
        });
      pageViewports[i - 1].textItems = textItems;

      overlay.addEventListener('click', (event) => {
        const rect = overlay.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        handleCanvasClick(i - 1, x, y, overlay);
      });

      overlay.addEventListener('pointerdown', (event) => {
        handleCanvasPointerDown(event, i - 1, overlay);
      });
    }

    requestAnimationFrame(() => {
      updateCurrentPageFromScroll();
    });
  }

  function handleCanvasClick(pageIndex, x, y, overlay) {
    if (!activeToolId) return;
    if (activeToolId === 'comment') {
      const payload = {
        pageIndex,
        x,
        y,
        text: toolPanelInputs?.querySelector('#tool-input-comment')?.value || ''
      };
      runClientToolAction('comment', payload);
      return;
    }
    if (activeToolId === 'edit_text' || activeToolId === 'highlight') {
      const selection = findTextItemAt(pageIndex, x, y);
      if (!selection && !pageViewports[pageIndex]?.textItems?.length) {
        setState('ready', 'No editable text detected on this page.');
        return;
      }
      if (!selection) {
        setState('ready', 'No text selected.');
        return;
      }
      if (!activeToolId || activeToolId === 'edit_text') {
        const tool = toolIndex.get('edit_text');
        if (tool) {
          selectedToolId = 'edit_text';
          activeToolId = 'edit_text';
          toolsGrid?.querySelectorAll('.tool-button').forEach((btn) => btn.classList.remove('is-selected'));
          const btn = toolsGrid?.querySelector('[data-tool-id="edit_text"]');
          btn?.classList.add('is-selected');
          openToolPanel(tool);
        }
      }
      activeSelection = selection;
      renderSelectionOverlay(overlay, selection);
      updateTextOverlay(selection, '');
      syncToolAvailability();
      if (activeToolId === 'highlight') {
        setState('ready', 'Text selected. Run tool to highlight.');
      } else {
        setState('ready', 'Text selected. Run tool to edit.');
      }
    }
  }

  function findTextItemAt(pageIndex, x, y) {
    const pageInfo = pageViewports[pageIndex];
    if (!pageInfo?.textItems) return null;
    return pageInfo.textItems.find((item) =>
      x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height
    ) || null;
  }

  function renderSelectionOverlay(overlay, selection) {
    pdfPages?.querySelectorAll('.selection-box').forEach((box) => box.remove());
    if (!selection) return;
    const box = document.createElement('div');
    box.className = 'selection-box';
    box.style.position = 'absolute';
    box.style.left = `${selection.x}px`;
    box.style.top = `${selection.y}px`;
    box.style.width = `${selection.width}px`;
    box.style.height = `${selection.height}px`;
    overlay.appendChild(box);
  }

  function updateTextOverlay(selection, text) {
    if (!selection) {
      if (activeTextOverlay) {
        activeTextOverlay.remove();
        activeTextOverlay = null;
      }
      return;
    }
    const overlay = pageViewports[selection.pageIndex]?.overlay;
    if (!overlay) return;
    if (!activeTextOverlay) {
      activeTextOverlay = document.createElement('div');
      activeTextOverlay.className = 'text-overlay-preview';
      overlay.appendChild(activeTextOverlay);
    }
    activeTextOverlay.style.position = 'absolute';
    activeTextOverlay.style.left = `${selection.x}px`;
    activeTextOverlay.style.top = `${selection.y}px`;
    activeTextOverlay.style.width = `${selection.width}px`;
    activeTextOverlay.style.height = `${selection.height}px`;
    activeTextOverlay.textContent = text;
  }

  function handleCanvasPointerDown(event, pageIndex, overlay) {
    if (!activeToolId) return;
    if (activeToolId === 'draw') {
      startFreehandDraw(event, pageIndex, overlay);
      return;
    }
    if (activeToolId === 'insert_text') {
      startTextBoxDrag(event, pageIndex, overlay);
      return;
    }
    if (activeToolId === 'insert_image') {
      startImagePlacement(event, pageIndex, overlay);
    }
  }

  function updatePreviewControls() {
    if (!pdfPageInput || !pdfPageTotal) return;
    const total = pdfDocInstance?.numPages || 0;
    pdfPageTotal.textContent = total ? String(total) : '—';
    pdfPageInput.max = total ? String(total) : '1';
    pdfPageInput.value = total ? String(currentPageIndex + 1) : '1';
    const disabled = !total;
    if (pdfPrev) pdfPrev.disabled = disabled || currentPageIndex <= 0;
    if (pdfNext) pdfNext.disabled = disabled || currentPageIndex >= total - 1;
    if (pdfZoomSelect) pdfZoomSelect.disabled = disabled;
    if (pdfFitWidth) pdfFitWidth.disabled = disabled;
  }

  function scrollToPage(index) {
    const target = pdfPages?.querySelector(`[data-page-index="${index}"]`);
    if (!target || !pdfPages) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateCurrentPageFromScroll() {
    if (!pdfPages) return;
    const pages = Array.from(pdfPages.querySelectorAll('.pdf-page'));
    if (!pages.length) return;
    const containerTop = pdfPages.scrollTop;
    let closestIndex = 0;
    let closestDistance = Infinity;
    pages.forEach((page) => {
      const top = page.offsetTop;
      const distance = Math.abs(top - containerTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = Number(page.dataset.pageIndex || 0);
      }
    });
    if (closestIndex !== currentPageIndex) {
      currentPageIndex = closestIndex;
      updatePreviewControls();
    }
  }

  function toPdfPoint(pageIndex, x, y) {
    const info = pageViewports[pageIndex];
    if (!info) return { x: 0, y: 0 };
    return {
      x: x / info.scale,
      y: info.page.view[3] - y / info.scale
    };
  }

  function startTextBoxDrag(event, pageIndex, overlay) {
    event.preventDefault();
    const start = { x: event.offsetX, y: event.offsetY };
    const box = document.createElement('div');
    box.className = 'text-box-ghost';
    box.style.position = 'absolute';
    box.style.left = `${start.x}px`;
    box.style.top = `${start.y}px`;
    overlay.appendChild(box);

    const onMove = (moveEvent) => {
      const x = Math.min(start.x, moveEvent.offsetX);
      const y = Math.min(start.y, moveEvent.offsetY);
      const width = Math.abs(start.x - moveEvent.offsetX);
      const height = Math.abs(start.y - moveEvent.offsetY);
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.width = `${Math.max(60, width)}px`;
      box.style.height = `${Math.max(24, height)}px`;
    };

    const onUp = () => {
      overlay.removeEventListener('pointermove', onMove);
      overlay.removeEventListener('pointerup', onUp);
      const rect = box.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const x = rect.left - overlayRect.left;
      const y = rect.top - overlayRect.top;
      const width = rect.width;
      const height = rect.height;
      box.remove();
      spawnTextInput(overlay, pageIndex, { x, y, width, height });
    };

    overlay.addEventListener('pointermove', onMove);
    overlay.addEventListener('pointerup', onUp, { once: true });
  }

  function spawnTextInput(overlay, pageIndex, box) {
    const input = document.createElement('textarea');
    input.className = 'text-box-input';
    input.style.position = 'absolute';
    input.style.left = `${box.x}px`;
    input.style.top = `${box.y}px`;
    input.style.width = `${box.width}px`;
    input.style.height = `${box.height}px`;
    overlay.appendChild(input);
    input.focus();

    const commit = async () => {
      const text = input.value.trim();
      input.remove();
      if (!text) return;
      const pdfBox = toPdfBox(pageIndex, box);
      const payload = collectToolPayload({ id: 'insert_text' });
      if (!payload) return;
      payload.box = pdfBox;
      payload.text = text;
      payload.pageIndex = pageIndex;
      await runClientToolAction('insert_text', payload);
    };

    input.addEventListener('blur', commit, { once: true });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        commit();
      }
    });
  }

  function toPdfBox(pageIndex, box) {
    const info = pageViewports[pageIndex];
    const x = box.x / info.scale;
    const yTop = box.y / info.scale;
    const width = box.width / info.scale;
    const height = box.height / info.scale;
    return {
      x,
      y: info.page.view[3] - yTop - height,
      width,
      height
    };
  }

  function startImagePlacement(event, pageIndex, overlay) {
    const payload = collectToolPayload({ id: 'insert_image' });
    if (!payload) return;
    const imageFile = payload.imageFile;
    if (!imageFile) return;
    const ghost = document.createElement('div');
    ghost.className = 'image-ghost';
    ghost.style.position = 'absolute';
    ghost.style.left = `${event.offsetX - 100}px`;
    ghost.style.top = `${event.offsetY - 100}px`;
    ghost.style.width = '200px';
    ghost.style.height = '200px';
    const handle = document.createElement('div');
    handle.className = 'image-resize-handle';
    ghost.appendChild(handle);
    overlay.appendChild(ghost);

    let resizing = false;
    let dragStart = null;
    const aspect = ghost.clientWidth / ghost.clientHeight;

    handle.addEventListener('pointerdown', (resizeEvent) => {
      resizeEvent.stopPropagation();
      resizing = true;
      dragStart = { x: resizeEvent.clientX, y: resizeEvent.clientY };
    });

    const onMove = (moveEvent) => {
      if (resizing && dragStart) {
        const deltaX = moveEvent.clientX - dragStart.x;
        const newWidth = Math.max(80, ghost.clientWidth + deltaX);
        ghost.style.width = `${newWidth}px`;
        ghost.style.height = `${newWidth / aspect}px`;
        dragStart = { x: moveEvent.clientX, y: moveEvent.clientY };
        return;
      }
      ghost.style.left = `${moveEvent.offsetX - ghost.clientWidth / 2}px`;
      ghost.style.top = `${moveEvent.offsetY - ghost.clientHeight / 2}px`;
    };

    const onUp = async () => {
      overlay.removeEventListener('pointermove', onMove);
      overlay.removeEventListener('pointerup', onUp);
      resizing = false;
      const rect = ghost.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const box = {
        x: rect.left - overlayRect.left,
        y: rect.top - overlayRect.top,
        width: rect.width,
        height: rect.height
      };
      ghost.remove();
      payload.box = toPdfBox(pageIndex, box);
      payload.pageIndex = pageIndex;
      await runClientToolAction('insert_image', payload);
    };

    overlay.addEventListener('pointermove', onMove);
    overlay.addEventListener('pointerup', onUp, { once: true });
  }

  function startFreehandDraw(event, pageIndex, overlay) {
    const color = toolPanelInputs?.querySelector('#tool-input-draw-color')?.value || '#ff0000';
    const width = Number(toolPanelInputs?.querySelector('#tool-input-draw-width')?.value || 2);
    const path = [];
    const info = pageViewports[pageIndex];
    if (!info) return;

    const onMove = (moveEvent) => {
      const x = moveEvent.offsetX;
      const y = moveEvent.offsetY;
      path.push({ x, y });
    };

    const onUp = async () => {
      overlay.removeEventListener('pointermove', onMove);
      overlay.removeEventListener('pointerup', onUp);
      if (!path.length) return;
      const rect = calculatePathRect(path);
      const payload = {
        pageIndex,
        path: path.map((point) => toPdfPoint(pageIndex, point.x, point.y)),
        rect: toPdfRectFromPath(rect, info.page.view[3], info.scale),
        color,
        width
      };
      await runClientToolAction('draw', payload);
    };

    overlay.addEventListener('pointermove', onMove);
    overlay.addEventListener('pointerup', onUp, { once: true });
  }

  function calculatePathRect(path) {
    const xs = path.map((p) => p.x);
    const ys = path.map((p) => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  function toPdfRectFromPath(rect, pageHeight, scale) {
    const x1 = rect.x / scale;
    const y1 = pageHeight - (rect.y + rect.height) / scale;
    const x2 = (rect.x + rect.width) / scale;
    const y2 = pageHeight - rect.y / scale;
    return [x1, y1, x2, y2];
  }

  async function fetchPdfBytes(storagePath) {
    const firebase = await import('../firebase.js');
    const storageRef = firebase.ref(firebase.storage, storagePath);
    const url = await firebase.getDownloadURL(storageRef);
    const response = await fetch(url);
    return { url, bytes: new Uint8Array(await response.arrayBuffer()) };
  }

  async function refreshPreview(storagePath, label) {
    const { bytes } = await fetchPdfBytes(storagePath);
    await setPdfBytes(bytes, { pushHistory: true });
    setPreviewMeta(label);
  }

  async function refreshPreviewWithUrl(url, label) {
    const response = await fetch(url);
    const bytes = new Uint8Array(await response.arrayBuffer());
    await setPdfBytes(bytes, { pushHistory: true });
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

    if (CLIENT_EDIT_TOOLS.has(tool.id)) {
      await runClientToolAction(tool.id, payload);
      return;
    }

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
    if (currentPdfBytes) {
      const blob = new Blob([currentPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename.textContent.replace('Document: ', '') || 'justapdf-export.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return;
    }
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
        await setPdfBytes(first.data, { pushHistory: true });
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
        await setPdfBytes(result.data, { pushHistory: true });
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

  async function runClientToolAction(toolId, payload) {
    if (!currentPdfBytes) {
      setState('ready', 'Load a PDF to edit.');
      return;
    }
    emitAction('action_start', { toolId });
    try {
      const { PDFDocument, StandardFonts, rgb, PDFName, PDFNumber, PDFArray, PDFString } = await getPdfLib();
      const pdfDoc = await PDFDocument.load(currentPdfBytes);
      const page = pdfDoc.getPage(payload.pageIndex ?? 0);
      const pageSize = page.getSize();
      const scale = pageViewports[payload.pageIndex ?? 0]?.scale || 1;

      if (toolId === 'edit_text') {
        const selection = payload.selection;
        if (!selection) {
          setState('ready', 'Select text to edit.');
          emitAction('action_commit', { toolId, status: 'blocked' });
          return;
        }
        if (payload.mode === 'native') {
          const runner = getNativeTextEditRunner();
          if (!runner) {
            editTextLimitReason = 'Native edit unavailable. Engine not detected.';
            renderToolInputs({ id: 'edit_text' });
            setState('ready', editTextLimitReason);
            emitAction('action_commit', { toolId, status: 'blocked' });
            return;
          }
          setState('running_operation', 'Running native edit...');
          try {
            const result = await runner({
              bytes: currentPdfBytes,
              selection,
              pageIndex: payload.pageIndex,
              bbox: toPdfBox(payload.pageIndex, selection),
              originalText: selection.text,
              newText: payload.text,
              fontName: selection.fontName,
              font: payload.font,
              size: payload.size,
              color: payload.color
            });
            const nextBytes = result?.bytes || result;
            if (!nextBytes) {
              throw new Error('Native edit failed.');
            }
            await setPdfBytes(nextBytes, { pushHistory: true });
            setState('ready', 'Text updated (native).');
            emitAction('action_commit', { toolId });
          } catch (error) {
            setState('ready', error.message || 'Native edit failed.');
            emitAction('action_commit', { toolId, status: 'failed' });
          }
          return;
        }
        if (payload.mode === 'ocr') {
          const runner = getOcrTextEditRunner();
          if (!runner) {
            editTextLimitReason = 'OCR + rebuild unavailable. Engine not detected.';
            renderToolInputs({ id: 'edit_text' });
            setState('ready', editTextLimitReason);
            emitAction('action_commit', { toolId, status: 'blocked' });
            return;
          }
          setState('running_operation', 'Running OCR + rebuild...');
          try {
            const result = await runner({
              bytes: currentPdfBytes,
              selection,
              pageIndex: payload.pageIndex,
              selectionBox: toPdfBox(payload.pageIndex, selection),
              text: payload.text,
              font: payload.font,
              size: payload.size,
              color: payload.color
            });
            const nextBytes = result?.bytes || result;
            if (!nextBytes) {
              throw new Error('OCR + rebuild failed.');
            }
            await setPdfBytes(nextBytes, { pushHistory: true });
            setState('ready', 'Text updated (OCR + rebuild).');
            emitAction('action_commit', { toolId });
          } catch (error) {
            setState('ready', error.message || 'OCR + rebuild failed.');
            emitAction('action_commit', { toolId, status: 'failed' });
          }
          return;
        }
        const scale = pageViewports[payload.pageIndex]?.scale || 1;
        const rect = toPdfBox(payload.pageIndex, {
          x: selection.x,
          y: selection.y,
          width: selection.width,
          height: selection.height
        });
        const font = pdfDoc.embedStandardFont(StandardFonts[payload.font] || StandardFonts.Helvetica);
        const color = hexToRgb(payload.color || '#000000', rgb);
        page.drawRectangle({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          color: rgb(1, 1, 1),
          opacity: 1
        });
        page.drawText(payload.text, {
          x: rect.x,
          y: rect.y + (rect.height - (payload.size || 12)),
          size: payload.size || Math.max(6, Math.round((selection.height / scale) * 0.85)),
          font,
          color,
          maxWidth: rect.width,
          lineHeight: (payload.size || 12) * 1.2
        });
        activeTextOverlay?.remove();
        activeTextOverlay = null;
        editTextLimitReason = '';
        renderToolInputs({ id: 'edit_text' });
        const updatedBytes = await pdfDoc.save();
        await setPdfBytes(updatedBytes, { pushHistory: true });
        setState('ready', 'Text updated (overlay).');
        emitAction('action_commit', { toolId });
        return;
      }

      if (toolId === 'insert_text') {
        const font = pdfDoc.embedStandardFont(StandardFonts[payload.font] || StandardFonts.Helvetica);
        const color = hexToRgb(payload.color || '#000000', rgb);
        const box = payload.box;
        if (!box) {
          setState('ready', 'Draw a text box on the page.');
          return;
        }
        page.drawText(payload.text || '', {
          x: box.x,
          y: box.y,
          size: payload.size || 12,
          font,
          color,
          maxWidth: box.width,
          lineHeight: (payload.size || 12) * 1.2
        });
      }

      if (toolId === 'insert_image') {
        const box = payload.box;
        if (!box || !payload.imageFile) {
          setState('ready', 'Place the image on the page.');
          return;
        }
        const imageBytes = await payload.imageFile.arrayBuffer();
        const image =
          payload.imageFile.type === 'image/png'
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);
        page.drawImage(image, {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          opacity: payload.opacity ?? 1
        });
      }

      if (toolId === 'highlight') {
        const selection = payload.selection;
        if (!selection) return;
        const rect = toPdfRect(selection, pageSize.height, scale);
        const annot = pdfDoc.context.obj({
          Type: 'Annot',
          Subtype: 'Highlight',
          Rect: pdfDoc.context.obj(rect),
          QuadPoints: [
            rect[0], rect[3],
            rect[2], rect[3],
            rect[0], rect[1],
            rect[2], rect[1]
          ],
          C: hexToRgb(payload.color || '#fff59d'),
          CA: payload.opacity ?? 0.4
        });
        attachAnnotation(page, annot, pdfDoc);
      }

      if (toolId === 'draw') {
        if (!payload.path || !payload.path.length) {
          setState('ready', 'Draw on the page to create a stroke.');
          return;
        }
        const points = payload.path.flatMap((point) => [
          PDFNumber.of(point.x),
          PDFNumber.of(point.y)
        ]);
        const inkList = pdfDoc.context.obj([points]);
        const annot = pdfDoc.context.obj({
          Type: 'Annot',
          Subtype: 'Ink',
          Rect: pdfDoc.context.obj(payload.rect),
          InkList: inkList,
          C: hexToRgb(payload.color || '#ff0000'),
          BS: pdfDoc.context.obj({ W: PDFNumber.of(payload.width || 2) })
        });
        attachAnnotation(page, annot, pdfDoc);
      }

      if (toolId === 'comment') {
        const point = toPdfPoint(payload.pageIndex ?? 0, payload.x, payload.y);
        const rect = [
          PDFNumber.of(point.x),
          PDFNumber.of(point.y),
          PDFNumber.of(point.x + 24),
          PDFNumber.of(point.y + 24)
        ];
        const annot = pdfDoc.context.obj({
          Type: 'Annot',
          Subtype: 'Text',
          Rect: rect,
          Contents: PDFString.of(payload.text || ''),
          T: PDFString.of(window.currentUser?.email || 'User'),
          M: PDFString.of(new Date().toISOString()),
          C: hexToRgb('#ffd54f')
        });
        attachAnnotation(page, annot, pdfDoc);
      }

      const updatedBytes = await pdfDoc.save();
      await setPdfBytes(updatedBytes, { pushHistory: true });
      setState('ready', 'Update ready.');
      emitAction('action_commit', { toolId });
    } catch (error) {
      setState('ready', error.message || 'Edit failed.');
    }
  }

  function hexToRgb(hex, rgbFn) {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;
    if (rgbFn) return rgbFn(r, g, b);
    return [r, g, b];
  }

  function toPdfRect(selection, pageHeight, scale) {
    const x1 = selection.x / scale;
    const y1 = pageHeight - (selection.y + selection.height) / scale;
    const x2 = (selection.x + selection.width) / scale;
    const y2 = pageHeight - selection.y / scale;
    return [x1, y1, x2, y2].map((value) => Math.max(0, value));
  }

  function attachAnnotation(page, annot, pdfDoc) {
    const annots = page.node.Annots();
    if (annots) {
      annots.push(annot);
    } else {
      page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annot]));
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

    if (toolId === 'edit_text') {
      const warning = editTextLimitReason
        ? `
          <div class="tool-input tool-warning">
            <strong>Limited</strong>
            <span>${editTextLimitReason}</span>
          </div>
        `
        : '';
      content = `
        ${warning}
        <label class="tool-input">
          Mode
          <select id="tool-input-edit-mode">
            <option value="overlay">Overlay (default)</option>
            <option value="native">Native (experimental)</option>
            <option value="ocr">OCR + Rebuild</option>
          </select>
        </label>
        <label class="tool-input">
          Font
          <select id="tool-input-edit-font">
            <option value="Helvetica">Helvetica</option>
            <option value="TimesRoman">Times</option>
            <option value="Courier">Courier</option>
          </select>
        </label>
        <label class="tool-input">
          Size
          <input type="number" id="tool-input-edit-size" min="6" max="96" value="12" />
        </label>
        <label class="tool-input">
          Color
          <input type="color" id="tool-input-edit-color" value="#000000" />
        </label>
        <label class="tool-input">
          New text
          <textarea id="tool-input-edit-text" rows="2" placeholder="Edit selected text..."></textarea>
        </label>
        <div class="tool-input tool-note" id="tool-input-edit-mode-note"></div>
      `;
    }

    if (toolId === 'insert_text') {
      content = `
        <label class="tool-input">
          Font
          <select id="tool-input-font">
            <option value="Helvetica">Helvetica</option>
            <option value="TimesRoman">Times</option>
            <option value="Courier">Courier</option>
          </select>
        </label>
        <label class="tool-input">
          Size
          <input type="number" id="tool-input-size" min="6" max="96" value="12" />
        </label>
        <label class="tool-input">
          Color
          <input type="color" id="tool-input-color" value="#000000" />
        </label>
      `;
    }

    if (toolId === 'insert_image') {
      content = `
        <label class="tool-input">
          Image file
          <input type="file" id="tool-input-image-file" accept="image/png,image/jpeg" />
        </label>
        <label class="tool-input">
          Opacity
          <input type="number" id="tool-input-image-opacity" min="0" max="1" step="0.1" value="1" />
        </label>
      `;
    }

    if (toolId === 'highlight') {
      content = `
        <label class="tool-input">
          Color
          <input type="color" id="tool-input-highlight-color" value="#fff59d" />
        </label>
        <label class="tool-input">
          Opacity
          <input type="number" id="tool-input-highlight-opacity" min="0" max="1" step="0.1" value="0.4" />
        </label>
      `;
    }

    if (toolId === 'draw') {
      content = `
        <label class="tool-input">
          Color
          <input type="color" id="tool-input-draw-color" value="#ff0000" />
        </label>
        <label class="tool-input">
          Stroke width
          <input type="number" id="tool-input-draw-width" min="1" max="20" value="2" />
        </label>
      `;
    }

    if (toolId === 'comment') {
      content = `
        <label class="tool-input">
          Comment
          <textarea id="tool-input-comment" rows="3" placeholder="Add a note..."></textarea>
        </label>
      `;
    }

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

    if (toolId === 'edit_text') {
      const modeSelect = toolPanelInputs.querySelector('#tool-input-edit-mode');
      const input = toolPanelInputs.querySelector('#tool-input-edit-text');
      const sizeInput = toolPanelInputs.querySelector('#tool-input-edit-size');
      const modeNote = toolPanelInputs.querySelector('#tool-input-edit-mode-note');
      if (activeSelection && sizeInput) {
        const size = Math.max(6, Math.round((activeSelection.height / (pageViewports[activeSelection.pageIndex]?.scale || 1)) * 0.85));
        sizeInput.value = String(size);
      }
      if (modeSelect) {
        modeSelect.value = textEditMode;
        const updateNote = (mode) => {
          if (!modeNote) return;
          if (mode === 'native') {
            modeNote.textContent = getNativeTextEditRunner()
              ? 'Native edit is experimental. Results depend on the document structure.'
              : 'Native edit is unavailable. Engine not detected.';
          } else if (mode === 'ocr') {
            modeNote.textContent = getOcrTextEditRunner()
              ? 'OCR + rebuild reconstructs the document. Intended for scanned PDFs.'
              : 'OCR + rebuild is unavailable. Engine not detected.';
          } else {
            modeNote.textContent = 'Overlay mode hides original text and draws new text on top.';
          }
        };
        updateNote(textEditMode);
        modeSelect.addEventListener('change', () => {
          textEditMode = modeSelect.value;
          updateNote(textEditMode);
          if (textEditMode !== 'overlay') {
            updateTextOverlay(null, '');
          }
        });
      }
      if (input) {
        input.addEventListener('input', () => {
          if (textEditMode === 'overlay') {
            updateTextOverlay(activeSelection, input.value);
          }
        });
      }
    }

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

    if (toolId === 'edit_text') {
      if (!activeSelection) {
        setState('ready', 'Select text to edit.');
        return null;
      }
      payload.selection = activeSelection;
      payload.pageIndex = activeSelection.pageIndex;
      payload.mode = toolPanelInputs.querySelector('#tool-input-edit-mode')?.value || textEditMode;
      payload.text = toolPanelInputs.querySelector('#tool-input-edit-text')?.value || '';
      if (!payload.text.trim()) {
        setState('ready', 'Enter replacement text.');
        return null;
      }
      payload.font = toolPanelInputs.querySelector('#tool-input-edit-font')?.value || 'Helvetica';
      payload.size = Number(toolPanelInputs.querySelector('#tool-input-edit-size')?.value || 12);
      payload.color = toolPanelInputs.querySelector('#tool-input-edit-color')?.value || '#000000';
      return payload;
    }

    if (toolId === 'insert_text') {
      payload.font = toolPanelInputs.querySelector('#tool-input-font')?.value || 'Helvetica';
      payload.size = Number(toolPanelInputs.querySelector('#tool-input-size')?.value || 12);
      payload.color = toolPanelInputs.querySelector('#tool-input-color')?.value || '#000000';
      return payload;
    }

    if (toolId === 'insert_image') {
      const imageFile = toolPanelInputs.querySelector('#tool-input-image-file')?.files?.[0];
      if (!imageFile) {
        setState('ready', 'Choose an image file.');
        return null;
      }
      payload.imageFile = imageFile;
      payload.opacity = Number(toolPanelInputs.querySelector('#tool-input-image-opacity')?.value || 1);
      return payload;
    }

    if (toolId === 'highlight') {
      if (!activeSelection) {
        setState('ready', 'Select text to highlight.');
        return null;
      }
      payload.selection = activeSelection;
      payload.pageIndex = activeSelection.pageIndex;
      payload.color = toolPanelInputs.querySelector('#tool-input-highlight-color')?.value || '#fff59d';
      payload.opacity = Number(toolPanelInputs.querySelector('#tool-input-highlight-opacity')?.value || 0.4);
      return payload;
    }

    if (toolId === 'draw') {
      payload.color = toolPanelInputs.querySelector('#tool-input-draw-color')?.value || '#ff0000';
      payload.width = Number(toolPanelInputs.querySelector('#tool-input-draw-width')?.value || 2);
      return payload;
    }

    if (toolId === 'comment') {
      payload.text = toolPanelInputs.querySelector('#tool-input-comment')?.value || '';
      return payload;
    }

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
        await setPdfBytes(new Uint8Array(buffer), { pushHistory: true });
        setPreviewMeta(`${pageCount} page${pageCount === 1 ? '' : 's'}`);
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
