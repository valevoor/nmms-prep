// Claude Code hook (PostToolUse on Edit/Write): after an edit to a MAT or SAT screen, names its counterpart,
// so a UI change is made on both sides. app/src/parity.test.tsx is the check that enforces it.
// Reads the hook's JSON on stdin; prints nothing for other files.

const PAIRS = {
  'app/src/pages/Chapter.tsx': 'app/src/pages/SatTopic.tsx (the SAT topic page)',
  'app/src/pages/SatTopic.tsx': 'app/src/pages/Chapter.tsx (the MAT chapter page)',
  'app/src/pages/Practice.tsx': 'app/src/pages/SatQuestions.tsx (the SAT question card)',
  'app/src/components/Options.tsx': 'app/src/pages/SatQuestions.tsx (the SAT question card)',
  'app/src/components/QuestionStem.tsx': 'app/src/pages/SatQuestions.tsx (the SAT question card)',
  'app/src/pages/SatQuestions.tsx': 'app/src/pages/Practice.tsx, components/QuestionStem.tsx and components/Options.tsx (the MAT question card)',
  'app/src/pages/Home.tsx': 'the other tab in the same file: ChapterRow ↔ SatRow, the MAT hero ↔ SatHome',
}

let input = ''
for await (const chunk of process.stdin) input += chunk
const path = JSON.parse(input).tool_input?.file_path ?? ''
const key = Object.keys(PAIRS).find((k) => path.endsWith(k))
if (key) {
  const text =
    `MAT/SAT parity: ${key} has a counterpart: ${PAIRS[key]}. Make the same UI change there, or, if the difference is ` +
    `intended, add the class to matOnly/satOnly in app/src/parity.test.tsx with the reason. npm test fails on any unlisted difference.`
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } }))
}
