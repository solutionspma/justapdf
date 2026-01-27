export const CREDIT_PACKS = [
  { id: 'pack_small', label: 'Small Pack', priceUsd: 5, credits: 50 },
  { id: 'pack_medium', label: 'Medium Pack', priceUsd: 10, credits: 120 },
  { id: 'pack_large', label: 'Large Pack', priceUsd: 20, credits: 280 }
];

export const OPERATION_PRICING = Object.freeze({
  upload_pdf: 0,
  merge_documents: 1,
  split_pages: 1,
  rotate_pages: 1,
  delete_pages: 1,
  watermark: 1,
  normalize_pdf: 1,
  export_pdf: 0
});

export const SUBSCRIPTIONS = [
  { id: 'sub_starter', label: 'Starter', monthlyCredits: 500, discountRate: 0.15, rollover: true },
  { id: 'sub_pro', label: 'Pro', monthlyCredits: 1500, discountRate: 0.2, rollover: true },
  { id: 'sub_enterprise', label: 'Enterprise', monthlyCredits: 5000, discountRate: 0.25, rollover: true }
];

export const PROFESSIONAL_PACKS = [
  {
    id: 'pack_legal',
    label: 'Legal Workflow Pack',
    baseFeeMonthly: 49,
    discountCategories: ['pro'],
    discountRate: 0.2,
    perks: ['Batch execution', 'Audit logs', 'Chain-of-custody export', 'OCR confidence scoring']
  },
  {
    id: 'pack_prepress',
    label: 'Pre-Press / Print Pack',
    baseFeeMonthly: 99,
    discountCategories: ['print'],
    discountRate: 0.3,
    perks: ['Deterministic processing guarantees', 'PDF/X profiles', 'Color management ops', 'Font handling workflows']
  }
];
