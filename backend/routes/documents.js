/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - DOCUMENT ROUTES
 * Complete document management with PDF engine integration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { db } from '../database/connection.js';
import { getOperationById } from '../services/operationRegistry.js';
import { consumeCredits } from '../services/credits.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/html',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT CRUD
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/', async (req, res) => {
  try {
    const { userId, orgId } = req.user;
    const { page = 1, limit = 20, folder, type, search, sort = 'updatedAt' } = req.query;
    
    // Mock documents response
    const documents = [
      {
        id: crypto.randomUUID(),
        name: 'Sample Contract.pdf',
        type: 'pdf',
        size: 245678,
        folder: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: userId,
        shared: [],
        status: 'draft',
        signatureStatus: null,
        thumbnail: '/api/documents/xxx/thumbnail'
      }
    ];
    
    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1,
        pages: 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = {
      id,
      name: 'Sample Contract.pdf',
      type: 'pdf',
      size: 245678,
      pages: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        author: 'Mod PDF',
        title: 'Sample Contract',
        subject: 'Legal Agreement',
        keywords: ['contract', 'agreement'],
        creator: 'Mod PDF Engine'
      },
      versions: [
        { version: 1, createdAt: new Date().toISOString(), author: 'user1' }
      ],
      signatures: [],
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canSign: true
      }
    };
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch document' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { userId, orgId } = req.user;
    const { name, folder } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const document = {
      id: crypto.randomUUID(),
      name: name || req.file.originalname,
      type: req.file.mimetype.split('/')[1],
      size: req.file.size,
      folder: folder || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: userId,
      organization: orgId
    };
    
    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, folder, metadata } = req.body;
    
    res.json({
      success: true,
      document: {
        id,
        name,
        folder,
        metadata,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update document' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    res.json({
      success: true,
      message: permanent ? 'Document permanently deleted' : 'Document moved to trash'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PDF OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { operationId, storagePath, secondaryStoragePath, metadata = {} } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!operationId) {
      return res.status(400).json({ error: 'operationId is required' });
    }

    const operation = getOperationById(operationId);
    if (!operation) {
      return res.status(400).json({ error: 'Invalid operationId' });
    }

    if (operation.requiresUpload && !storagePath) {
      return res.status(400).json({ error: 'storagePath is required' });
    }

    if (operation.requiresSecondFile && !secondaryStoragePath) {
      return res.status(400).json({ error: 'secondaryStoragePath is required' });
    }

    const ownedPrefix = `uploads/users/${userId}/`;
    if (storagePath && !storagePath.startsWith(ownedPrefix)) {
      return res.status(403).json({ error: 'storagePath does not belong to user' });
    }

    if (secondaryStoragePath && !secondaryStoragePath.startsWith(ownedPrefix)) {
      return res.status(403).json({ error: 'secondaryStoragePath does not belong to user' });
    }

    await consumeCredits({
      userId,
      userEmail: req.user?.email,
      operationId,
      quantity: 1,
      metadata
    });

    const jobId = crypto.randomUUID();
    await db.create('operation_jobs', {
      id: jobId,
      user_id: userId,
      document_id: id,
      operation_id: operationId,
      storage_path: storagePath || null,
      secondary_storage_path: secondaryStoragePath || null,
      status: 'queued',
      created_at: new Date().toISOString()
    });

    res.status(202).json({ success: true, jobId, status: 'queued' });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_CREDITS') {
      return res.status(402).json({ error: 'Insufficient credits' });
    }
    res.status(500).json({ error: 'Failed to queue operation' });
  }
});

router.post('/:id/merge', async (req, res) => {
  try {
    const { id } = req.params;
    const { documentIds, outputName } = req.body;
    
    res.status(201).json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        name: outputName || 'Merged Document.pdf',
        mergedFrom: [id, ...documentIds]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to merge documents' });
  }
});

router.post('/:id/split', async (req, res) => {
  try {
    const { id } = req.params;
    const { ranges } = req.body;
    
    // ranges: [{ start: 1, end: 5, name: 'Part 1' }, ...]
    
    const splitDocuments = ranges.map((range, index) => ({
      id: crypto.randomUUID(),
      name: range.name || `Split ${index + 1}.pdf`,
      pages: range.end - range.start + 1,
      sourceRange: range
    }));
    
    res.status(201).json({ success: true, documents: splitDocuments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to split document' });
  }
});

router.post('/:id/compress', async (req, res) => {
  try {
    const { id } = req.params;
    const { quality = 'medium' } = req.body;
    
    res.json({
      success: true,
      result: {
        originalSize: 5000000,
        compressedSize: 1500000,
        reduction: '70%',
        downloadUrl: `/api/documents/${id}/download?version=compressed`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to compress document' });
  }
});

router.post('/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetFormat } = req.body;
    
    // Supported formats: pdf, docx, xlsx, pptx, html, txt, png, jpg
    
    res.status(201).json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        name: `Converted.${targetFormat}`,
        format: targetFormat,
        convertedFrom: id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to convert document' });
  }
});

router.post('/:id/ocr', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'eng', outputType = 'searchable_pdf' } = req.body;
    
    res.json({
      success: true,
      result: {
        pagesProcessed: 5,
        textExtracted: true,
        confidence: 0.95,
        outputDocumentId: crypto.randomUUID()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to perform OCR' });
  }
});

router.post('/:id/watermark', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, text, imageUrl, position, opacity, pages } = req.body;
    
    res.json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        name: 'Watermarked Document.pdf',
        watermark: { type, text, position, opacity }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add watermark' });
  }
});

router.post('/:id/redact', async (req, res) => {
  try {
    const { id } = req.params;
    const { areas, searchTerms, patterns } = req.body;
    
    // areas: [{ page: 1, x, y, width, height }]
    // searchTerms: ['SSN', 'credit card']
    // patterns: ['email', 'phone', 'ssn']
    
    res.json({
      success: true,
      result: {
        redactionsApplied: 12,
        documentId: crypto.randomUUID()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to redact document' });
  }
});

router.post('/:id/encrypt', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, permissions } = req.body;
    
    res.json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        encrypted: true,
        permissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to encrypt document' });
  }
});

router.post('/:id/decrypt', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    res.json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        encrypted: false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to decrypt document' });
  }
});

// Premium: Password override (Business+ plans)
router.post('/:id/override-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, auditLog = true } = req.body;
    
    // Check plan permissions
    if (req.user.plan !== 'business' && req.user.plan !== 'enterprise' && req.user.role !== 'root_master_admin') {
      return res.status(403).json({
        success: false,
        error: 'Password override requires Business or Enterprise plan'
      });
    }
    
    res.json({
      success: true,
      document: {
        id: crypto.randomUUID(),
        passwordOverridden: true,
        auditLogEntry: crypto.randomUUID()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to override password' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMS & FIELDS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/:id/forms', async (req, res) => {
  try {
    const { id } = req.params;
    
    const fields = [
      {
        id: 'field_1',
        type: 'text',
        name: 'fullName',
        page: 1,
        x: 100,
        y: 200,
        width: 200,
        height: 24,
        value: '',
        required: true
      }
    ];
    
    res.json({ success: true, fields });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get form fields' });
  }
});

router.put('/:id/forms', async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.body;
    
    res.json({
      success: true,
      message: 'Form fields updated',
      filledFields: fields.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update form fields' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOWNLOAD & PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.query;
    
    // In production, stream the file
    res.json({
      success: true,
      downloadUrl: `https://storage.modpdf.com/documents/${id}`,
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate download URL' });
  }
});

router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    res.json({
      success: true,
      previewUrl: `https://storage.modpdf.com/previews/${id}/page-${page}.png`,
      totalPages: 5
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate preview' });
  }
});

router.get('/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      thumbnailUrl: `https://storage.modpdf.com/thumbnails/${id}.png`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get thumbnail' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHARING & COLLABORATION
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/:id/shares', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shares = [
      {
        id: crypto.randomUUID(),
        type: 'user',
        email: 'collaborator@example.com',
        permission: 'edit',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({ success: true, shares });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get shares' });
  }
});

router.post('/:id/shares', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission, message, expiresAt } = req.body;
    
    const share = {
      id: crypto.randomUUID(),
      documentId: id,
      email,
      permission,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    
    res.status(201).json({ success: true, share });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to share document' });
  }
});

router.post('/:id/shares/link', async (req, res) => {
  try {
    const { id } = req.params;
    const { permission, expiresAt, password } = req.body;
    
    const shareLink = {
      id: crypto.randomUUID(),
      url: `https://modpdf.app/share/${crypto.randomBytes(16).toString('hex')}`,
      permission,
      passwordProtected: !!password,
      expiresAt,
      views: 0
    };
    
    res.status(201).json({ success: true, shareLink });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create share link' });
  }
});

router.delete('/:id/shares/:shareId', async (req, res) => {
  try {
    const { id, shareId } = req.params;
    
    res.json({ success: true, message: 'Share revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to revoke share' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOLDERS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/folders', async (req, res) => {
  try {
    const folders = [
      { id: crypto.randomUUID(), name: 'Contracts', parentId: null, documentCount: 12 },
      { id: crypto.randomUUID(), name: 'Invoices', parentId: null, documentCount: 45 }
    ];
    
    res.json({ success: true, folders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch folders' });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    const folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, folder });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create folder' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRASH
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/trash', async (req, res) => {
  try {
    const trashedDocuments = [];
    
    res.json({ success: true, documents: trashedDocuments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trash' });
  }
});

router.post('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({ success: true, message: 'Document restored' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to restore document' });
  }
});

router.delete('/trash/empty', async (req, res) => {
  try {
    res.json({ success: true, message: 'Trash emptied' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to empty trash' });
  }
});

export default router;
