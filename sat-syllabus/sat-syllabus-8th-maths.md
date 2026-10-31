# Class 8 Mathematics Syllabus & Concept Mapping Guide (NMMS SAT Prep)

**Source Textbooks:**
- **Part 1:** *Ganita Prakash — Textbook of Mathematics for Grade 8, Part 1* (2026–27 Edition, KTBS / NCERT Revised Syllabus) — `sat-syllabus/textbooks/8th English Maths Part 1 2026-27.pdf` (200 PDF pages; Book pp. 1–182; offset: $\text{PDF Page} = \text{Book Page} + 18$)
- **Part 2:** *Ganita Prakash — Textbook of Mathematics for Grade 8, Part 2* (2026–27 Edition, KTBS / NCERT Revised Syllabus) — `sat-syllabus/textbooks/8th English Maths Part 2 2026-27.pdf` (176 PDF pages; Book pp. 1–174; offset: $\text{PDF Page} = \text{Book Page} + 2$)

**Purpose:** This guide provides an exhaustive, concept-level index of the 14 chapters across Class 8 Mathematics (Parts 1 and 2). Because *Ganita Prakash* replaces conventional chapter titles with thematic, inquiry-driven titles (e.g., *Power Play*, *We Distribute, Yet Things Multiply*, *Fractions in Disguise*, *Tales by Dots, Bars, and Lines*), each chapter section below explicitly maps creative textbook headings to **canonical NMMS SAT Mathematics syllabus topics**, key formulas, algebraic identities, geometric theorems, Indian mathematical heritage notes, and strict disambiguation rules for categorizing previous-year questions (PYQs).

---

## Quick Reference Index

| Topic Slug | Ch. No. | Part | Chapter Title (*Ganita Prakash*) | Sub-Discipline | Book Pages | PDF Pages |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: |
| `math-8-01-square-and-cube` | 1 | Part 1 | A Square and A Cube | Number Theory / Arithmetic | 1–18 | 19–36 |
| `math-8-02-power-play` | 2 | Part 1 | Power Play | Algebra / Number Theory / Combinatorics | 19–47 | 37–65 |
| `math-8-03-story-of-numbers` | 3 | Part 1 | A Story of Numbers | Number Systems / History of Mathematics | 48–81 | 66–99 |
| `math-8-04-quadrilaterals` | 4 | Part 1 | Quadrilaterals | Geometry | 82–111 | 100–129 |
| `math-8-05-number-play` | 5 | Part 1 | Number Play | Number Theory / Combinatorics | 112–135 | 130–153 |
| `math-8-06-distribute-multiply` | 6 | Part 1 | We Distribute, Yet Things Multiply | Algebra (Polynomials & Identities) | 136–158 | 154–176 |
| `math-8-07-proportional-reasoning-1` | 7 | Part 1 | Proportional Reasoning-1 | Commercial Arithmetic (Ratios & Direct Proportion) | 159–182 | 177–200 |
| `math-8-08-fractions-in-disguise` | 8 | Part 2 | Fractions in Disguise | Commercial Arithmetic (Percentages, Profit/Loss, SI & CI) | 1–32 | 3–34 |
| `math-8-09-baudhayana-pythagoras` | 9 | Part 2 | The Baudhayana-Pythagoras Theorem | Geometry / Number Theory | 33–54 | 35–56 |
| `math-8-10-proportional-reasoning-2` | 10 | Part 2 | Proportional Reasoning-2 | Commercial Arithmetic / Statistics (Pie Charts & Inverse Proportion) | 55–69 | 57–71 |
| `math-8-11-geometric-themes` | 11 | Part 2 | Exploring Some Geometric Themes | Geometry (Fractals, 3D Solids, Nets & Projections) | 70–102 | 72–104 |
| `math-8-12-tales-dots-bars-lines` | 12 | Part 2 | Tales by Dots, Bars, and Lines | Statistics & Data Handling | 103–134 | 105–136 |
| `math-8-13-algebra-play` | 13 | Part 2 | Algebra Play | Algebra / Number Theory (Linear Equations & Grid Proofs) | 135–147 | 137–149 |
| `math-8-14-area` | 14 | Part 2 | Area | Mensuration / Geometry | 148–174 | 150–176 |

---

# PART 1 CHAPTERS (`8th English Maths Part 1 2026-27.pdf`)

---

## Chapter 1: A Square and A Cube (`math-8-01-square-and-cube`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 1
- **Book Page Range:** pp. 1–18
- **PDF Page Range:** pp. 19–36
- **Sub-Discipline:** Number Theory / Arithmetic

### Canonical Topic Aliases
- **Squares and Square Roots** (Perfect squares, properties of square numbers, prime factorisation for square roots, estimation of square roots)
- **Cubes and Cube Roots** (Perfect cubes, Hardy-Ramanujan Taxicab numbers, prime factorisation for cube roots, digit-based cube root extraction)
- **Number Patterns & Divisor Counting** (Locker puzzle, odd number sums, triangular numbers, finite differences of polynomials)

### Core Concepts, Subtopics & Problem Archetypes
- **Opening Puzzle — Queen Ratnamanjuri's 100 Lockers:**
  - 100 lockers (initially closed) are toggled by 100 people where person $k$ toggles every multiple of $k$.
  - A locker $n$ is toggled once for each factor of $n$. Since factors occur in pairs $(d, n/d)$, $n$ has an **odd number of factors** if and only if $n$ is a **perfect square** ($d = n/d$).
  - Open lockers at the end: the 10 perfect squares $\le 100$ ($1, 4, 9, 16, 25, 36, 49, 64, 81, 100$).
  - Lockers toggled **exactly twice** (by person 1 and person $p$): **prime numbers** ($2, 3, 5, 7, 11, \dots$).
- **1.1 Square Numbers:**
  - **Definition:** The square of a number $n$ is $n^2 = n \times n$ (applies to integers, fractions like $(3/5)^2 = 9/25$, and decimals like $(2.5)^2 = 6.25$). The squares of natural numbers ($1, 4, 9, 16, 25, \dots$) are called **perfect squares**.
  - **Units Digit Rule:** Perfect squares in base-10 can end **only** in $0, 1, 4, 5, 6,$ or $9$. No perfect square ends in **$2, 3, 7,$ or $8$** (sufficient condition to rule out non-squares, though ending in $0, 1, 4, 5, 6, 9$ is not sufficient to guarantee a square).
    - Numbers ending in $1$ or $9 \implies$ square ends in $1$.
    - Numbers ending in $2$ or $8 \implies$ square ends in $4$.
    - Numbers ending in $3$ or $7 \implies$ square ends in $9$.
    - Numbers ending in $4$ or $6 \implies$ square ends in $6$.
    - Numbers ending in $5 \implies$ square ends in $25$.
  - **Trailing Zeros Rule:** Perfect squares can only end in an **even number of zeros** ($k$ trailing zeros in $n \implies 2k$ trailing zeros in $n^2$).
  - **Parity:** Even numbers have even squares; odd numbers have odd squares.
  - **Perfect Squares and Consecutive Odd Numbers:**
    - Sum of the first $n$ consecutive odd natural numbers starting from $1$ is $n^2$ (proven visually by partitioning an $n \times n$ grid into $n$ inverted L-shaped gnomons of sizes $1, 3, 5, \dots, 2n-1$).
    - Difference between consecutive squares: $(n+1)^2 - n^2 = 2n + 1$.
    - Number of non-square natural numbers strictly between $n^2$ and $(n+1)^2$ is **$2n$** (i.e., $(\text{difference}) - 1$).
    - **Successive Subtraction Test:** Subtracting $1, 3, 5, 7, \dots$ successively from $N$; if $0$ is reached at the $k$-th step, $N = k^2$.
  - **Perfect Squares and Triangular Numbers:**
    - Triangular numbers: $T_n = 1 + 2 + \dots + n = \frac{n(n+1)}{2}$ ($1, 3, 6, 10, 15, \dots$).
    - Sum of any two consecutive triangular numbers is a perfect square: $T_{n-1} + T_n = n^2$ (e.g., $1+3=4=2^2$, $3+6=9=3^2$, $6+10=16=4^2$).
  - **Square Roots ($\sqrt{y}$):**
    - Inverse of squaring: if $y = x^2$, then $x = \sqrt{y}$. Every positive perfect square has two integer roots ($\pm x$, e.g., $8^2 = (-8)^2 = 64$), though $\sqrt{y}$ denotes the positive root.
    - **Prime Factorisation Method:** Express $N$ as a product of primes and pair identical prime factors into two equal groups (e.g., $324 = 2^2 \times 3^4 = (2 \times 3^2)^2 \implies \sqrt{324} = 18$).
    - **NMMS Archetypes:** Finding the smallest number by which $N$ must be multiplied or divided to make it a perfect square (unpaired prime factors); finding the smallest perfect square divisible by $a, b, c$ (compute $\text{LCM}(a, b, c)$ and multiply by unpaired primes).
    - **Estimation & Interval Halving:** Locating $\sqrt{N}$ between consecutive multiples of 10 (e.g., $40^2 = 1600 < 1936 < 2500 = 50^2$; using $45^2 = 2025$ and units digit $6 \implies \sqrt{1936} = 44$). Approximating non-perfect square roots to the nearest integer (e.g., $\sqrt{250} \approx 16$ since $15^2 = 225$ and $16^2 = 256$; maximum integer side of a square cut from $125\text{ cm}^2$ cloth is $11\text{ cm}$ since $11^2 = 121 \le 125 < 144$).
- **1.2 Cubic Numbers:**
  - **Definition:** The cube of $n$ is $n^3 = n \times n \times n$. Perfect cubes ($1, 8, 27, 64, 125, 216, 343, 512, 729, 1000$).
  - **Units Digit Bijection for Cubes:** Unlike squares, cubes can end in **any digit from $0$ to $9$**, with a unique 1-to-1 correspondence between the units digit of $n$ and the units digit of $n^3$:
    - $0 \to 0,\; 1 \to 1,\; 4 \to 4,\; 5 \to 5,\; 6 \to 6,\; 9 \to 9$ (self-mapping)
    - $2 \leftrightarrow 8$ ($2^3 = 8$, $8^3 = 512$) and $3 \leftrightarrow 7$ ($3^3 = 27$, $7^3 = 343$)
  - **Trailing Zeros & Sign:** A perfect cube must have a number of trailing zeros that is a **multiple of 3** ($3k$ zeros). The cube of a negative integer is always **negative**: $(-n)^3 = -n^3$ (e.g., $(-6)^3 = -216$).
  - **Taxicab Numbers (Hardy-Ramanujan Number):**
    - **1729** is the smallest positive integer expressible as the sum of two positive cubes in two different ways: $1729 = 1^3 + 12^3 = 9^3 + 10^3$.
    - Next taxicab numbers featured in the textbook: **4104** ($2^3 + 16^3 = 9^3 + 15^3$) and **13832** ($2^3 + 24^3 = 18^3 + 20^3$).
  - **Sum of Consecutive Odd Numbers as Cubes:**
    - Grouping odd numbers into triangular blocks of size $1, 2, 3, 4, \dots$:
      - $1 = 1 = 1^3$
      - $3 + 5 = 8 = 2^3$
      - $7 + 9 + 11 = 27 = 3^3$
      - $13 + 15 + 17 + 19 = 64 = 4^3$
      - Sum of 10 consecutive odd numbers $91 + 93 + \dots + 109 = 10^3 = 1000$.
  - **Cube Roots ($\sqrt[3]{y}$):**
    - **Prime Factorisation Method:** Group prime factors into **triplets** (three identical factors per group), e.g., $3375 = 3^3 \times 5^3 \implies \sqrt[3]{3375} = 15$.
    - **NMMS Archetypes:** Smallest multiplier/divisor to obtain a perfect cube; minimum number of cuboids of dimensions $a \times b \times c$ needed to form a cube; digit-based extraction of cube roots for known perfect cubes ($1331 \to 11$, $4913 \to 17$, $12167 \to 23$, $32768 \to 32$).
  - **Successive Differences of Powers:**
    - For squares ($1, 4, 9, 16, 25, \dots$), Level 1 differences are $3, 5, 7, 9, \dots$ and **Level 2 differences are constant ($2 = 2!$)**.
    - For cubes ($1, 8, 27, 64, 125, \dots$), Level 1 differences are $7, 19, 37, 61, \dots$, Level 2 are $12, 18, 24, \dots$, and **Level 3 differences are constant ($6 = 3!$)**.
- **1.3 A Pinch of History & Square-Sum Circle Puzzle:**
  - Babylonian cuneiform tablets (c. 1700 BCE) listing squares and square roots.
  - Ancient Sanskrit terminology: ***varga*** (both square geometric figure and square power), ***ghana*** (solid cube and cubic power), ***mula*** (plant root / basis / cause $\implies$ ***varga-mula*** for square root and ***ghana-mula*** for cube root, later translated into Arabic *jidhr* and Latin *radix*), and ***pada*** / ***krti*** (**Brahmagupta**, 628 CE).
  - **Square-Sum Arrangement Puzzle:** Arranging $1\text{–}17$ in a row or $1\text{–}32$ in a circle such that every pair of adjacent numbers sums to a perfect square.

### Key Formulas, Identities, Theorems & Mathematicians
- **Sum of First $n$ Odd Natural Numbers:**
  $$1 + 3 + 5 + \dots + (2n - 1) = n^2$$
- **Difference of Consecutive Squares & Count of Non-Squares:**
  $$(n + 1)^2 - n^2 = 2n + 1 \implies \text{Non-squares between } n^2 \text{ and } (n+1)^2 = 2n$$
- **Pythagorean-like Consecutive Square Pattern:**
  $$n^2 + (n + 1)^2 + [n(n + 1)]^2 = [n(n + 1) + 1]^2$$
- **Hardy-Ramanujan Taxicab Identities:**
  $$1729 = 1^3 + 12^3 = 9^3 + 10^3, \qquad 4104 = 2^3 + 16^3 = 9^3 + 15^3, \qquad 13832 = 2^3 + 24^3 = 18^3 + 20^3$$
- **Mathematicians & Historical Notes:** **Srinivasa Ramanujan** & **G. H. Hardy** (1729 taxicab number); **Brahmagupta** (*Brahmasphutasiddhanta*, 628 CE — *varga*, *ghana*, *varga-mula*, *ghana-mula*, *pada*, *krti*).

### Mapping & Disambiguation Rules
- **Ch 1 (`math-8-01-square-and-cube`) vs. Ch 2 (`math-8-02-power-play`):** Questions specifically testing properties of exponents $2$ and $3$ (perfect squares/cubes, units digits of squares/cubes, $\sqrt{N}$, $\sqrt[3]{N}$, odd-number sums, smallest multiplier to make a square/cube, 1729) map to **Ch 1**. Questions involving general exponents $n^a$, negative exponents $n^{-a}$, laws of exponents, or scientific notation map to **Ch 2**.
- **Ch 1 (`math-8-01-square-and-cube`) vs. Ch 9 (`math-8-09-baudhayana-pythagoras`):** Extracting square roots of perfect squares or estimating $\sqrt{250}$ maps to **Ch 1**. Proving the irrationality of $\sqrt{2}$ or applying $a^2 + b^2 = c^2$ to right triangles and Pythagorean triples maps to **Ch 9**.

---

## Chapter 2: Power Play (`math-8-02-power-play`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 2
- **Book Page Range:** pp. 19–47
- **PDF Page Range:** pp. 37–65
- **Sub-Discipline:** Algebra / Number Theory / Combinatorics

### Canonical Topic Aliases
- **Exponents and Powers** (Laws of exponents, zero and negative integral exponents, exponential equations)
- **Standard Form / Scientific Notation** (Expressing very large and very small numbers as $x \times 10^y$, decimal place-value expansion)
- **Fundamental Principle of Counting / Combinatorics** (Multiplicative counting of outfits, PINs, passcodes, vehicle registration numbers)
- **Linear vs. Exponential Growth & Order-of-Magnitude Estimation** ( Indian vs. International large number naming systems)

### Core Concepts, Subtopics & Problem Archetypes
- **2.1 Experiencing the Power Play (Exponential Folding):**
  - Paper-folding thought experiment with initial thickness $0.001\text{ cm}$ ($10^{-3}\text{ cm}$): each fold doubles the thickness ($0.001 \times 2^k\text{ cm}$).
  - Every 10 folds multiplies thickness by $2^{10} = 1024 \approx 10^3$: 10 folds $\approx 1.024\text{ cm}$; 26 folds $\approx 671\text{ m}$ (nearly Burj Khalifa at $830\text{ m}$); 30 folds $\approx 10.7\text{ km}$ (cruising aircraft / Mariana Trench); **46 folds** exceeds the distance to the Moon ($3,84,400\text{ km}$).
- **2.2 Exponential Notation, Laws of Exponents & Combinatorics:**
  - **Base and Exponent:** In $n^a$, $n$ is the **base** and $a$ is the **exponent / power** ($n^a$ read as "$n$ raised to the power of $a$").
  - **Powers of $-1$:** $(-1)^{\text{even}} = +1$ and $(-1)^{\text{odd}} = -1$.
  - **Multiplicative Hierarchy & Laws of Exponents:**
    - *The Stones that Shine* puzzle: 1 palace $\to 3$ daughters $\to 3$ baskets $\to 3$ keys $\to 3$ rooms $\to 3$ tables $\to 3$ necklaces $\to 3$ diamonds $= 3^7 = 2187$ diamonds.
    - Product of powers with the same base: $n^a \times n^b = n^{a+b}$.
    - Power of a power: $(n^a)^b = n^{ab}$.
    - Product of powers with the same exponent (*Magical Pond* lotus problem): $m^a \times n^a = (mn)^a$.
  - **Combinatorics (Fundamental Counting Principle):**
    - Choosing 1 item from each of $k$ independent categories with $n_1, n_2, \dots, n_k$ options gives $n_1 \times n_2 \times \dots \times n_k$ combinations (e.g., Roxie's 7 dresses $\times$ 2 hats $\times$ 3 shoes $= 42$ outfits).
    - **PINs, Locks & Registration Codes:**
      - $k$-digit numerical PIN (digits $0\text{–}9$): $10^k$ combinations ($4$-digit ATM PIN $= 10^4 = 10,000$).
      - 6-letter uppercase lock ($A\text{–}Z$): $26^6$ combinations.
      - 5-character alphanumeric passcode ($26$ uppercase letters $+ 10$ digits $= 36$ choices per position): $36^5$ combinations.
      - Indian 6-digit Pincode (first digit $1\text{–}9$, remaining five $0\text{–}9$): $9 \times 10^5$ possibilities.
      - 10-digit Indian mobile numbers (first digit $6, 7, 8,$ or $9$): $4 \times 10^9$ possibilities.
      - Indian vehicle registration plates (e.g., `DL 05 BC 2436`).
- **2.3 The Other Side of Powers (Division, Zero & Negative Exponents):**
  - Repeatedly halving a line segment of length $n^a$ leads to the quotient rules and negative powers:
    - Quotient of powers with the same base: $\frac{n^a}{n^b} = n^{a-b}$ ($n \neq 0$).
    - Power of a quotient: $\frac{n^a}{m^a} = \left(\frac{n}{m}\right)^a$ ($m \neq 0$).
    - **Zero Exponent:** $n^0 = 1$ for any $n \neq 0$ (since $\frac{n^a}{n^a} = n^{a-a} = n^0 = 1$).
    - **Negative Integral Exponent:** $n^{-a} = \frac{1}{n^a}$ and $\left(\frac{a}{b}\right)^{-m} = \left(\frac{b}{a}\right)^m$ ($n, a, b \neq 0$).
  - **Power Lines:** Unlike a standard number line where steps are additive ($+k$), on a power line steps are multiplicative ($\times r$ to the right, $\div r$ to the left: $\dots, r^{-2}, r^{-1}, r^0, r^1, r^2, \dots$).
- **2.4 Powers of 10, Scientific Notation & Linear vs. Exponential Growth:**
  - **Place-Value Expansion with Negative Powers of 10:**
    $$561.903 = 5 \times 10^2 + 6 \times 10^1 + 1 \times 10^0 + 9 \times 10^{-1} + 0 \times 10^{-2} + 3 \times 10^{-3}$$
  - **Scientific Notation (Standard Form):** Any positive number can be written uniquely as:
    $$N = x \times 10^y \quad \text{where } 1 \le x < 10 \text{ (coefficient) and } y \in \mathbb{Z} \text{ (exponent)}$$
    (e.g., Earth–Moon distance $3,84,400\text{ km} = 3.844 \times 10^5\text{ km}$; mass of a proton $\approx 1.67 \times 10^{-27}\text{ kg}$).
  - **Linear vs. Exponential Growth:**
    - **Linear growth** adds a fixed amount at each step (e.g., a ladder with $20\text{ cm}$ rungs requires $1,92,20,00,000$ rungs to reach the Moon).
    - **Exponential growth** multiplies by a fixed factor $>1$ at each step (e.g., folding paper $46$ times reaches the Moon).
  - **Fermi Estimation & Cultural Contexts:** *Tulabhara* (weighing a person against grain/coins for charity), *annadana*, and *Padayatra* (walking $400\text{ km}$).
- **2.5 A Pinch of History (Indian & International Names for Powers of 10):**
  - **Comparative Place-Value Table:**
    | Indian Name | Power of 10 | International Name | Power of 10 |
    | :--- | :---: | :--- | :---: |
    | Lakh | $10^5$ | Million | $10^6$ |
    | Crore | $10^7$ | Billion | $10^9$ |
    | Arab | $10^9$ | Trillion | $10^{12}$ |
    | Kharab | $10^{11}$ | Quadrillion | $10^{15}$ |
    | Neel | $10^{13}$ | Quintillion | $10^{18}$ |
    | Padma | $10^{15}$ | Sextillion | $10^{21}$ |
    | Shankh | $10^{17}$ | Septillion | $10^{24}$ |
    | Maha Shankh | $10^{19}$ | Octillion / Nonillion / Decillion | $10^{27} / 10^{30} / 10^{33}$ |
  - **Googol & Googolplex:** $1\text{ Googol} = 10^{100}$; $1\text{ Googolplex} = 10^{\text{googol}} = 10^{10^{100}}$.
  - **Ancient Indian Texts on Large Powers of 10:**
    - ***Lalitavistara*** (1st century BCE Buddhist work): Prince Gautama (Bodhisattva) answers mathematician Arjuna by naming odd powers of 10 in steps of $10^2$ from *koti* ($10^7$), *ayuta* ($10^9$), *niyuta* ($10^{11}$), *kankara* ($10^{13}$) up to ***tallakshana*** ($10^{53}$).
    - **Mahaviracharya** (*Ganita-sara-sangraha*, 850 CE): Named powers of 10 up to $10^{24}$.
    - ***Amalasiddhi*** (Jaina treatise): Named powers of 10 up to ***dasha-ananta*** ($10^{96}$).
    - **Kaccayana's Pali Grammar:** Named powers of 10 up to ***asankhyeya*** ($10^{140}$).
  - **Additional Problem Archetypes:** Finding the units digit of large powers via cyclicity (e.g., units digit of $2^{100}$ is $6$ since $2^k$ cycles through $2, 4, 8, 6$ with period $4$); identifying numbers that are simultaneously perfect squares and perfect cubes ($n^6$, e.g., $1, 64, 729$).

### Key Formulas, Identities, Theorems & Mathematicians
- **Laws of Exponents ($m, n \neq 0;\; a, b \in \mathbb{Z}$):**
  $$n^a \times n^b = n^{a+b}, \qquad \frac{n^a}{n^b} = n^{a-b}, \qquad (n^a)^b = n^{ab}$$
  $$m^a \times n^a = (mn)^a, \qquad \frac{n^a}{m^a} = \left(\frac{n}{m}\right)^a, \qquad n^0 = 1, \qquad n^{-a} = \frac{1}{n^a}$$
- **Scientific Notation:**
  $$N = x \times 10^y \quad (1 \le x < 10,\; y \in \mathbb{Z})$$
- **Mathematicians & Historical Texts:** ***Lalitavistara*** (Bodhisattva & Arjuna, up to $10^{53}$); **Mahaviracharya** (*Ganita-sara-sangraha*); ***Amalasiddhi***; **Kaccayana**.

### Mapping & Disambiguation Rules
- **Ch 2 (`math-8-02-power-play`) vs. Ch 3 (`math-8-03-story-of-numbers`):** Questions on laws of exponents, scientific notation ($x \times 10^y$), Lakh/Crore/Million/Billion conversions, and counting combinations ($10^k, 26^k$) map to **Ch 2**. Questions on the historical evolution of numerals, non-positional vs. positional systems, Roman/Egyptian/Babylonian/Mayan/Chinese numerals, and base-$n$ place-value conversions map to **Ch 3**.

---

## Chapter 3: A Story of Numbers (`math-8-03-story-of-numbers`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 3
- **Book Page Range:** pp. 48–81
- **PDF Page Range:** pp. 66–99
- **Sub-Discipline:** Number Systems / History of Mathematics

### Canonical Topic Aliases
- **Number Systems & Place Value** (Non-positional vs. positional number systems, concept of a base, landmark numbers)
- **Ancient & Historical Numeration Systems** (Tally bones, Gumulgal base-2, Roman, Egyptian, Mesopotamian/Babylonian base-60, Mayan base-20, Chinese rod numerals, Indian/Hindu-Arabic decimal system)
- **Base-$n$ Number Conversions** (Binary [base-2], quinary [base-5], octal [base-8], and decimal [base-10] representations)

### Core Concepts, Subtopics & Problem Archetypes
- **3.1 Reema's Curiosity & The Indian (Hindu) Number System:**
  - **Definition:** A **number** is an abstract quantity; a **numeral** is the written symbol used to represent it; a **number system** is a standard ordered sequence of objects, spoken names, or written symbols mapped 1-to-1 to quantities.
  - **Historical Milestones of the Indian Decimal System:**
    - ***Yajurveda Samhita*:** Early Sanskrit names for powers of 10 (*eka* $1$, *dasha* $10$, *shata* $10^2$, *sahasra* $10^3$, *ayuta* $10^4$, up to $10^{12}$).
    - **Bakhshali Manuscript (c. 3rd century CE):** Earliest surviving archaeological evidence of the **dot symbol for zero ($0$)** used in a decimal place-value system.
    - **Aryabhata (c. 499 CE):** Used the 10-symbol decimal system for astronomical and scientific computations.
    - **Brahmagupta (*Brahmasphutasiddhanta*, 628 CE):** First mathematician to treat **zero ($0$) as a number on par with positive and negative integers**, giving explicit rules for addition, subtraction, and multiplication of positive numbers (*dhana*), negative numbers (*rina*), and zero (*shunya*). In modern algebra, this closed structure under $+, -,$ and $\times$ is called a **Ring**.
    - **Global Transmission:** Reached the Arab world (~800 CE), where Persian mathematician **Al-Khwarizmi** wrote *On the Calculation with Hindu Numerals* (c. 825 CE; his name gave rise to the word **algorithm**) and philosopher **Al-Kindi** wrote *On the Use of the Hindu Numerals* (c. 830 CE). Transmitted to Europe (~1100–1200 CE) by **Fibonacci** and others.
- **3.2 Some Early Number Systems (Non-Positional & Without Uniform Base):**
  - **Body-Part Counting:** Papua New Guinea system counting 1 to 27 along fingers, wrist, elbow, shoulder, head, and down the other arm.
  - **Prehistoric Tally Bones:** **Lebombo bone** (~44,000 years old, South Africa, 29 notches — possibly a lunar calendar) and **Ishango bone** (~20,000–35,000 years old, DRC, grouped tallies).
  - **Counting in Twos (Oral Base-2):** **Gumulgal** people of Australia ($1 = \text{urapon}$, $2 = \text{ukasar}$, $3 = \text{ukasar-urapon}$, $4 = \text{ukasar-ukasar}$, $5 = \text{ukasar-ukasar-urapon}$, $6 = \text{ukasar-ukasar-ukasar}$, $>6 = \text{ras}$); similar 2-counting systems among indigenous South Americans (*toke, tghae*) and Bushmen of South Africa (*xa, t'oa*). Rooted in the human visual subitizing limit of **4 to 5 objects** at a glance.
  - **Roman Number System:**
    - Seven **landmark numbers**: $I = 1,\; V = 5,\; X = 10,\; L = 50,\; C = 100,\; D = 500,\; M = 1000$.
    - Uses additive grouping (e.g., $XXVII = 27$) and subtractive notation ($IV = 4,\; IX = 9,\; XL = 40,\; XC = 90,\; CD = 400,\; CM = 900$).
    - **Limitations:** Non-positional, lacks zero, and its landmark numbers alternate multipliers of $5$ and $2$ rather than powers of a single base — making direct multiplication nearly impossible without a decimal **abacus**.
- **3.3 The Idea of a Base (Non-Positional Base-$n$ Systems):**
  - **Egyptian Number System (~3000 BCE):**
    - Pure **base-10 (decimal) non-positional** system where landmark numbers are powers of 10: $1$ (vertical stroke), $10$ (heel bone $\cap$), $100$ (coiled rope), $1000$ (lotus flower), $10^4$ (bent finger), $10^5$ (tadpole/frog), $10^6$ (astonished man), $10^7$ (sun symbol).
    - Because landmark numbers are powers of 10 ($10^a \times 10^b = 10^{a+b}$), addition and multiplication are much easier than in Roman numerals, **but** a non-positional system still requires inventing a brand-new symbol for every higher power of the base.
  - **General Base-$n$ Landmark Numbers:** In a system of base $n$, the landmark numbers are $n^0 = 1, n^1, n^2, n^3, \dots$ (e.g., Base-5 landmark numbers are $1, 5, 25, 125, 625, \dots$).
- **3.4 Place Value Representation (Positional Number Systems):**
  - **Mesopotamian / Babylonian System (~2000 BCE):**
    - **Base-60 (sexagesimal)** positional system using only two cuneiform symbols: a vertical wedge for $1$ and a corner wedge $<$ for $10$ to build numbers $1\text{–}59$ in each position.
    - Place values from right to left are $60^0 = 1,\; 60^1 = 60,\; 60^2 = 3600,\; 60^3 = 216000$ (legacy survives in $1\text{ hour} = 60\text{ minutes},\; 1\text{ minute} = 60\text{ seconds}$, and $360^\circ$ in a circle).
    - **Limitation:** Initially lacked a symbol for an empty position (relying on a gap), and even after introducing a separator symbol, never used it at the **end (units place)** of a number, leaving $1$ vs. $60$ vs. $3600$ ambiguous without context.
  - **Mayan Number System (3rd–10th century CE, Central America):**
    - Written **vertically** (lowest place at the bottom) using a dot for $1$, a horizontal bar for $5$, and a **seashell symbol for zero ($0$)**.
    - **Modified Base-20 (Vigesimal):** Place values from bottom to top are $1$, $20$, **$360$** ($18 \times 20$, chosen to approximate the 360-day tun calendar year instead of $20^2 = 400$), $7200$ ($18 \times 20^2$), etc. Because the third place is $360$ rather than $400$, it is **not a pure base-20 system**, which forfeits the simple shift rule for multiplication.
  - **Chinese Rod Numerals (3rd century CE–17th century):**
    - Pure **decimal (base-10) positional system** using counting rods on a board.
    - Alternated **Zongs** (vertical rod representations for units $10^0$, hundreds $10^2$, ten-thousands $10^4$, etc.) and **Hengs** (horizontal rod representations for tens $10^1$, thousands $10^3$, etc.) to prevent adjacent digits from merging, leaving a blank space for zero.
  - **Comparison of Historical Number Systems & Base Conversions:**
    - Converting base-10 integers into **Base-2 (Binary)**, **Base-5**, and **Base-8 (Octal)**, and vice versa (e.g., decomposing a number into powers of $b$: $d_k b^k + \dots + d_1 b^1 + d_0 b^0$ with $0 \le d_i < b$).

### Key Formulas, Identities, Theorems & Mathematicians
- **Positional Base-$b$ Expansion:**
  $$(d_k d_{k-1} \dots d_1 d_0)_b = d_k b^k + d_{k-1} b^{k-1} + \dots + d_1 b^1 + d_0 b^0 \quad (0 \le d_i < b)$$
- **Summary of Historical Number Systems:**
  | Number System | Base / Landmark Structure | Positional? | Symbol for Zero? |
  | :--- | :--- | :---: | :---: |
  | **Roman** | Alternating $1, 5, 10, 50, 100, 500, 1000$ (No uniform base) | No | No |
  | **Egyptian** | Base-10 ($1, 10, 100, 1000, \dots$) | No | No |
  | **Mesopotamian (Babylonian)** | Base-60 ($1, 60, 3600, \dots$) | Yes | Partial (medial placeholder only, not trailing) |
  | **Mayan** | Modified Base-20 ($1, 20, 360, 7200, \dots$) | Yes (Vertical) | Yes (Seashell placeholder) |
  | **Chinese Rod Numerals** | Base-10 ($1, 10, 100, 1000, \dots$, alternating Zongs/Hengs) | Yes | Blank space (later $0$) |
  | **Indian (Hindu-Arabic)** | Pure Base-10 ($1, 10, 100, 1000, \dots$) | Yes | Yes (Both placeholder & full number in a Ring) |
- **Mathematicians & Historical Sources:** **Aryabhata**, **Brahmagupta** (*Brahmasphutasiddhanta*, 628 CE), **Bakhshali Manuscript**, **Al-Khwarizmi**, **Al-Kindi**, **Fibonacci**.

### Mapping & Disambiguation Rules
- **Ch 3 (`math-8-03-story-of-numbers`) vs. Ch 5 (`math-8-05-number-play`):** Questions on Roman numerals, base-2/base-5/base-8/base-60 conversions, or historical numeral systems map to **Ch 3**. Questions on base-10 place-value algebra ($100c + 10b + a$) used for divisibility tests or cryptarithms map to **Ch 5** (or **Ch 13**).

---

## Chapter 4: Quadrilaterals (`math-8-04-quadrilaterals`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 4
- **Book Page Range:** pp. 82–111
- **PDF Page Range:** pp. 100–129
- **Sub-Discipline:** Geometry

### Canonical Topic Aliases
- **Understanding Quadrilaterals** (Angle sum property of a quadrilateral, properties of sides, angles, and diagonals of special quadrilaterals)
- **Types of Quadrilaterals & Venn Hierarchy** (Parallelogram, Rectangle, Rhombus, Square, Kite, Trapezium, Isosceles Trapezium)
- **Deductive Geometric Proofs** (Using SAS, ASA, SSS triangle congruence and parallel line transversal properties to prove quadrilateral theorems)

### Core Concepts, Subtopics & Problem Archetypes
- **4.1 Rectangles and Squares:**
  - **The Carpenter's Problem (Diagonal Characterization of a Rectangle):** Two strips of wood joined as diagonals form the vertices of a **rectangle** if and only if they are of **equal length** and **bisect each other** ($AO = OC = BO = OD$).
    - *Congruence Proof:* $\triangle AOB \cong \triangle COD$ and $\triangle AOD \cong \triangle BOC$ (SAS), and base angles of the four isosceles triangles satisfy $2a + x = 180^\circ \implies a = 90^\circ - x/2$ and $2b + (180^\circ - x) = 180^\circ \implies b = x/2$, so every corner angle is $a + b = 90^\circ$ regardless of the intersection angle $x$ between the diagonals!
    - When the equal bisecting diagonals intersect at **$x = 90^\circ$**, $\triangle AOB \cong \triangle BOC \cong \triangle COD \cong \triangle DOA$ (SAS), making all four outer sides equal — a **square**.
  - **Rectangle Definition & Properties:** A quadrilateral in which all four angles are $90^\circ$.
    - Opposite sides are equal ($AB = CD, BC = DA$) and parallel (co-interior angles sum to $180^\circ$).
    - Diagonals are of equal length and bisect each other.
  - **Square Definition & Properties:** A quadrilateral in which all four angles are $90^\circ$ and all four sides are equal.
    - Diagonals are equal, **bisect each other at right angles ($90^\circ$)**, and **bisect the vertex angles** into $45^\circ$ each (proven via SSS congruence $\triangle BOA \cong \triangle BOC$).
- **4.2 Angles in a Quadrilateral:**
  - **Angle Sum Property:** The sum of the four interior angles of **any** quadrilateral (convex or concave) is **$360^\circ$**, proven by drawing a diagonal to partition the quadrilateral into two triangles ($180^\circ + 180^\circ = 360^\circ$).
- **4.3 More Quadrilaterals with Parallel Opposite Sides (Parallelograms):**
  - **Parallelogram Definition:** A quadrilateral in which both pairs of opposite sides are parallel ($AB \parallel DC$ and $AD \parallel BC$).
  - **Properties of a Parallelogram (Proven via Alternate Interior Angles & ASA Congruence $\triangle ABD \cong \triangle CDB$):**
    1. **Opposite sides are equal:** $AB = DC$ and $AD = BC$. (Converse also holds: any quadrilateral whose opposite sides are equal is a parallelogram).
    2. **Opposite angles are equal:** $\angle A = \angle C$ and $\angle B = \angle D$.
    3. **Adjacent angles are supplementary:** Any pair of adjacent interior angles sums to $180^\circ$ ($\angle A + \angle B = 180^\circ$, etc., as co-interior angles between parallel lines).
    4. **Diagonals bisect each other:** $AO = OC$ and $BO = OD$ (proven via ASA congruence on the triangles formed by both diagonals). *Note:* Diagonals of a general parallelogram are **not** equal unless it is a rectangle.
- **4.4 Quadrilaterals with Equal Sidelengths (Rhombus):**
  - **Rhombus Definition:** A quadrilateral in which all four sides have the same length ($AB = BC = CD = DA$).
  - **Properties of a Rhombus:**
    1. Every rhombus is a **parallelogram** (opposite sides are equal $\implies$ opposite sides are parallel).
    2. Opposite angles are equal, and adjacent angles sum to $180^\circ$.
    3. Diagonals **bisect each other at right angles ($90^\circ$)** and **bisect the interior vertex angles**.
- **4.5 & 4.6 Playing with Quadrilaterals — Kite and Trapezium:**
  - **Kite Definition & Properties:** A quadrilateral $ABCD$ whose four sides can be grouped into two pairs of equal-length sides that are adjacent to each other ($AB = BC$ and $CD = DA$).
    - The main diagonal (joining the vertices between equal sides, here $BD$) **bisects vertex angles $\angle B$ and $\angle D$**, **bisects the other diagonal $AC$** ($AO = OC$), and is **perpendicular to $AC$** ($BD \perp AC$).
  - **Trapezium Definition & Properties:** A quadrilateral with **at least one pair of parallel opposite sides** ($PQ \parallel SR$).
    - Angles adjacent to each non-parallel leg are supplementary ($\angle P + \angle S = 180^\circ$ and $\angle Q + \angle R = 180^\circ$).
    - **Isosceles Trapezium:** A trapezium in which the non-parallel sides have equal length ($UV = WT$ where $UW \parallel VT$). Its base angles opposite to the equal sides are equal ($\angle U = \angle W$ and $\angle V = \angle T$), and its diagonals are equal in length.

### Key Formulas, Identities, Theorems & Mathematicians
- **Interior Angle Sum of a Quadrilateral:**
  $$\angle A + \angle B + \angle C + \angle D = 360^\circ$$
- **Complete Venn Diagram / Subset Inclusion Hierarchy of Quadrilaterals (*Ganita Prakash* Convention):**
  $$\text{Squares} = \text{Rectangles} \cap \text{Rhombuses}$$
  $$\text{Squares} \subset \text{Rectangles} \subset \text{Parallelograms} \subset \text{Trapeziums}$$
  $$\text{Squares} \subset \text{Rhombuses} \subset \text{Parallelograms} \subset \text{Trapeziums}$$
  $$\text{Squares} \subset \text{Rhombuses} \subset \text{Kites}$$
  *(Important Note: Because Ganita Prakash defines a trapezium as having "at least one pair of parallel sides", every parallelogram is also a trapezium, and every rhombus is both a parallelogram and a kite!)*
- **Summary Matrix of Quadrilateral Properties:**
  | Quadrilateral | Opposite Sides | Opposite Angles | Diagonals Equal? | Diagonals Bisect Each Other? | Diagonals $\perp$ ($90^\circ$)? |
  | :--- | :--- | :--- | :---: | :---: | :---: |
  | **Trapezium** | At least 1 pair $\parallel$ | Not necessarily equal | Only if isosceles | No (unless $\parallel$-gram) | No |
  | **Kite** | 2 pairs of equal adjacent sides | 1 pair equal | No | One bisects the other | **Yes** |
  | **Parallelogram** | Both pairs $\parallel$ & equal | Equal (Adjacent $= 180^\circ$) | No | **Yes** | No |
  | **Rectangle** | Both pairs $\parallel$ & equal | All $90^\circ$ | **Yes** | **Yes** | No |
  | **Rhombus** | All 4 equal & opposite $\parallel$ | Equal (Adjacent $= 180^\circ$) | No | **Yes** | **Yes** (and bisect vertex $\angle$s) |
  | **Square** | All 4 equal & opposite $\parallel$ | All $90^\circ$ | **Yes** | **Yes** | **Yes** (into $45^\circ$ vertex $\angle$s) |

### Mapping & Disambiguation Rules
- **Ch 4 (`math-8-04-quadrilaterals`) vs. Ch 14 (`math-8-14-area`):** Questions on angles, side properties, diagonal properties, congruence proofs, or Venn classification of quadrilaterals map to **Ch 4**. Questions calculating the **area** or **perimeter** of rectangles, triangles, parallelograms, rhombuses ($\frac{1}{2} d_1 d_2$), or trapeziums ($\frac{1}{2}h(a+b)$) map to **Ch 14**.
- **Ch 4 (`math-8-04-quadrilaterals`) vs. Ch 9 (`math-8-09-baudhayana-pythagoras`):** If a problem gives the two diagonals of a rhombus ($d_1, d_2$) and asks to compute its **side length** using $s = \sqrt{(d_1/2)^2 + (d_2/2)^2}$ (since diagonals bisect at $90^\circ$), it bridges Ch 4 and Ch 9 — map primarily to **Ch 9** (where this exact problem is solved in Section 9.7).

---

## Chapter 5: Number Play (`math-8-05-number-play`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 5
- **Book Page Range:** pp. 112–135
- **PDF Page Range:** pp. 130–153
- **Sub-Discipline:** Number Theory / Combinatorics

### Canonical Topic Aliases
- **Playing with Numbers & Divisibility Tests** (Divisibility rules and proofs for $2, 3, 4, 5, 8, 9, 10, 11$, and composite divisors like $6, 12, 24, 36$)
- **Modular Arithmetic, Parity & Remainders** (Linear remainder expressions $dk + r$, modulo-4 parity, LCM remainder puzzles, digital roots)
- **Cryptarithms (Alphametics)** (Finding missing digits represented by letters in addition and multiplication puzzles)

### Core Concepts, Subtopics & Problem Archetypes
- **5.1 Is This a Multiple Of? (Parity, Divisibility Theorems & Remainders):**
  - **Parity Invariance under $\pm$ Signs:** Given any four integers $a, b, c, d$, all 8 expressions $a \pm b \pm c \pm d$ have the **exact same parity** (all even or all odd), because flipping $+x$ to $-x$ changes the sum by $-2x$ (an even number). For any 4 consecutive integers, $a \pm b \pm c \pm d$ is always **even**.
  - **Modulo-4 Classification of Even Numbers (*Pairs to Make Fours*):** Every even integer is either a multiple of 4 ($4p$, remainder $0$) or two more than a multiple of 4 ($4p + 2$, remainder $2$).
    - $(4p) + (4q) = 4(p+q)$ (divisible by 4).
    - $(4p + 2) + (4q + 2) = 4(p + q + 1)$ (sum of two even non-multiples of 4 is **always divisible by 4**).
    - $(4p) + (4q + 2) = 4(p+q) + 2$ (leaves remainder 2).
  - **Fundamental Divisibility Theorems (*Always, Sometimes, or Never True*):**
    1. **Sum & Difference:** If $a$ divides $M$ and $a$ divides $N$, then $a$ **always** divides $(M + N)$ and $(M - N)$. *(Converse is only **Sometimes True**: $a \mid (M+N)$ does not imply $a \mid M$ and $a \mid N$).*
    2. **Factors vs. Multiples of a Divisor:** If $A$ is divisible by $k$, then $A$ is **always** divisible by every **factor** of $k$ (e.g., divisible by $8 \implies$ divisible by $1, 2, 4$), and every **multiple** of $A$ is **always** divisible by $k$. However, $A$ being divisible by a *multiple* of $k$ is only **Sometimes True**.
    3. **Simultaneous Divisibility & LCM Rule:** If $A$ is divisible by both $k$ and $m$, then $A$ is **always** divisible by $\text{LCM}(k, m)$ — **not** necessarily by $k \times m$ unless $\text{HCF}(k, m) = 1$ (coprime).
       - *Trap Example:* A number divisible by $4$ and $6$ is always divisible by $\text{LCM}(4, 6) = 12$, **not** necessarily by $24$ (e.g., $12, 36$). A number divisible by $9$ and $4$ is always divisible by $\text{LCM}(9, 4) = 36$.
    4. **Product of $k$ Consecutive Integers:**
       - Product of any $2$ consecutive integers is divisible by $2! = 2$.
       - Product of any $3$ consecutive integers is divisible by $3! = 6$.
       - Product of any $4$ consecutive integers is divisible by $4! = 24$.
  - **Algebraic Forms of Remainders (*What Remains?*):**
    - Integers leaving remainder $r$ when divided by $d$ are represented as $dk + r$ or equivalently $dk - (d - r)$ (e.g., remainder $3$ when divided by $5 \iff 5k + 3$ or $5k - 2$).
    - **Simultaneous Remainder Archetypes (LCM Puzzles):**
      - Smallest number leaving remainder $1$ when divided by $2, 3, 5$ and divisible by $7$: takes the form $\text{LCM}(2,3,5)k + 1 = 30k + 1$; for $k = 3$, $30(3) + 1 = 91$ (divisible by $7$).
      - Number leaving remainders $2, 3, 4$ when divided by $3, 4, 5$ respectively (where each remainder is $1$ less than the divisor, i.e., $d - 1$): takes the form $\text{LCM}(3, 4, 5)k - 1 = 60k - 1$ (smallest positive solution is $59$).
- **5.2 Checking Divisibility Quickly (Place-Value Proofs & Digital Roots):**
  - **Place-Value Expansion:** Any base-10 integer $\dots edcba = \dots + 10000e + 1000d + 100c + 10b + a$.
  - **Divisibility by 10, 5, 2, 4, 8:**
    - By $10$: units digit $a = 0$; remainder mod 10 is $a$.
    - By $5$: units digit $a \in \{0, 5\}$; remainder mod 5 is the remainder of $a \div 5$.
    - By $2$: units digit $a \in \{0, 2, 4, 6, 8\}$.
    - By $4$: since $100c, 1000d, \dots$ are multiples of $4$, the remainder of any number divided by $4$ equals the remainder of its **last two digits ($10b + a$)** divided by $4$.
    - By $8$: since $1000d, 10000e, \dots$ are multiples of $8$, the remainder of any number divided by $8$ equals the remainder of its **last three digits ($100c + 10b + a$)** divided by $8$.
  - **Divisibility by 9 and 3 (and Remainder Theorem):**
    - Every power of 10 is $1$ more than a multiple of $9$: $10^k = \underbrace{99\dots9}_{k} + 1$.
    - Therefore, $1000d + 100c + 10b + a = (999d + 99c + 9b) + (d + c + b + a)$.
    - A number is divisible by $9$ (or $3$) if and only if the **sum of its digits** $(a + b + c + d + \dots)$ is divisible by $9$ (or $3$). Moreover, the remainder upon division by $9$ (or $3$) equals the remainder of the sum of its digits!
  - **Digital Roots:** Repeatedly summing the digits of a number until a single digit ($1\text{–}9$) is obtained yields its **digital root**, which equals its remainder modulo 9 (with digital root $9$ corresponding to remainder $0$). **Aryabhata II** (c. 950 CE, *Maha-Siddhanta*) used digital roots to verify arithmetic operations.
  - **Divisibility by 11 (and Remainder Theorem):**
    - Powers of 10 alternate around multiples of 11: $10^0 = 1$, $10^1 = 11 - 1$, $10^2 = 99 + 1$, $10^3 = 1001 - 1$, $10^4 = 9999 + 1, \dots$
    - Expanding $\dots edcba$:
      $$\dots + 1000d + 100c + 10b + a = 11(\text{integer}) + (a - b + c - d + e - \dots)$$
    - **Rule:** Compute the alternating sum of digits starting with $+$ at the units digit: $(\text{sum of digits in odd places from right}) - (\text{sum of digits in even places from right})$.
    - The number is divisible by $11$ iff this alternating sum is $0$ or a multiple of $11$ ($\pm 11, \pm 22, \dots$). Furthermore, this alternating sum directly gives the remainder modulo 11 (if negative, add $11$).
- **5.3 Digits in Disguise (Cryptarithms) & *Navakankari*:**
  - **Cryptarithm Rules:** Each letter represents a unique single digit ($0\text{–}9$), and the leading digit of a multi-digit number cannot be $0$.
  - **Textbook Cryptarithm Archetypes:**
    - Addition: $A1 + 1B = B0$; $C6 + 9C = 1D3$; $K2 + K2 + K2 = 1MM$.
    - Multiplication: $PQ \times 8 = RS$; $GH \times H = 9K$; $BYE \times 6 = RAY$; $UT \times 3 = PUT$; $EF \times E = GGG$ (since $GGG = 111 \times G = 37 \times 3 \times G$, $EF = 37, E = 3 \implies 37 \times 3 = 111$); $WOW \times 5 = MEOW$.
  - **Traditional Game:** ***Navakankari*** (*Salu Mane Ata* in Kannada / *Char-Par* / Nine Men's Morris) — strategic alignment of 3-in-a-row on concentric squares.

### Key Formulas, Identities, Theorems & Mathematicians
- **Place-Value Decomposition for Divisibility by 9 and 11:**
  $$\sum_{k=0}^{n} d_k 10^k \equiv \sum_{k=0}^{n} d_k \pmod 9 \quad \text{and} \quad \sum_{k=0}^{n} d_k 10^k \equiv \sum_{k=0}^{n} (-1)^k d_k \pmod{11}$$
- **LCM Divisibility Theorem:**
  $$(k \mid A \;\text{and}\; m \mid A) \iff \text{LCM}(k, m) \mid A$$
- **Mathematicians:** **Aryabhata II** (*Maha-Siddhanta*, c. 950 CE — digital roots).

### Mapping & Disambiguation Rules
- **Ch 5 (`math-8-05-number-play`) vs. Ch 13 (`math-8-13-algebra-play`):** Both chapters touch upon number theory and place value, so use these boundaries:
  - **Map to Ch 5 (`math-8-05-number-play`):** Standard divisibility tests ($2, 3, 4, 5, 8, 9, 10, 11$), finding missing digits in a number divisible by $9$ or $11$, digital roots, remainders $dk + r$, LCM remainder word problems, parity of $a \pm b \pm c \pm d$, and **cryptarithms** ($AB \times C = DEF$).
  - **Map to Ch 13 (`math-8-13-algebra-play`):** "Think of a number" algebraic tricks, **number pyramids** (and Virahanka-Fibonacci numbers in pyramids), calendar/algebra grids, maximising 2-digit $\times$ 1-digit products, **reversing 2-digit numbers** ($|ab - ba| = 9|a-b|$, $ab + ba = 11(a+b)$), **cyclic 3-digit sums** ($abc + bca + cab = 111(a+b+c)$), **repeating 3-digit numbers** ($abcabc = 1001 \times abc = 7 \times 11 \times 13 \times abc$), and linear equation word problems (shrines/genie, hens and horses).

---

## Chapter 6: We Distribute, Yet Things Multiply (`math-8-06-distribute-multiply`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 6
- **Book Page Range:** pp. 136–158
- **PDF Page Range:** pp. 154–176
- **Sub-Discipline:** Algebra (Polynomials & Identities)

### Canonical Topic Aliases
- **Algebraic Expressions and Identities** (Multiplication of monomials, binomials, and polynomials using the distributive property)
- **Standard Algebraic Identities** ($(a+b)^2$, $(a-b)^2$, $(a+b)(a-b) = a^2 - b^2$, $(a+m)(b+n)$, Sridharacharya's fast squaring identity)
- **Fast Mental Arithmetic & Visual Algebraic Modelling** (*Khanda-gunanam*, *Ista-gunana*, multiplying by $11, 99, 101, 1001$, calendar & tile pattern identities)

### Core Concepts, Subtopics & Problem Archetypes
- **6.1 Some Properties of Multiplication & General Binomial Identity:**
  - **Distributive Property:** $a(b + c) = ab + ac$ and $a(b - c) = ab - ac$.
  - **Product Increment Rules:**
    - Increasing one factor by $1$: $a(b + 1) = ab + a$.
    - Increasing both factors by $1$: $(a + 1)(b + 1) = ab + a + b + 1$.
    - Increasing one factor by $1$ and decreasing the other by $1$: $(a + 1)(b - 1) = ab + b - a - 1$.
    - Consecutive integers around $n$: $(n - 1)(n + 1) = n^2 - 1 \implies n^2 - (n - 1)(n + 1) = 1$.
  - **Identity 1 (General Binomial Multiplication):**
    $$(a + m)(b + n) = ab + mb + an + mn$$
    Derived geometrically via a $2 \times 2$ partitioned array/rectangle and algebraically by applying the distributive law twice. Extends to signed terms: $(a - u)(b - v) = ab - ub - av + uv$ (confirming $(-u)(-v) = +uv$).
  - **Higher-Degree Polynomial Expansions Featured in Exercises:**
    - $(a + b)(a^2 + 2ab + b^2) = a^3 + 3a^2b + 3ab^2 + b^3$
    - $(a - b)(a^2 + ab + b^2) = a^3 - b^3$
  - **A Pinch of History (*Khanda-gunanam* & *Ista-gunana*):**
    - **Brahmagupta** (*Brahmasphutasiddhanta*, 628 CE, Verse 12.55) gave the first explicit algebraic statement of the distributive law, naming it ***khanda-gunanam*** (multiplication by parts).
    - In Verse 12.56, Brahmagupta formulated fast mental multiplication using the distributive property as ***ista-gunana***, later elaborated by **Sridharacharya** (*Patiganita*, 750 CE) and **Bhaskaracharya** (*Lilavati*, 1150 CE).
  - **Fast Multiplication by $11, 101, 1001, 99, 999$:**
    - Multiplying a multi-digit number by $11 = 10 + 1$: add adjacent digits from right to left (e.g., $3874 \times 11 = 42614$).
    - Multiplying by $99 = 100 - 1$ or $101 = 100 + 1$ using $N(10^k \pm 1) = N \cdot 10^k \pm N$.
- **6.2 Special Cases of the Distributive Property (Standard Identities):**
  - **Identity 1A (Square of a Sum):**
    $$(a + b)^2 = a^2 + 2ab + b^2$$
    Proven geometrically by dissecting a square of side $(a + b)$ into two squares ($a^2, b^2$) and two rectangles ($ab, ab$). Used to compute $65^2 = (60+5)^2 = 4225$, $(5m + 6n)^2 = 25m^2 + 60mn + 36n^2$, etc.
  - **Identity 1B (Square of a Difference):**
    $$(a - b)^2 = a^2 - 2ab + b^2$$
    Proven geometrically by subtracting two overlapping strips of area $ab$ from $a^2$ and adding back the doubly-subtracted corner square $b^2$ (inclusion-exclusion).
  - **Pattern 1 & Related Sum/Difference of Squares Identities:**
    $$2(a^2 + b^2) = (a + b)^2 + (a - b)^2$$
    $$(a + b)^2 - (a - b)^2 = 4ab \iff (m + n)^2 - 4mn = (n - m)^2$$
  - **Identity 1C (Difference of Two Squares):**
    $$(a + b)(a - b) = a^2 - b^2$$
    Proven geometrically by cutting a strip of width $(a-b)$ and length $b$ from $a^2 - b^2$ and reattaching it to form a rectangle of dimensions $(a + b) \times (a - b)$.
  - **Sridharacharya's Fast Squaring Identity (750 CE):**
    $$a^2 = (a + b)(a - b) + b^2$$
    Allows instant mental squaring of numbers near a round base $a \pm b$ (e.g., $197^2 = (197 + 3)(197 - 3) + 3^2 = 200 \times 194 + 9 = 38809$; also explains why numbers ending in $5$ have $(10k + 5)^2 = 10k(10k + 10) + 25 = 100k(k+1) + 25$).
- **6.3 & 6.4 Mind the Mistake, Mend the Mistake & Visual Algebraic Patterns:**
  - Identifying common student errors: forgetting to multiply the second term in $-3p(-5p + 2q) = 15p^2 - 6pq$, omitting the middle term $2ab$ in $(a \pm b)^2$, or combining unlike terms ($2a + 5 \neq 7a$).
  - Proving equivalence of multiple algebraic formulas for the same visual pattern (e.g., Step $k$ has $(k + 1)^2 - 1 = k^2 + 2k = k(k + 1) + k = k(k + 2)$ circles).
  - Calendar $2 \times 2$ diagonal product invariant: $(a + 1)(a + 7) - a(a + 8) = (a^2 + 8a + 7) - (a^2 + 8a) = 7$.

### Key Formulas, Identities, Theorems & Mathematicians
- **Core Algebraic Identities:**
  $$(a + m)(b + n) = ab + mb + an + mn$$
  $$(a + b)^2 = a^2 + 2ab + b^2, \qquad (a - b)^2 = a^2 - 2ab + b^2$$
  $$(a + b)(a - b) = a^2 - b^2, \qquad a^2 = (a + b)(a - b) + b^2 \;\text{(Sridharacharya)}$$
  $$(a + b)^2 + (a - b)^2 = 2(a^2 + b^2), \qquad (a + b)^2 - (a - b)^2 = 4ab$$
  $$(a + b)(a^2 + 2ab + b^2) = a^3 + 3a^2b + 3ab^2 + b^3, \qquad (a - b)(a^2 + ab + b^2) = a^3 - b^3$$
- **Mathematicians:** **Brahmagupta** (*Brahmasphutasiddhanta*, 628 CE — *khanda-gunanam* & *ista-gunana*); **Sridharacharya** (750 CE — $a^2 = (a+b)(a-b) + b^2$); **Bhaskaracharya** (*Lilavati*, 1150 CE).

### Mapping & Disambiguation Rules
- **Ch 6 (`math-8-06-distribute-multiply`) vs. Ch 13 (`math-8-13-algebra-play`):** Polynomial multiplication, expanding/factorising using $(a \pm b)^2$ or $a^2 - b^2$, and algebraic identities map to **Ch 6**. Solving linear equations in one variable, number pyramids, and algebraic proofs of digit-reversal/cyclic divisibility tricks map to **Ch 13**.

---

## Chapter 7: Proportional Reasoning-1 (`math-8-07-proportional-reasoning-1`)

### Book Metadata
- **Part:** Part 1
- **Chapter No.:** 7
- **Book Page Range:** pp. 159–182 *(includes Binairo logic puzzles on pp. 178–182)*
- **PDF Page Range:** pp. 177–200
- **Sub-Discipline:** Commercial Arithmetic (Ratios & Direct Proportion)

### Canonical Topic Aliases
- **Ratio and Proportion (Part 1 — Two-Term Ratios & Direct Proportion)** (Simplest form of a ratio, equivalent ratios, proportionality $a : b :: c : d$, cross-multiplication)
- **The Rule of Three (*Trairasika*) & Unitary Method** (Solving direct variation word problems)
- **Dividing a Quantity in a Given Two-Term Ratio** (Mixture problems, profit sharing in investment ratio, unit conversions)

### Core Concepts, Subtopics & Problem Archetypes
- **7.1–7.3 Observing Similarity in Change, Ratios & Proportion:**
  - **Multiplicative vs. Additive Scaling:** Resizing an image without distortion requires multiplying both width and height by the **same factor $f$** (preserving the aspect ratio), whereas adding the same constant to both dimensions distorts the image.
  - **Ratio ($a : b$):** $a$ and $b$ are the **terms** of the ratio. Dividing both terms by their $\text{HCF}(a, b)$ reduces the ratio to its **simplest form**.
  - **Proportion ($a : b :: c : d$):** Two ratios $a : b$ and $c : d$ are in **proportion** if they reduce to the exact same simplest form (i.e., $c = fa$ and $d = fb$ for some multiplicative factor $f > 0$).
  - **Age Trap:** Because the passage of $t$ years adds $+t$ to both ages ($A + t : B + t$), the ratio of two people's ages is **not** in proportion across time (unless $A = B$).
- **7.4 Problem Solving with Proportional Reasoning & *Trairasika*:**
  - **Cross-Multiplication Law:**
    $$a : b :: c : d \iff \frac{a}{b} = \frac{c}{d} \iff ad = bc \implies d = \frac{bc}{a}$$
  - ***Trairasika* (The Rule of Three — Aryabhata & Bhaskaracharya):**
    - Ancient Indian formulation for direct proportion involving three known quantities:
      1. ***Pramana*** ($a$): The standard measure.
      2. ***Phala*** ($b$): The fruit/result yielded by *pramana*.
      3. ***Ichchha*** ($c$): The desired/requisitioned measure.
    - The unknown desired yield ***Ichchhaphala*** ($d$) is given by:
      $$\text{Ichchhaphala } (d) = \frac{\text{Phala } (b) \times \text{Ichchha } (c)}{\text{Pramana } (a)}$$
    - **Unit Consistency Rule:** *Pramana* ($a$) and *Ichchha* ($c$) must always be expressed in the **same unit** before applying the formula (e.g., converting hours to minutes or kg to grams).
- **7.5 Sharing, but Not Equally! (Dividing a Whole $x$ in Ratio $m : n$):**
  - To divide a total quantity $x$ into two parts in the ratio $m : n$, divide $x$ into $m + n$ equal groups of size $\frac{x}{m+n}$:
    $$\text{First Share} = \frac{m}{m + n} \times x, \qquad \text{Second Share} = \frac{n}{m + n} \times x$$
  - **NMMS Problem Archetypes:**
    - Dividing a line segment, sum of money, or business profit in the ratio of partners' investments ($m : n$).
    - **Mixture Adjustment:** Given $40\text{ kg}$ of a sand-cement mixture in ratio $3 : 1$ ($30\text{ kg}$ sand, $10\text{ kg}$ cement), finding how much cement $c$ must be added so the new ratio becomes $5 : 2$ ($\frac{30}{10 + c} = \frac{5}{2} \implies c = 2\text{ kg}$).
    - **Alloy / Coin Composition:** Indian ₹10 outer ring (cupro-nickel alloy in ratio $3 : 1$ copper to nickel).
- **7.6 Unit Conversions (Proportional vs. Affine):**
  - **Length:** $1\text{ metre} = 3.281\text{ feet}$.
  - **Area:** $1\text{ sq. m} = 10.764\text{ sq. ft}$; $1\text{ acre} = 43,560\text{ sq. ft}$; $1\text{ hectare} = 10,000\text{ sq. m} = 2.471\text{ acres}$.
  - **Volume / Capacity:** $1\text{ mL} = 1\text{ cc}$ ($\text{cm}^3$); $1\text{ L} = 1,000\text{ mL} = 1,000\text{ cc}$.
  - **Temperature (Non-Proportional / Affine Conversion):** Celsius ($C$) and Fahrenheit ($F$) are **not** directly proportional because $0^\circ\text{C} = 32^\circ\text{F} \neq 0^\circ\text{F}$:
    $$F = \frac{9}{5}C + 32 \quad \Longleftrightarrow \quad C = \frac{5}{9}(F - 32)$$
- **End-of-Book Logic Puzzle — Binairo (Book pp. 178–182):** Filling an $n \times n$ grid (even $n$) with $\circ$ and $\bullet$ such that: (1) each row/column has an equal number of $\circ$ and $\bullet$, (2) no more than two identical symbols are adjacent, and (3) every row/column is unique.

### Key Formulas, Identities, Theorems & Mathematicians
- **Direct Proportion & *Trairasika*:**
  $$a : b :: c : d \iff ad = bc \iff d = \frac{bc}{a}$$
- **Two-Part Ratio Division:**
  $$\text{Part}_1 = \left(\frac{m}{m + n}\right)x, \qquad \text{Part}_2 = \left(\frac{n}{m + n}\right)x$$
- **Mathematicians:** **Aryabhata** (*Aryabhatiya*, 499 CE — *Trairasika*); **Bhaskaracharya** (*Lilavati*, 1150 CE — saffron rule-of-three problems).

### Mapping & Disambiguation Rules
- **Ch 7 (`math-8-07-proportional-reasoning-1`) vs. Ch 10 (`math-8-10-proportional-reasoning-2`):**
  - **Map to Ch 7:** Two-term ratios ($a : b$), basic direct proportion ($a : b :: c : d$), *Trairasika* (Rule of Three), dividing a quantity into **2 parts** ($m : n$), and unit conversion problems.
  - **Map to Ch 10:** Map scales (**Representative Fraction, RF**), **multi-term ratios** ($a : b : c : d$), dividing a quantity into **3 or more parts**, **Pie Charts** (central angle $=\frac{\text{Part}}{\text{Whole}} \times 360^\circ$), **Inverse Proportion** ($x_1 y_1 = x_2 y_2$), and **Time & Work** problems.

---

# PART 2 CHAPTERS (`8th English Maths Part 2 2026-27.pdf`)

---

## Chapter 8: Fractions in Disguise (`math-8-08-fractions-in-disguise`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 8
- **Book Page Range:** pp. 1–32
- **PDF Page Range:** pp. 3–34
- **Sub-Discipline:** Commercial Arithmetic (Percentages, Profit/Loss, Discount, GST, SI & CI)

### Canonical Topic Aliases
- **Comparing Quantities / Commercial Arithmetic** (Percentages, fraction-decimal-percentage conversions, percentage increase/decrease)
- **Profit, Loss, Overhead Expenses, Discount & Taxes (GST / VAT)** (Cost Price [CP], Selling Price [SP], Marked Price [MP / MRP], Gross vs. Net Profit, successive discounts)
- **Simple Interest (SI) and Compound Interest (CI)** (Linear growth without compounding $A = p(1 + rt)$ vs. exponential growth with compounding $A = p(1 + r)^t$, population growth, and asset depreciation $A = p(1 - r)^t$)

### Core Concepts, Subtopics & Problem Archetypes
- **8.1 & 8.2 Fractions as Percentages & Percentage of a Quantity:**
  - **Definition:** *Per cent* (from Latin *per centum*, "per hundred", symbol $\%$) represents a fraction with denominator $100$: $z\% = \frac{z}{100}$ (contrasted with *per decem* [per $10$] and *per mille* [per $1000$]).
  - **Conversions:** $\text{Fraction} \leftrightarrow \text{Decimal} \leftrightarrow \text{Percentage}$ (e.g., $\frac{1}{8} = 0.125 = 12.5\%$, $\frac{1}{3} \approx 33.33\%$, $250\% = 2.5$).
  - **Base Sensitivity:** $x\%$ of $y$ equals $y\%$ of $x$ ($\frac{xy}{100}$), **but** when comparing changes, the denominator (reference base) is critical!
- **8.3 Using Percentages in Commercial Arithmetic:**
  - **Percentage Increase and Decrease:**
    $$\text{Percentage Change} = \frac{\text{Change in Quantity}}{\text{Original (Initial) Quantity}} \times 100\%$$
    - Multiplicative scaling factor: Increasing $p$ by $r\%$ yields $p\left(1 + \frac{r}{100}\right)$; decreasing $p$ by $r\%$ yields $p\left(1 - \frac{r}{100}\right)$.
    - *Reversal Asymmetry:* If $A$ is $25\%$ more than $B$ ($A = 1.25B$), then $B$ is $\frac{0.25}{1.25} \times 100\% = 20\%$ less than $A$ (not $25\%$!).
  - **Profit, Loss & Overhead Expenses:**
    - **Cost Price (CP):** Price at which an item is bought/manufactured.
    - **Selling Price (SP):** Price at which the item is sold.
    - **Gross Profit vs. Net Profit:** $\text{Gross Profit} = \text{SP} - \text{CP}$. When additional **overhead expenses** (rent, transport, salaries, repairs) are incurred, $\text{Net Profit} = \text{Gross Profit} - \text{Overheads}$ (or equivalently, $\text{Effective CP} = \text{CP} + \text{Overheads}$).
    - **Profit % and Loss % are ALWAYS calculated on CP:**
      $$\text{Profit } \% = \frac{\text{Profit}}{\text{CP}} \times 100\%, \qquad \text{Loss } \% = \frac{\text{Loss}}{\text{CP}} \times 100\%$$
  - **Marked Price (MP / MRP) & Discount:**
    - **Marked Price (MP) / Maximum Retail Price (MRP):** Price printed on the tag.
    - **Discount** is a reduction given on the **Marked Price (MP)**:
      $$\text{Discount} = \text{MP} - \text{SP}, \qquad \text{Discount } \% = \frac{\text{Discount}}{\text{MP}} \times 100\%, \qquad \text{SP} = \text{MP}\left(1 - \frac{\text{Discount } \%}{100}\right)$$
    - **"Buy $m$, Get $n$ Free" Discount Formula:** Effective discount percentage $= \frac{n}{m + n} \times 100\%$ (e.g., "Buy 4 get 1 free" $= \frac{1}{5} \times 100\% = 20\%$ discount).
    - **Successive Discounts / Markup-Discount Trap:**
      - A "$30\% + 20\%$ off" sale applies $20\%$ discount to the already discounted price: $\text{SP} = \text{MP} \times 0.70 \times 0.80 = 0.56\,\text{MP}$, which is an effective **$44\%$ discount** (not $50\%$!).
      - Marking up CP by $50\%$ ($\text{MP} = 1.5\,\text{CP}$) and then giving a $50\%$ discount yields $\text{SP} = 0.5 \times 1.5\,\text{CP} = 0.75\,\text{CP}$, resulting in a **$25\%$ loss**!
  - **Taxes — Goods and Services Tax (GST):**
    - **GST** (often split equally on receipts into **CGST** [Central GST] and **SGST** [State GST]) is charged as a percentage on the selling/bill price:
      $$\text{Bill Amount (with Tax)} = \text{Bill Price} \times \left(1 + \frac{\text{GST } \%}{100}\right)$$
    - Working backwards: If the tax-inclusive price is $T$ at $R\%$ GST, the pre-tax price is $\frac{T}{1 + R/100}$.
  - **Growth and Compounding (Simple Interest vs. Compound Interest):**
    - Framed via bank **Fixed Deposits (FD)** and loans with **Principal ($p$)**, **Rate of Interest ($R\%$ per year/term, or $r = \frac{R}{100}$)**, and **Time / Number of terms ($t$)**.
    - **Case 1 — Without Compounding (Simple Interest, SI):** Interest is calculated only on the original principal $p$ every term ($I_1 = pr$ per year, total interest $\text{SI} = prt = \frac{pRt}{100}$). This is **linear growth**:
      $$A = p + prt = p(1 + rt) = p\left(1 + \frac{Rt}{100}\right)$$
    - **Case 2 — With Compounding (Compound Interest, CI):** Interest earned at the end of each term is added to the principal to earn interest in the next term. After $t$ compounding periods, this produces **exponential growth**:
      $$A = p(1 + r)^t = p\left(1 + \frac{R}{100}\right)^t, \qquad \text{CI} = A - p = p\left[\left(1 + \frac{R}{100}\right)^t - 1\right]$$
    - **Compounding Frequency:** If interest is compounded **half-yearly (every 6 months)** at annual rate $R\%$ for $Y$ years, there are $t = 2Y$ terms at rate $\frac{R}{2}\%$ per term.
  - **Decline / Depreciation:**
    - When a quantity (e.g., value of a car/scooter or population of a village) decreases at a compound rate of $R\%$ ($r = R/100$) per period over $t$ periods:
      $$A = p(1 - r)^t = p\left(1 - \frac{R}{100}\right)^t$$

### Key Formulas, Identities, Theorems & Mathematicians
- **Profit, Loss, Discount & GST Relations:**
  $$\text{SP} = \text{CP}\left(1 + \frac{\text{Profit } \%}{100}\right) = \text{CP}\left(1 - \frac{\text{Loss } \%}{100}\right) = \text{MP}\left(1 - \frac{\text{Discount } \%}{100}\right)$$
- **Successive Percentage Changes ($a\%$ followed by $b\%$):**
  $$\text{Net Multiplier} = \left(1 \pm \frac{a}{100}\right)\left(1 \pm \frac{b}{100}\right)$$
- **Simple Interest (Without Compounding) vs. Compound Interest (With Compounding):**
  $$\text{SI} = \frac{pRt}{100}, \qquad A_{\text{SI}} = p\left(1 + \frac{Rt}{100}\right)$$
  $$A_{\text{CI}} = p\left(1 + \frac{R}{100}\right)^t, \qquad \text{CI} = p\left[\left(1 + \frac{R}{100}\right)^t - 1\right], \qquad A_{\text{depreciation}} = p\left(1 - \frac{R}{100}\right)^t$$

### Mapping & Disambiguation Rules
- **Ch 8 (`math-8-08-fractions-in-disguise`) vs. Ch 7 & Ch 10 (`Proportional Reasoning 1 & 2`):** Any question involving the `%` symbol, Profit/Loss, CP/SP/MP, Discount, GST/Sales Tax, Simple Interest, Compound Interest, or population growth/depreciation maps to **Ch 8**. Questions purely in terms of ratios ($a : b$ or $a : b : c$), map scales, pie chart angles, or inverse proportion / time-and-work map to **Ch 7** or **Ch 10**.

---

## Chapter 9: The Baudhayana-Pythagoras Theorem (`math-8-09-baudhayana-pythagoras`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 9
- **Book Page Range:** pp. 33–54
- **PDF Page Range:** pp. 35–56
- **Sub-Discipline:** Geometry / Number Theory

### Canonical Topic Aliases
- **The Pythagoras Theorem (Baudhayana-Pythagoras Theorem)** (Right-angled triangles, hypotenuse $a^2 + b^2 = c^2$, geometric dissection proofs)
- **Pythagorean Triples (Baudhayana Triples)** (Primitive vs. scaled triples, generating triples from odd squares)
- **Irrational Numbers ($\sqrt{2}$)** (Decimal bounds for $\sqrt{2}$, non-terminating decimal proof, Euclid's proof of irrationality of $\sqrt{2}$)
- **Fermat's Last Theorem & Classical Applications** (Bhaskaracharya's Lotus problem, diagonals of rectangles and rhombuses)

### Core Concepts, Subtopics & Problem Archetypes
- **9.1–9.3 Doubling & Halving a Square, Isosceles Right Triangles & $\sqrt{2}$:**
  - **Baudhayana's *Sulba-sutra* (c. 800 BCE, Verse 1.9):** First recorded geometric statement of the theorem for an isosceles right-angled triangle: *"The diagonal of a square produces a square of **double the area** of the original square."*
  - If a square has side $a$ and diagonal $c$, then $a^2 + a^2 = c^2 \implies c^2 = 2a^2 \implies c = a\sqrt{2}$.
  - **Halving a Square:** Folding the four corners of a square to its centre (joining the midpoints of adjacent sides) creates an inner square with **half the area** ($\frac{1}{2}a^2$) and side length $\frac{a}{\sqrt{2}}$.
  - **Nature of $\sqrt{2}$ (Side of a Square of Area $2$):**
    - Numerical bounds by squaring decimals: $1.414 < \sqrt{2} < 1.415$ ($\sqrt{2} = 1.41421356\dots$).
    - **Proof that $\sqrt{2}$ is Not a Terminating Decimal:** Any terminating decimal has a last non-zero digit ($1\text{–}9$); when squared, its last digit is $1, 4, 9, 6, 5$, which can never be $0$, so its square can never equal $2.000\dots$
    - **Euclid's Proof (*Elements*, c. 300 BCE) that $\sqrt{2}$ is Not a Fraction ($\sqrt{2} \neq \frac{m}{n}$):** If $\left(\frac{m}{n}\right)^2 = 2$, then $m^2 = 2n^2$. In the prime factorisation of any square ($m^2$ and $n^2$), the prime $2$ must appear an **even** number of times; thus $m^2$ has an even number of $2$s while $2n^2$ has an **odd** number of $2$s — a contradiction!
- **9.4 Combining Two Different Squares — General Baudhayana-Pythagoras Theorem:**
  - **Baudhayana's *Sulba-sutra* (Verse 1.12 & Verse 2.1):** *"The areas of the squares produced separately by the length and the breadth of a rectangle together equal the area of the square produced by the diagonal."*
  - For any right-angled triangle with legs (shorter sides) $a, b$ and **hypotenuse** $c$:
    $$a^2 + b^2 = c^2$$
  - Proven visually by dissecting and rearranging two squares of sides $a$ and $b$ into a single square of side $c$ using four congruent right triangles of legs $a, b$.
  - **Constructing $\sqrt{n}$ Lengths (*Sulba-sutra* Verse 1.10):** A rectangle with sides $a$ and $a\sqrt{2}$ has diagonal $a\sqrt{3}$ (creating a square with $3\times$ the area); legs $a$ and $2a$ give hypotenuse $a\sqrt{5}$ ($5\times$ the area).
  - **Subtracting Squares:** Given hypotenuse $c$ and one leg $a$, the other leg is $b = \sqrt{c^2 - a^2}$.
- **9.5 Right-Triangles Having Integer Sidelengths (Baudhayana-Pythagoras Triples):**
  - **Definition:** A triple of positive integers $(a, b, c)$ satisfying $a^2 + b^2 = c^2$ is a **Baudhayana-Pythagoras triple** (recorded in the *Sulba-sutras*, Babylonian tablets, and Euclid's *Elements*).
  - **Essential Triples to Memorise for NMMS:**
    $$(3, 4, 5), \quad (5, 12, 13), \quad (8, 15, 17), \quad (7, 24, 25), \quad (9, 40, 41), \quad (11, 60, 61), \quad (12, 35, 37), \quad (20, 21, 29)$$
  - **Primitive vs. Scaled Triples:**
    - A triple $(a, b, c)$ is **primitive** if $\text{HCF}(a, b, c) = 1$ (no common factor $> 1$).
    - Multiplying a triple by any positive integer $k$ yields a **scaled triple** $(ka, kb, kc)$ (since $(ka)^2 + (kb)^2 = k^2(a^2+b^2) = k^2 c^2 = (kc)^2$, e.g., $(6, 8, 10), (9, 12, 15), (300, 400, 500)$).
  - **Generating Infinitely Many Primitive Triples Using Odd Squares:**
    - From Chapter 1, $1 + 3 + 5 + \dots + (2n - 1) = n^2 \implies (n - 1)^2 + (2n - 1) = n^2$.
    - Whenever the $n$-th odd number $2n - 1$ is itself an odd perfect square $k^2$ (for any odd $k \ge 3$), setting $2n - 1 = k^2 \implies n = \frac{k^2 + 1}{2}$ produces the primitive triple:
      $$\left(k,\; \frac{k^2 - 1}{2},\; \frac{k^2 + 1}{2}\right)$$
      (e.g., $k = 3 \implies (3, 4, 5)$; $k = 5 \implies (5, 12, 13)$; $k = 7 \implies (7, 24, 25)$; $k = 9 \implies (9, 40, 41)$).
    - *Note:* Not all primitive triples have hypotenuse $c = b + 1$ (e.g., $(8, 15, 17)$ and $(20, 21, 29)$ have $c = b + 2$ or $c = b + 8$).
- **9.6 Fermat's Last Theorem:**
  - **Pierre de Fermat** (17th century) conjectured that the equation $a^n + b^n = c^n$ has **no positive integer solutions $(a, b, c)$ for any integer $n > 2$**.
  - Remained unsolved for over 300 years until proven by British mathematician **Andrew Wiles** in **1994**.
- **9.7 Classical & Geometric Applications:**
  - **Bhaskaracharya's (*Bhaskara II*, *Lilavati*, 1150 CE) Lotus Problem:**
    - In a lake, a lotus bud stands $h$ units ($1\text{ unit}$) above the water surface. Forced by the wind, it gradually advances and is submerged at a horizontal distance $d$ ($3\text{ units}$) from its original position.
    - If the lake depth is $x$, the stem length (hypotenuse) is $x + h$, so:
      $$x^2 + d^2 = (x + h)^2 \implies x^2 + 3^2 = (x + 1)^2 \implies 9 = 2x + 1 \implies x = 4\text{ units}$$
  - **Rhombus Side & Diagonal Problems:** Since the diagonals $d_1, d_2$ of a rhombus bisect each other at $90^\circ$, they divide the rhombus into four right triangles with legs $\frac{d_1}{2}$ and $\frac{d_2}{2}$ and hypotenuse equal to the rhombus side $s$:
    $$s = \sqrt{\left(\frac{d_1}{2}\right)^2 + \left(\frac{d_2}{2}\right)^2}$$
    (e.g., $d_1 = 24, d_2 = 70 \implies s = \sqrt{12^2 + 35^2} = 37$).
  - **Ladder, Pole, Tree-Breaking & Circle Chord Problems:** Finding height reached by a ladder against a wall, distance between tops of two poles, or distance of a chord from the centre of a circle.

### Key Formulas, Identities, Theorems & Mathematicians
- **Baudhayana-Pythagoras Theorem:**
  $$a^2 + b^2 = c^2 \implies c = \sqrt{a^2 + b^2}, \qquad a = \sqrt{c^2 - b^2}$$
- **Diagonal of a Square of Side $a$ & Rectangle of Sides $l, w$:**
  $$d_{\text{square}} = a\sqrt{2}, \qquad d_{\text{rectangle}} = \sqrt{l^2 + w^2}$$
- **Side $s$ of a Rhombus with Diagonals $d_1, d_2$:**
  $$s^2 = \left(\frac{d_1}{2}\right)^2 + \left(\frac{d_2}{2}\right)^2 \iff 4s^2 = d_1^2 + d_2^2$$
- **Mathematicians:** **Baudhayana** (*Sulba-sutra*, c. 800 BCE — Verses 1.9, 1.10, 1.12, 2.1), **Pythagoras** (c. 500 BCE), **Euclid** (*Elements*, c. 300 BCE — irrationality of $\sqrt{2}$), **Bhaskaracharya / Bhaskara II** (*Lilavati*, 1150 CE — Lotus problem), **Pierre de Fermat** & **Andrew Wiles** (1994 — Fermat's Last Theorem).

### Mapping & Disambiguation Rules
- **Ch 9 (`math-8-09-baudhayana-pythagoras`) vs. Ch 11 (`math-8-11-geometric-themes`):** Standard 2D right-triangle problems, Pythagorean triples, rhombus side-diagonal calculations, and the lotus/ladder problems map to **Ch 9**. Finding the **shortest path on the surface of a 3D cuboid** (*Ant and Laddu problem*) by unfolding its net and applying $a^2 + b^2 = c^2$ maps to **Ch 11**.

---

## Chapter 10: Proportional Reasoning-2 (`math-8-10-proportional-reasoning-2`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 10
- **Book Page Range:** pp. 55–69
- **PDF Page Range:** pp. 57–71
- **Sub-Discipline:** Commercial Arithmetic / Statistics (Pie Charts & Inverse Proportion)

### Canonical Topic Aliases
- **Direct and Inverse Proportions** (Inverse variation $x_1 y_1 = x_2 y_2$, speed-time-distance, provisions for students/soldiers, gear/pulley ratios)
- **Time and Work** (Workers vs. days, combined work rates $\frac{1}{t_1} + \frac{1}{t_2}$)
- **Multi-Term Ratios & Map Scales** (Dividing a whole in ratio $a : b : c : d$, Representative Fraction [RF] on maps)
- **Pie Charts (Circle Graphs)** (Converting data counts/percentages into central sector angles of $360^\circ$)

### Core Concepts, Subtopics & Problem Archetypes
- **10.1 & 10.2 Ratios in Maps — Representative Fraction (RF):**
  - **Representative Fraction (RF):** The ratio of a distance on the map to the corresponding actual distance on the ground, expressed in the **same unit of length**.
  - *Example:* $\text{RF } 1 : 60,00,000$ means $1\text{ cm}$ on the map represents $60,00,000\text{ cm} = 60,000\text{ m} = 60\text{ km}$ on the ground.
- **10.3 & 10.4 Ratios with More Than 2 Terms & Dividing a Whole:**
  - **Multi-Term Ratios ($a : b : c : \dots$):** Scaling all terms by the same non-zero factor $k$ preserves the proportion (e.g., concrete mix of cement : sand : gravel $= 1 : 1.5 : 3 = 2 : 3 : 6$).
  - **Dividing a Quantity $x$ in the Ratio $p : q : r : s$:**
    $$\text{Part}_1 = \frac{p}{p + q + r + s} \times x, \qquad \text{Part}_2 = \frac{q}{p + q + r + s} \times x, \quad \text{etc.}$$
  - **Geometric Ratio Archetypes:**
    - Angles of a triangle in the ratio $p : q : r \implies$ divide $180^\circ$ in the ratio $p : q : r$ (e.g., $1 : 3 : 5 \implies 20^\circ, 60^\circ, 100^\circ$).
    - **Triangle Sidelength Ratio Trap:** Sidelengths of a triangle **cannot** be in the ratio $1 : 3 : 5$ because $1k + 3k = 4k < 5k$, violating the **triangle inequality** (sum of any two sides must exceed the third side)! In contrast, triangles with sides in ratio $3 : 4 : 5$ exist and are all **similar** right-angled triangles.
- **10.5 A Slice of the Pie (Pie Charts / Circle Graphs):**
  - A **pie chart** divides a circle ($360^\circ$) into sectors whose central angles are directly proportional to the frequency or percentage of each category:
    $$\text{Central Angle of Sector} = \frac{\text{Category Value}}{\text{Total Value}} \times 360^\circ = \frac{\text{Percentage}}{100} \times 360^\circ$$
- **10.6 Inverse Proportions & Time-and-Work:**
  - **Definition of Inverse Proportion:** Two quantities $x$ and $y$ vary **inversely** if multiplying $x$ by a factor $n$ causes $y$ to be multiplied by $\frac{1}{n}$ (divided by $n$), so that their **product remains constant**:
    $$x_1 y_1 = x_2 y_2 = k \iff \frac{x_1}{x_2} = \frac{y_2}{y_1}$$
  - **Standard NMMS Inverse Proportion Archetypes:**
    1. **Workers / Machines / Pumps vs. Time:** If $M_1$ workers/pumps complete a task in $D_1$ days/hours, then $M_2$ workers take $D_2 = \frac{M_1 D_1}{M_2}$ days/hours.
    2. **Speed vs. Travel Time (Fixed Distance $d = st$):** Increasing speed by factor $n$ divides travel time by $n$ ($s_1 t_1 = s_2 t_2$).
    3. **Hostel / Camp Food & Water Provisions:** If provisions for $N_1$ people last $D_1$ days, how long do they last if $k$ people join or leave after $d$ days? Remaining person-days $= N_1(D_1 - d) = N_2 D_2$.
  - **Combined Work Rate Problems (Independent Rates):**
    - If Pump/Person A alone fills a tank / completes a job in $t_1$ hours and Pump/Person B alone takes $t_2$ hours:
      - Fraction of work done by A in $1\text{ hour} = \frac{1}{t_1}$; by B in $1\text{ hour} = \frac{1}{t_2}$.
      - Combined work done in $1\text{ hour} = \frac{1}{t_1} + \frac{1}{t_2} = \frac{t_1 + t_2}{t_1 t_2}$.
      - **Total time taken working together:**
        $$T_{\text{together}} = \frac{1}{\frac{1}{t_1} + \frac{1}{t_2}} = \frac{t_1 t_2}{t_1 + t_2}$$
      (e.g., $t_1 = 2\text{ hr}, t_2 = 3\text{ hr} \implies$ in $1\text{ hr}$ they fill $\frac{1}{2} + \frac{1}{3} = \frac{5}{6}$ of the tank, taking $\frac{6}{5}\text{ hr} = 1\text{ hr } 12\text{ min}$ for the full tank).

### Key Formulas, Identities, Theorems & Mathematicians
- **Direct vs. Inverse Proportion:**
  $$\text{Direct Proportion: } \frac{x_1}{y_1} = \frac{x_2}{y_2}, \qquad \text{Inverse Proportion: } x_1 y_1 = x_2 y_2$$
- **Pie Chart Central Angle:**
  $$\theta = \left(\frac{f_i}{\sum f_i}\right) \times 360^\circ$$
- **Combined Work / Pipe-and-Cistern Formula:**
  $$R_{\text{combined}} = \frac{1}{t_1} + \frac{1}{t_2}, \qquad T_{\text{combined}} = \frac{t_1 t_2}{t_1 + t_2}$$

### Mapping & Disambiguation Rules
- **Ch 10 (`math-8-10-proportional-reasoning-2`) vs. Ch 12 (`math-8-12-tales-dots-bars-lines`):** **Pie charts** (circle graphs and sector angle calculations) are taught in **Ch 10** (`math-8-10-proportional-reasoning-2`), whereas **Mean, Median, Bar Graphs, Line Graphs, Spreadsheets, and Infographics** are taught in **Ch 12** (`math-8-12-tales-dots-bars-lines`).

---

## Chapter 11: Exploring Some Geometric Themes (`math-8-11-geometric-themes`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 11
- **Book Page Range:** pp. 70–102
- **PDF Page Range:** pp. 72–104
- **Sub-Discipline:** Geometry (Fractals, 3D Solids, Nets & Projections)

### Canonical Topic Aliases
- **Visualising Solid Shapes (3D Geometry)** (Faces $F$, Edges $E$, and Vertices $V$ of prisms, pyramids, and Platonic solids; nets of 3D solids)
- **Projections & Isometric Drawings** (Orthographic projections — Front View, Top View, Side View; isometric dot grids and unit cube assemblies)
- **Fractals & Self-Similarity** (Sierpinski Carpet, Sierpinski Triangle, Koch Snowflake — recursive counting of shapes, holes, area, and perimeter)
- **Shortest Path on 3D Surfaces** (Unfolding a cuboid net to find the shortest surface path via the Baudhayana-Pythagoras theorem)

### Core Concepts, Subtopics & Problem Archetypes
- **11.1 Fractals (Self-Similar Geometric Patterns):**
  - **Definition:** Geometric figures exhibiting **self-similarity**, where smaller parts of the structure resemble the whole across multiple scales.
  - **Cultural & Natural Examples:** Ferns, trees, coastlines, lightning bolts, clouds; **Kandariya Mahadeva Temple** (Khajuraho) *shikhara* towers; traditional African **Fulani wedding blankets**.
  - **Quantitative Fractal Sequences (Step $0, 1, 2, \dots, n$):**
    1. **Sierpinski Carpet:** Start with 1 unit square (Step 0). At each step, divide every remaining square into $9$ congruent sub-squares ($3 \times 3$) and remove the central sub-square.
       - At Step $n$: Number of remaining squares $= 8^n$; Number of holes $= 1 + 8 + 8^2 + \dots + 8^{n-1} = \frac{8^n - 1}{7}$; Remaining area $= \left(\frac{8}{9}\right)^n$.
    2. **Sierpinski Triangle (Gasket):** Start with 1 equilateral triangle of area $1$ (Step 0). At each step, connect the midpoints of the three sides to form $4$ smaller congruent equilateral triangles and remove the central inverted triangle.
       - At Step $n$: Number of remaining triangles $= 3^n$; Number of holes $= 1 + 3 + 3^2 + \dots + 3^{n-1} = \frac{3^n - 1}{2}$; Remaining area $= \left(\frac{3}{4}\right)^n$.
    3. **Koch Snowflake:** Start with an equilateral triangle of side $1$ and perimeter $3$ (Step 0). At each step, divide every line segment into $3$ equal thirds and replace the middle third with two sides of an outward equilateral triangle (so 1 segment becomes $4$ segments each of length $\frac{1}{3}$ of the previous segment).
       - At Step $n$: Number of sides $= 3 \times 4^n$; Length of each side $= \left(\frac{1}{3}\right)^n$; Total Perimeter $= 3 \times \left(\frac{4}{3}\right)^n$ (grows without bound as $n \to \infty$ while area remains bounded!).
- **11.2 Visualising Solids (Polyhedra, Nets, Shortest Paths & Projections):**
  - **Faces ($F$), Edges ($E$), and Vertices ($V$) of Polyhedra:**
    - **Cube / Cuboid / Parallelepiped** (6 parallelogram faces): $F = 6,\; E = 12,\; V = 8$.
    - **Prism with an $n$-sided polygonal base** (two congruent parallel $n$-gon bases joined by $n$ rectangular/parallelogram lateral faces):
      $$F = n + 2, \qquad E = 3n, \qquad V = 2n$$
    - **Pyramid with an $n$-sided polygonal base** (one $n$-gon base whose vertices are joined to a single apex via $n$ triangular lateral faces):
      $$F = n + 1, \qquad E = 2n, \qquad V = n + 1$$
      *(Note: All convex polyhedra satisfy **Euler's Polyhedron Formula**: $F + V - E = 2$).*
  - **Nets of 3D Solids & Platonic Solids:**
    - A **net** is a 2D arrangement of edge-joined polygons that folds without overlap into a 3D polyhedron.
    - **Number of Distinct Nets (up to rotation/reflection):**
      - **Cube** (6 square faces): **11 distinct nets** (out of 35 hexominoes).
      - **Regular Tetrahedron** (triangular pyramid, 4 equilateral triangle faces): **2 distinct nets**.
      - **Regular Octahedron** (8 equilateral triangle faces): **11 distinct nets**.
      - **Regular Dodecahedron** (12 regular pentagon faces): **43,380 distinct nets**.
    - **Curved-Surface Nets:**
      - **Cylinder** (radius $r$, height $h$): 1 rectangle of length $2\pi r$ and height $h$, plus 2 circular discs of radius $r$.
      - **Cone** (base radius $r$, slant height $l$): 1 circular sector of radius $l$ and arc length $2\pi r$, plus 1 circular base of radius $r$.
  - **Shortest Path on the Surface of a Cuboid (*The Ant and the Laddu Problem*):**
    - To find the shortest path for an ant crawling along the outer surface of a cuboid of dimensions $L \times W \times H$ from one corner to the opposite corner, **unfold the cuboid into a flat net** and draw a straight line segment between the start and end points.
    - By the **Baudhayana-Pythagoras Theorem**, compare the three possible two-face unfoldings: $\sqrt{(L+W)^2 + H^2}$, $\sqrt{(L+H)^2 + W^2}$, and $\sqrt{(W+H)^2 + L^2}$. The shortest surface path is obtained by grouping the **two smaller dimensions** together: if $L \ge W \ge H$, then $d_{\min} = \sqrt{(W + H)^2 + L^2}$.
  - **Orthographic Projections (Profiles / 3-View Drawings):**
    - Projecting a 3D object via perpendicular rays onto three mutually perpendicular planes:
      1. **Front View** (elevation on the vertical plane).
      2. **Top View** (plan on the horizontal plane).
      3. **Side View** (profile on the side vertical plane).
    - **Invariance of Parallelism:** Parallel lines in 3D space always project to parallel lines (or points) on any projection plane; thus a parallelogram always projects to a parallelogram (or line segment).
  - **Isometric Projections & Isometric Dot Grids:**
    - Projecting a cube balanced on a corner vertex so that the three mutually perpendicular axes meeting at that corner make equal angles with the projection plane produces a **regular hexagon** outline where all three principal directions (length, breadth, height) are spaced **$120^\circ$ apart** with equal unit scale (**isometric grid**).
    - Used to draw 3D unit-cube assemblies (polycubes / Soma cube pieces) and optical illusions like the **Penrose impossible triangle**.

### Key Formulas, Identities, Theorems & Mathematicians
- **Faces, Edges, and Vertices of Prisms & Pyramids ($n$-gon base):**
  $$\text{Prism: } F = n + 2,\; E = 3n,\; V = 2n \qquad \text{Pyramid: } F = n + 1,\; E = 2n,\; V = n + 1 \qquad (F + V - E = 2)$$
- **Fractal Scaling Laws at Step $n$:**
  $$\text{Sierpinski Carpet Area} = \left(\frac{8}{9}\right)^n, \qquad \text{Sierpinski Triangle Area} = \left(\frac{3}{4}\right)^n, \qquad \text{Koch Snowflake Perimeter} = 3\left(\frac{4}{3}\right)^n$$
- **Shortest Surface Path on a Cuboid ($L \ge W \ge H$):**
  $$d_{\min} = \sqrt{L^2 + (W + H)^2}$$

### Mapping & Disambiguation Rules
- **Ch 11 (`math-8-11-geometric-themes`) vs. Class 7 Geometry:** Any question involving 3D polyhedra ($F, E, V$), cube/tetrahedron/octahedron nets, front/top/side views of stacked unit cubes, isometric dot-grid drawings, fractals (Sierpinski/Koch), or shortest ant path on a box maps to **Ch 11**.

---

## Chapter 12: Tales by Dots, Bars, and Lines (`math-8-12-tales-dots-bars-lines`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 12
- **Book Page Range:** pp. 103–134
- **PDF Page Range:** pp. 105–136
- **Sub-Discipline:** Statistics & Data Handling

### Canonical Topic Aliases
- **Data Handling & Measures of Central Tendency** (Arithmetic Mean and Median; algebraic properties of the mean under inclusion/removal and linear scaling/shifting)
- **Line Graphs & Time-Series Data Interpretation** (Comparing multi-line trends, temperature and monsoon rainfall patterns, sunrise/sunset curves)
- **Spreadsheets & Infographics** (Cell references `B3:G3`, `=SUM()`, `=AVERAGE()`, choropleth maps, strip charts)

### Core Concepts, Subtopics & Problem Archetypes
- **12.1 The Balancing Act (Deep Properties of Mean and Median):**
  - **Arithmetic Mean ($\bar{x}$):** $\bar{x} = \frac{\text{Sum of all observations}}{\text{Number of observations}} = \frac{\sum_{i=1}^{n} x_i}{n}$.
  - **Mean as the Fulcrum / Balance Point (Zero Sum of Deviations):**
    - On a number line (dot plot), the sum of distances from the mean to all data values **smaller** than the mean exactly equals the sum of distances from the mean to all data values **greater** than the mean:
      $$\sum_{x_i < \bar{x}} (\bar{x} - x_i) = \sum_{x_i > \bar{x}} (x_i - \bar{x}) \iff \sum_{i=1}^{n} (x_i - \bar{x}) = 0$$
  - **Effect of Including or Removing Observations on the Mean:**
    - Including a new value **greater than $\bar{x}$** (or removing a value **smaller than $\bar{x}$**) **increases** the mean.
    - Including a new value **smaller than $\bar{x}$** (or removing a value **greater than $\bar{x}$**) **decreases** the mean.
    - Including or removing a value **equal to $\bar{x}$** (or a pair of values symmetric around $\bar{x}$, i.e., $\bar{x} - d$ and $\bar{x} + d$) leaves the mean **unchanged**.
  - **Effect of Linear Transformations on the Mean:**
    - Given $n$ numbers $x_1, x_2, \dots, x_n$ with mean $a$:
      1. Adding a constant $c$ to every observation ($x_i + c$) changes the mean to **$a + c$**.
      2. Subtracting a constant $c$ from every observation ($x_i - c$) changes the mean to **$a - c$**.
      3. Multiplying every observation by $k$ ($k x_i$) changes the mean to **$ka$**.
      4. Dividing every observation by $k$ ($x_i / k$) changes the mean to **$a / k$**.
  - **Median (Middle Value of Sorted Data):**
    - Arrange the $n$ observations in ascending or descending order:
      - If $n$ is **odd**, $\text{Median} = \left(\frac{n+1}{2}\right)\text{-th term}$.
      - If $n$ is **even**, $\text{Median} = \text{average of the } \left(\frac{n}{2}\right)\text{-th and } \left(\frac{n}{2} + 1\right)\text{-th terms}$.
    - **Outlier Robustness:** Changing the largest value to an even larger value shifts the **mean** upward, but leaves the **median** completely unchanged!
  - **Introduction to Spreadsheets:**
    - **Cell Address:** Column letter followed by row number (e.g., `E5` is Column E, Row 5).
    - **Cell Range:** `B3:G3` denotes all cells from `B3` to `G3`.
    - **Formulas:** `=SUM(B3:G3)` computes the sum; `=AVERAGE(B7:D7)` computes the arithmetic mean.
- **12.2 Visualising and Interpreting Data:**
  - **Clustered Bar Graphs & Line Graphs (Time Series):**
    - Reading and comparing multi-variable line graphs over time:
      - Monthly max temperatures of **Kerala** (equatorial/coastal — narrow range $29\text{–}34^\circ\text{C}$) vs. **Punjab** (continental — wide range $20\text{–}40^\circ\text{C}$).
      - **Indian Monsoon Rainfall Signatures:** West Coast cities (**Udupi, Mumbai, Kovalam**) peak sharply in **June–August** (Southwest Monsoon), whereas East Coast cities in Tamil Nadu (**Chennai, Rameswaram**) peak in **October–December** (Northeast / Retreating Monsoon).
      - Global space objects launched per year, sleep duration vs. age curves, and 30-day sunrise/sunset vs. moonrise/moonset cyclic graphs.
  - **Infographics:** Reading scale-based choropleth maps (rice vs. wheat consumption across Indian states) and 24-hour half-hourly daily activity strip charts.

### Key Formulas, Identities, Theorems & Mathematicians
- **Arithmetic Mean & Balance Property:**
  $$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i \iff \sum_{i=1}^{n} x_i = n\bar{x}, \qquad \sum_{x_i < \bar{x}} (\bar{x} - x_i) = \sum_{x_i > \bar{x}} (x_i - \bar{x})$$
- **Linear Transformation of the Mean:**
  $$\text{If Mean}(x_1, \dots, x_n) = a, \quad \text{then Mean}(kx_1 \pm c, \dots, kx_n \pm c) = ka \pm c$$

### Mapping & Disambiguation Rules
- **Ch 12 (`math-8-12-tales-dots-bars-lines`) vs. Ch 10 (`math-8-10-proportional-reasoning-2`):** Questions on Mean, Median, effect of adding/removing/scaling data points on the average, line graphs, bar graphs, or spreadsheet formulas (`=SUM`, `=AVERAGE`) map to **Ch 12**. Questions on **Pie Charts** (calculating central angles or reading sector percentages) map to **Ch 10**.

---

## Chapter 13: Algebra Play (`math-8-13-algebra-play`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 13
- **Book Page Range:** pp. 135–147
- **PDF Page Range:** pp. 137–149
- **Sub-Discipline:** Algebra / Number Theory (Linear Equations & Grid Proofs)

### Canonical Topic Aliases
- **Linear Equations in One Variable** (Formulating and solving algebraic equations from word problems, age problems, coin/flower-doubling puzzles, hens-and-horses problems)
- **Algebraic Number Tricks & Place-Value Proofs** (2-digit reversal identities, 3-digit cyclic permutation sums, 6-digit repeating numbers $abcabc = 1001 \times abc$)
- **Number Pyramids, Calendar Grids & Virahanka-Fibonacci Numbers** (Binomial-weighted pyramid sums, calendar square algebra)

### Core Concepts, Subtopics & Problem Archetypes
- **13.1 & 13.2 'Think of a Number' & Birthday Tricks:**
  - Translating multi-step verbal instructions into an algebraic expression in $x$ (or date $d$ and month $m$) to simplify and invert the steps:
    - *Birthday Trick:* Multiply birth month $m$ by $5 \to$ add $6 \to$ multiply by $2 \to$ add birth date $d \to$ multiply by $5 \to$ subtract $60$:
      $$5\big(2(5m + 6) + d\big) - 60 = 5(10m + 12 + d) - 60 = 50m + 60 + 5d - 60 = 50m + 5d = 5(10m + d)$$
      Dividing the final answer by $5$ yields $10m + d$ (or $100m + d$ when multiplied by $20$ instead of $2$), immediately revealing both $m$ and $d$.
- **13.3 Number Pyramids & Virahanka-Fibonacci Numbers:**
  - **Rule:** Each cell above the bottom row equals the sum of the two cells directly below it.
  - **Algebraic Top-Cell Formulas (Binomial / Pascal Weights):**
    - **2-row pyramid** with bottom row $(a, b)$: Top $= a + b$.
    - **3-row pyramid** with bottom row $(a, b, c)$: Middle row is $(a+b,\; b+c)$; Top $= a + 2b + c$.
    - **4-row pyramid** with bottom row $(a, b, c, d)$: Top $= a + 3b + 3c + d$.
  - **Virahanka-Fibonacci Sequence ($1, 2, 3, 5, 8, 13, 21, 34, 55, \dots$):**
    - Each number is the sum of the two preceding numbers ($F_{k} = F_{k-1} + F_{k-2}$).
    - If the bottom row of an $n$-row number pyramid is filled in order with consecutive **Virahanka-Fibonacci numbers** ($F_1, F_2, \dots, F_n$), then **every single cell in the pyramid is also a Virahanka-Fibonacci number**!
- **13.4 & 13.5 Fun with Grids & Largest Product:**
  - **Calendar $2 \times 2$ Grid:** Since each row in a calendar increases by $+1$ across columns and $+7$ down rows, any $2 \times 2$ square with top-left date $a$ consists of $a,\; a+1,\; a+7,\; a+8$, with total sum:
    $$S = a + (a + 1) + (a + 7) + (a + 8) = 4a + 16 = 4(a + 4)$$
  - **Maximising a 2-Digit $\times$ 1-Digit Product:** Given three distinct digits $p < q < r$, to form a 2-digit number multiplied by a 1-digit number with the **largest possible product**, always place the largest digit $r$ as the 1-digit multiplier and form $(10q + p)$ with the remaining two:
    $$\text{Maximum Product} = (10q + p) \times r$$
    (Proven algebraically by comparing $10qr + pr$ against $10rq + pq$ and $10rp + qp$).
- **13.6 Decoding Divisibility Tricks & Classical Linear Equation Word Problems:**
  - **Trick 1 — Reversing a 2-Digit Number ($ab = 10a + b$ and $ba = 10b + a$):**
    - **Sum of a 2-digit number and its reverse** is always divisible by **$11$**:
      $$(10a + b) + (10b + a) = 11a + 11b = 11(a + b)$$
      (When divided by $11$, the quotient is $a + b$; when divided by $a + b$, the quotient is always $11$).
    - **Difference between a 2-digit number and its reverse** (for $b > a$) is always divisible by **$9$**:
      $$(10b + a) - (10a + b) = 9b - 9a = 9(b - a)$$
      (When divided by $9$, the quotient is $|b - a|$).
  - **Trick 2 — Cyclic Permutations of a 3-Digit Number ($abc + bca + cab$):**
    - Adding a 3-digit number and its two cyclic shifts is always divisible by **$111$, $37$, and $3$**:
      $$(100a + 10b + c) + (100b + 10c + a) + (100c + 10a + b) = 111(a + b + c) = 3 \times 37 \times (a + b + c)$$
  - **Trick 3 — Repeating a 3-Digit Number to Form a 6-Digit Number ($abcabc$):**
    - Writing any 3-digit number $abc$ twice side-by-side multiplies it by **$1001 = 7 \times 11 \times 13$**:
      $$abcabc = 1000(abc) + abc = 1001 \times abc = 7 \times 11 \times 13 \times abc$$
      Hence $abcabc$ is **always divisible by $7, 11, 13,$ and $1001$**, and dividing $abcabc$ successively by $7, 11,$ and $13$ returns the original number $abc$!
  - **Classical Linear Equation Word Problems (Explore Further):**
    - **Temple Flower-Doubling / Karim & the Genie Puzzle:** Starting with $x$ coins/flowers, at each of 3 shrines/dips the count doubles and $k$ units are offered ($x \to 2x - k \to 2(2x - k) - k \to 2(2(2x - k) - k) - k = 8x - 7k$). For Karim ($k = 8$, final $= 8$): $8x - 56 = 8 \implies x = 7$. For 3 shrines leaving $0$ flowers at the end: $8x - 7k = 0 \implies x = 7, k = 8$ (minimum positive integers).
    - **Hens and Horses (Heads & Legs) Problem:** 55 heads ($h + c = 55$) and 150 legs ($2h + 4c = 150 \implies h + 2c = 75$) $\implies c = 20$ horses and $h = 35$ hens.

### Key Formulas, Identities, Theorems & Mathematicians
- **Number Pyramid Top-Cell Identities:**
  $$\text{3-Row Top} = a + 2b + c, \qquad \text{4-Row Top} = a + 3b + 3c + d$$
- **Place-Value Algebraic Identities:**
  $$(10a + b) + (10b + a) = 11(a + b), \qquad |(10a + b) - (10b + a)| = 9|a - b|$$
  $$abc + bca + cab = 111(a + b + c) = 3 \times 37(a + b + c)$$
  $$abcabc = 1001 \times abc = 7 \times 11 \times 13 \times abc$$
- **Mathematicians:** **Virahanka** (c. 600–800 CE) & **Fibonacci** (1202 CE) — Virahanka-Fibonacci numbers.

### Mapping & Disambiguation Rules
- **Ch 13 (`math-8-13-algebra-play`) vs. Ch 5 (`math-8-05-number-play`):** See Chapter 5 disambiguation rules above. Any problem involving linear equations in one variable, number pyramids, calendar grids, $ab \pm ba$, $abc + bca + cab$, or $abcabc = 7 \times 11 \times 13 \times abc$ maps to **Ch 13**.

---

## Chapter 14: Area (`math-8-14-area`)

### Book Metadata
- **Part:** Part 2
- **Chapter No.:** 14
- **Book Page Range:** pp. 148–174 *(Learning Material Sheets on pp. 172–174)*
- **PDF Page Range:** pp. 150–176
- **Sub-Discipline:** Mensuration / Geometry

### Canonical Topic Aliases
- **Mensuration — Area of Plane Figures (2D Polygons)** (Area of rectangles, squares, rectangular paths/crosspaths, triangles, parallelograms, rhombuses, trapeziums, and general polygons via triangulation)
- **Geometric Area Theorems & Dissections** (Median of a triangle halves its area; triangles between the same parallels; Heron's reflection principle for minimum perimeter; *Sulba-sutra* polygon-to-rectangle dissections)
- **Real-Life Area Units & Conversions** ($\text{cm}^2, \text{in}^2, \text{ft}^2, \text{m}^2, \text{acres}, \text{km}^2$, A4 paper dimensions)

### Core Concepts, Subtopics & Problem Archetypes
- **14.1 Let Us Recall — Rectangles, Squares & Rectangular Paths:**
  - **Area vs. Perimeter:** Area measures the 2D region enclosed by a boundary (in square units), whereas perimeter measures the 1D boundary length. Figures with a larger perimeter can have a **smaller area** (e.g., a $1 \times 10$ strip has perimeter $22$ and area $10$, whereas a $4 \times 4$ square has perimeter $16$ and area $16$).
  - **Area of Rectangle & Square:** $\text{Area}_{\text{rect}} = l \times w$; $\text{Area}_{\text{square}} = s^2$.
  - **Area of Rectangular Frame / Path / Crosspaths:** Computed either by subtracting the inner rectangle from the outer rectangle ($L W - lw$) or by summing dissected rectangular strips.
- **14.2 Area of a Triangle & Equal-Area Theorems:**
  - **Area of Any Triangle:** By enclosing any triangle (acute, right, or obtuse) within a rectangle on the same base $b$ and altitude (perpendicular height) $h$:
    $$\text{Area of a Triangle} = \frac{1}{2} \times \text{base} \times \text{height} = \frac{1}{2}bh$$
    *(For an obtuse-angled triangle, the altitude $h$ from the apex falls on the extended base outside the triangle, and $\text{Area} = \frac{1}{2}bh$ still holds by subtracting two right triangles).*
  - **Equal-Area Triangle Theorems:**
    1. **Triangles with the same base and height** (i.e., third vertex lying anywhere on a line parallel to the base) have **equal areas**.
    2. **Median Theorem:** A **median** of a triangle (line segment joining a vertex to the midpoint of the opposite side) divides the triangle into **two triangles of equal area** (since both share the same altitude and have equal bases $\frac{1}{2}b$).
    3. **Rectangle Diagonals:** The two diagonals of a rectangle (or any parallelogram) divide it into **four triangles of equal area** (each having $\frac{1}{4}$ of the total area).
  - **Minimum Perimeter among Equal-Area Triangles (Reflection Principle):**
    - Among all triangles sharing the same base $AB$ and having the same area (third vertex $C$ moving along a line $l \parallel AB$), the **isosceles triangle** ($AC = BC$) has the **minimum perimeter** (proven by reflecting $B$ across line $l$ to $B'$ and noting that $AC + CB = AC + CB'$ is minimised when $A, C, B'$ are collinear, making $\angle 1 = \angle 2$).
  - ***Sulba-sutra* Rectangle $\leftrightarrow$ Triangle Transformations:** A triangle of base $b$ and height $h$ has the same area as a rectangle of sides $\frac{b}{2}$ and $h$ (or $b$ and $\frac{h}{2}$).
- **14.3 Area of Any Polygon (Triangulation, Parallelogram, Rhombus & Trapezium):**
  - **Triangulation Principle:** The area of **any polygon** (pentagon, hexagon, irregular quadrilateral) can be evaluated by dividing it into non-overlapping triangles (or right triangles and trapeziums around a central diagonal) and summing their areas.
  - **Area of a Parallelogram:**
    - Dissecting a right triangle from one end and translating it to the other end transforms the parallelogram into a rectangle of the same base $b$ and perpendicular height $h$ (or dividing along a diagonal into two congruent triangles of area $\frac{1}{2}bh$ each):
      $$\text{Area of a Parallelogram} = \text{base} \times \text{height} = b \times h$$
  - **Area of a Rhombus:**
    - Using its two perpendicular bisecting diagonals $d_1$ and $d_2$ (proven via *Sulba-sutra* dissection into a rectangle of sides $d_1$ and $\frac{1}{2}d_2$):
      $$\text{Area of a Rhombus} = \frac{1}{2} \times \text{product of its diagonals} = \frac{1}{2} \times d_1 \times d_2$$
  - **Area of a Trapezium:**
    - Given parallel sides of lengths $a$ and $b$ separated by perpendicular height $h$, proven in four distinct ways: (1) dividing along a diagonal into two triangles of areas $\frac{1}{2}ah + \frac{1}{2}bh$, (2) rectangle + two triangles, (3) parallelogram + triangle, and (4) rotating a second congruent copy of the trapezium to form a parallelogram of base $(a + b)$ and height $h$:
      $$\text{Area of a Trapezium} = \frac{1}{2} \times \text{height} \times (\text{sum of parallel sides}) = \frac{1}{2}h(a + b)$$
- **Areas in Real Life & Unit Conversions:**
  - **A4 Paper Sheet:** Dimensions $21\text{ cm} \times 29.7\text{ cm} \implies \text{Area} = 623.7\text{ cm}^2$.
  - **Linear vs. Square Unit Conversions:**
    - $1\text{ in} = 2.54\text{ cm} \implies 1\text{ in}^2 = (2.54)^2\text{ cm}^2 = 6.4516\text{ cm}^2$.
    - $1\text{ ft} = 12\text{ in} = 30.48\text{ cm} \implies 1\text{ ft}^2 = 144\text{ in}^2 \approx 0.0929\text{ m}^2$ ($1\text{ m}^2 \approx 10.764\text{ ft}^2$).
    - $1\text{ acre} = 43,560\text{ ft}^2$; $1\text{ km}^2 = (1000\text{ m})^2 = 10^6\text{ m}^2 = 10,00,000\text{ m}^2$.
    - Traditional Indian regional land area units: *bigha*, *gaj*, *katha*, *dhur*, *cent*, *ankanam*, *guntha*.

### Key Formulas, Identities, Theorems & Mathematicians
- **Complete Mensuration Formula Summary (Class 8):**
  $$\text{Rectangle} = l \times w, \qquad \text{Square} = s^2 = \frac{1}{2}d^2, \qquad \text{Triangle} = \frac{1}{2} \times b \times h$$
  $$\text{Parallelogram} = b \times h, \qquad \text{Rhombus} = \frac{1}{2} \times d_1 \times d_2 = b \times h, \qquad \text{Trapezium} = \frac{1}{2} \times h \times (a + b)$$
- **Unit Conversions for Area:**
  $$1\text{ m}^2 = 10^4\text{ cm}^2 = 10.764\text{ ft}^2, \qquad 1\text{ km}^2 = 10^6\text{ m}^2, \qquad 1\text{ in}^2 = 6.4516\text{ cm}^2, \qquad 1\text{ acre} = 43,560\text{ ft}^2$$
- **Historical Sources:** ***Sulba-sutras*** (geometric area-preserving dissections converting triangles, rhombuses, and isosceles trapeziums into rectangles).

### Mapping & Disambiguation Rules
- **Ch 14 (`math-8-14-area`) vs. Ch 4 (`math-8-04-quadrilaterals`):** Any problem computing or comparing the **area** of triangles, parallelograms, rhombuses, trapeziums, or general polygons maps to **Ch 14**. Problems on angle measures, side lengths, or diagonal properties without area calculations map to **Ch 4**.

---

## Cross-Chapter & Cross-Grade Disambiguation Matrix (For PYQ Tagging)

| Common NMMS Question Theme | Target Chapter Slug | Why / Disambiguation Rule |
| :--- | :--- | :--- |
| Perfect squares/cubes, $\sqrt{N}$, $\sqrt[3]{N}$, 1729, odd-number sums | `math-8-01-square-and-cube` | Specific to exponents $2$ and $3$ and radical extraction. |
| Laws of exponents ($n^a \times n^b, n^{-a}$), scientific notation ($x \times 10^y$), PIN/outfit counting | `math-8-02-power-play` | General integer exponents, powers of 10, and multiplicative counting. |
| Roman, Egyptian, Babylonian, Mayan, Chinese numerals, Base-$2 / 5 / 8$ conversion | `math-8-03-story-of-numbers` | Historical number systems and non-base-10 positional representations. |
| Interior angles ($360^\circ$), properties of sides/diagonals, Venn hierarchy of quadrilaterals | `math-8-04-quadrilaterals` | Pure geometric properties and congruence proofs of quadrilaterals (no area). |
| Divisibility tests ($2,3,4,5,8,9,10,11$), digital roots, remainders $dk+r$, cryptarithms | `math-8-05-number-play` | Divisibility rules, LCM remainder puzzles, and letter-for-digit arithmetic. |
| Expanding/factorising $(a\pm b)^2$, $a^2-b^2$, $(a+m)(b+n)$, fast mental squaring | `math-8-06-distribute-multiply` | Polynomial multiplication and standard algebraic identities. |
| 2-term ratios ($a:b$), direct proportion ($a:b::c:d$), *Trairasika*, sharing in ratio $m:n$ | `math-8-07-proportional-reasoning-1` | Two-term ratios and direct variation only. |
| Percentages, Profit/Loss, CP/SP/MP, Discount, GST, Simple & Compound Interest | `math-8-08-fractions-in-disguise` | All commercial arithmetic involving $\%$ and interest formulas. |
| Right triangles ($a^2+b^2=c^2$), Pythagorean triples, $\sqrt{2}$ irrationality, rhombus side from diagonals | `math-8-09-baudhayana-pythagoras` | 2D applications of Baudhayana-Pythagoras theorem and triples. |
| Map scale (RF), multi-term ratio ($a:b:c$), Pie Charts ($360^\circ$), Inverse Proportion, Time & Work | `math-8-10-proportional-reasoning-2` | Multi-part ratios, circle graphs, inverse variation ($x_1y_1=x_2y_2$), and work rates. |
| Fractals (Sierpinski/Koch), 3D polyhedra ($F, E, V$), nets, Front/Top/Side views, shortest path on cuboid | `math-8-11-geometric-themes` | 3D solid visualisation, projections, nets, and self-similar fractals. |
| Mean, Median, effect of scaling/adding on mean, line graphs, bar graphs, spreadsheets | `math-8-12-tales-dots-bars-lines` | Central tendency (mean/median) and dot/bar/line charts (excluding pie charts). |
| Linear equations in 1 variable, number pyramids, calendar grids, $ab\pm ba$, $abc+bca+cab$, $abcabc$ | `math-8-13-algebra-play` | Solving linear equations and algebraic proofs of digit/grid puzzles. |
| Area of triangle ($\frac{1}{2}bh$), parallelogram ($bh$), rhombus ($\frac{1}{2}d_1d_2$), trapezium ($\frac{1}{2}h(a+b)$), median area | `math-8-14-area` | All 2D area formulas, polygon triangulation, and area unit conversions. |
