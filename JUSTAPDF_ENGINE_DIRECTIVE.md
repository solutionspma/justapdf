PROJECT: JustaPDF — Engine + Editor Build (Firebase)

ROLE
You are building a real PDF processing platform, not a static website.
Prioritize functionality, correctness, and extensibility over polish.

STACK (LOCKED)
- Frontend: Native JavaScript / TypeScript (ES Modules)
- Auth: Firebase Auth
- Database: Firestore
- Storage: Firebase Storage
- Compute: Firebase Cloud Functions
- Hosting: Netlify (frontend only)

DO NOT introduce frameworks, additional HTML files, or alternate backends.

--------------------------------
STORAGE (FIREBASE)
--------------------------------
Use ONE Firebase Storage bucket with structured paths:

/uploads/
  /users/{userId}/
    /original/
    /working/
    /exports/

/uploads/
  /orgs/{orgId}/
    /original/
    /working/
    /exports/

Original files are immutable. Never overwrite originals.

--------------------------------
DATA MODEL (FIRESTORE)
--------------------------------
Collections:
- users
- orgs
- memberships
- documents
- operations

documents schema:
{
  id,
  ownerType: "user" | "org",
  ownerId,
  filename,
  mimeType: "application/pdf",
  storageOriginal,
  storageWorking,
  storageExport,
  pageCount,
  status: "uploaded" | "processing" | "ready" | "error",
  availableOperations: string[],
  operationsRun: [],
  originalHash,
  createdAt
}

operations schema:
{
  id,
  label,
  category: "core" | "professional" | "print",
  creditCost: number | "dynamic",
  refundable: boolean,
  previewable: boolean,
  requires: string[],
  produces: string[]
}

--------------------------------
EDITOR (STATE-DRIVEN)
--------------------------------
Editor states:
- empty
- uploading
- document_loaded
- processing
- ready
- error

UI RULES:
- No document → no tools
- Upload must be drag & drop + click
- Show progress during upload
- Lock UI during processing
- Enable operations only when document is ready

--------------------------------
UPLOAD FLOW (MANDATORY ORDER)
--------------------------------
1. User uploads PDF
2. Store in /original/
3. Create Firestore document record
4. Call Cloud Function parsePdf
5. Update pageCount + status=ready
6. Unlock editor tools

--------------------------------
CLOUD FUNCTIONS (PHASE 1)
--------------------------------
Implement PDF processing ONLY in Cloud Functions.

Functions to implement:
- parsePdf(documentId)
- splitPages(documentId, pages[])
- mergeDocuments(documentIds[])

Functions must:
- Read from storage
- Write results to /exports/
- Update Firestore document state
- Log operations
- Return download URLs

--------------------------------
OPERATIONS (PHASE 1 ONLY)
--------------------------------
- upload_pdf (0 credits)
- view_pages (0 credits)
- split_pages (1 credit per page)
- merge_documents (1 credit per document)
- download_pdf (0 credits)

Do NOT implement OCR, text editing, redaction, or preflight yet.

--------------------------------
MULTI-ACCOUNT SUPPORT
--------------------------------
Support both:
- Personal users
- Organizations (law firms, print shops)

Use memberships collection:
{
  userId,
  orgId,
  role: "admin" | "member"
}

Documents belong to exactly ONE owner (user or org).

--------------------------------
ACCOUNT PAGE
--------------------------------
Account page must display real data:
- Uploaded documents
- Operation history
- Credit balance (stub acceptable)
- Org memberships

--------------------------------
PRICING PAGE
--------------------------------
Pricing must reflect real operations from the operations collection.
No hardcoded pricing text.
Support:
- Pay-as-you-go credits
- Optional subscriptions (credit preload)
- Professional packs (discount modifiers, not feature locks)

--------------------------------
PRIORITY
--------------------------------
Make the editor FUNCTIONAL.
A working split/merge beats a fake “edit text” feature.

DO NOT BUILD DEMOS OR PLACEHOLDERS THAT PRETEND TO WORK.
