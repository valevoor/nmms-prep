import { Page } from '../components/Page'
import { Rich } from '../components/Rich'
import { CUBE_LAST_DIGIT, CUBE_ROOTS, FACT_TABS, HUNDRED, PRIMES, PRIMES_BY_TEN, PRIME_TRAPS, SQUARE_AND_CUBE, SQUARE_ROOTS } from '../data/facts'
import type { FactTab } from '../data/facts'
import { useT } from '../lib/i18n'
import { href } from '../lib/router'

const PRIME_SET = new Set(PRIMES)
const TRAP_SET = new Set(PRIME_TRAPS.map(([n]) => n))

function Primes() {
  const t = useT().facts
  return (
    <>
      <h2 className="facts-title">{t.primesTitle}</h2>
      <p className="muted facts-intro">
        <Rich parts={t.primesIntro} />
      </p>
      <section className="card">
        <ol className="hundred" aria-label={t.gridLabel}>
          {HUNDRED.map((n) => (
            <li key={n} className={PRIME_SET.has(n) ? 'prime' : TRAP_SET.has(n) ? 'trap' : undefined}>
              {n}
            </li>
          ))}
        </ol>
        <p className="facts-legend muted">
          <span>
            <span className="swatch prime" aria-hidden />
            {t.legendPrime}
          </span>
          <span>
            <span className="swatch trap" aria-hidden />
            {t.legendTrap}
          </span>
        </p>
      </section>

      <h3 className="section-title">{t.byTens}</h3>
      <ul className="by-tens">
        {PRIMES_BY_TEN.map((r) => (
          <li key={r.from}>
            <span className="muted">
              {r.from}–{r.to}
            </span>
            <b>{r.primes.join('  ')}</b>
            <span className="count">{r.primes.length}</span>
          </li>
        ))}
      </ul>

      <section className="card trick-card warn">
        <h3>{t.trapsTitle}</h3>
        <div className="trap-list">
          {PRIME_TRAPS.map(([n, a, b]) => (
            <span key={n}>
              {n} = {a} × {b}
            </span>
          ))}
        </div>
        <ul>
          {t.primeTips.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Squares() {
  const t = useT().facts
  return (
    <>
      <h2 className="facts-title">{t.squaresTitle}</h2>
      <p className="muted facts-intro">{t.squaresIntro}</p>
      <ul className="power-grid">
        {SQUARE_ROOTS.map((n) => (
          <li key={n} className={n % 10 === 5 ? 'hl' : undefined}>
            <span>{n}²</span>
            <b>{n * n}</b>
          </li>
        ))}
      </ul>

      <h3 className="section-title">{t.tricks}</h3>
      <section className="card trick-card warn">
        <h3>{t.fiveTitle}</h3>
        <p>
          <Rich parts={t.fiveBody} />
        </p>
      </section>
      <section className="card trick-card">
        <h3>{t.gapsTitle}</h3>
        <p>{t.gapsBody}</p>
        <p className="gaps" aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n}>
              <b>{n * n}</b>
              {n < 5 && <span className="gap">+{2 * n + 1}</span>}
            </span>
          ))}
        </p>
      </section>
      <section className="card trick-card">
        <h3>{t.neverTitle}</h3>
        <p>
          <Rich parts={t.neverBody} />
        </p>
      </section>
    </>
  )
}

function Cubes() {
  const t = useT().facts
  return (
    <>
      <h2 className="facts-title">{t.cubesTitle}</h2>
      <p className="muted facts-intro">{t.cubesIntro}</p>
      <ul className="power-grid power-grid-2">
        {CUBE_ROOTS.map((n) => (
          <li key={n}>
            <span>{n}³</span>
            <b>{n ** 3}</b>
          </li>
        ))}
      </ul>

      <h3 className="section-title">{t.tricks}</h3>
      <section className="card trick-card warn">
        <h3>{t.lastDigitTitle}</h3>
        <ul className="last-digits">
          {CUBE_LAST_DIGIT.map(([d, c]) => (
            <li key={d} className={d === c ? undefined : 'hl'} aria-label={t.lastDigitLabel(d, c)}>
              {d} → {c}
            </li>
          ))}
        </ul>
        <p>
          <Rich parts={t.lastDigitBody} />
        </p>
      </section>
      <section className="card trick-card">
        <h3>{t.bothTitle}</h3>
        <div className="trap-list">
          {SQUARE_AND_CUBE.map(([n, s, c]) => (
            <span key={n}>
              {n} = {s}² = {c}³
            </span>
          ))}
        </div>
        <p>{t.bothBody}</p>
      </section>
    </>
  )
}

const VIEWS: Record<FactTab, () => React.JSX.Element> = { primes: Primes, squares: Squares, cubes: Cubes }

/** Primes, squares and cubes to learn by heart, with the tricks that go with them. */
export function Facts({ tab }: { tab: FactTab }) {
  const t = useT().facts
  const View = VIEWS[tab]
  return (
    <Page title={t.title} back="">
      <nav className="facts-tabs" aria-label={t.tabsLabel}>
        {FACT_TABS.map((k) => (
          <a key={k} href={href(`facts/${k}`)} aria-current={k === tab ? 'page' : undefined}>
            {t.tabs[k]}
          </a>
        ))}
      </nav>
      <View />
    </Page>
  )
}
