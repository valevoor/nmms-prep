---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: #FFFFFF
color: #4B4B4B
style: |
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

  section {
    font-family: 'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif;
    padding: 40px 55px;
    background-color: #FFFFFF;
    color: #4B4B4B;
  }

  /* Colour palette */
  :root {
    --color-green: #58CC02;
    --color-green-dark: #46A302;
    --color-blue: #1CB0F6;
    --color-blue-dark: #1899D6;
    --color-yellow: #FFC800;
    --color-yellow-dark: #E5A500;
    --color-orange: #FF9600;
    --color-orange-dark: #CC7800;
    --color-purple: #CE82FF;
    --color-purple-dark: #A555DE;
    --color-red: #FF4B4B;
    --color-red-dark: #EA2B2B;
    --color-gray: #E5E5E5;
    --color-gray-dark: #AFAFAF;
    --color-charcoal: #4B4B4B;
  }

  h1 {
    font-size: 2.3rem;
    font-weight: 900;
    color: #58CC02;
    margin-bottom: 0.2rem;
  }

  h2 {
    font-size: 1.85rem;
    font-weight: 800;
    color: #1CB0F6;
    margin-top: 0;
    margin-bottom: 24px;
    display: inline-block;
    padding-bottom: 6px;
    border-bottom: 4px solid #E5E5E5;
    width: 100%;
  }

  p, ul, ol {
    font-size: 1.15rem;
  }

  p, li {
    line-height: 1.5;
    font-weight: 700;
    color: #4B4B4B;
  }

  /* Cards (raised look from the thicker bottom border) */
  .card {
    background: #FFFFFF;
    border: 2.5px solid #E5E5E5;
    border-bottom: 6px solid #E5E5E5;
    border-radius: 20px;
    padding: 18px 24px;
    margin: 10px 0;
  }

  .card-green {
    background: #EAF9DE;
    border: 2.5px solid #58CC02;
    border-bottom: 6px solid #46A302;
    border-radius: 20px;
    padding: 16px 22px;
  }

  .card-blue {
    background: #E5F6FD;
    border: 2.5px solid #1CB0F6;
    border-bottom: 6px solid #1899D6;
    border-radius: 20px;
    padding: 16px 22px;
  }

  .card-yellow {
    background: #FFF9E5;
    border: 2.5px solid #FFC800;
    border-bottom: 6px solid #E5A500;
    border-radius: 20px;
    padding: 16px 22px;
  }

  .card-orange {
    background: #FFF4E5;
    border: 2.5px solid #FF9600;
    border-bottom: 6px solid #CC7800;
    border-radius: 20px;
    padding: 16px 22px;
  }

  /* Badges & Tags */
  .badge {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 14px;
    border-radius: 999px;
    margin-right: 8px;
  }
  .badge-green { background: #58CC02; color: #FFFFFF; }
  .badge-blue { background: #1CB0F6; color: #FFFFFF; }
  .badge-yellow { background: #FFC800; color: #7B5200; }
  .badge-orange { background: #FF9600; color: #FFFFFF; }
  .badge-red { background: #FF4B4B; color: #FFFFFF; }

  /* Pill button (raised look from the thicker bottom border) */
  .btn {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 16px;
    font-weight: 800;
    font-size: 1.1rem;
    text-transform: uppercase;
    color: #FFFFFF;
    background: #58CC02;
    border-bottom: 5px solid #46A302;
  }

  /* Grid Layouts */
  .grid-2 {
    display: flex;
    gap: 20px;
  }
  .grid-2 > div {
    flex: 1;
  }
  .grid-3 {
    display: flex;
    gap: 16px;
  }
  .grid-3 > div {
    flex: 1;
  }

  /* Stat numbers */
  .big-stat {
    font-size: 2.3rem;
    font-weight: 900;
    line-height: 1.1;
  }
  .stat-label {
    font-size: 0.95rem;
    font-weight: 800;
    color: #777777;
    text-transform: uppercase;
  }

  /* Custom table for Marp */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 2.5px solid #E5E5E5;
    border-bottom: 5px solid #E5E5E5;
    border-radius: 16px;
    overflow: hidden;
    margin-top: 15px;
  }
  th {
    background: #1CB0F6;
    color: #FFFFFF;
    font-weight: 800;
    padding: 12px 16px;
    text-align: left;
    font-size: 1.05rem;
  }
  td {
    padding: 12px 16px;
    border-bottom: 1.5px solid #F0F0F0;
    background: #FFFFFF;
    font-weight: 700;
    font-size: 1rem;
  }
  tr:last-child td {
    border-bottom: none;
  }

  /* Lead / Title Slide */
  section.title-slide {
    text-align: center;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  /* Helpers. Marp's default HTML mode (used by the VS Code preview) strips
     inline style="" attributes, so every style must be a class here. */
  .center { text-align: center; }
  .mt-0 { margin-top: 0; }
  .mt-s { margin-top: 5px; }
  .mt-m { margin-top: 15px; }
  .mt-l { margin-top: 20px; }
  .c-green { color: #46A302 !important; }
  .c-blue { color: #1899D6 !important; }
  .c-orange { color: #CC7800 !important; }
  .c-red { color: #FF4B4B !important; }
  .c-charcoal { color: #4B4B4B !important; }
  .emoji-lg { font-size: 40px; }
  .card-title { margin: 0 0 8px 0; }
  .card-sub { margin: 10px 0 6px 0; }
  .list { padding-left: 20px; margin: 0; font-size: 24px; }
  .list-sm { font-size: 21px; }
  .text-24 { font-size: 24px; margin: 0 0 8px 0; }
  .note { font-size: 20px; margin: 8px 0 0 0; }
  .note-0 { font-size: 20px; margin: 0; }
  .border-red { border-left: 6px solid #FF4B4B; }
  .inline-card { display: flex; align-items: center; gap: 15px; margin-top: 20px; }
  .row { display: flex; gap: 15px; margin-bottom: 15px; }
  .row > div { flex: 1; padding: 12px 18px; text-align: center; }
  .pro-tip { margin-top: 10px; font-size: 20px; color: #58CC02; text-align: center; }
  .lines { font-size: 22px; line-height: 1.7; }
  .body-sm { margin: 0; font-size: 22px; }
  .habit-title { font-size: 24px; font-weight: 900; }
  .habit-text { margin: 6px 0 0 0; font-size: 19px; }
  .badge-lg { font-size: 18px; padding: 6px 18px; }
  .btn-row { margin-top: 25px; }
  .btn-blue { background: #1CB0F6; border-bottom-color: #1899D6; }

  /* About Me slides */
  section.top { justify-content: flex-start; }
  .quiz-q { font-size: 26px; margin: 0 0 6px 0; }
  .options { display: flex; gap: 14px; margin-top: 12px; }
  .options > div { flex: 1; text-align: center; padding: 14px 12px; }
  .opt-letter { font-size: 22px; font-weight: 900; color: #AFAFAF; }
  .opt-letter.c-green { color: #46A302; }
  .opt-letter.c-red { color: #EA2B2B; }
  .card-red { background: #FFECEC; border: 2.5px solid #FF4B4B; border-bottom: 6px solid #EA2B2B; border-radius: 20px; }
  .opt-text { margin: 6px 0 0 0; font-size: 20px; }
  .journey { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  .journey > div { flex: 1; text-align: center; padding: 14px 16px; }
  .journey > .arrow { flex: 0 0 auto; padding: 0; font-size: 36px; font-weight: 900; color: #AFAFAF; }
  .nowrap { white-space: nowrap; }
  .logo-box { height: 60px; display: flex; align-items: center; justify-content: center; gap: 14px; }
  .logo { height: 34px; width: auto; }
  .logos .logo { height: 28px; }
  .big-quote { font-size: 26px; font-weight: 900; line-height: 1.35; margin: 0; }
---

<!-- _class: title-slide -->

<span class="badge badge-green badge-lg">⚡ Class 8 Mission Quest</span>

# NMMS Supercharge! 🚀
### National Means-cum-Merit Scholarship Examination

<div class="btn-row">
  <span class="btn">Ready to Level Up Your Future! 🔥</span>
</div>

<!-- HIDDEN: slides 2 and 3 (2 Truths & 2 Lies). To restore, remove this wrapper and change each "(_class: top)" back to the _class: top directive comment.
---

(_class: top)

## 👋 Namaskara! I'm Vishwanath Alevoor

<p class="quiz-q">🕵️ <strong>2 Truths & 2 Lies:</strong> Two of these are NOT true. Can you spot both?</p>

<div class="options">
  <div class="card">
    <div class="opt-letter">(A)</div>
    <div class="logo-box"><span class="emoji-lg">🏫</span></div>
    <p class="opt-text">I studied in a <strong>Govt school</strong></p>
  </div>
  <div class="card">
    <div class="opt-letter">(B)</div>
    <div class="logo-box"><span class="emoji-lg">🏏</span></div>
    <p class="opt-text">I was a <strong>state-level cricket player</strong></p>
  </div>
  <div class="card">
    <div class="opt-letter">(C)</div>
    <div class="logo-box"><span class="emoji-lg">🐕</span></div>
    <p class="opt-text">I'm <strong>scared of dogs</strong></p>
  </div>
  <div class="card">
    <div class="opt-letter">(D)</div>
    <div class="logo-box logos"><img class="logo" src="assets/google-logo.svg" alt="Google"><img class="logo" src="assets/amazon-logo.svg" alt="Amazon"></div>
    <p class="opt-text">I worked at <strong>Google</strong> and <strong>Amazon</strong></p>
  </div>
</div>

<div class="card-yellow center mt-m">
  <p class="big-quote">✋ Raise your hand: which <span class="c-red">TWO</span> are the lies?</p>
</div>

---

(_class: top)

## 👋 Namaskara! I'm Vishwanath Alevoor

<p class="quiz-q">🕵️ <strong>2 Truths & 2 Lies:</strong> Two of these are NOT true. Can you spot both?</p>

<div class="options">
  <div class="card-green">
    <div class="opt-letter c-green">(A) ✅ TRUE</div>
    <div class="logo-box"><span class="emoji-lg">🏫</span></div>
    <p class="opt-text">I studied in a <strong>Govt school</strong></p>
  </div>
  <div class="card-red">
    <div class="opt-letter c-red">(B) ❌ LIE!</div>
    <div class="logo-box"><span class="emoji-lg">🏏</span></div>
    <p class="opt-text">I was a <strong>state-level cricket player</strong></p>
  </div>
  <div class="card-red">
    <div class="opt-letter c-red">(C) ❌ LIE!</div>
    <div class="logo-box"><span class="emoji-lg">🐕</span></div>
    <p class="opt-text">I'm <strong>scared of dogs</strong></p>
  </div>
  <div class="card-green">
    <div class="opt-letter c-green">(D) ✅ TRUE</div>
    <div class="logo-box logos"><img class="logo" src="assets/google-logo.svg" alt="Google"><img class="logo" src="assets/amazon-logo.svg" alt="Amazon"></div>
    <p class="opt-text">I worked at <strong>Google</strong> and <strong>Amazon</strong></p>
  </div>
</div>

<div class="card inline-card">
  <span class="badge badge-red nowrap">THE LIES: B & C</span>
  <span>Never played state-level cricket, and dogs don't scare me! 🐶 But the rest is true: a Govt school kid, <strong>just like you</strong>, who later worked at Google and Amazon. 🙌</span>
</div>

-->

---

## 🚀 My Journey: From Your Bench to Big Tech

<div class="journey">
  <div class="card-yellow">
    <div class="emoji-lg">🏫</div>
    <div class="habit-title c-orange">Level 1: Govt School</div>
    <p class="habit-text">Same benches, same blackboard, same textbooks as you!</p>
  </div>
  <div class="arrow">➜</div>
  <div class="card-blue">
    <div class="emoji-lg">📚</div>
    <div class="habit-title c-blue">Level 2: Keep Learning</div>
    <p class="habit-text">Curiosity + practice, one step at a time. No shortcuts!</p>
  </div>
  <div class="arrow">➜</div>
  <div class="card-green">
    <div class="logo-box logos"><img class="logo" src="assets/google-logo.svg" alt="Google"><img class="logo" src="assets/amazon-logo.svg" alt="Amazon"></div>
    <div class="habit-title c-green">Level 3: Google & Amazon</div>
    <p class="habit-text">Built technology used by millions of people.</p>
  </div>
</div>

<div class="card center mt-l">
  <p class="big-quote">🌟 Where you study doesn't decide where you go.<br><span class="c-green">What you do every day does!</span></p>
</div>

<p class="pro-tip text-24">🔥 <strong>NMMS can be YOUR Level 1 win. Let's start today!</strong></p>

---

## 🎁 The Super Reward: Why Take NMMS?

<div class="grid-3 mt-l">
  <div class="card-green center">
    <div class="emoji-lg">💰</div>
    <div class="big-stat c-green">₹48,000</div>
    <div class="stat-label">Total Scholarship</div>
    <p class="note">₹12,000 paid each year across 4 years!</p>
  </div>

  <div class="card-blue center">
    <div class="emoji-lg">🗓️</div>
    <div class="big-stat c-blue">4 Years</div>
    <div class="stat-label">Coverage Span</div>
    <p class="note">Supports you non-stop from Class 9 to 12!</p>
  </div>

  <div class="card-yellow center">
    <div class="emoji-lg">🏆</div>
    <div class="big-stat c-orange">Bank Transfer</div>
    <div class="stat-label">Straight to You</div>
    <p class="note">Paid into your bank account through the National Scholarship Portal.</p>
  </div>
</div>

<div class="card inline-card">
  <span class="badge badge-orange">PROUD MOMENT</span>
  <span>NMMS is a Government of India scholarship. Win it and make your whole school proud!</span>
</div>

---

## 🎯 Are You Eligible to Enter?

<div class="grid-2 mt-s">
  <div class="card-green">
    <h3 class="c-green card-title">✅ You are IN if:</h3>
    <ul class="list">
      <li>You are currently studying in <strong>Class 8</strong>.</li>
      <li>Enrolled in a <strong>Govt., Local Body, or Aided school</strong>.</li>
      <li>Scored <strong>55% or above</strong> in Class 7 <br><em>(50% for SC/ST students)</em>.</li>
      <li>Family annual income is under <strong>₹3,50,000</strong>.</li>
    </ul>
  </div>

  <div class="card border-red">
    <h3 class="c-red card-title">❌ Not Eligible:</h3>
    <p class="text-24">Students of these schools can't apply:</p>
    <ul class="list">
      <li>Kendriya Vidyalaya (KVS)</li>
      <li>Jawahar Navodaya Vidyalaya (JNV)</li>
      <li>Sainik Schools</li>
      <li>Residential schools (e.g. Morarji Desai, Kittur Rani Chennamma)</li>
      <li>Private unaided schools</li>
    </ul>
  </div>
</div>

---

## ⚔️ Exam Battle Plan: 2 Papers, 180 Marks

<div class="row">
  <div class="card-yellow">
    <strong>✍️ Format:</strong> Multiple Choice (MCQs)
  </div>
  <div class="card-green">
    <strong>🎯 Marks:</strong> 1 mark per question
  </div>
  <div class="card-blue">
    <strong>🗣️ Medium:</strong> Kannada, English, Urdu, Marathi or Telugu
  </div>
</div>

| Paper | Focus Area | Questions | Marks |
| :--- | :--- | :---: | :---: |
| **Paper 1: MAT** | Mental Ability & Reasoning Puzzles | 90 | 90 |
| **Paper 2: SAT** | School Subjects (Science, Social Science, Maths) | 90 | 90 |
| **TOTAL** | **Complete Exam** | **180** | **180** |

<p class="pro-tip">
  💡 <strong>Pro Tip:</strong> Both papers carry equal marks, so MAT practice counts as much as your school subjects!
</p>

---

## 🧠 Quest 1: Mental Ability Test (MAT)

<div class="grid-2">
  <div>
    <p class="mt-0">Tests your <strong>reasoning power</strong>: how fast you spot patterns and solve puzzles. No textbook memorization needed!</p>
    <div class="card-blue">
      <h4 class="c-blue card-title">🌟 Core MAT Topics:</h4>
      <ul class="list list-sm">
        <li><strong>Number & Letter Series:</strong> Find what comes next!</li>
        <li><strong>Analogy:</strong> Pair matching & relationships</li>
        <li><strong>Odd One Out:</strong> Spotting the misfit item</li>
        <li><strong>Venn Diagrams:</strong> Grouping categories</li>
      </ul>
    </div>
  </div>
  <div>
    <div class="card-yellow">
      <h4 class="c-orange card-title">🔍 Visual & Spatial Puzzles:</h4>
      <ul class="list list-sm">
        <li>Mirror & Water Images</li>
        <li>Paper folding & cut-outs</li>
        <li>Hidden figures & counting shapes</li>
        <li>Coding-Decoding secrets</li>
      </ul>
    </div>
    <div class="card-green center mt-m">
      <strong>Level Up:</strong> Solve a few <strong>puzzles every day</strong>. Speed comes with practice!
    </div>
  </div>
</div>

---

## 📚 Quest 2: Scholastic Aptitude Test (SAT)

<p class="mt-0">Everything comes from your <strong>Class 7 & 8 State Syllabus</strong> textbooks!</p>

<div class="grid-3 mt-m">
  <div class="card-blue">
    <h3 class="c-blue card-sub">🔬 Science</h3>
    <ul class="list list-sm">
      <li>Light, Sound & Heat</li>
      <li>Force, Friction & Pressure</li>
      <li>Acids, Bases, Salts & Metals</li>
      <li>Cells, Plants, Animals & Crops</li>
    </ul>
  </div>

  <div class="card-orange">
    <h3 class="c-orange card-sub">🌍 Social Science</h3>
    <ul class="list list-sm">
      <li>History</li>
      <li>Geography</li>
      <li>Political Science & Economics</li>
      <li>Sociology & Business Studies</li>
    </ul>
  </div>

  <div class="card-green">
    <h3 class="c-green card-sub">📐 Mathematics</h3>
    <ul class="list list-sm">
      <li>Numbers & Indices</li>
      <li>Algebra & Linear Equations</li>
      <li>Ratio, Proportion & Average</li>
      <li>Triangles, Quadrilaterals & Mensuration</li>
    </ul>
  </div>
</div>

---

## 🏆 Qualifying Marks & Merit Cutoff

<div class="grid-2 mt-l">
  <div class="card">
    <div class="badge badge-yellow">STEP 1: QUALIFYING CUTOFF</div>
    <h3 class="c-charcoal card-sub">Minimum Pass Marks</h3>
    <div class="lines">
      <div>• <strong>General / OBC:</strong> 40% aggregate in both papers (72/180)</div>
      <div>• <strong>SC / ST:</strong> 32% aggregate in both papers (58/180)</div>
    </div>
  </div>

  <div class="card-green">
    <div class="badge badge-green">STEP 2: MERIT RANKING</div>
    <h3 class="c-green card-sub">District Merit Ranking</h3>
    <p class="body-sm">
      Qualifying is required, but scholarships go to the top-ranked students in each <strong>district</strong>, following reservation rules.
      <br><br>
      🎯 <strong>Aim high:</strong> cutoffs change by district and year, so every extra mark helps!
    </p>
  </div>
</div>

---

## 🔥 4 Daily Habits of NMMS Champions

<div class="grid-2 mt-m">
  <div class="card-blue">
    <div class="habit-title c-blue">1. 📖 Textbook Mastery</div>
    <p class="habit-text">Read your Class 7 & 8 State Syllabus Science, Social Science and Maths textbooks line by line.</p>
  </div>

  <div class="card-yellow">
    <div class="habit-title c-orange">2. 🧩 Daily 15-Min MAT Streak</div>
    <p class="habit-text">Keep your brain active by solving 10 to 15 reasoning puzzles every single day.</p>
  </div>

  <div class="card-orange">
    <div class="habit-title c-orange">3. 📝 Previous Year Papers (PYQs)</div>
    <p class="habit-text">Solve previous exam papers with a timer to build speed and accuracy.</p>
  </div>

  <div class="card-green">
    <div class="habit-title c-green">4. 🔁 Learn From Mistakes</div>
    <p class="habit-text">Re-solve every question you got wrong until you understand the method.</p>
  </div>
</div>

---

## 🔒 Keeping Your Scholarship in Classes 9–12

<p class="mt-0">Once you win, follow these rules to keep getting your scholarship:</p>

<div class="grid-3 mt-m">
  <div class="card center">
    <div class="badge badge-green">RULE 1</div>
    <h3 class="card-sub">First Attempt</h3>
    <p class="note-0">Pass Class 9 and Class 11 in the first attempt.</p>
  </div>

  <div class="card center">
    <div class="badge badge-blue">RULE 2</div>
    <h3 class="card-sub">Class 10 Marks</h3>
    <p class="note-0">Score at least 60% in Class 10 (55% for SC/ST).</p>
  </div>

  <div class="card center">
    <div class="badge badge-yellow">RULE 3</div>
    <h3 class="card-sub">NSP Renewal</h3>
    <p class="note-0">Apply online every year on the National Scholarship Portal (scholarships.gov.in).</p>
  </div>
</div>

---

<!-- _class: title-slide -->

<span class="badge badge-yellow badge-lg">🌟 YOU HAVE GOT THIS!</span>

# You Are Tomorrow's Scholar! 🎓
### Hard work today = 4 years of proud achievement.

<div class="btn-row">
  <span class="btn btn-blue">Any Questions? Let's Talk! 💬</span>
</div>
