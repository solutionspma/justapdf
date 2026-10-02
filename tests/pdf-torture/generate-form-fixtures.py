#!/usr/bin/env python3
"""Create real page/Form-XObject source fixtures with pikepdf."""
from pathlib import Path
import pikepdf

ROOT = Path(__file__).resolve().parent / "fixtures"
source = ROOT / "31-create-from-scratch.pdf"


def form(pdf, text, resources, nested=None):
    content = b"BT\n/F0 14 Tf\n1 0 0 1 20 100 Tm\n" + text.encode("latin-1") + b" Tj\nET\n"
    if nested is not None:
        content = b"q\n/FN Do\nQ\n"
        resources = pikepdf.Dictionary(Font=resources.Font, XObject=pikepdf.Dictionary(FN=nested))
    return pikepdf.Stream(pdf, content, Type=pikepdf.Name.XObject, Subtype=pikepdf.Name.Form, FormType=1, BBox=[0, 0, 300, 200], Resources=resources)


with pikepdf.open(source) as pdf:
    page = pdf.pages[0]
    font = page.Resources.Font
    resources = pikepdf.Dictionary(Font=pikepdf.Dictionary(F0=next(iter(font.items()))[1]))
    inner = form(pdf, "(Nested form John Smith)", resources)
    outer = form(pdf, "", resources, nested=inner)
    page.Resources = pikepdf.Dictionary(Font=resources.Font, XObject=pikepdf.Dictionary(Fm0=outer))
    page.Contents = pikepdf.Stream(pdf, b"q\n1 0 0 1 80 300 cm\n/Fm0 Do\nQ\n")
    pdf.save(ROOT / "14-form-xobject-text.pdf")

with pikepdf.open(source) as pdf:
    page = pdf.pages[0]
    font = page.Resources.Font
    resources = pikepdf.Dictionary(Font=pikepdf.Dictionary(F0=next(iter(font.items()))[1]))
    inner = form(pdf, "(Nested form John Smith)", resources)
    outer = form(pdf, "", resources, nested=inner)
    page.Resources = pikepdf.Dictionary(Font=resources.Font, XObject=pikepdf.Dictionary(Fm0=outer))
    page.Contents = pikepdf.Stream(pdf, b"q\n1 0 0 1 80 300 cm\n/Fm0 Do\nQ\n")
    pdf.save(ROOT / "15-nested-form-xobject.pdf")

with pikepdf.open(source) as pdf:
    page = pdf.pages[0]
    font = page.Resources.Font
    resources = pikepdf.Dictionary(Font=pikepdf.Dictionary(F0=next(iter(font.items()))[1]))
    shared = form(pdf, "(Shared form John Smith)", resources)
    page.Resources = pikepdf.Dictionary(Font=resources.Font, XObject=pikepdf.Dictionary(Fm0=shared))
    page.Contents = pikepdf.Stream(pdf, b"q\n1 0 0 1 40 300 cm\n/Fm0 Do\nQ\nq\n1 0 0 1 300 300 cm\n/Fm0 Do\nQ\n")
    pdf.save(ROOT / "27-repeated-form-xobject.pdf")
