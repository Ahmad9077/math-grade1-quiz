import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN, TEST_SIZE, arrangeOptions, buildPractice, buildTest, orderQuestions, starsFor } from '../../src/domain/round'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

describe('rounds', () => {
  it('builds a practice round from one lesson without repeats', () => {
    const round = buildPractice('clock', [], [], seeded(3))
    expect(round).toHaveLength(PRACTICE_SIZE)
    expect(new Set(round.map((q) => q.key)).size).toBe(PRACTICE_SIZE)
    expect(round.every((q) => q.topic === 'clock')).toBe(true)
  })

  it('builds the twelve-question mock test from every lesson', () => {
    const round = buildTest([], [], seeded(7))
    expect(round).toHaveLength(TEST_SIZE)
    expect(TEST_SIZE).toBe(12)
    for (const [topic, count] of Object.entries(TEST_PLAN)) expect(round.filter((q) => q.topic === topic)).toHaveLength(count)
  })

  it('puts Hub-selected questions first, then unseen ones', () => {
    const pool = QUESTIONS.filter((q) => q.topic === 'count')
    const preferred = [pool[5]!.key, pool[2]!.key]
    const recent = pool.slice(0, 8).map((q) => q.key)
    const ordered = orderQuestions(pool, preferred, recent, seeded(1))
    expect(ordered.slice(0, 2).map((q) => q.key)).toEqual(preferred)
    const firstFresh = ordered[2]!
    expect(recent).not.toContain(firstFresh.key)
  })

  it('changes from one attempt to the next: other questions, other objects to count', () => {
    const first = buildTest([], [], seeded(11))
    const second = buildTest([], first.map((q) => q.key), seeded(12))
    const repeated = second.filter((q) => first.some((other) => other.key === q.key))
    expect(repeated.length).toBeLessThanOrEqual(1)
    const objects = new Set(
      Array.from({ length: 6 }, (_, n) => buildPractice('count', [], [], seeded(20 + n)))
        .flat()
        .flatMap((q) => [q.subject ?? '', ...q.options.map((o) => o.art)])
        .filter((art) => art.startsWith('count:'))
        .map((art) => art.split(':')[1]),
    )
    expect(objects.size).toBeGreaterThan(3)
    expect(objects.has('*')).toBe(false)
  })

  it('keeps the comparison signs in the book order', () => {
    const question = QUESTIONS.find((q) => q.topic === 'compare' && q.fixedOrder)!
    expect(arrangeOptions(question, seeded(4)).map((o) => o.art)).toEqual(['sym:>', 'sym:=', 'sym:<'])
  })

  it('shuffles the choices of every pick question', () => {
    const moved = QUESTIONS.filter((q) => q.kind === 'pick').some(
      (q) => arrangeOptions(q, seeded(9)).map((o) => o.id).join() !== q.options.map((o) => o.id).join(),
    )
    expect(moved).toBe(true)
  })

  it('awards stars generously for young learners', () => {
    expect(starsFor(8, 8)).toBe(3)
    expect(starsFor(5, 8)).toBe(2)
    expect(starsFor(2, 8)).toBe(1)
    expect(starsFor(0, 0)).toBe(1)
  })
})
