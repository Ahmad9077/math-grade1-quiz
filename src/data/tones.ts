import type { TopicId } from './catalog'

export type ToneId = TopicId | 'test'

// Each lesson keeps one colour everywhere it appears: the sea and coral of the book's cover.
export const TONES: Record<ToneId, { tone: string; tint: string; deep: string }> = {
  sentence: { tone: '#1f7fc4', tint: '#dcefff', deep: '#14588a' },
  make45: { tone: '#e0466e', tint: '#ffe1e9', deep: '#9c2647' },
  make9: { tone: '#f08a24', tint: '#ffeedb', deep: '#a65508' },
  test: { tone: '#0d6e8c', tint: '#d6f1f8', deep: '#08495d' },
}

export function toneStyle(id: ToneId): Record<string, string> {
  const { tone, tint, deep } = TONES[id]
  return { '--tone': tone, '--tint': tint, '--deep': deep }
}
