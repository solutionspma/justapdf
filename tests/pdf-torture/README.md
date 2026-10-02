# JustaPDF PDF torture lab

`generate.mjs` creates the reproducible 31-fixture corpus in `fixtures/`.
The fixtures are test inputs, not claims that every named PDF structure is
already supported by the generator.

After regenerating the JavaScript corpus, run
`generate-form-fixtures.py` with the isolated Python environment to replace
the Form XObject/reused-form fixtures with genuine page/Form stream inputs.

For local independent validation, use an isolated environment outside the
repository (the current session uses `/private/tmp/justapdf-pdf-venv`):

```sh
/private/tmp/justapdf-pdf-venv/bin/python3 tests/pdf-torture/baseline.py > /private/tmp/justapdf-baseline.json
```

The baseline runner reopens output with PyMuPDF and inspects source structure
with pikepdf. It is intentionally separate from JustaPDF’s browser renderer.
