#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

from pdf_glyph_editor import PDFGlyphEditor


def main():
    parser = argparse.ArgumentParser(description="Edit a PDF text operand by matching text.")
    parser.add_argument("--input", required=True, help="Input PDF file")
    parser.add_argument("--output", required=True, help="Output PDF file")
    parser.add_argument("--page", type=int, required=True, help="0-based page index")
    parser.add_argument("--original", help="Original text to match")
    parser.add_argument("--new", required=True, help="New replacement text")
    parser.add_argument("--match", choices=["exact", "contains"], default="exact")
    parser.add_argument("--index", type=int, help="Operand index to edit directly")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(json.dumps({"ok": False, "error": "Input file not found"}))
        sys.exit(1)

    page_num = args.page + 1

    with PDFGlyphEditor(str(input_path)) as editor:
        editor.extract_operands([page_num])
        target = None
        index = None

        if args.index is not None:
            if args.index < 0 or args.index >= len(editor.operands):
                print(json.dumps({"ok": False, "error": "Operand index out of range"}))
                sys.exit(2)
            index = args.index
            target = editor.operands[index]
        else:
            original = args.original or ""
            if not original:
                print(json.dumps({"ok": False, "error": "Original text required when no index provided"}))
                sys.exit(2)
            if args.match == "exact":
                candidates = [op for op in editor.operands if op.text == original]
            else:
                candidates = [op for op in editor.operands if original in op.text]

            if not candidates:
                print(json.dumps({"ok": False, "error": "No matching operands"}))
                sys.exit(2)

            target = candidates[0]
            index = editor.operands.index(target)

        ok = editor.edit_operand(index, args.new)
        if not ok:
            print(json.dumps({"ok": False, "error": "Failed to edit operand"}))
            sys.exit(3)

        editor.save(str(output_path))
        # Re-open the saved file before reporting success. This catches broken
        # stream/xref output at the engine boundary instead of returning bytes
        # that only existed in memory.
        with PDFGlyphEditor(str(output_path)) as validation_editor:
            validation_editor.extract_operands([page_num])
        print(json.dumps({
            "ok": True,
            "mode": "native-direct",
            "capability": "native-direct",
            "index": index,
            "operator": target.operator,
            "matched": target.text
        }))


if __name__ == "__main__":
    main()
