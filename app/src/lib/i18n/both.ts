import { createContext, useContext, useSyncExternalStore } from 'react'

const KEY = 'nmms-both'
const listeners = new Set<() => void>()

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let current = read()

export function setBoth(next: boolean) {
  current = next
  try {
    localStorage.setItem(KEY, next ? '1' : '0')
  } catch {
    // Not saved, but still applied for this visit.
  }
  listeners.forEach((l) => l())
}

/** The saved setting, whatever page is showing. */
export function useBothSetting(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}

/**
 * The chapter of the current page, set in App on the pages that can show English and Kannada together
 * ("EN+ಕ" in the top bar): every chapter page except the "Guess the rule" game, and the Shapes page ("shapes").
 */
export const TopicIdContext = createContext<string | undefined>(undefined)

/** Whether this page can show both languages, i.e. whether to offer the switch. */
export function useBothAvailable(): boolean {
  return useContext(TopicIdContext) !== undefined
}

/** Whether to show the second language on this page right now. */
export function useShowBoth(): boolean {
  const on = useBothSetting()
  return useBothAvailable() && on
}
