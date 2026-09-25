import type { Rich as RichText } from '../lib/i18n'

/** Renders dictionary text parts; odd-indexed parts are bold. */
export function Rich({ parts }: { parts: RichText }) {
  return <>{parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p))}</>
}
