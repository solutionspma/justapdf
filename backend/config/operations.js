export const OPERATION_CATALOG = [
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
    creditCost: 1,
    requiresUpload: true,
    requiresSecondFile: true
  },
  {
    id: 'split_pages',
    name: 'Split PDF',
    description: 'Extract selected pages into a new PDF.',
    creditCost: 1,
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
    id: 'watermark',
    name: 'Add watermark',
    description: 'Apply a watermark to the document.',
    creditCost: 1,
    requiresUpload: true,
    requiresSecondFile: false
  },
  {
    id: 'normalize_pdf',
    name: 'Normalize PDF',
    description: 'Rebuild the PDF for consistent structure.',
    creditCost: 1,
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
