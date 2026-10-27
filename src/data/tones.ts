import type { TopicId } from './catalog'

export type ToneId = TopicId | 'test'

// Each lesson keeps one colour everywhere it appears: the sea and coral of the book's cover.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  count: { tone: '#1f7fc4', tint: '#dcefff', deep: '#14588a' },
  order: { tone: '#f08a24', tint: '#ffeedb', deep: '#a65508' },
  compare: { tone: '#7a4fd1', tint: '#ece4ff', deep: '#4f2f93' },
  clock: { tone: '#22a06b', tint: '#dcf5e9', deep: '#14704a' },
  calendar: { tone: '#e0466e', tint: '#ffe1e9', deep: '#9c2647' },
  test: { tone: '#0d6e8c', tint: '#d6f1f8', deep: '#08495d' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
