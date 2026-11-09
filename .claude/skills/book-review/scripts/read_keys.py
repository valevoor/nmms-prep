"""Reads a printed answer key (a table of question numbers and letters) into a source's keys.json.

  python3 .claude/skills/book-review/scripts/read_keys.py <source-id> <name>=<pdf-pages> [<name>=<pdf-pages> …] [--count name=N]

<name> is the value a section's key.by field picks (e.g. a subject), or "all" for a paper with one key.
<pdf-pages> is a page or range, such as 197 or 296-297, in source.json's "keyPdf" (if the key is a separate file) or "pdf".
It finds every "number letter" pair (e.g. "17 C") on those pages, so it suits key tables, not keys printed beside
each solution. It refuses to write a key with gaps; check the result against the page image either way.
"""
import json, os, re, subprocess, sys

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(SKILL)))
args = sys.argv[1:]
counts = {}
while '--count' in args:
    i = args.index('--count'); k, v = args[i + 1].split('='); counts[k] = int(v); del args[i:i + 2]
if len(args) < 2:
    sys.exit(__doc__)
SID = args[0]
src_dir = os.path.join(SKILL, 'sources', SID)
src = json.load(open(os.path.join(src_dir, 'source.json')))
pdf = os.path.join(REPO, src.get('keyPdf', src['pdf']))  # a key published separately has its own PDF
keys_path = os.path.join(src_dir, 'keys.json')
keys = json.load(open(keys_path)) if os.path.exists(keys_path) else {'_about': 'Printed answer keys, one letter per question in order, read by scripts/read_keys.py from the PDF pages given.'}

ok = True
for spec in args[1:]:
    name, pages = spec.split('=')
    text = subprocess.run(['swift', os.path.join(SKILL, 'scripts', 'pdf_pages.swift'), 'text', pdf, pages],
                          capture_output=True, text=True, check=True).stdout
    found = {}
    for n, letter in re.findall(r'(?<![\d.])(\d{1,3})\s*[.)]?\s+\(?([A-D])\)?(?![A-Za-z])', text):
        found.setdefault(int(n), letter)
    last = counts.get(name, max(found) if found else 0)
    gaps = [i for i in range(1, last + 1) if i not in found]
    print(f'{name}: {len(found)} answers on PDF pages {pages}, questions 1–{last}' + (f', missing {gaps}' if gaps else ''))
    if gaps or not found:
        ok = False
        continue
    keys[name] = {'pdfPage': pages, 'keys': ''.join(found[i] for i in range(1, last + 1))}

if ok:
    json.dump(keys, open(keys_path, 'w'), indent=1)
    print(keys_path)
else:
    sys.exit('not written: fill the gaps by hand from the page image, or give --count if the key runs past the last question')
