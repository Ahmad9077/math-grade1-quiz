import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ASK_CLIPS, CHEERS, QUESTIONS, QUIZ_ID, RETRIES, TOPICS, UI_CLIPS, audioCues, clip, roundClips, type Question } from '../../src/data/catalog'
import { PRACTICE_SIZE, TEST_PLAN } from '../../src/domain/round'

const DIACRITICS = /[ً-ْٰ]/
const valueOf = (id: string) => Number(id.replace(/^[a-z]+/, ''))
const parts = (art: string) => art.split(':')
const rightOption = (q: Question) => q.options.find((o) => o.id === q.answer)!

/** The numbers a sentence option or answer id carries: `s2-6-8` → [2, 6, 8]. */
const sentenceOf = (id: string) => id.slice(1).split('-').map(Number)

describe('question bank', () => {
  it('uses the permanent quiz id', () => {
    expect(QUIZ_ID).toBe('math-grade1')
  })

  it('matches the Hub seed key for key', () => {
    const keys = new Set(QUESTIONS.map((q) => q.key))
    const seed = fs.readFileSync('integration/seed-math-grade1.sql', 'utf8')
    const inserted = seed.slice(seed.indexOf('values\n  (')).match(/'[a-z0-9]+:[a-z0-9-]+'/g) ?? []
    expect(inserted.length).toBe(QUESTIONS.length)
    for (const key of inserted) expect(keys.has(key.slice(1, -1)), key).toBe(true)
  })

  it('has unique, well-formed permanent keys', () => {
    const keys = QUESTIONS.map((q) => q.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const q of QUESTIONS) expect(q.key).toMatch(new RegExp(`^${q.topic}:[a-z0-9-]+$`))
  })

  it('follows the school card: lessons 3-2, 3-4 and 3-8, with a big enough bank for fresh rounds', () => {
    expect(TOPICS.map((t) => [t.id, t.lesson])).toEqual([
      ['sentence', '٣-٢'],
      ['make45', '٣-٤'],
      ['make9', '٣-٨'],
    ])
    for (const topic of TOPICS) {
      const count = QUESTIONS.filter((q) => q.topic === topic.id).length
      expect(count, topic.id).toBeGreaterThanOrEqual(3 * PRACTICE_SIZE)
      expect(count, topic.id).toBeGreaterThanOrEqual(6 * TEST_PLAN[topic.id])
    }
  })

  it('has no matching boards: the card asks for none', () => {
    expect(QUESTIONS.filter((q) => q.kind === 'match')).toHaveLength(0)
  })

  it('gives every question one right answer among three distinct options', () => {
    for (const q of QUESTIONS) {
      const ids = q.options.map((o) => o.id)
      expect(new Set(ids).size, q.key).toBe(ids.length)
      expect(ids, q.key).toContain(q.answer)
      expect(q.options.length, q.key).toBe(3)
    }
  })

  it('stays within the numbers of grade 1 addition: nothing above ten, nothing below zero', () => {
    for (const q of QUESTIONS) {
      for (const o of q.options) {
        if (o.id.startsWith('n')) expect(valueOf(o.id), `${q.key} ${o.id}`).toBeGreaterThanOrEqual(0)
        if (o.id.startsWith('n')) expect(valueOf(o.id), `${q.key} ${o.id}`).toBeLessThanOrEqual(10)
        if (o.id.startsWith('s')) for (const n of sentenceOf(o.id)) expect(n, `${q.key} ${o.id}`).toBeLessThanOrEqual(10)
      }
      for (const n of (q.subject ?? '').match(/\d+/g) ?? []) expect(Number(n), q.key).toBeLessThanOrEqual(10)
    }
  })

  it('adds right in every picture, rod, frame, domino and number line', () => {
    for (const q of QUESTIONS) {
      const art = parts(q.subject ?? '')
      const kind = art[0]
      const answer = q.answer.startsWith('n') ? valueOf(q.answer) : NaN
      if (kind === 'pair' || kind === 'cubes2' || kind === 'frame2' || kind === 'paint') {
        const [a, b] = art.slice(-2).map(Number) as [number, number]
        expect(q.answer, q.key).toBe(`s${a}-${b}-${a + b}`)
        // The wrong sentences are wrong for this picture.
        for (const o of q.options.filter((option) => option.id !== q.answer)) {
          const [x, y, z] = sentenceOf(o.id)
          expect(x === a && y === b && z === a + b, `${q.key} ${o.id}`).toBe(false)
        }
      } else if (kind === 'dotsent') {
        expect(answer, q.key).toBe(Number(art[1]) + Number(art[2]))
      } else if (kind === 'jump') {
        expect(answer, q.key).toBe(Number(art[1]) + Number(art[2]))
      } else if (kind === 'domsent') {
        expect(Number(art[1]) + answer, q.key).toBe(Number(art[2]))
      } else if (kind === 'picsent') {
        expect(answer, q.key).toBe(Number(art[3]))
      } else if (kind === 'bond') {
        const [whole, a, b] = art.slice(1).map((n) => (n === '?' ? answer : Number(n)))
        expect(a! + b!, q.key).toBe(whole)
      } else if (kind === 'eq') {
        const [a, b, c, d] = art.slice(1).map((n) => (n === '?' ? answer : Number(n)))
        expect(a! + b!, q.key).toBe(c! + d!)
        expect([c, d].sort(), q.key).toEqual([a, b].sort())
      } else if (kind === 'house') {
        const total = Number(art[1])
        for (const cell of art[2]!.split(',')) {
          const [a, b] = cell.split('+').map((n) => (n === '?' ? answer : Number(n)))
          expect(a! + b!, `${q.key} ${cell}`).toBe(total)
        }
        expect(art[2]!.split('?').length - 1, q.key).toBe(1)
      } else if (kind === 'sent' && q.key.includes(':sum-name-')) {
        expect(answer, q.key).toBe(Number(art[3]))
      } else if (kind === 'sent') {
        const [a, b, c] = art.slice(1).map((n) => (n === '?' ? answer : Number(n)))
        expect(a! + b!, q.key).toBe(c)
        expect(art.slice(1).filter((n) => n === '?'), q.key).toHaveLength(1)
      } else if (kind === 'n') {
        // «أي عبارة ناتجها …؟»: only the right sentence makes the number.
        const total = Number(art[1])
        for (const o of q.options) {
          const [a, b] = sentenceOf(o.id)
          expect(a! + b! === total, `${q.key} ${o.id}`).toBe(o.id === q.answer)
        }
      } else if (kind === 'sym') {
        expect(rightOption(q).label, q.key).toBe(art[1] === '+' ? 'زائد' : 'يساوي')
      } else {
        throw new Error(`No check for ${q.key} (${q.subject})`)
      }
    }
  })

  it('builds every house the way the book does: one floor for each way, starting from zero', () => {
    for (const q of QUESTIONS.filter((entry) => entry.subject?.startsWith('house:'))) {
      const [, total, cells] = parts(q.subject!)
      expect(cells!.split(',').length, q.key).toBe(Math.floor(Number(total) / 2) + 1)
      expect(cells!.split(',')[0]!.split('+')[0], q.key).toMatch(/^(0|\?)$/)
    }
  })

  it('makes the lessons about their own numbers: 4 and 5 in 3-4, 9 in 3-8', () => {
    for (const q of QUESTIONS.filter((entry) => entry.topic !== 'sentence')) {
      const totals = q.skills.filter((skill) => skill.startsWith('make_')).map((skill) => Number(skill.slice(5)))
      expect(totals, q.key).toHaveLength(1)
      expect(q.topic === 'make9' ? [9] : [4, 5], q.key).toContain(totals[0])
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
      for (const o of q.options) expect(o.label, q.key).not.toMatch(DIACRITICS)
    }
    for (const topic of TOPICS) expect(topic.title, topic.id).not.toMatch(DIACRITICS)
  })

  it('never glues «و» to a number, where «و١» would read as «وا»', () => {
    for (const q of QUESTIONS) for (const way of q.explain) expect(way.text, q.key).not.toMatch(/و[٠-٩]/)
  })

  it('copies the instruction lines of the school paper', () => {
    const paper = ['اكتب عبارة الجمع.', 'اجمع. استخدم خط الأعداد.', 'أوجد الناتج.', 'أكمل.', 'أكمل بيت العدد.', 'أكمل مستعينا بالصورة.', 'استكمل رسم العناصر. أكمل.']
    const used = new Set(QUESTIONS.map((q) => q.prompt))
    for (const line of paper) expect(used.has(line), line).toBe(true)
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

  it('speaks to every child the same way (no girl- or boy-only words)', () => {
    // The screen copies the paper («اكتب»، «اجمع»); Maryam says «نكمل»، «نعد»، «نختار» instead.
    const words = ['أحسنتي', 'أحسنت', 'شطورة', 'بطلة', 'عليج', 'إنتي', 'أنتي', 'اختاري', 'شطور', 'بطل', 'عليك', 'اختار', 'اسمع', 'حاول', 'تبي', 'اختر', 'عد', 'عدي', 'اجمع', 'اجمعي', 'أكمل', 'كمل', 'كملي', 'اكتب', 'اكتبي', 'ارسم', 'ارسمي', 'لون', 'لوني', 'حط', 'حطي']
    const gendered = new RegExp(`(?<![\\u0600-\\u06FF])(${words.join('|')})(?![\\u0600-\\u06FF])`)
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(gendered)
  })

  it('keeps to Kuwaiti words, with no sighs and no counts cut short', () => {
    const banned = /…|\.\.\.|(?<![؀-ۿ])(أوه|آه|نحوط|ذب|سيكل|فديت|ثلاث|خمس|ست|سبع|ثمان|تسع)(?![؀-ۿ])/
    for (const cue of audioCues()) expect(cue.text, cue.id).not.toMatch(banned)
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
    expect(total).toBeLessThan(2000)
    expect(audioCues().length).toBeLessThan(QUESTIONS.length)
  })

  it('has a recording for every clip a round can play, whichever line Maryam picks', () => {
    const recorded = new Set(audioCues().map((cue) => cue.id))
    for (const id of roundClips(QUESTIONS)) expect(recorded.has(id), id).toBe(true)
    for (const q of QUESTIONS) for (const line of q.asks) for (const id of line) expect(recorded.has(id), `${q.key} ${id}`).toBe(true)
    expect(recorded.has(clip.ui('test-intro'))).toBe(true)
  })

  it('ends every spoken question with a complete sentence, in every variant', () => {
    const texts = new Map(audioCues().map((cue) => [cue.id, cue.text]))
    for (const q of QUESTIONS) {
      expect(q.asks.length, q.key).toBeGreaterThanOrEqual(1)
      for (const line of q.asks) expect(texts.get(line.at(-1)!), q.key).toMatch(/[؟.!]$/)
    }
  })

  it('gives most question styles two ways of asking, and uses every recorded line', () => {
    const used = new Set(QUESTIONS.flatMap((q) => q.asks.flat()))
    for (const id of Object.keys(ASK_CLIPS)) expect(used.has(clip.ask(id as keyof typeof ASK_CLIPS)), id).toBe(true)
    const twoWays = QUESTIONS.filter((q) => q.asks.length >= 2).length
    expect(twoWays / QUESTIONS.length).toBeGreaterThan(0.8)
  })

  it('has many different cheers and kind words, all in Kuwaiti', () => {
    expect(CHEERS.length).toBeGreaterThanOrEqual(10)
    expect(RETRIES.length).toBeGreaterThanOrEqual(5)
    const texts = [...CHEERS, ...RETRIES].map((line) => line.text)
    expect(new Set(texts).size).toBe(texts.length)
    for (const text of texts) expect(text, text).not.toMatch(/[A-Za-z]/)
    expect(Object.values(UI_CLIPS).join(' ')).not.toMatch(/[A-Za-z]/)
  })
})
