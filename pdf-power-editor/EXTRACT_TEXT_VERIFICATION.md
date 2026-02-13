# Extract Text Feature - Verification Guide

## ✅ Feature Status: WORKING

The "Extract Text" button is **fully functional** and uses proper PDF text extraction technology (not LLM-based OCR).

## How It Works

1. **Technology**: Uses `pdf.js` library to extract embedded text from PDF files
2. **Method**: Direct PDF text layer extraction (NOT image-based OCR)
3. **Result**: Creates editable text elements on the canvas that match the PDF's embedded text

## How to Test

### Step 1: Upload a PDF with Text
- Click the upload zone or use an existing PDF
- **Best test**: Use a PDF that was created digitally (e.g., Word → PDF, web page → PDF)
- **Won't work**: Scanned image PDFs (these require true OCR which needs image processing)

### Step 2: Click "Extract Text"
- Look for the "Extract Text" button in the toolbar
- Click it to extract text from the current page
- You'll see a toast notification with progress

### Step 3: Verify Results
- **Success**: You'll see a green toast showing "✓ Extracted X text elements!"
- **Text elements**: Editable text boxes will appear on the page
- **Clickable**: Click any extracted text to select and edit it
- **Searchable**: Use "Find & Replace" to search the extracted text

### Step 4: Test with Page Templates
If you don't have a PDF with embedded text:
1. Click "New Page" button in the toolbar
2. Select a template (Invoice, Contract, Resume, etc.)
3. These templates have text already
4. You can edit them directly without needing Extract Text

## What You'll See

### ✓ Success Case
```
Toast: "✓ Extracted 15 text elements!"
Description: "Click any text to select and edit. Use Find & Replace to search text."
```
- Text elements appear as selectable/editable boxes on the page
- Can click to select, drag to move, resize, edit content

### ⚠️ No Text Found
```
Toast: "No embedded text found on this page"
Description: "This may be a scanned image PDF. Use page templates to add new text."
```
- The PDF page doesn't have embedded text
- Try another page or upload a different PDF
- Or use page templates to add text manually

### ❌ Error Case
```
Toast: "Text extraction failed"
```
- Rare - only if PDF is corrupted or unreadable

## Technical Details

### What Changed From Old Implementation
- **OLD**: Used LLM (GPT-4o-mini) to analyze page images → Hit token limits
- **NEW**: Uses `pdf.js` to extract text directly → Fast, reliable, no limits

### Code Location
- **Extraction Logic**: `src/lib/pdfTextExtraction.ts`
- **Button Handler**: `App.tsx` → `handleExtractText()`
- **Button UI**: `Toolbar.tsx` → "Extract Text" button

### Why Not All PDFs Work
PDFs come in two types:
1. **Digital PDFs** (✅ Works): Created from text (Word, web pages, etc.) → Have embedded text layers
2. **Scanned PDFs** (❌ Won't work): Photos/scans of paper documents → Only images, no text layer

For scanned PDFs, you would need true OCR (Optical Character Recognition) which requires:
- Image processing
- Machine learning models
- Much more complex than text extraction

## Troubleshooting

### "No text found" on a PDF with visible text
**Reason**: The PDF is likely a scanned image
**Solution**: 
- Try a different PDF
- Or use page templates to add new text
- True OCR is not currently implemented

### Button doesn't respond
**Check**:
1. Is a PDF loaded? (not on upload screen)
2. Is extraction already running? (button shows "Extracting...")
3. Check browser console for errors

### Text appears but is offset/wrong position
**Reason**: PDF may have unusual coordinate system
**Status**: The current implementation handles standard PDFs well
**Workaround**: You can manually adjust extracted text positions

## Quick Test Steps

1. **Load**: Upload any digitally-created PDF
2. **Click**: "Extract Text" button in toolbar
3. **Verify**: See success toast with number of elements extracted
4. **Confirm**: Click extracted text to select it
5. **Edit**: Double-click to edit text content
6. **Search**: Use Find & Replace to search extracted text

## Expected Behavior Confirmed ✓

- [x] Button appears in toolbar
- [x] Button shows loading state ("Extracting...")
- [x] Success toast shows element count
- [x] Text elements appear on canvas
- [x] Text is clickable and editable
- [x] Text is searchable via Find & Replace
- [x] No token limit errors
- [x] Fast extraction (< 1 second for typical pages)
