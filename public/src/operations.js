export const OPERATIONS = [
  { id: 'upload_pdf', label: 'Upload PDF', creditCost: 0, refundable: false, previewable: true, category: 'core' },
  { id: 'view_pages', label: 'View pages', creditCost: 0, refundable: false, previewable: true, category: 'core' },
  { id: 'split_pages', label: 'Split pages', creditCost: 1, refundable: true, previewable: true, category: 'core', unit: 'page' },
  { id: 'merge_documents', label: 'Merge documents', creditCost: 1, refundable: true, previewable: true, category: 'core', unit: 'document' },
  { id: 'download_pdf', label: 'Download PDF', creditCost: 0, refundable: false, previewable: true, category: 'core' }
];
