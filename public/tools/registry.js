export const TOOLS = {
  edit_text: { cost: 0, op: "editText", cat: "Basics", requiresSelection: true, disabled: true },
  insert_text: { cost: 0, op: "insertText", cat: "Basics", disabled: true },
  insert_image: { cost: 0, op: "insertImage", cat: "Basics", disabled: true },
  highlight: { cost: 0, op: "highlight", cat: "Basics", requiresSelection: true, disabled: true },
  draw: { cost: 0, op: "draw", cat: "Basics", disabled: true },
  comment: { cost: 0, op: "comment", cat: "Basics", disabled: true },
  merge: { cost: 2, op: "merge", cat: "File" },
  split_pages: { cost: 3, op: "split", cat: "File" },
  split_range: { cost: 3, op: "splitRange", cat: "File", disabled: true },
  extract_pages: { cost: 2, op: "extractPages", cat: "File", disabled: true },

  rotate: { cost: 1, op: "rotate", cat: "Page" },
  reorder: { cost: 1, op: "reorder", cat: "Page" },
  delete_pages: { cost: 1, op: "removePages", cat: "Page" },
  insert_pages: { cost: 2, op: "insertPages", cat: "Page", disabled: true },

  compress_basic: { cost: 3, op: "optimize", cat: "Optimize" },
  compress_strong: { cost: 6, op: "optimizeStrong", cat: "Optimize" },
  optimize_web: { cost: 4, op: "optimizeWeb", cat: "Optimize" },
  normalize: { cost: 3, op: "normalize", cat: "Optimize" },

  watermark_text: { cost: 2, op: "watermarkText", cat: "Mark" },
  watermark_image: { cost: 3, op: "watermarkImage", cat: "Mark" },
  stamp: { cost: 2, op: "stamp", cat: "Mark", disabled: true },

  sign_simple: { cost: 5, op: "sign", cat: "Sign", disabled: true },

  metadata_view: { cost: 0, op: "readMeta", cat: "Metadata" },
  metadata_edit: { cost: 1, op: "writeMeta", cat: "Metadata" },
  metadata_strip: { cost: 2, op: "removeMeta", cat: "Metadata" },

  encrypt: { cost: 3, op: "encrypt", cat: "Security" },
  decrypt: { cost: 3, op: "decrypt", cat: "Security" },
  permissions: { cost: 2, op: "setPermissions", cat: "Security" },

  page_numbers: { cost: 2, op: "addPageNumbers", cat: "Layout", disabled: true },
  headers: { cost: 2, op: "addHeader", cat: "Layout", disabled: true },
  footers: { cost: 2, op: "addFooter", cat: "Layout", disabled: true },

  grayscale: { cost: 2, op: "grayscale", cat: "Color", disabled: true },
  rgb_to_cmyk: { cost: 3, op: "convertColor", cat: "Color", disabled: true },
  color_profile_attach: { cost: 3, op: "attachICC", cat: "Color", disabled: true },
  color_profile_strip: { cost: 2, op: "stripICC", cat: "Color", disabled: true },

  repair: { cost: 4, op: "repair", cat: "Advanced", disabled: true },
  flatten: { cost: 3, op: "flatten", cat: "Advanced", disabled: true },
  unflatten: { cost: 6, op: "unflatten", cat: "Advanced", disabled: true },
  normalize_strict: { cost: 4, op: "normalizeStrict", cat: "Advanced", disabled: true },
  linearize: { cost: 4, op: "linearize", cat: "Advanced", disabled: true },

  redact_text: { cost: 4, op: "redactText", cat: "Redact", disabled: true },
  redact_images: { cost: 5, op: "redactImages", cat: "Redact", disabled: true },
  redact_regions: { cost: 5, op: "redactRegions", cat: "Redact", disabled: true },
  redact_metadata: { cost: 2, op: "redactMeta", cat: "Redact", disabled: true },
  redact_full: { cost: 6, op: "redactFull", cat: "Redact", disabled: true },

  ocr: { cost: 10, op: "ocr", cat: "OCR", gated: true, disabled: true },

  unredact: {
    cost: 25,
    op: "unredact",
    cat: "Legal",
    gated: true,
    disclaimer: true,
    disabled: true
  },
  unredact_legal: {
    cost: 25,
    op: "unredactLegal",
    cat: "Legal",
    gated: true,
    requiresAttestation: true,
    disabled: true
  },

  batch_execute: { cost: 0, op: "batchExecute", cat: "Batch", disabled: true },
  batch_parallel: { cost: 2, op: "batchParallel", cat: "Batch", disabled: true },
  batch_resume: { cost: 1, op: "batchResume", cat: "Batch", disabled: true },
  batch_template_save: { cost: 0, op: "batchTemplateSave", cat: "Batch", disabled: true },
  batch_template_run: { cost: 0, op: "batchTemplateRun", cat: "Batch", disabled: true }
};
