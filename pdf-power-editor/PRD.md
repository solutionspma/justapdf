# Planning Guide

A comprehensive PDF editor that enables users to upload, edit, and modify PDF documents directly in the browser with features including text editing, image manipulation, form filling, signature placement, page organization, and OCR text detection.

**Experience Qualities**:
1. **Professional** - The interface should feel like a robust desktop application with powerful editing capabilities and precision controls
2. **Intuitive** - Complex PDF editing operations should be accessible through clear visual tools and contextual actions
3. **Responsive** - Edits and interactions should feel immediate with smooth visual feedback and real-time preview updates

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a feature-rich application requiring multiple editing modes (text, image, form, signature), document state management, canvas-based rendering, OCR integration, and sophisticated page manipulation tools.

## Essential Features

### PDF Upload & Preview
- **Functionality**: Drag-and-drop or click to upload PDF files, render pages as editable canvases
- **Purpose**: Entry point for all editing operations; provides visual context for modifications
- **Trigger**: User drops PDF file or clicks upload button
- **Progression**: Drag file → Upload animation → PDF parsing → Page thumbnails appear → First page rendered in editor
- **Success criteria**: PDF renders accurately with all pages visible in sidebar, pages are individually selectable

### Text Editing
- **Functionality**: Click on existing text to edit in place, add new text boxes anywhere on the page, double-click text elements to enter edit mode with visual hint
- **Purpose**: Enables form filling, corrections, and content additions without external tools
- **Trigger**: User clicks text mode tool, then clicks on existing text or empty area, or double-clicks any text element
- **Progression**: Select text tool → Click text element → Edit cursor appears → Type changes → Click outside to commit OR double-click existing text element → "Double-click to edit" tooltip appears → Enter edit mode directly
- **Success criteria**: Text maintains original font properties when edited, new text boxes are fully customizable, double-click editing is discoverable with hover hints, text editing feels immediate and responsive

### Context Menu
- **Functionality**: Right-click any element to access quick actions - duplicate, bring to front, send to back, flip horizontal/vertical (for images), delete
- **Purpose**: Provide fast access to common element manipulation actions without switching tools
- **Trigger**: User right-clicks on any PDF element (text, image, signature, form, highlight, note)
- **Progression**: Right-click element → Context menu appears at cursor → Select action → Element is modified → Menu closes
- **Success criteria**: Context menu appears instantly on right-click, all actions work correctly and update element immediately, menu closes when clicking outside or after selecting action, image-specific actions (flip) only appear for applicable elements

### Image Manipulation
- **Functionality**: Upload images, position, resize, rotate, and delete images on PDF pages
- **Purpose**: Add logos, signatures, stamps, or replace existing images
- **Trigger**: User clicks image tool, then uploads or selects image
- **Progression**: Select image tool → Upload image → Image appears on page → Drag to position → Resize handles appear → Adjust and confirm
- **Success criteria**: Images scale proportionally, maintain quality, and can be layered correctly

### Form Field Detection & Editing
- **Functionality**: Automatically detect form fields, enable direct typing into fields, add new form elements
- **Purpose**: Makes PDF forms usable and editable
- **Trigger**: PDF with forms loads, or user adds form field manually
- **Progression**: Upload form PDF → Fields auto-highlighted → Click field → Type value → Tab to next field
- **Success criteria**: Fields are visually distinct, support keyboard navigation, retain values

### Digital Signature Placement
- **Functionality**: Draw, type, or upload signature; place and resize on document
- **Purpose**: Enable document signing without printing
- **Trigger**: User clicks signature tool
- **Progression**: Select signature tool → Choose draw/type/upload → Create signature → Place on document → Resize/position → Lock in place
- **Success criteria**: Signatures are high contrast, positioned precisely, remain visible in exported PDF

### Annotation Tools
- **Functionality**: Add highlighting to emphasize text or areas with quick color presets, create sticky notes with custom colors and content, reply to notes for collaboration, draw arrows to point out specific areas, add shapes (rectangles, circles, lines, triangles) for diagramming, apply stamps (Approved, Rejected, Confidential, Draft, Final, etc.) for document status
- **Purpose**: Enable document review, commenting, and collaboration without modifying original content; provide visual annotation tools for markup and emphasis
- **Trigger**: User clicks highlight, sticky note, arrow, shape, or stamp tool; right-clicks elements for context menu
- **Progression**: Select annotation tool → Choose color/style from preset options → Click and drag for highlight/arrow/shape or click for note/stamp → Customize content and appearance → Position and resize as needed → Notes can be edited by double-clicking → Add replies to notes for team collaboration → Filter annotations by type or author
- **Success criteria**: Highlights have adjustable opacity and 10+ color presets, sticky notes support text editing and multiple colors with reply threads, arrows can be styled (solid, dashed, dotted) with adjustable arrowhead size, shapes support fill and stroke customization, stamps display appropriate styling for each type, annotations are layered properly and can be moved/deleted, right-click context menu provides quick actions (duplicate, bring to front, send to back, flip for images), annotation filters allow showing/hiding by type or author
- **Annotation Types**:
  - **Highlights**: Yellow, Green, Blue, Orange, Pink, Purple, Red, Cyan, Lime, Amber with opacity control
  - **Sticky Notes**: Collaborative notes with reply threads, author names, and timestamps
  - **Arrows**: Directional indicators with customizable color, stroke width, and style (solid/dashed/dotted)
  - **Shapes**: Rectangles, circles, lines, triangles with fill and stroke options
  - **Stamps**: Pre-defined status stamps (Approved, Rejected, Confidential, Draft, Final, Reviewed, Void, Copy) with appropriate colors
- **Collaboration**: Sticky notes support reply threads with author names and timestamps for team review workflows

### Page Organization
- **Functionality**: Reorder, delete, rotate, duplicate pages via thumbnail sidebar
- **Purpose**: Organize document structure before finalizing
- **Trigger**: User interacts with page thumbnails
- **Progression**: View thumbnails → Drag page to new position → Page reorders → Thumbnail updates → Main view reflects change
- **Success criteria**: Drag-and-drop is smooth, changes reflect immediately, undo/redo works

### OCR Text Detection
- **Functionality**: Scan scanned PDFs or images with enhanced sensitivity for small text, detect text including rotated text at various angles and fine print, make it editable and searchable with advanced prompt engineering optimized for high-sensitivity text detection
- **Purpose**: Convert non-searchable PDFs into editable documents with support for text at any angle and size, including captions, footnotes, and small annotations
- **Trigger**: User clicks "Detect Text" button with helpful tooltip explaining best practices
- **Progression**: Select OCR tool → "Analyzing page for text..." loading message → High-sensitivity text detection via LLM with improved image quality → Detected text overlay appears → "Found X text elements!" success message → Detected text becomes selectable and editable
- **Success criteria**: Text detection works on PDFs with text of varying sizes (from 6pt to 24pt+), loading/success/error messages appear in correct order using toast notifications with IDs, detected text aligns with original positioning, maintains formatting and size differentiation, clear error messages guide users when pages are too complex, tooltip provides helpful guidance before usage
- **OCR Enhancements**: 
  - Increased image resolution (800px → 1200px) for better small text capture
  - Higher compression quality (0.3 → 0.5 JPEG quality) to preserve text clarity
  - Advanced image smoothing with 'high' quality setting for crisp rendering
  - Enhanced prompt engineering specifically targeting small, faint, and detailed text
  - Expanded size categories: xlarge (>20pt), large (16-20pt), medium (10-15pt), small (7-9pt), xsmall (<7pt)
  - Explicit instructions to detect fine print, captions, footnotes, subscripts, superscripts, margins, headers, footers
  - Improved font size mapping with more granular detection (6pt to 24pt range)
  - Better width estimation for small text elements (0.55 → 0.6 character width ratio)

**Test Document Features**: The "Create Test PDF" button generates a comprehensive test document with:
- Standard horizontal text in various sizes and styles
- Contact information (emails, phone numbers, URLs)
- Structured content (lists, paragraphs, headings)
- Financial data and dates for pattern testing
- **Rotated text elements** at multiple angles (30°, 45°, 90°, 135°, 180°, 270°, -45°) in different colors for visual angle detection testing
- Special characters and mixed case text
- Technical specifications and measurements

### Text Search & Find/Replace
- **Functionality**: Search for text across all pages with support for literal text, whole word matching, case sensitivity, and advanced regex patterns with preset library; navigate between matches; replace individual or all occurrences; **batch text replacement across multiple pages at once**
- **Purpose**: Quickly locate and modify specific text content throughout the document with powerful pattern matching capabilities, instant access to common patterns, and efficient bulk editing
- **Trigger**: User clicks "Find & Replace" button or presses Ctrl+F/Cmd+F
- **Progression**: Open search dialog → Enter search term (or click "Patterns" to browse regex library) → Select from categorized presets (emails, phone numbers, URLs, dates, numbers) → Toggle search options → Results displayed with page numbers and context → Click result to navigate → **Replace single match or click "Replace All" to change all matches across all pages simultaneously** → Changes saved with history
- **Success criteria**: Search supports multiple modes (literal, whole word, regex), case-sensitive/insensitive toggleable, regex validation with clear error messages, preset pattern library organized by categories (Contact Info, Dates & Times, Numbers, Web & URLs, Common), all matches highlighted with context preview, navigation works seamlessly across pages, **replace-all functions correctly with regex capture groups and processes multiple pages in one operation**, selected patterns auto-apply to search field with examples, batch replacement confirms count before applying

### Page Templates
- **Functionality**: Choose from pre-designed page templates organized by category (Business, Legal, Personal, Custom); instantly create new pages with professional layouts; templates include letterheads, invoices, contracts, meeting notes, and resumes
- **Purpose**: Speed up document creation with ready-made layouts for common business and personal documents
- **Trigger**: User clicks "Page Templates" button in toolbar
- **Progression**: Click templates button → Template gallery opens showing categories → Browse templates by category (Business/Legal/Personal/Custom) → Preview template with element count → Click to select → New page added to document with template layout → Elements are fully editable
- **Success criteria**: Templates organized clearly by category, template preview shows layout and element count, selecting template adds page immediately, all template elements are editable and customizable, templates include variety of common document types (6+ templates minimum), new page appears at end of document and automatically becomes active
- **Template Categories**:
  - **Business**: Letterhead, Invoice, Meeting Notes (with agenda and action items)
  - **Legal**: Contract template with signature lines
  - **Personal**: Resume with organized sections
  - **Blank**: Letter and A4 size options

### Digital Signature Verification
- **Functionality**: Detect and verify digital signatures in PDFs; validate signature certificates against trusted store; view signature details including signer, date, location, and validation status
- **Purpose**: Ensure document authenticity and integrity by verifying digital signatures and certificate chains
- **Trigger**: User clicks "Verify Signatures" button in toolbar
- **Progression**: Click verify button → Signature panel opens → Signatures automatically detected → Click "Verify All" or individual signature → Certificate validation against trusted store → Status displayed (valid/invalid/unknown) → View detailed certificate information
- **Success criteria**: All signatures in document are detected, certificate chain validation works correctly, signature verification status is clear and accurate, detailed information available for each signature including date, signer, and certificate details

### Certificate Management
- **Functionality**: Add, import, view, and manage trusted certificates; import certificates from PEM, CRT, CER, DER files; mark certificates as trusted/untrusted; view certificate details including validity dates, issuer, subject, fingerprint, and usage
- **Purpose**: Build and maintain a trusted certificate store for signature verification
- **Trigger**: User clicks "Certificates" button in toolbar
- **Progression**: Open certificate dialog → View list of certificates → Add new certificate manually or import from file → Fill certificate details → Mark as trusted → Certificate stored for verification → View detailed certificate information in details tab
- **Success criteria**: Certificates can be imported from common formats, certificate details are properly parsed and displayed, trust status can be toggled, expired/invalid certificates are clearly marked, certificate verification works correctly including date range and trust chain validation

### TSA Server Management
- **Functionality**: Add, configure, validate, and manage Timestamp Authority (TSA) servers for timestamp validation; includes preset list of major TSA providers (DigiCert, Sectigo, GlobalSign, Entrust, SSL.com, SwissSign, QuoVadis, Verisign, Thawte, GlobalTrust, Certum, Adobe); validate server reachability; enable/disable servers; mark servers as trusted/untrusted
- **Purpose**: Establish trusted TSA servers for validating signature timestamps against known authorities
- **Trigger**: User clicks "Manage TSA Servers" button in signature verification panel or clicks link when no TSA servers are configured
- **Progression**: Open TSA dialog → View preset server list → Add individual or all presets → Configure custom TSA server with name, URL, and description → Validate server reachability → Mark as trusted/enabled → Server used for timestamp validation → View validation status and last validated date
- **Success criteria**: 12+ preset TSA servers available for quick addition, custom TSA servers can be added with full details, servers can be validated for reachability, trust status and enabled/disabled state are clearly indicated, timestamp validation checks against configured TSA list, validation errors are descriptive and actionable

### Export & Save
- **Functionality**: Download modified PDF with all edits applied, with watermarks, stamps, password protection, and single-page export options
- **Purpose**: Preserve and share edited documents with professional finishing options
- **Trigger**: User clicks export/download button
- **Progression**: Click export → Configure options (watermarks, stamps, passwords, pages) → Processing animation → File generation → Download prompt → PDF saved locally
- **Success criteria**: Exported PDF opens in any PDF viewer, all edits are permanent, file size is reasonable, optional watermarks/stamps apply correctly, password protection works in all PDF viewers, individual pages can be exported as separate files

### Annotation Filters
- **Functionality**: Filter visible annotations by type (text, image, signature, form, highlight, note) and by author for sticky notes; toggle individual types or authors on/off; see count of visible vs total annotations
- **Purpose**: Focus on specific annotations during review, hide distractions, filter by team member contributions
- **Trigger**: User clicks "Filters" button in floating toolbar above canvas
- **Progression**: Click filters → Popover opens showing type toggles and author list → Toggle types or authors → Canvas updates to show/hide matching annotations → Filter count updates → Close popover or reset all filters
- **Success criteria**: Filters apply instantly to canvas, filtered elements are completely hidden (not just dimmed), filter state persists while editing, annotation count shows "X of Y annotations", "Show All" toggle for authors works correctly, filter icon shows indicator dot when filters are active

## Edge Case Handling

- **Large Files**: Show progress indicator for files >10MB, warn for files >50MB, implement virtualized page rendering
- **Corrupted PDFs**: Display error message with specific issue, offer partial rendering if possible
- **Unsupported Fonts**: Fallback to web-safe fonts with visual indicator, allow font substitution
- **Mobile Editing**: Adapt tools to touch interfaces, larger hit targets, simplified toolbar
- **Browser Compatibility**: Detect missing features (Canvas API, File API), show compatibility warnings
- **Concurrent Edits**: Track edit history, prevent conflicting changes, implement undo/redo stack
- **Export Failures**: Retry logic, option to export as images if PDF generation fails
- **OCR Failures**: Graceful degradation, manual text addition option, language detection issues
- **Invalid Certificates**: Clearly mark expired, revoked, or untrusted certificates with warnings
- **Signature Verification Failures**: Provide clear error messages when signatures cannot be verified, guide users to add missing certificates to trusted store
- **Certificate Import Errors**: Validate certificate file formats, show specific errors for malformed certificates, support multiple certificate formats (PEM, CRT, CER, DER)
- **TSA Server Validation**: Handle unreachable TSA servers gracefully, allow users to disable or remove problematic servers, display validation status with clear indicators
- **Missing TSA Configuration**: Prompt users to configure TSA servers when verifying timestamps, provide preset list for easy setup

## Design Direction

The design should evoke precision, professionalism, and creative control—like Adobe Acrobat meets modern web aesthetics. It should feel powerful yet approachable, with a clear visual hierarchy that guides users from upload to export. The interface should inspire confidence through clean lines, generous spacing, and purposeful color usage that distinguishes editing modes and actions.

## Color Selection

A sophisticated palette balancing professional neutrals with vibrant accent colors for different editing modes.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Represents trust and professionalism, used for primary actions and the main toolbar
- **Secondary Colors**: 
  - Soft Gray (oklch(0.88 0.01 250)) - Background panels and inactive states
  - Charcoal (oklch(0.25 0.01 250)) - Sidebar and tool panels for depth
- **Accent Color**: Electric Teal (oklch(0.65 0.18 200)) - CTAs, active tool indicators, highlighting selected elements
- **Mode-Specific Colors**:
  - Text Mode: Amber (oklch(0.70 0.15 70)) - Warm, associated with writing
  - Image Mode: Magenta (oklch(0.60 0.22 330)) - Creative, visual
  - Form Mode: Green (oklch(0.65 0.15 150)) - Completion, input
  - Signature Mode: Purple (oklch(0.55 0.18 290)) - Authority, finality
- **Foreground/Background Pairings**:
  - Primary Blue (oklch(0.45 0.15 250)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Accent Teal (oklch(0.65 0.18 200)): White text (oklch(0.98 0 0)) - Ratio 4.7:1 ✓
  - Charcoal BG (oklch(0.25 0.01 250)): White text (oklch(0.98 0 0)) - Ratio 12.1:1 ✓
  - Amber (oklch(0.70 0.15 70)): Charcoal text (oklch(0.25 0.01 250)) - Ratio 5.8:1 ✓

## Font Selection

Typography should communicate precision and modernity while maintaining excellent readability for lengthy editing sessions.

- **Primary Font**: Space Grotesk - A geometric sans with technical character, perfect for UI elements and toolbar labels
- **Secondary Font**: JetBrains Mono - Monospace for precise measurements, coordinates, and form field values
- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/32px/tight (-0.02em) letter spacing
  - H2 (Panel Headers): Space Grotesk SemiBold/20px/normal letter spacing
  - H3 (Tool Labels): Space Grotesk Medium/16px/wide (0.01em) letter spacing
  - Body (Descriptions): Space Grotesk Regular/14px/1.5 line height
  - Mono (Measurements): JetBrains Mono Regular/13px/1.4 line height
  - Small (Hints): Space Grotesk Regular/12px/muted color

## Animations

Animations should reinforce the physicality of document editing—pages should feel like real objects being manipulated, tools should provide satisfying feedback, and transitions should maintain spatial relationships. Balance between utility (showing what changed) and delight (making interactions enjoyable).

- **Page Transitions**: Smooth slide with slight scale (200ms ease-out) when switching pages
- **Tool Selection**: Quick highlight pulse (150ms) with color shift to mode-specific accent
- **Drag Operations**: Gentle lift effect with subtle shadow increase while dragging pages/elements
- **Edit Confirmations**: Micro-celebration with slight bounce (180ms spring) when edits are committed
- **Upload Progress**: Smooth progress bar with subtle shimmer effect
- **OCR Processing**: Scanning line animation that sweeps across the page
- **Hover States**: Subtle 100ms color transition, 80ms scale (1.02) for buttons

## Component Selection

- **Components**:
  - **Toolbar**: Custom horizontal toolbar with shadcn `Button` components in ghost variant, grouped by function
  - **Sidebar**: shadcn `ScrollArea` for page thumbnails with drag-and-drop cards using shadcn `Card`
  - **Canvas Area**: Custom Canvas component for PDF rendering and editing layer
  - **Upload Zone**: Custom dropzone with shadcn `Button` for fallback click-to-upload
  - **Dialogs**: shadcn `Dialog` for signature creation, settings, export options, search/replace functionality, and certificate management
  - **Tool Panels**: shadcn `Sheet` from right side for contextual editing options
  - **Progress**: shadcn `Progress` for upload and processing states
  - **Toasts**: sonner for operation confirmations and error messages with toast IDs for proper sequencing
  - **Context Menus**: Custom `ContextMenu` component for right-click actions on elements with actions like duplicate, bring to front, send to back, flip horizontal/vertical, delete
  - **Tabs**: shadcn `Tabs` for switching between editing modes in properties panel and certificate details
  - **Search Dialog**: shadcn `Dialog` with `Input`, `Checkbox`, `ScrollArea`, `Badge`, `Popover`, and `Tabs` for comprehensive search/replace UI with regex pattern library
  - **Certificate Dialog**: shadcn `Dialog` with `Tabs`, `ScrollArea`, `Input`, `Label`, `Textarea`, and `Badge` for certificate management interface
  - **Signature Verification Panel**: Side panel with shadcn `Card`, `Badge`, `ScrollArea` for signature verification and certificate details
  - **Annotation Filters**: shadcn `Popover` with `Switch` components for filtering annotations by type and author
  - **Color Presets**: shadcn `Popover` with preset color grid and custom color picker for quick highlight/note color selection
  - **Sticky Note Replies**: Custom reply thread component with `Input` and `Button` for collaborative note discussions
  
- **Customizations**:
  - **PDF Canvas Component**: Custom canvas with zoom controls, pan functionality, selection layer
  - **Thumbnail Grid**: Custom draggable thumbnail component with page numbers and action buttons
  - **Signature Pad**: Custom canvas for drawing signatures with pressure sensitivity
  - **Text Editor Overlay**: Custom contentEditable overlay that appears over PDF text with double-click activation and hover hints
  - **Transform Handles**: Custom resize/rotate handles for images and text boxes
  - **Context Menu**: Fixed-position menu that appears on right-click with context-aware actions
  - **Color Preset Grid**: 10-color preset grid with custom color picker fallback
  - **Annotation Filter Panel**: Floating toolbar with filter controls and annotation count
  - **Note Reply System**: Threaded reply interface within sticky notes with author attribution and timestamps
  - **Regex Pattern Library**: Custom popover with categorized tabs displaying 20+ preset regex patterns (emails, phone numbers, URLs, dates, numbers) with descriptions and examples
  - **Certificate List**: Custom certificate card component with status indicators, trust badges, and validation information
  - **Signature Card**: Custom signature display with verification status, certificate details, and validation timeline
  - **TSA Server Manager**: Custom dialog with preset TSA server list (DigiCert, Sectigo, GlobalSign, Entrust, SSL.com, etc.), validation status indicators, enable/disable toggles, and trust management
  
- **States**:
  - **Buttons**: Default (mode color at 20% opacity) → Hover (mode color at 30%) → Active (solid mode color with white text) → Disabled (gray with 50% opacity)
  - **Tool Icons**: Inactive (muted) → Hover (scale 1.1, color shift) → Active (primary color, slight glow)
  - **Thumbnails**: Default (border: transparent) → Hover (border: accent) → Selected (border: primary, shadow) → Dragging (lifted with increased shadow)
  - **Canvas Elements**: Default → Hover (blue outline) → Selected (handles visible) → Editing (pulsing outline)
  
- **Icon Selection**:
  - Upload: `ArrowUpTray` / `Upload`
  - Text: `TextAa` / `Type`
  - Image: `Image` / `ImageSquare`
  - Form: `ListChecks` / `CheckSquare`
  - Signature: `Signature` / `PencilLine`
  - OCR: `ScanEye` / `Eye`
  - Search: `MagnifyingGlass`
  - Pages: `Squares` / `SquaresFour`
  - Rotate: `ArrowClockwise`
  - Delete: `Trash`
  - Download: `Download` / `ArrowDown`
  - Undo/Redo: `ArrowCounterClockwise` / `ArrowClockwise`
  - Zoom: `MagnifyingGlassPlus` / `MagnifyingGlassMinus`
  - Navigate: `ArrowUp` / `ArrowDown`
  - Replace All: `ArrowsClockwise`
  - Pattern Library: `BookOpen`
  - Certificate: `Certificate` / `ShieldCheck`
  - Verify: `ShieldCheck`
  - Highlight: `Highlighter`
  - Sticky Note: `Note`
  - Filters: `Funnel`
  - Color Palette: `Palette`
  - Context Menu Actions: `Copy`, `ArrowsOutSimple`, `ArrowsInSimple`, `FlipHorizontal`, `FlipVertical`
  - Reply: `PaperPlaneRight`
  - Trust: `ShieldCheck` (filled)
  - Untrust: `ShieldWarning`
  - Valid: `CheckCircle` (filled, green)
  - Invalid: `Warning` (filled, red)
  - Info: `Info`
  
- **Spacing**:
  - Toolbar padding: `px-6 py-3`
  - Tool button gaps: `gap-1` within groups, `gap-4` between groups
  - Sidebar padding: `p-4`
  - Thumbnail gaps: `gap-3`
  - Canvas margins: `m-6`
  - Panel sections: `space-y-6`
  - Form elements: `space-y-4`
  
- **Mobile**:
  - Sidebar collapses to bottom sheet with page carousel
  - Toolbar becomes vertical slide-out panel
  - Canvas occupies full viewport with floating tool button
  - Touch gestures: pinch to zoom, two-finger pan, long-press for context menu
  - Larger touch targets: minimum 44px for all interactive elements
  - Simplified tool panels with accordion sections instead of side sheets
