"""Collects every finding about one question source (a study book or a question paper) into findings.json.

A source is a folder sources/<id>/ in this skill:
  source.json    title, audience, page offset, sections (which data files, how to name chapters, where the key is)
  keys.json      the printed answer key, if the source has one (optional)
  findings.json  findings that are not in the app data: hand-checked entries, rewordings ("replace"), skips (optional)

From the app data, a question gives a finding when it has:
  keyFrom "solved" + a printed key  -> wrong key (the working is its solution, else its note)
  status "needs-review", or a note
  and no answer                     -> no single answer / can't be read (its note says why)
  a note and nothing else           -> misprint (the key stands)
A source with no printed key (key "none") gives no wrong-key findings: every answer there is worked out.

Run from the project root:  python3 .claude/skills/book-review/scripts/collect.py <source-id>
Writes .book-review/<source-id>/findings.json.
"""
import json, glob, re, os, sys
from collections import Counter

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(SKILL)))
if len(sys.argv) < 2:
    sys.exit('usage: collect.py <source-id>   (sources: ' + ', '.join(sorted(os.listdir(os.path.join(SKILL, 'sources')))) + ')')
SID = sys.argv[1]
SRC_DIR = os.path.join(SKILL, 'sources', SID)
src = json.load(open(os.path.join(SRC_DIR, 'source.json')))
def optional(name, default):
    p = os.path.join(SRC_DIR, name)
    return json.load(open(p)) if os.path.exists(p) else default
KEYS = optional('keys.json', {})
EXTRA = optional('findings.json', {'findings': []})['findings']
OFFSET = src.get('pageOffset', 0)
OUT_DIR = os.path.join(REPO, '.book-review', SID)
warn = lambda msg: print('warning: ' + msg, file=sys.stderr)

def clean(t):
    """Rewords an app note for the source's authors: no 'hidden', no 'used here'."""
    t = re.sub(r'^Hidden( until checked)?: ', '', t.strip())
    t = re.sub(r',? and (?:they are|it is|that is) used here', '', t)
    for a, b in [(', so this question is hidden', ''), (' So this question is hidden.', ''),
                 (' This waits for a corrected version.', ''), (', which is used here', ''), (', used here,', ''),
                 (', used here', ''), ('so “only” is added here', 'so the question needs “only”'),
                 ('so "only" is added here', 'so the question needs "only"'),
                 ('so it is left out here', 'so it looks like a stray sign'),
                 ('This follows the book’s Kannada', 'The key fits the book’s Kannada'),
                 ('this follows its Kannada', 'the key fits its Kannada'),
                 ('so the numbers are left out here', 'so they need correcting'),
                 (" (the book's key is ", ' (the key is '), (' (the book’s key is ', ' (the key is ')]:
        t = t.replace(a, b)
    return t if t[:2] in ('i,', 'i ') else t[:1].upper() + t[1:]

NOTE_KEY = re.compile(r"key (?:says|gives|prints|marks|is)\s*\(?([A-D])\b|\(([A-D]),? the (?:book’s |book's )?key\)|key, ([A-D])\b")
def key_in(text):
    m = NOTE_KEY.search(text or '')
    return next(g for g in m.groups() if g) if m else '?'

findings = []
def add(section, chapter, q, pdf, cat, text, book='', correct=''):
    findings.append({'section': section, 'chapter': chapter, 'q': q, 'pdf': pdf,
                     'printed': pdf - OFFSET if isinstance(pdf, int) else None,
                     'cat': cat, 'text': text.strip(), 'book': book, 'correct': correct})

def first_num(s):
    m = re.search(r'\d+', str(s)); return int(m.group()) if m else 0

for sec in src['sections']:
    name, num_field = sec['name'], sec.get('number', 'paperNo')
    chap, key = sec.get('chapter', {}), sec.get('key', {'from': 'none'})
    files = sorted(f for pat in sec['files'] for f in glob.glob(os.path.join(REPO, pat))
                   if not re.search(r'\.(kn|meta)\.json$', f))  # skip translations and Learn pages
    for f in files:
        d = json.load(open(f))
        for q in d.get('questions', []):
            if any(q.get(k) not in v for k, v in sec.get('where', {}).items()):
                continue
            no = q.get(num_field)
            label = q.get(chap['field'], d.get(chap['field'])) if 'field' in chap else None
            chapter = chap.get('names', {}).get(label, label) if label else chap.get('fixed', name)
            note, ans, pdf = q.get('note') or '', q.get('answer') or '', q.get('sourcePage')
            printed = None
            if key.get('from') == 'printed':
                k = KEYS.get(q.get(key['by']) if key.get('by') else 'all', {}).get('keys', '')
                printed = k[no - 1] if isinstance(no, int) and 0 < no <= len(k) else '?'
                if q.get('keyFrom') == 'book' and ans and ans != printed:
                    warn(f'{name} Q{no} ({q.get("id")}) says keyFrom "book", but its answer {ans} is not the printed key {printed}')
            if q.get('keyFrom') == 'solved' and key.get('from') != 'none':
                if 'solution' in q:
                    sol = q['solution']
                    concept = re.sub(r'^(\d+(\.\d+)* |Old syllabus – [^:]+: |Beyond the syllabus: )', '', sol.get('concept', ''))
                    text = (concept[:1].upper() + concept[1:] + '. ' if concept else '') + ' '.join(s.rstrip('.') + '.' for s in sol.get('steps', []))
                    text = re.sub(r'[;,]? *[Tt]he book’s key gives [^.;]*', '', text)
                    text = re.sub(r' *\.\.', '.', text).strip('; ')
                    text = (clean(note) + ' ' if note else '') + text
                else:
                    # the report shows the printed key beside the text, so a sentence naming it is dropped
                    text = clean(re.sub(r' *[Tt]he book’s key (?:gives|is) [^.]*\.', '', note) if printed else note) if note else ''
                bk = printed or key_in(note)
                if bk == ans:
                    continue  # the key was missing or unreadable, and the worked answer agrees with it
                add(name, chapter, no, pdf, 'wrong', text, bk, ans)
            elif q.get('status') == 'needs-review' or (note and not ans):
                add(name, chapter, no, pdf, 'unclear', clean(note), printed or ans or '—', '—')
            elif note:
                add(name, chapter, no, pdf, 'misprint', clean(note), printed or ans, ans)

# findings.json of the source: skips, rewordings, hand-checked entries.
# A "pending" entry gives way once the app data has its own finding for any of its questions.
from_data = {(f['section'], first_num(f['q'])) for f in findings}
stale = Counter()
for e in EXTRA:
    match = lambda f: f['section'] == e['section'] and f['chapter'] == e['chapter'] and str(f['q']) == str(e['q'])
    if e.get('skip') or e.get('replace'):
        if not any(match(f) for f in findings):
            warn(f"nothing to {'skip' if e.get('skip') else 'replace'} for {e['section']} {e['chapter']} Q{e['q']}")
        findings[:] = [f for f in findings if not match(f)]
        if e.get('skip'):
            continue
    elif e.get('pending') and any((e['section'], int(n)) in from_data for n in re.findall(r'\d+', str(e['q']))):
        stale[e['section']] += 1
        continue
    add(e['section'], e['chapter'], e['q'], e.get('pdf'), e['cat'], e['text'], e.get('book', ''), e.get('correct', ''))
for s, n in stale.items():
    print(f'note: {n} pending {s} entries in sources/{SID}/findings.json now have a finding in the app data and were skipped; delete them', file=sys.stderr)
for f in findings:
    if f['book'] == '?':
        warn(f"no book key for {f['section']} {f['chapter']} Q{f['q']}: name it in the note or add the source's keys.json")
    if not f['text']:
        warn(f"{f['section']} {f['chapter']} Q{f['q']} has no explanation")

# order: section, then chapter (by its number if it has one, else first seen), then question
first_seen = {}
for f in findings:
    first_seen.setdefault((f['section'], f['chapter']), len(first_seen))
names = [s['name'] for s in src['sections']]
def chap_order(f):
    m = re.match(r'(?:Ch\.? )?(\d+)\b', f['chapter'])
    return (0, int(m.group(1))) if m else (1, first_seen[(f['section'], f['chapter'])])
findings.sort(key=lambda f: (names.index(f['section']), chap_order(f), first_num(f['q'])))

checked = {s['name']: s['checked'] for s in src['sections']}
os.makedirs(OUT_DIR, exist_ok=True)
out = os.path.join(OUT_DIR, 'findings.json')
json.dump({'source': SID, 'checked': checked, 'findings': findings}, open(out, 'w'), ensure_ascii=False, indent=1)
print(out)
print(f'{sum(checked.values())} questions checked, {len(findings)} findings')
for (s, c), n in sorted(Counter((f['section'], f['cat']) for f in findings).items(), key=lambda x: (names.index(x[0][0]), x[0][1])):
    print(f'  {s:20} {c:10} {n}')
