#!/usr/bin/env python3
"""
PDF Glyph Editor - Edit text operands in PDF content streams at the operator level.

This tool provides low-level access to PDF text content, allowing you to:
- Extract and view text operands with their exact positions in the content stream
- Edit text strings in place (Tj, TJ operators)
- Modify individual glyph positions in TJ arrays
- Preserve all formatting, fonts, and positioning
"""

import sys
import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Union, Any
from dataclasses import dataclass, asdict
from enum import Enum

try:
    import pikepdf
except ImportError:
    print("Error: pikepdf not installed. Run: pip install pikepdf")
    sys.exit(1)


class TextOperator(Enum):
    """PDF text showing operators."""
    SHOW_TEXT = "Tj"           # (string) Tj - Show text
    SHOW_TEXT_ADJUST = "TJ"    # [array] TJ - Show text with positioning
    NEXT_LINE_SHOW = "'"       # (string) ' - Move to next line and show
    SET_SPACING_SHOW = '"'     # (aw ac string) " - Set spacing, next line, show


@dataclass
class TextOperand:
    """Represents a single text operand found in a PDF content stream."""
    page_num: int
    object_ref: str           # e.g., "Contents[0]" or "FormXObject[5]"
    operator: str             # "Tj", "TJ", "'", or '"'
    text: str                 # The decoded text content
    raw_bytes: bytes          # The original PDF string bytes
    operand_index: int        # Index within multi-operand operators (for TJ arrays)
    byte_offset: int          # Approximate byte offset in content stream
    context: str              # Surrounding context for identification
    
    def to_dict(self) -> Dict:
        return {
            "page_num": self.page_num,
            "object_ref": self.object_ref,
            "operator": self.operator,
            "text": self.text,
            "raw_bytes": self.raw_bytes.hex(),
            "operand_index": self.operand_index,
            "byte_offset": self.byte_offset,
            "context": self.context
        }


class PDFContentParser:
    """Parse PDF content streams to extract text operands."""
    
    # PDF string patterns
    LITERAL_STRING_PATTERN = rb'\((?:[^\\()]|\\.|\\\n)*\)'
    HEX_STRING_PATTERN = rb'<[0-9A-Fa-f]*>'
    
    def __init__(self, content: bytes):
        self.content = content
        self.pos = 0
        self.operands: List[TextOperand] = []
    
    def parse(self, page_num: int, object_ref: str) -> List[TextOperand]:
        """Parse content stream and extract all text operands."""
        self.pos = 0
        self.operands = []
        
        while self.pos < len(self.content):
            self._skip_whitespace_and_comments()
            if self.pos >= len(self.content):
                break
            
            # Check for TJ array operator
            if self._peek() == ord('['):
                self._parse_tj_array(page_num, object_ref)
            # Check for literal string followed by Tj or '
            elif self._peek() == ord('('):
                self._parse_literal_string_operator(page_num, object_ref)
            # Check for hex string followed by Tj or '
            elif self._peek() == ord('<'):
                self._parse_hex_string_operator(page_num, object_ref)
            else:
                self.pos += 1
        
        return self.operands
    
    def _peek(self, offset: int = 0) -> Optional[int]:
        """Peek at byte at current position + offset."""
        idx = self.pos + offset
        if idx < len(self.content):
            return self.content[idx]
        return None
    
    def _skip_whitespace_and_comments(self):
        """Skip whitespace and comments."""
        while self.pos < len(self.content):
            c = self.content[self.pos]
            if c in b' \t\r\n\x00\x0c':
                self.pos += 1
            elif c == ord('%'):
                # Skip comment
                while self.pos < len(self.content) and self.content[self.pos] != ord('\n'):
                    self.pos += 1
            else:
                break
    
    def _parse_literal_string(self) -> Optional[Tuple[bytes, int]]:
        """Parse a PDF literal string (parentheses delimited)."""
        if self._peek() != ord('('):
            return None
        
        start = self.pos
        depth = 0
        escaped = False
        
        while self.pos < len(self.content):
            c = self.content[self.pos]
            if escaped:
                escaped = False
            elif c == ord('\\'):
                escaped = True
            elif c == ord('('):
                depth += 1
            elif c == ord(')'):
                depth -= 1
                if depth == 0:
                    self.pos += 1
                    return self.content[start:self.pos], start
            self.pos += 1
        
        return None
    
    def _parse_hex_string(self) -> Optional[Tuple[bytes, int]]:
        """Parse a PDF hex string (angle brackets delimited)."""
        if self._peek() != ord('<'):
            return None
        
        start = self.pos
        self.pos += 1
        
        while self.pos < len(self.content):
            c = self.content[self.pos]
            if c == ord('>'):
                self.pos += 1
                return self.content[start:self.pos], start
            self.pos += 1
        
        return None
    
    def _decode_pdf_string(self, s: bytes) -> str:
        """Decode a PDF string (literal or hex) to Unicode."""
        try:
            if s.startswith(b'(') and s.endswith(b')'):
                # Literal string - handle escapes
                result = []
                i = 1
                while i < len(s) - 1:
                    c = s[i]
                    if c == ord('\\'):
                        i += 1
                        if i >= len(s) - 1:
                            break
                        esc = s[i]
                        if esc in b'01234567':
                            # Octal escape
                            octal = b''
                            while i < len(s) - 1 and s[i] in b'01234567' and len(octal) < 3:
                                octal += bytes([s[i]])
                                i += 1
                            if octal:
                                result.append(chr(int(octal, 8)))
                            continue
                        elif esc == ord('n'):
                            result.append('\n')
                        elif esc == ord('r'):
                            result.append('\r')
                        elif esc == ord('t'):
                            result.append('\t')
                        elif esc == ord('b'):
                            result.append('\b')
                        elif esc == ord('f'):
                            result.append('\f')
                        elif esc == ord('('):
                            result.append('(')
                        elif esc == ord(')'):
                            result.append(')')
                        elif esc == ord('\\'):
                            result.append('\\')
                        elif esc == ord('\n'):
                            pass  # Line continuation
                        else:
                            result.append(chr(esc))
                    else:
                        result.append(chr(c))
                    i += 1
                return ''.join(result)
            
            elif s.startswith(b'<') and s.endswith(b'>'):
                # Hex string
                hex_content = s[1:-1].decode('ascii', errors='ignore')
                hex_content = ''.join(c for c in hex_content if c in '0123456789ABCDEFabcdef')
                if len(hex_content) % 2:
                    hex_content += '0'
                decoded = bytes.fromhex(hex_content)
                # Try UTF-16BE first (common in PDF), then Latin-1
                try:
                    return decoded.decode('utf-16be')
                except:
                    return decoded.decode('latin-1', errors='replace')
        except Exception:
            pass
        
        return f"[binary: {s.hex()[:50]}...]"
    
    def _encode_pdf_string(self, text: str, original: bytes) -> bytes:
        """Encode text back to PDF string format matching original type."""
        if original.startswith(b'('):
            # Literal string - escape special chars
            result = ['(']
            for c in text:
                if c == '(':
                    result.append('\\(')
                elif c == ')':
                    result.append('\\)')
                elif c == '\\':
                    result.append('\\\\')
                elif c == '\n':
                    result.append('\\n')
                elif c == '\r':
                    result.append('\\r')
                elif c == '\t':
                    result.append('\\t')
                elif ord(c) < 32 or ord(c) > 126:
                    result.append(f'\\{ord(c):03o}')
                else:
                    result.append(c)
            result.append(')')
            return ''.join(result).encode('latin-1')
        
        elif original.startswith(b'<'):
            # Hex string - encode as UTF-16BE
            hex_content = text.encode('utf-16be').hex().upper()
            return f'<{hex_content}>'.encode('ascii')
        
        return original
    
    def _get_context(self, pos: int, window: int = 50) -> str:
        """Get surrounding context for identification."""
        start = max(0, pos - window)
        end = min(len(self.content), pos + window)
        context = self.content[start:end]
        # Replace non-printable chars
        context_str = ''
        for b in context:
            if 32 <= b < 127:
                context_str += chr(b)
            else:
                context_str += f'\\x{b:02x}'
        return context_str
    
    def _parse_literal_string_operator(self, page_num: int, object_ref: str):
        """Parse a literal string followed by an operator."""
        start_pos = self.pos
        string_result = self._parse_literal_string()
        if not string_result:
            self.pos = start_pos + 1
            return
        
        raw_bytes, string_start = string_result
        self._skip_whitespace_and_comments()
        
        operator = None
        
        if self._peek() == ord('T') and self._peek(1) == ord('j'):
            operator = "Tj"
            self.pos += 2
        elif self._peek() == ord("'"):
            operator = "'"
            self.pos += 1
        elif self._peek() == ord('"'):
            operator = '"'
            self.pos += 1
        
        if operator:
            text = self._decode_pdf_string(raw_bytes)
            context = self._get_context(start_pos)
            self.operands.append(TextOperand(
                page_num=page_num,
                object_ref=object_ref,
                operator=operator,
                text=text,
                raw_bytes=raw_bytes,
                operand_index=0,
                byte_offset=string_start,
                context=context
            ))
    
    def _parse_hex_string_operator(self, page_num: int, object_ref: str):
        """Parse a hex string followed by an operator."""
        start_pos = self.pos
        string_result = self._parse_hex_string()
        if not string_result:
            self.pos = start_pos + 1
            return
        
        raw_bytes, string_start = string_result
        self._skip_whitespace_and_comments()
        
        operator = None
        
        if self._peek() == ord('T') and self._peek(1) == ord('j'):
            operator = "Tj"
            self.pos += 2
        elif self._peek() == ord("'"):
            operator = "'"
            self.pos += 1
        elif self._peek() == ord('"'):
            operator = '"'
            self.pos += 1
        
        if operator:
            text = self._decode_pdf_string(raw_bytes)
            context = self._get_context(start_pos)
            self.operands.append(TextOperand(
                page_num=page_num,
                object_ref=object_ref,
                operator=operator,
                text=text,
                raw_bytes=raw_bytes,
                operand_index=0,
                byte_offset=string_start,
                context=context
            ))
    
    def _parse_tj_array(self, page_num: int, object_ref: str):
        """Parse a TJ array [ (string1) num1 (string2) num2 ... ] TJ."""
        start_pos = self.pos
        
        if self._peek() != ord('['):
            return
        
        self.pos += 1
        operand_index = 0
        
        while self.pos < len(self.content):
            self._skip_whitespace_and_comments()
            
            if self.pos >= len(self.content):
                break
            
            if self._peek() == ord(']'):
                self.pos += 1
                self._skip_whitespace_and_comments()
                
                # Check for TJ operator
                if self._peek() == ord('T') and self._peek(1) == ord('J'):
                    self.pos += 2
                return
            
            if self._peek() == ord('('):
                string_result = self._parse_literal_string()
                if string_result:
                    raw_bytes, string_start = string_result
                    text = self._decode_pdf_string(raw_bytes)
                    context = self._get_context(start_pos)
                    self.operands.append(TextOperand(
                        page_num=page_num,
                        object_ref=object_ref,
                        operator="TJ",
                        text=text,
                        raw_bytes=raw_bytes,
                        operand_index=operand_index,
                        byte_offset=string_start,
                        context=context
                    ))
                    operand_index += 1
            elif self._peek() == ord('<'):
                string_result = self._parse_hex_string()
                if string_result:
                    raw_bytes, string_start = string_result
                    text = self._decode_pdf_string(raw_bytes)
                    context = self._get_context(start_pos)
                    self.operands.append(TextOperand(
                        page_num=page_num,
                        object_ref=object_ref,
                        operator="TJ",
                        text=text,
                        raw_bytes=raw_bytes,
                        operand_index=operand_index,
                        byte_offset=string_start,
                        context=context
                    ))
                    operand_index += 1
            else:
                self.pos += 1


class PDFGlyphEditor:
    """Main class for editing PDF glyphs at the operand level."""
    
    def __init__(self, pdf_path: Union[str, Path]):
        self.pdf_path = Path(pdf_path)
        self.pdf = None
        self.operands: List[TextOperand] = []
    
    def open(self):
        """Open the PDF file."""
        self.pdf = pikepdf.open(self.pdf_path)
        return self
    
    def close(self):
        """Close the PDF file."""
        if self.pdf:
            self.pdf.close()
            self.pdf = None
    
    def __enter__(self):
        return self.open()
    
    def __exit__(self, *args):
        self.close()
    
    def extract_operands(self, page_numbers: Optional[List[int]] = None) -> List[TextOperand]:
        """Extract all text operands from the PDF."""
        self.operands = []
        
        pages_to_process = page_numbers if page_numbers else range(1, len(self.pdf.pages) + 1)
        
        for page_num in pages_to_process:
            if page_num < 1 or page_num > len(self.pdf.pages):
                continue
            
            page = self.pdf.pages[page_num - 1]
            
            # Get content streams
            if "/Contents" in page:
                contents = page["/Contents"]
                
                if hasattr(contents, '__iter__') and not isinstance(contents, pikepdf.Stream):
                    # Array of content streams
                    for i, stream_ref in enumerate(contents):
                        if isinstance(stream_ref, pikepdf.Stream):
                            content_data = stream_ref.read_bytes()  # Decompressed
                            parser = PDFContentParser(content_data)
                            object_ref = f"Page{page_num}/Contents[{i}]"
                            operands = parser.parse(page_num, object_ref)
                            self.operands.extend(operands)
                elif isinstance(contents, pikepdf.Stream):
                    # Single content stream
                    content_data = contents.read_bytes()  # Decompressed
                    parser = PDFContentParser(content_data)
                    object_ref = f"Page{page_num}/Contents"
                    operands = parser.parse(page_num, object_ref)
                    self.operands.extend(operands)
            
            # Also check for Form XObjects
            self._extract_from_xobjects(page, page_num)
        
        return self.operands
    
    def _extract_from_xobjects(self, page: pikepdf.Dictionary, page_num: int, depth: int = 0):
        """Recursively extract text from Form XObjects."""
        if depth > 5:  # Limit recursion
            return
        
        if "/Resources" not in page:
            return
        
        resources = page.Resources
        if "/XObject" not in resources:
            return
        
        xobjects = resources.XObject
        for name, xobj_ref in xobjects.items():
            if isinstance(xobj_ref, pikepdf.Stream):
                xobj = xobj_ref
                if xobj.get("/Subtype") == "/Form":
                    if "/Contents" in xobj:
                        content_data = xobj.read_bytes()  # Decompressed
                        parser = PDFContentParser(content_data)
                        object_ref = f"Page{page_num}/XObject{name}"
                        operands = parser.parse(page_num, object_ref)
                        self.operands.extend(operands)
                    
                    # Recursively check nested XObjects
                    self._extract_from_xobjects(xobj, page_num, depth + 1)
    
    def edit_operand(self, index: int, new_text: str) -> bool:
        """Edit a text operand by index."""
        if index < 0 or index >= len(self.operands):
            return False
        
        operand = self.operands[index]
        
        # Find and modify the content stream
        page = self.pdf.pages[operand.page_num - 1]
        
        # Get the content stream
        contents = page.get("/Contents")
        if contents is None:
            return False
        
        # Handle array of streams
        if hasattr(contents, '__iter__') and not isinstance(contents, pikepdf.Stream):
            stream_idx = self._get_stream_index_from_ref(operand.object_ref)
            if stream_idx is not None and stream_idx < len(contents):
                stream = contents[stream_idx]
            else:
                return False
        else:
            stream = contents
        
        if not isinstance(stream, pikepdf.Stream):
            return False
        
        # Read current content (decompressed)
        content_data = stream.read_bytes()
        
        # Create parser to encode new text
        parser = PDFContentParser(content_data)
        new_bytes = parser._encode_pdf_string(new_text, operand.raw_bytes)
        
        # Find and replace the operand in the content
        modified_content = self._replace_operand_in_content(
            content_data, operand, new_bytes
        )
        
        if modified_content is None:
            return False
        
        # Write modified content back (pikepdf handles recompression)
        stream.write(modified_content)
        
        # Update our local copy
        operand.text = new_text
        operand.raw_bytes = new_bytes
        
        return True
    
    def _get_stream_index_from_ref(self, object_ref: str) -> Optional[int]:
        """Extract stream index from object reference string."""
        match = re.search(r'Contents\[(\d+)\]', object_ref)
        if match:
            return int(match.group(1))
        return None
    
    def _replace_operand_in_content(
        self, 
        content: bytes, 
        operand: TextOperand, 
        new_bytes: bytes
    ) -> Optional[bytes]:
        """Replace an operand in the content stream."""
        raw = operand.raw_bytes
        
        # Search for the raw bytes in content
        pos = content.find(raw)
        if pos == -1:
            # Try to find by context
            return self._replace_by_context(content, operand, new_bytes)
        
        # Count occurrences to find the right one
        occurrence = 0
        target_occurrence = 0
        
        if operand.operator == "TJ":
            # Count strings before this one in the same object
            for op in self.operands:
                if op.object_ref == operand.object_ref and op.byte_offset < operand.byte_offset:
                    occurrence += 1
            target_occurrence = occurrence
        
        # Find the target occurrence
        search_pos = 0
        found_pos = -1
        for _ in range(target_occurrence + 1):
            found_pos = content.find(raw, search_pos)
            if found_pos == -1:
                break
            search_pos = found_pos + len(raw)
        
        if found_pos == -1:
            return self._replace_by_context(content, operand, new_bytes)
        
        # Replace
        return content[:found_pos] + new_bytes + content[found_pos + len(raw):]
    
    def _replace_by_context(
        self, 
        content: bytes, 
        operand: TextOperand, 
        new_bytes: bytes
    ) -> Optional[bytes]:
        """Try to replace using context matching."""
        context = operand.context.encode('latin-1', errors='ignore')
        
        # Find context in content
        ctx_pos = content.find(context)
        if ctx_pos == -1:
            return None
        
        # Within context, find the operand
        raw = operand.raw_bytes
        op_pos = context.find(raw)
        if op_pos == -1:
            return None
        
        # Calculate absolute position
        abs_pos = ctx_pos + op_pos
        
        # Verify
        if content[abs_pos:abs_pos + len(raw)] != raw:
            return None
        
        return content[:abs_pos] + new_bytes + content[abs_pos + len(raw):]
    
    def save(self, output_path: Union[str, Path]):
        """Save the modified PDF."""
        output_path = Path(output_path)
        self.pdf.save(output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PDF Glyph Editor")
    parser.add_argument("pdf", help="Input PDF file")
    parser.add_argument("command", choices=["list", "edit"], help="Command to execute")
    parser.add_argument("-o", "--output", help="Output file path")
    parser.add_argument("--search", help="Search text for filtering")
    parser.add_argument("--index", type=int, help="Operand index to edit")
    parser.add_argument("--text", help="New text for edit command")
    parser.add_argument("--pages", help="Page numbers to process (e.g., 1,3,5 or 1-10)")
    args = parser.parse_args()

    if not Path(args.pdf).exists():
        print(f"Error: File not found: {args.pdf}")
        sys.exit(1)

    page_numbers = None
    if args.pages:
        page_numbers = []
        for part in args.pages.split(','):
            if '-' in part:
                start, end = part.split('-')
                page_numbers.extend(range(int(start), int(end) + 1))
            else:
                page_numbers.append(int(part))

    with PDFGlyphEditor(args.pdf) as editor:
        editor.extract_operands(page_numbers)
        if args.command == "edit":
            if args.index is None or args.text is None or not args.output:
                print("Error: --index, --text, and -o required for edit command")
                sys.exit(1)
            if editor.edit_operand(args.index, args.text):
                editor.save(args.output)
            else:
                print("Edit failed!")
                sys.exit(1)
