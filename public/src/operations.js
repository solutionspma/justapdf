export const OPERATIONS = [
  { id: 'upload_pdf', label: 'Upload PDF', creditCost: 0, refundable: false, previewable: true, category: 'core' },
  { id: 'split_pages', label: 'Split pages', creditCost: 1, refundable: true, previewable: true, category: 'core', unit: 'page' },
  { id: 'merge_documents', label: 'Merge documents', creditCost: 1, refundable: true, previewable: true, category: 'core', unit: 'document' },
  { id: 'rotate_pages', label: 'Rotate pages', creditCost: 1, refundable: true, previewable: true, category: 'edit', unit: 'page' },
  { id: 'delete_pages', label: 'Delete pages', creditCost: 1, refundable: true, previewable: true, category: 'edit', unit: 'page' },
  { id: 'watermark', label: 'Add watermark', creditCost: 1, refundable: true, previewable: true, category: 'sign', unit: 'document' },
  { id: 'normalize_pdf', label: 'Normalize PDF', creditCost: 1, refundable: true, previewable: true, category: 'advanced', unit: 'document' },
  { id: 'export_pdf', label: 'Export PDF', creditCost: 0, refundable: false, previewable: true, category: 'core' }
];
