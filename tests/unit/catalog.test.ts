import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CHEERS, DAYS, QUESTIONS, QUIZ_ID, RETRIES, TOPICS, audioCues, clip, roundClips } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN } from '../../src/domain/round'

const DIACRITICS = /[ً-ْٰ]/
const valueOf = (id: string) => Number(id.replace(/^[a-z]+/, ''))

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('math-grade1')
  })

  it('keeps every published question key', () => {
    const keys = new Set(QUESTIONS.map((q) => q.key))
    const permanent = fs.readFileSync('integration/seed-math-grade1.sql', 'utf8').match(/'[a-z]+:[a-z0-9-]+'/g) ?? []
    expect(permanent.length).toBe(QUESTIONS.length)
    for (const key of permanent) expect(keys.has(key.slice(1, -1)), key).toBe(true)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('has a big enough bank for fresh rounds in every lesson', () => {
    expect(TOPICS.map((t) => t.id)).toEqual(['count', 'order', 'compare', 'clock', 'calendar'])
    for (const topic of TOPICS) {
      const count = QUESTIONS.filter((q) => q.topic === topic.id).length
      expect(count, topic.id).toBeGreaterThanOrEqual(2 * PRACTICE_SIZE)
      expect(count, topic.id).toBeGreaterThanOrEqual(4 * TEST_PLAN[topic.id])
    }
  })

  it('covers every number of the test, 0 to 12, in counting and in comparing', () => {
    for (let value = 0; value <= 12; value += 1) {
      expect(QUESTIONS.some((q) => q.topic === 'count' && q.answer === `n${value}`), `count ${value}`).toBe(true)
      expect(QUESTIONS.some((q) => q.topic === 'compare' && q.subject?.split(':').slice(1, 3).includes(String(value))), `compare ${value}`).toBe(true)
    }
  })

  it('covers every whole hour and every day of the week', () => {
    for (let hour = 1; hour <= 12; hour += 1) expect(QUESTIONS.some((q) => q.key === `clock:read-${hour}`), `${hour}:00`).toBe(true)
    for (const day of DAYS) expect(QUESTIONS.some((q) => q.topic === 'calendar' && q.options.some((o) => o.label === day)), day).toBe(true)
  })

  it('gives every choice question one right answer among three distinct options', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'pick')) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBe(3)
    }
  })

  it('counts right: the group, frame, abacus, sticks or cubes shows the answer', () => {
    for (const q of QUESTIONS.filter((entry) => entry.key.startsWith('count:') && entry.kind === 'pick' && entry.subject && !entry.subject.startsWith('n:'))) {
      expect(Number(q.subject!.split(':').at(-1)), q.key).toBe(valueOf(q.answer))
    }
    for (const q of QUESTIONS.filter((entry) => entry.key.startsWith('count:group-'))) {
      const right = q.options.find((o) => o.id === q.answer)!
      expect(right.art, q.key).toBe(`count:*:${q.subject!.slice(2)}`)
    }
  })

  it('puts the missing number in the train and on the number line', () => {
    for (const q of QUESTIONS.filter((entry) => /^(train|line):/.test(entry.subject ?? '') && entry.subject!.split(',').length > 2)) {
      const items = q.subject!.split(':')[1]!.split(',')
      const at = items.indexOf('?')
      const neighbour = at > 0 ? Number(items[at - 1]) + 1 : Number(items[at + 1]) - 1
      expect(valueOf(q.answer), q.key).toBe(neighbour)
    }
  })

  it('compares right: the open side of the sign faces the bigger number', () => {
    for (const q of QUESTIONS.filter((entry) => entry.topic === 'compare' && entry.fixedOrder)) {
      const [right, left] = q.subject!.split(':').slice(-2).map(Number) as [number, number]
      const sign = q.options.find((o) => o.id === q.answer)!.art.slice(4)
      // Laid out left to right: «left sign right».
      const holds = sign === '<' ? left < right : sign === '>' ? left > right : left === right
      expect(holds, q.key).toBe(true)
    }
    for (const q of QUESTIONS.filter((entry) => entry.key.startsWith('compare:complete-'))) {
      const [, right, , sign] = q.subject!.split(':')
      const left = valueOf(q.answer)
      const holds = sign === '<' ? left < Number(right) : sign === '>' ? left > Number(right) : left === Number(right)
      expect(holds, q.key).toBe(true)
      const others = q.options.filter((o) => o.id !== q.answer).map((o) => valueOf(o.id))
      for (const other of others) {
        const alsoHolds = sign === '<' ? other < Number(right) : sign === '>' ? other > Number(right) : other === Number(right)
        expect(alsoHolds, `${q.key} ${other}`).toBe(false)
      }
    }
  })

  it('reads the clock right, one hour before or after', () => {
    for (const q of QUESTIONS.filter((entry) => entry.key.startsWith('clock:read-') || entry.key.startsWith('clock:find-'))) {
      expect(valueOf(q.answer), q.key).toBe(Number(q.key.split('-').at(-1)))
    }
    for (const q of QUESTIONS.filter((entry) => /^clock:(after|before)-/.test(entry.key))) {
      const hour = Number(q.key.split('-').at(-1))
      const target = ((hour - 1 + (q.key.includes('after') ? 1 : -1) + 12) % 12) + 1
      expect(valueOf(q.answer), q.key).toBe(target)
    }
  })

  it('knows the calendar facts of the book', () => {
    const answer = (key: string) => QUESTIONS.find((q) => q.key === `calendar:${key}`)!.options.find((o) => o.id === QUESTIONS.find((q) => q.key === `calendar:${key}`)!.answer)!.label
    expect(answer('months-gregorian')).toBe('١٢')
    expect(answer('months-hijri')).toBe('١٢')
    expect(answer('national-day')).toBe('فبراير')
    expect(answer('fasting')).toBe('رمضان')
    expect(answer('hajj')).toBe('ذو الحجة')
    expect(answer('week-days')).toBe('٧')
    expect(answer('school-start')).toBe('الأحد')
    expect(answer('after-wed')).toBe('الخميس')
    expect(answer('after-sat')).toBe('الأحد')
  })

  it('builds matching boards of three different numbers', () => {
    for (const q of QUESTIONS.filter((entry) => entry.kind === 'match')) {
      expect(q.pairs.length, q.key).toBe(3)
      expect(new Set(q.pairs.map((p) => p.second)).size, q.key).toBe(3)
    }
  })

  it('has adaptive difficulty in the Hub range with skill tags', () => {
    for (const q of QUESTIONS) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1)
      expect(q.difficulty).toBeLessThanOrEqual(100)
      expect(q.skills.length).toBeGreaterThan(0)
    }
  })
})

describe('screen text', () => {
  it('shows no diacritics', () => {
    for (const q of QUESTIONS) {
      expect(q.prompt, q.key).not.toMatch(DIACRITICS)
      for (const way of q.explain) expect(way.text, q.key).not.toMatch(DIACRITICS)
    }
    for (const topic of TOPICS) expect(topic.title, topic.id).not.toMatch(DIACRITICS)
  })

  it('never glues «و» to a number, where «و١» would read as «وا»', () => {
    for (const q of QUESTIONS) for (const way of q.explain) expect(way.text, q.key).not.toMatch(/و[٠-٩]/)
  })

  it('never writes a comparison sign inside Arabic text, where it would be mirrored', () => {
    for (const q of QUESTIONS) {
      expect(q.prompt, q.key).not.toMatch(/[<>]/)
      for (const way of q.explain) expect(way.text, q.key).not.toMatch(/[<>]/)
    }
  })

  it('speaks to every child the same way (no girl- or boy-only words)', () => {
    // «تبين» is left out: here it means «shows», as in «أي ساعة تبين هالوقت؟».
    const words = ['أحسنتي', 'شطورة', 'بطلة', 'عليج', 'إنتي', 'أنتي', 'اختاري', 'شطور', 'بطل', 'عليك', 'اختار', 'اسمع', 'حاول', 'تبي', 'اختر', 'عد', 'عدي', 'قارن', 'قارني', 'حوط', 'حوطي', 'اكتب', 'اكتبي']
    const gendered = new RegExp(`(?<![\\u0600-\\u06FF])(${words.join('|')})(?![\\u0600-\\u06FF])`)
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(gendered)
    for (const q of QUESTIONS) expect(q.prompt, q.key).not.toMatch(gendered)
    for (const cheer of CHEERS) expect(cheer.text).not.toMatch(gendered)
  })
})

describe('narration', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8')) as {
    voices: Record<string, { name: string }>
    clips: Record<string, { text: string }>
  }

  it('uses Maryam, the Kuwaiti voice, without diacritics', () => {
    expect(Object.keys(manifest.voices)).toEqual(['ar'])
    expect(manifest.voices.ar!.name).toBe('Maryam Essa - Kuwaiti Calm & Warm')
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(DIACRITICS)
  })

  it('has a current clip for every cue, and no unused clips', () => {
    const cues = audioCues()
    for (const cue of cues) {
      expect(manifest.clips[cue.id]?.text, cue.id).toBe(cue.text)
      expect(fs.existsSync(`public/audio/${cue.id}.mp3`), cue.id).toBe(true)
    }
    expect(Object.keys(manifest.clips).sort()).toEqual(cues.map((cue) => cue.id).sort())
  })

  it('records only short shared phrases: no clip per question', () => {
    const total = audioCues().reduce((sum, cue) => sum + cue.text.length, 0)
    expect(total).toBeLessThan(1200)
    expect(audioCues().length).toBeLessThan(QUESTIONS.length)
  })

  it('has a recording for every clip a round can play', () => {
    const recorded = new Set(audioCues().map((cue) => cue.id))
    for (const id of roundClips(QUESTIONS)) expect(recorded.has(id), id).toBe(true)
    expect(recorded.has(clip.ui('test-intro'))).toBe(true)
  })

  it('ends every spoken question with a complete sentence', () => {
    const texts = new Map(audioCues().map((cue) => [cue.id, cue.text]))
    for (const q of QUESTIONS) expect(texts.get(q.ask.at(-1)!), q.key).toMatch(/[؟.!]$/)
  })

  it('has many cheers and kind words', () => {
    expect(CHEERS.length).toBeGreaterThanOrEqual(10)
    expect(RETRIES.length).toBeGreaterThanOrEqual(5)
  })
})
