"""Builds the errata report for one source from .book-review/<source-id>/findings.json (made by collect.py):
  answer-check.html   the web page, to publish with the Artifact tool
  <pdfFile>           an A4 PDF, printed by headless Chrome (set CHROME if it isn't in the usual macOS place)

The report's words (title, introduction, method, footer) come from sources/<source-id>/source.json.
Run from the project root:  python3 .claude/skills/book-review/scripts/report.py <source-id> [--date "November 2026"]
"""
import json, os, subprocess, html, sys, datetime

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(os.path.dirname(os.path.dirname(SKILL)))
args = sys.argv[1:]
date = datetime.date.today().strftime('%B %Y')
if '--date' in args:
    i = args.index('--date'); date = args[i + 1]; del args[i:i + 2]
if not args:
    sys.exit('usage: report.py <source-id> [--date "Month YYYY"]')
SID = args[0]
src = json.load(open(os.path.join(SKILL, 'sources', SID, 'source.json')))
OUT = os.path.join(REPO, '.book-review', SID)
found = json.load(open(os.path.join(OUT, 'findings.json')))
data, CHECKED = found['findings'], found['checked']
SECTIONS = list(CHECKED)
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
e = html.escape

CATS = [('wrong', 'Wrong key'), ('unclear', 'No single answer'), ('missing', 'Key missing'), ('debatable', 'Debatable'), ('misprint', 'Misprint')]
CATNAME = dict(CATS)
LEGEND = {'wrong': 'The key’s answer is wrong. The correct option is given, with the working.',
          'unclear': 'Two options are right, none is, or the question or figure can’t be read as printed. The question needs rewording.',
          'missing': 'The key gives no answer. A worked answer is given.',
          'debatable': 'The key can be defended, but another option fits better, or the fact behind it is disputed or out of date.',
          'misprint': 'A typo, a mislabelled option, a mismatch between language versions or a repeated question. The key’s answer stands.'}

# words shared by the web page and the PDF
offset = src.get('pageOffset', 0)
method = list(src.get('method', []))
if offset:
    method.append(['Page numbers.', f'Each finding gives the printed page number, with the PDF page in brackets. The PDF page is always {offset} more than the printed page.'])
method_html = ''.join(f'<li><strong>{e(t)}</strong> {e(x)}</li>' for t, x in method)
pagenote = '<span>Page numbers are the printed page numbers</span>' if offset else ''
total = sum(CHECKED.values())

# ---- web page ----
page = open(os.path.join(SKILL, 'assets', 'page.html')).read()
for k, v in {'__TITLE__': e(src['reportTitle']), '__SOURCE__': e(src['title']), '__HEADING__': e(src['heading']),
             '__INTRO__': e(src['intro']), '__DATE__': e(date), '__PAGENOTE__': pagenote, '__METHOD__': method_html,
             '__FOOTER__': e(src.get('footer', '')),
             '__DATA__': json.dumps(found, ensure_ascii=False).replace('</', '<\\/')}.items():
    page = page.replace(k, v)
web = os.path.join(OUT, 'answer-check.html')
open(web, 'w').write(page)
print(web)

# ---- PDF ----
def keys(f):
    if f['cat'] == 'misprint' or (f['book'] and f['book'] == f['correct']):
        return f'Key <b>{e(f["book"])}</b> stands' if f['book'] else ''
    parts = []
    if f['book']: parts.append(f'Printed key <b>{e(f["book"])}</b>')
    if f['correct'] and f['correct'] != '—':
        parts.append(('Better fit ' if f['cat'] == 'debatable' else 'Correct ') + f'<b>{e(f["correct"])}</b>')
    return ' → '.join(parts)

def where(f):
    if f.get('pdf') is None: return ''
    return f'p. {f["printed"]} (PDF {f["pdf"]})' if f['printed'] != f['pdf'] else f'p. {f["pdf"]}'

rows = ''.join(f'<tr><th>{e(s)}</th><td>{CHECKED[s]:,}</td>' +
               ''.join(f'<td>{sum(1 for f in data if f["section"] == s and f["cat"] == c)}</td>' for c, _ in CATS) + '</tr>'
               for s in SECTIONS)
foot = ''.join(f'<td>{sum(1 for f in data if f["cat"] == c)}</td>' for c, _ in CATS)
legend = ''.join(f'<div><span class="pill c-{c}">{n}</span><p>{LEGEND[c]}</p></div>' for c, n in CATS)

body, sec, chap = '', None, None
for f in data:
    if f['section'] != sec:
        if chap is not None: body += '</div>'
        if sec is not None: body += '</section>'
        sec, chap = f['section'], None
        body += f'<section class="sec"><h2>{e(sec)}</h2>'
    if f['chapter'] != chap:
        if chap is not None: body += '</div>'
        chap = f['chapter']
        body += f'<div class="chap"><h3>{e(chap)}</h3>'
    body += (f'<div class="item"><div class="where"><span class="q">Q{e(str(f["q"]))}</span><span class="pg">{where(f)}</span></div>'
             f'<div class="main"><div class="tags"><span class="pill c-{f["cat"]}">{CATNAME[f["cat"]]}</span>'
             f'<span class="keys">{keys(f)}</span></div><p>{e(f["text"])}</p></div></div>')
if data:
    body += '</div></section>'

foot_line = e(f'{src["title"]} · Answer check, {date}').replace('"', '\\"')
pdf_html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{e(src["reportTitle"])}</title>
<style>
@page {{ size: A4; margin: 18mm 16mm;
  @bottom-left {{ content: "{foot_line}"; font: 8pt Helvetica, Arial, sans-serif; color: #6b7280; }}
  @bottom-right {{ content: "Page " counter(page) " of " counter(pages); font: 8pt Helvetica, Arial, sans-serif; color: #6b7280; }} }}
:root {{ --ink:#1b2330; --muted:#5b6474; --rule:#d9dde6; }}
/* the system font stack covers Indian scripts on macOS (Kannada Sangam MN, Tamil Sangam MN, Kohinoor…) */
body {{ font: 9.6pt/1.45 "Helvetica Neue", Helvetica, Arial, sans-serif; color: var(--ink); margin: 0; }}
h1, h2, h3 {{ font-family: Georgia, "Times New Roman", serif; margin: 0; }}
h1 {{ font-size: 22pt; line-height: 1.15; margin: 4pt 0 10pt; }}
h2 {{ font-size: 14pt; margin: 18pt 0 8pt; break-after: avoid; }}
h3 {{ font-size: 11pt; font-weight: normal; padding-bottom: 3pt; border-bottom: .8pt solid var(--ink); margin: 12pt 0 0; break-after: avoid; }}
p {{ margin: 0 0 6pt; }}
.eyebrow {{ font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 600; }}
.meta {{ color: var(--muted); font-size: 8.5pt; margin-bottom: 8pt; }}
table {{ border-collapse: collapse; width: 100%; font-size: 9pt; margin: 4pt 0 6pt; }}
th, td {{ border-bottom: .6pt solid var(--rule); padding: 4pt 6pt; text-align: right; }}
th:first-child {{ text-align: left; font-weight: 500; }}
thead th {{ font-size: 7.8pt; color: var(--muted); font-weight: 600; vertical-align: bottom; }}
thead th:first-child {{ text-align: left; }}
tfoot td {{ font-weight: 700; border-top: 1.2pt solid var(--rule); border-bottom: 0; }}
.legend {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6pt 18pt; }}
.legend div p {{ color: var(--muted); font-size: 8.8pt; margin: 2pt 0 0; }}
ul {{ margin: 0; padding-left: 14pt; }} li {{ margin-bottom: 4pt; }}
.pill {{ display: inline-block; font-size: 7pt; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; padding: 2pt 5pt; border-radius: 2pt;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.c-wrong {{ color:#b4233a; background:#fbe9ec; }} .c-unclear {{ color:#9a5b00; background:#fdf1dc; }}
.c-missing {{ color:#2b4c9b; background:#e7edfa; }} .c-misprint {{ color:#5d5a72; background:#eeedf3; }}
.c-debatable {{ color:#146b63; background:#e1f3f0; }}
.front {{ break-after: page; }}
.sec + .sec {{ break-before: page; }}
.sec h2 {{ margin-top: 0; }}
.item {{ display: grid; grid-template-columns: 26mm 1fr; gap: 0 10pt; padding: 6pt 0; border-bottom: .6pt solid var(--rule); break-inside: avoid; }}
.where {{ display: flex; flex-direction: column; }}
.q {{ font: 600 10pt Menlo, "Courier New", monospace; }}
.pg {{ font-size: 7.8pt; color: var(--muted); }}
.tags {{ display: flex; gap: 8pt; align-items: center; margin-bottom: 3pt; }}
.keys {{ font: 8.4pt Menlo, "Courier New", monospace; color: var(--muted); }}
.keys b {{ color: var(--ink); }}
.main p {{ margin: 0; }}
</style></head><body>
<div class="front">
<div class="eyebrow">Errata report · {e(src["title"])}</div>
<h1>{e(src["heading"])}</h1>
<div class="meta">Checked {e(date)} · {total:,} questions checked · {len(data)} findings{" · page numbers are the printed page numbers" if offset else ""}</div>
<p>{e(src["intro"])}</p>
<p>Most questions are fine: the findings cover {round(len(data) / total * 100) if total else 0}% of the questions checked. The ones that matter most for students are the <span class="pill c-wrong">wrong key</span> findings, because a student who works the question correctly will be marked wrong.</p>
<h2 style="margin-top:12pt">Summary</h2>
<table><thead><tr><th>Section</th><th>Questions checked</th>{''.join(f'<th>{n}</th>' for _, n in CATS)}</tr></thead>
<tbody>{rows}</tbody><tfoot><tr><td style="text-align:left">All</td><td>{total:,}</td>{foot}</tr></tfoot></table>
<h2>Kinds of finding</h2>
<div class="legend">{legend}</div>
<h2>How the answers were checked</h2>
<ul>{method_html}</ul>
<p style="margin-top:10pt;color:var(--muted)">{e(src.get("footer", ""))}</p>
</div>
{body}
</body></html>'''

src_html = os.path.join(OUT, 'print.html')
open(src_html, 'w').write(pdf_html)
pdf = os.path.join(OUT, src.get('pdfFile', SID + '-answer-check.pdf'))
subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', 'file://' + src_html],
               check=True, capture_output=True)
print(pdf)
