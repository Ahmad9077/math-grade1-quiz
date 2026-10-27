import { QUESTIONS, dressQuestion, type Option, type Question, type TopicId } from '../data/catalog'

export const PRACTICE_SIZE = 8
/** The mock test, weighted like the official model papers: counting and the clock carry the most marks. */
export const TEST_PLAN: Record<TopicId, number> = { count: 3, order: 2, compare: 2, clock: 3, calendar: 2 }
export const TEST_SIZE = Object.values(TEST_PLAN).reduce((sum, count) => sum + count, 0)

export type Random = () => number

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

/** Hub-preferred keys first (in plan order), then questions not seen recently, then the rest. */
export function orderQuestions(
  pool: readonly Question[],
  preferredKeys: readonly string[],
  recentKeys: readonly string[],
  random: Random = Math.random,
): Question[] {
  const byKey = new Map(pool.map((question) => [question.key, question]))
  const preferred = preferredKeys.map((key) => byKey.get(key)).filter((q): q is Question => Boolean(q))
  const used = new Set(preferred.map((question) => question.key))
  const recent = new Set(recentKeys)
  const rest = shuffle(pool.filter((question) => !used.has(question.key)), random)
  const fresh = rest.filter((question) => !recent.has(question.key))
  const stale = rest.filter((question) => recent.has(question.key))
  return [...preferred, ...fresh, ...stale]
}

export function questionsFor(topic: TopicId): Question[] {
  return QUESTIONS.filter((question) => question.topic === topic)
}

export function buildPractice(
  topic: TopicId,
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const chosen = orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random).slice(0, PRACTICE_SIZE)
  return mixKinds(chosen, random).map((question) => dressQuestion(question, random))
}

export function buildTest(
  preferredKeys: readonly string[] = [],
  recentKeys: readonly string[] = [],
  random: Random = Math.random,
): Question[] {
  const picked = (Object.keys(TEST_PLAN) as TopicId[]).flatMap((topic) =>
    orderQuestions(questionsFor(topic), preferredKeys, recentKeys, random).slice(0, TEST_PLAN[topic]),
  )
  return mixKinds(shuffle(picked, random), random).map((question) => dressQuestion(question, random))
}

/** Avoid runs of the same question style so a round keeps changing pace. */
function mixKinds(questions: Question[], random: Random): Question[] {
  const result: Question[] = []
  const pool = [...questions]
  while (pool.length > 0) {
    const last = result.at(-1)
    const index = pool.findIndex((question) => question.kind !== last?.kind || question.topic !== last?.topic)
    const pickIndex = index === -1 ? Math.floor(random() * pool.length) : index
    result.push(...pool.splice(pickIndex, 1))
  }
  return result
}

/** Choices are shuffled every time; the comparison signs keep the book's order. */
export function arrangeOptions(question: Question, random: Random = Math.random): Option[] {
  return question.kind === 'pick' && !question.fixedOrder ? shuffle(question.options, random) : [...question.options]
}

export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  return 1
}
