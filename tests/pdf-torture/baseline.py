#!/usr/bin/env python3
"""Run the pre-repair native editor against every generated fixture.

This is deliberately a black-box baseline. It records what the current engine
actually does, rather than treating a successful HTTP response as an edit.
Requires the isolated development environment documented in tests/pdf-torture/README.md.
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import fitz
import pikepdf

ROOT = Path(__file__).resolve().parent
FIXTURES = ROOT / "fixtures"
EDITOR = Path(__file__).resolve().parents[2] / "native-edit-service" / "glyph_edit.py"


def classify(pdf_path):
    with pikepdf.open(pdf_path) as pdf:
        has_form = False
        has_image = False
        for page in pdf.pages:
            resources = page.get("/Resources", {})
            xobjects = resources.get("/XObject", {}) if resources else {}
            for _, obj in xobjects.items() if xobjects else []:
                if not isinstance(obj, pikepdf.Stream):
                    continue
                has_form = has_form or obj.get("/Subtype") == "/Form"
                has_image = has_image or obj.get("/Subtype") == "/Image"
        doc = fitz.open(pdf_path)
        text = "\n".join(page.get_text() for page in doc)
        if not text.strip():
            return "IMAGE_ONLY" if has_image else "VECTOR_OR_GRAPHICS_ONLY"
        if has_image:
            return "OCR_OR_MIXED_TEXT_AND_IMAGE"
        if has_form:
            return "FORM_XOBJECT_PRESENT"
        return "NATIVE_TEXT_PRESENT"


def run_edit(input_path, output_path):
    command = [sys.executable, str(EDITOR), "--input", str(input_path), "--output", str(output_path), "--page", "0", "--original", "John Smith", "--new", "Jane Smith", "--match", "contains"]
    completed = subprocess.run(command, capture_output=True, text=True)
    payload = None
    try:
        payload = json.loads(completed.stdout.strip().splitlines()[-1])
    except Exception:
        payload = {"ok": False, "error": (completed.stderr or completed.stdout).strip()}
    return completed.returncode, payload


def main():
    rows = []
    with tempfile.TemporaryDirectory(prefix="justapdf-baseline-") as temp:
        temp = Path(temp)
        for input_path in sorted(FIXTURES.glob("*.pdf")):
            output_path = temp / input_path.name
            row = {"fixture": input_path.name, "open": False, "classification": None, "edit": False, "save": False, "reopen": False, "old_text_present": None, "new_text_present": None, "mode": None, "capability": None, "error": None}
            try:
                source = fitz.open(input_path)
                row["open"] = True
                row["page_count"] = source.page_count
                source.close()
                row["classification"] = classify(input_path)
                rc, payload = run_edit(input_path, output_path)
                row["edit"] = bool(payload.get("ok"))
                row["mode"] = payload.get("mode")
                row["capability"] = payload.get("capability")
                row["error"] = payload.get("error")
                row["save"] = output_path.exists()
                if output_path.exists():
                    reopened = fitz.open(output_path)
                    row["reopen"] = True
                    text = "\n".join(page.get_text() for page in reopened)
                    row["old_text_present"] = "John Smith" in text
                    row["new_text_present"] = "Jane Smith" in text
                    reopened.close()
            except Exception as exc:
                row["error"] = f"{type(exc).__name__}: {exc}"
            rows.append(row)
    print(json.dumps(rows, indent=2))


if __name__ == "__main__":
    main()
