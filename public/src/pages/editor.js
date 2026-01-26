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

        <div class="editor-tools" id="editor-tools"></div>

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
  const tools = document.getElementById('editor-tools');
  const history = document.getElementById('editor-history');

  let currentUser = null;
  let currentDocId = null;

  function setState(state, message) {
    shell.dataset.state = state;
    if (message) status.textContent = message;
  }

  import('../firebase.js').then(({ auth, onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (!user) {
        authBlock.style.display = 'block';
        dropzone.style.display = 'none';
        setState('empty', 'Sign in to upload a PDF.');
        return;
      }
      authBlock.style.display = 'none';
      dropzone.style.display = 'block';
      setState('empty', 'Drop a PDF to begin.');
    });
  });

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
        await documents.createDocumentRecord({
          id: docId,
          ownerType: 'user',
          ownerId: currentUser.uid,
          filename: file.name,
          storagePathOriginal: path,
          availableOperations: operations.OPERATIONS.map((op) => op.id)
        });
        await documents.updateDocumentStatus(docId, 'ready');
        filename.textContent = `Document: ${file.name}`;
        docStatus.textContent = 'ready';
        renderTools(operations.OPERATIONS);
        setState('ready', 'Document ready.');
      });
    });
  }

  function renderTools(operations) {
    tools.innerHTML = operations
      .filter((op) => op.creditCost > 0)
      .map((op) => `<button class="ghost" data-op="${op.id}">${op.label}</button>`)
      .join('');

    tools.querySelectorAll('button[data-op]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!currentDocId) return;
        setState('running_operation', 'Running operation...');
        const { logOperation } = await import('../engine/documents.js');
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await logOperation(currentDocId, button.dataset.op);
        history.innerHTML = `<p>Last operation: ${button.dataset.op}</p>`;
        setState('ready', 'Operation complete.');
      });
    });
  }

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => handleFiles(event.target.files));

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
