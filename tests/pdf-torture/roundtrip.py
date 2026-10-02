#!/usr/bin/env python3
"""Repeated save/reopen test for the native operand path."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import fitz
import pikepdf

ROOT = Path(__file__).resolve().parents[2]
EDITOR = ROOT / "native-edit-service" / "glyph_edit.py"
SOURCE = ROOT / "tests" / "pdf-torture" / "fixtures" / "01-simple-helvetica.pdf"


def main():
    with tempfile.TemporaryDirectory(prefix="justapdf-roundtrip-") as directory:
        current = Path(directory) / "round-0.pdf"
        current.write_bytes(SOURCE.read_bytes())
        history = []
        old, new = "John Smith", "Jane Smith"
        for iteration in range(1, 31):
            output = Path(directory) / f"round-{iteration}.pdf"
            result = subprocess.run([sys.executable, str(EDITOR), "--input", str(current), "--output", str(output), "--page", "0", "--original", old, "--new", new, "--match", "contains"], capture_output=True, text=True)
            payload = json.loads(result.stdout.strip().splitlines()[-1])
            if not payload.get("ok"):
                raise RuntimeError(f"iteration {iteration}: {payload}")
            with pikepdf.open(output) as pdf:
                page_count = len(pdf.pages)
            document = fitz.open(output)
            text = document[0].get_text()
            document.close()
            if page_count != 1 or new not in text or old in text:
                raise RuntimeError(f"iteration {iteration}: page_count={page_count}, text={text!r}")
            history.append({"iteration": iteration, "mode": payload.get("mode"), "capability": payload.get("capability"), "bytes": output.stat().st_size})
            current = output
            old, new = new, old
        print(json.dumps({"ok": True, "iterations": len(history), "first_bytes": history[0]["bytes"], "last_bytes": history[-1]["bytes"], "history": history}, indent=2))


if __name__ == "__main__":
    main()
