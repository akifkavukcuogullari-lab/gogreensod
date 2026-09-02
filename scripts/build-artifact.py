#!/usr/bin/env python3
"""Bundle index.html and assets/img into one self-contained HTML file.

Used to publish the page where external image requests are blocked. Reads
compressed copies from build/img if present, otherwise assets/img.
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "build" / "gogreensod.html"

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:'
    'opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:'
    'wght@400;500;600&display=swap" rel="stylesheet">\n'
)


def inline(match):
    rel = match.group(1)
    for base in (ROOT / "build", ROOT):
        path = base / rel.replace("assets/", "") if base.name == "build" else base / rel
        if path.exists():
            data = base64.b64encode(path.read_bytes()).decode()
            return 'src="data:image/jpeg;base64,%s"' % data
    raise SystemExit("missing image: %s" % rel)


def main():
    src = (ROOT / "index.html").read_text()
    style = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
    body, count = re.subn(r'src="(assets/img/[^"]+)"', inline, body)

    page = "<title>Go Green Sod</title>\n%s<style>\n%s\n</style>\n%s" % (FONTS, style, body)
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(page)
    print("inlined %d images -> %s (%.2f MB)" % (count, OUT, len(page.encode()) / 1048576))


if __name__ == "__main__":
    main()
