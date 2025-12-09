/**
 * Mod PDF - Document Management System
 * Handles upload, storage, and management of documents using localStorage
 */

class DocumentManager {
    constructor() {
        this.storageKey = 'modpdf_documents';
        this.documents = this.loadDocuments();
    }

    // Load documents from localStorage
    loadDocuments() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading documents:', e);
            return [];
        }
    }

    // Save documents to localStorage
    saveDocuments() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.documents));
        } catch (e) {
            console.error('Error saving documents:', e);
        }
    }

    // Generate unique ID
    generateId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Format file size
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }

    // Determine document type from filename
    getDocumentType(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const types = {
            'pdf': 'PDF',
            'doc': 'DOC',
            'docx': 'DOC',
            'jpg': 'Image',
            'jpeg': 'Image',
            'png': 'Image',
            'contract': 'Contract'
        };
        
        // Check if filename contains contract-related keywords
        const contractKeywords = ['contract', 'agreement', 'nda', 'terms', 'legal'];
        const isContract = contractKeywords.some(keyword => 
            filename.toLowerCase().includes(keyword)
        );
        
        if (isContract) return 'Contract';
        return types[ext] || 'Document';
    }

    // Add a new document
    async addDocument(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const doc = {
                    id: this.generateId(),
                    name: file.name,
                    size: file.size,
                    sizeFormatted: this.formatSize(file.size),
                    type: this.getDocumentType(file.name),
                    mimeType: file.type,
                    createdAt: Date.now(),
                    modifiedAt: Date.now(),
                    signed: false,
                    data: e.target.result // Base64 encoded file data
                };
                
                this.documents.unshift(doc);
                this.saveDocuments();
                resolve(doc);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    // Add multiple documents
    async addDocuments(files) {
        const results = [];
        for (const file of files) {
            try {
                const doc = await this.addDocument(file);
                results.push({ success: true, doc });
            } catch (e) {
                results.push({ success: false, error: e.message, filename: file.name });
            }
        }
        return results;
    }

    // Get all documents
    getAll() {
        return this.documents;
    }

    // Get document by ID
    getById(id) {
        return this.documents.find(d => d.id === id);
    }

    // Filter documents
    filter(type) {
        if (!type || type === 'all') return this.documents;
        
        return this.documents.filter(d => {
            if (type === 'signed') return d.signed;
            if (type === 'pdf') return d.type === 'PDF';
            if (type === 'contract') return d.type === 'Contract';
            return true;
        });
    }

    // Search documents
    search(query) {
        if (!query) return this.documents;
        
        const q = query.toLowerCase();
        return this.documents.filter(d => 
            d.name.toLowerCase().includes(q)
        );
    }

    // Update document
    update(id, updates) {
        const index = this.documents.findIndex(d => d.id === id);
        if (index !== -1) {
            this.documents[index] = { 
                ...this.documents[index], 
                ...updates, 
                modifiedAt: Date.now() 
            };
            this.saveDocuments();
            return this.documents[index];
        }
        return null;
    }

    // Mark document as signed
    markSigned(id) {
        return this.update(id, { signed: true });
    }

    // Delete document
    delete(id) {
        const index = this.documents.findIndex(d => d.id === id);
        if (index !== -1) {
            const doc = this.documents.splice(index, 1)[0];
            this.saveDocuments();
            return doc;
        }
        return null;
    }

    // Download document
    download(id) {
        const doc = this.getById(id);
        if (!doc) return false;
        
        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    }

    // Open document in editor
    openInEditor(id) {
        const doc = this.getById(id);
        if (doc) {
            // Store current document for editor to pick up
            sessionStorage.setItem('modpdf_current_doc', JSON.stringify(doc));
            window.location.href = '/editor.html?doc=' + id;
        }
    }

    // Get storage usage
    getStorageUsage() {
        const used = new Blob([localStorage.getItem(this.storageKey) || '']).size;
        const maxStorage = 5 * 1024 * 1024; // 5MB typical limit
        return {
            used,
            usedFormatted: this.formatSize(used),
            max: maxStorage,
            maxFormatted: this.formatSize(maxStorage),
            percentage: Math.round((used / maxStorage) * 100)
        };
    }
}

// Create global instance
window.documentManager = new DocumentManager();

// UI Helper functions
function renderDocumentCard(doc) {
    const iconSvg = doc.signed 
        ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
    
    const badgeStyle = doc.signed 
        ? 'background: rgba(34, 197, 94, 0.2); color: #22c55e;' 
        : '';
    
    const actionBtn1 = doc.signed
        ? '<button class="doc-action-btn" onclick="viewDocument(\'' + doc.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>View</button>'
        : '<button class="doc-action-btn" onclick="editDocument(\'' + doc.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit</button>';
    
    const actionBtn2 = doc.signed
        ? '<button class="doc-action-btn" onclick="downloadDocument(\'' + doc.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Download</button>'
        : '<button class="doc-action-btn" onclick="shareDocument(\'' + doc.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>Share</button>';

    return `
        <div class="document-card" data-id="${doc.id}">
            <div class="document-preview">
                ${iconSvg}
                <span class="document-type-badge" style="${badgeStyle}">${doc.signed ? 'Signed' : doc.type}</span>
            </div>
            <div class="document-info">
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">
                    <span>${doc.sizeFormatted}</span>
                    <span>${documentManager.formatDate(doc.createdAt)}</span>
                </div>
            </div>
            <div class="document-actions">
                ${actionBtn1}
                ${actionBtn2}
            </div>
        </div>
    `;
}

function renderDocumentRow(doc) {
    const actionBtn = doc.signed ? 'View' : 'Edit';
    
    return `
        <div class="document-row" data-id="${doc.id}">
            <div class="document-row-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="document-row-info">
                <div class="document-row-name">${doc.name}</div>
                <div class="document-row-meta">${doc.sizeFormatted}</div>
            </div>
            <span class="document-row-type">${doc.type}</span>
            <span class="document-row-date">${documentManager.formatDate(doc.createdAt)}</span>
            <div class="document-row-actions">
                <button class="doc-action-btn" onclick="${doc.signed ? 'viewDocument' : 'editDocument'}('${doc.id}')">${actionBtn}</button>
                <button class="doc-action-btn" onclick="shareDocument('${doc.id}')">Share</button>
            </div>
        </div>
    `;
}

function renderDocuments(docs, view = 'grid') {
    const gridContainer = document.getElementById('documentsGrid');
    const listContainer = document.getElementById('documentsList');
    
    if (!docs || docs.length === 0) {
        const emptyState = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <svg width="64" height="64" fill="none" stroke="#444" viewBox="0 0 24 24" style="margin-bottom: 16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <h3 style="font-size: 18px; margin-bottom: 8px;">No documents yet</h3>
                <p style="color: #666; margin-bottom: 20px;">Upload your first document to get started</p>
                <button class="btn btn-primary" onclick="openUploadModal()">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    Upload Document
                </button>
            </div>
        `;
        
        if (gridContainer) gridContainer.innerHTML = emptyState;
        if (listContainer) listContainer.innerHTML = emptyState;
        return;
    }
    
    if (gridContainer) {
        gridContainer.innerHTML = docs.map(doc => renderDocumentCard(doc)).join('');
    }
    
    if (listContainer) {
        listContainer.innerHTML = docs.map(doc => renderDocumentRow(doc)).join('');
    }
}

// Document actions
function editDocument(id) {
    documentManager.openInEditor(id);
}

function viewDocument(id) {
    documentManager.openInEditor(id);
}

function downloadDocument(id) {
    documentManager.download(id);
}

function shareDocument(id) {
    const doc = documentManager.getById(id);
    if (doc) {
        // Create a shareable link (simulated)
        const shareUrl = window.location.origin + '/view/' + id;
        
        if (navigator.share) {
            navigator.share({
                title: doc.name,
                text: `Check out this document: ${doc.name}`,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Share link copied to clipboard!');
            });
        }
    }
}

function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        documentManager.delete(id);
        refreshDocuments();
    }
}

function refreshDocuments() {
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset?.filter || 'all';
    const searchQuery = document.getElementById('searchInput')?.value || '';
    
    let docs = documentManager.filter(currentFilter);
    if (searchQuery) {
        docs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    renderDocuments(docs);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    refreshDocuments();
    
    // Set up search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', refreshDocuments);
    }
    
    // Set up filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            refreshDocuments();
        });
    });
});
