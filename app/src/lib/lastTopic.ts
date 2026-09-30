/** The last chapter opened on this device, for Home's "Continue" card. */
const KEY = 'nmms-last-topic'

export function getLastTopic(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    // Storage blocked (private mode): no Continue card.
    return null
  }
}

export function setLastTopic(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // Not saved; Home just won't show the Continue card.
  }
}
