// Content for «الرياضيات - الأول الابتدائي» — the second short math test (Wednesday 18 Nov 2026).
// The school's card (Mishref Primary girls): unit 3 «الجمع», lessons 3-2 «عبارة الجمع»,
// 3-4 «تكوين العددين ٤، ٥» and 3-8 «تكوين العدد ٩». Questions follow the Ministry book
// «الرياضيات» (Grade 1, term 1, part 2, 2026/2027, printed pages 108-109, 112-113 and 120-121) and
// keep its instruction lines («اكتب عبارة الجمع»، «أوجد الناتج»، «أكمل»، «استكمل رسم العناصر»):
//   sentence — the addition sentence of a picture, cubes or a ten-frame; adding on the number line;
//              the signs + and =, and the sum («ناتج الجمع»)
//   make45   — the number houses of 4 and 5, completing a sentence, part-part-whole boxes, drawing
//              the missing counters, and adding in any order
//   make9    — the same for 9, and colouring nine circles two ways
//
// One Kuwaiti voice (Maryam) reads short lines; numbers, «زائد» and «يساوي» are their own clips and
// are joined at play time, so explanations need no new recordings. Every question style has two
// spoken lines, dealt per round. Wording never speaks to a girl or a boy, and no spoken line holds
// «…» (the voice read it as a sigh). Question keys are permanent Hub identifiers.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'math-grade1'

export type TopicId = 'sentence' | 'make45' | 'make9'
export type QuestionKind = 'pick' | 'match'

/**
 * What a tile or the question shows. Numbers may be `?`, the missing one.
 *   n:<k>                       a number               sym:<+|=>              a sign
 *   txt:<word>                  a word                 sent:<a>:<b>:<c>       the sentence a + b = c
 *   sum:<a>:<b>                 a + b                  eq:<a>:<b>:<c>:<d>     a + b = c + d
 *   pair:<object|*>:<a>:<b>     two groups, side by side in a two-part frame
 *   picsent:<object|*>:<a>:<b>:<blank>  the two groups, and their sentence with `b` or `c` missing
 *   cubes2:<a>:<b>              a red and a blue rod of connecting cubes
 *   frame2:<a>:<b>              a ten-frame with a red and b yellow counters
 *   dotsent:<a>:<b>             a red and b blue counters, and a + b = ?
 *   domsent:<a>:<total>         a counters on one side of a two-part frame, the other side empty,
 *                               and a + ? = total
 *   jump:<start>:<step>         the number line 0-12 with the jumps from start
 *   house:<n>:<a+b,…>           the number house of n; a cell may be ?
 *   bond:<whole>:<a>:<b>        two part boxes over the whole
 *   paint:<a>:<b>               a yellow and b red circles in a row
 * Arabic is read from the right: the first number of a sentence or a picture sits on the right.
 */
export type ArtRef = string

const DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
/** A number in the book's digits. */
export const A = (value: number) => String(value).replace(/\d/g, (d) => DIGITS[Number(d)]!)

const NUMBER_WORDS = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة']

/** Objects for pictures marked `*`: one is picked for each round, so the pictures keep changing. */
export const COUNT_OBJECTS = ['🍎', '🍓', '🍊', '🎈', '⭐', '🦆', '🐟', '🚗', '✏️', '🌸', '⚽', '🐞', '🦋', '🧁', '🐢', '🍉', '🎁', '🐥']

// ── Clip ids ──────────────────────────────────────────────────────────────
export const clip = {
  num: (value: number) => `ar/n/${value}`,
  ask: (id: AskClip) => `ar/q/${id}`,
  ui: (id: UiClip) => `ar/ui/${id}`,
}

// ── Explanations ──────────────────────────────────────────────────────────
/** One way to explain an answer: shown on screen and spoken as a short run of clips. */
export interface Explanation {
  text: string
  clips: string[]
}

/** «٢ + ٦ = ٨», as the book writes it; Arabic text keeps the first number on the right. */
const sentenceText = (a: number, b: number) => `${A(a)} + ${A(b)} = ${A(a + b)}`
/** «اثنان زائد ستة يساوي ثمانية». */
const saysSentence = (a: number, b: number) => [clip.num(a), clip.ui('plus'), clip.num(b), clip.ui('equal'), clip.num(a + b)]

function adding(a: number, b: number, hint: string): Explanation[] {
  return [
    { text: sentenceText(a, b), clips: saysSentence(a, b) },
    { text: `${hint}\n${sentenceText(a, b)}`, clips: saysSentence(a, b) },
  ]
}

/** Counting on from the first number: «نعد من ٦: ٧، ٨». */
const countOn = (a: number, b: number) => (b === 0 ? `إذا جمعنا صفرا يبقى العدد ${A(a)}` : `نعد من ${A(a)}: ${Array.from({ length: b }, (_, n) => A(a + n + 1)).join('، ')}`)

// ── Topics ────────────────────────────────────────────────────────────────
export interface Topic {
  id: TopicId
  title: string
  /** The lesson's number in the book. */
  lesson: string
  art: ArtRef[]
}

export const TOPICS: Topic[] = [
  { id: 'sentence', title: 'عبارة الجمع', lesson: '٣-٢', art: ['🐦', 'sym:+'] },
  { id: 'make45', title: 'تكوين العددين ٤ و ٥', lesson: '٣-٤', art: ['🏠', 'n:5'] },
  { id: 'make9', title: 'تكوين العدد ٩', lesson: '٣-٨', art: ['🐠', 'n:9'] },
]

// ── Questions ─────────────────────────────────────────────────────────────
export interface Option {
  id: string
  art: ArtRef
  label: string
  /** Read while the tile lights up; absent when hearing it would give the answer away. */
  clip?: string
}

export interface Pair {
  id: string
  first: ArtRef
  second: ArtRef
  label: string
  clip?: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  /** The book's instruction line, shown on screen. */
  prompt: string
  /** What Maryam says, for this round. */
  ask: string[]
  /** Every way Maryam can ask it; a round picks one. */
  asks: string[][]
  subject?: ArtRef
  options: Option[]
  /** Options keep the given order instead of being shuffled. */
  fixedOrder?: boolean
  pairs: Pair[]
  answer: string
  /** Ways to explain the answer; one is chosen each time so it does not repeat word for word. */
  explain: Explanation[]
  difficulty: number
  skills: string[]
}

const d = (difficulty: number) => difficulty

/** The spoken lines of a question style, each a run of clips. */
const lines = (...ids: AskClip[]) => ids.map((id) => [clip.ask(id)])

function base(key: string, topic: TopicId, prompt: string, asks: string[][], skills: string[], difficulty: number) {
  return { key: `${topic}:${key}`, topic, kind: 'pick' as QuestionKind, prompt, ask: asks[0]!, asks, options: [] as Option[], pairs: [] as Pair[], skills, difficulty }
}

const numberOption = (value: number): Option => ({ id: `n${value}`, art: `n:${value}`, label: A(value) })
const sentenceOption = (a: number, b: number, c: number): Option => ({ id: `s${a}-${b}-${c}`, art: `sent:${a}:${b}:${c}`, label: `${A(a)} زائد ${A(b)} يساوي ${A(c)}` })
const sumOption = (a: number, b: number): Option => ({ id: `e${a}-${b}`, art: `sum:${a}:${b}`, label: `${A(a)} زائد ${A(b)}` })

/** Two wrong numbers near the answer, never below zero or above ten. */
function near(answer: number, avoid: number[] = []): number[] {
  const out: number[] = []
  for (const step of [1, -1, 2, -2, 3, -3, 4]) {
    const value = answer + step
    if (value >= 0 && value <= 10 && !avoid.includes(value) && !out.includes(value)) out.push(value)
    if (out.length === 2) break
  }
  return out
}

const numbers = (answer: number, others?: number[]) => [answer, ...(others ?? near(answer))].map(numberOption)

/** The sentence of a picture: the right one, one with the wrong second number, one with the wrong sum. */
function sentenceOptions(a: number, b: number): Option[] {
  const otherB = b + 1 <= 10 - a ? b + 1 : b - 1
  const otherSum = a + b + (a + b < 10 ? 1 : -1)
  return [sentenceOption(a, b, a + b), sentenceOption(a, otherB, a + otherB), sentenceOption(a, b, otherSum)]
}

// 3-2 «عبارة الجمع» ─────────────────────────────────────────────────────────
const WRITE = lines('write-1', 'write-2')

/** «اكتب عبارة الجمع» under two groups, a rod of cubes or a ten-frame. */
function writeQ(style: 'pair' | 'cubes2' | 'frame2', a: number, b: number, difficulty: number, object = '*'): Question {
  const subject = style === 'pair' ? `pair:${object}:${a}:${b}` : `${style}:${a}:${b}`
  const what = style === 'pair' ? 'في المجموعة الأولى' : style === 'cubes2' ? 'مكعبات حمراء' : 'عدادات حمراء'
  return {
    ...base(`${style === 'pair' ? 'pic' : style === 'cubes2' ? 'cubes' : 'frame'}-${a}-${b}`, 'sentence', 'اكتب عبارة الجمع.', WRITE, ['addition', `add_${style === 'pair' ? 'picture' : style}`], difficulty),
    subject,
    options: sentenceOptions(a, b),
    answer: `s${a}-${b}-${a + b}`,
    explain: adding(a, b, `${A(a)} ${what} و ${A(b)} ${style === 'pair' ? 'في الثانية' : 'معها'}، والكل ${A(a + b)}`),
  }
}

/** «اجمع. استخدم خط الأعداد»: start at the red point and jump right. */
function jumpQ(start: number, step: number, difficulty: number): Question {
  const end = start + step
  return {
    ...base(`line-${start}-${step}`, 'sentence', 'اجمع. استخدم خط الأعداد.', lines('jump-1', 'jump-2'), ['addition', 'add_number_line'], difficulty),
    subject: `jump:${start}:${step}`,
    options: numbers(end),
    answer: `n${end}`,
    explain: adding(start, step, `نبدأ بالعدد ${A(start)} ونقفز ${A(step)} يمينا فنصل إلى ${A(end)}`),
  }
}

/** «أوجد الناتج» with counters: a red and b blue. */
function dotsQ(a: number, b: number, difficulty: number): Question {
  return {
    ...base(`dots-${a}-${b}`, 'sentence', 'أوجد الناتج.', lines('result-1', 'result-2'), ['addition', 'add_counters'], difficulty),
    subject: `dotsent:${a}:${b}`,
    options: numbers(a + b),
    answer: `n${a + b}`,
    explain: adding(a, b, countOn(a, b)),
  }
}

/** The sign and its name: «هذا رمز عملية الجمع ويقرأ زائد». */
function signQ(sign: '+' | '=', difficulty: number): Question {
  return {
    ...base(sign === '+' ? 'sign-plus' : 'sign-equal', 'sentence', 'كيف نقرأ هذا الرمز؟', lines('sign'), ['addition', 'add_signs'], difficulty),
    subject: `sym:${sign}`,
    options: ['زائد', 'يساوي', 'أكبر من'].map((word, n) => ({ id: `w${n}`, art: `txt:${word}`, label: word })),
    answer: sign === '+' ? 'w0' : 'w1',
    explain: [
      { text: sign === '+' ? 'هذا رمز عملية الجمع، ويقرأ: زائد' : 'هذا الرمز يقرأ: يساوي، وبعده ناتج الجمع', clips: [clip.ui(sign === '+' ? 'plus' : 'equal')] },
      { text: sign === '+' ? 'رمز الجمع يقرأ: زائد' : 'نقرأ الرمز: يساوي', clips: [clip.ui(sign === '+' ? 'plus' : 'equal')] },
    ],
  }
}

/** «ناتج الجمع» is the number after the sign =. */
function sumNameQ(a: number, b: number, difficulty: number): Question {
  return {
    ...base(`sum-name-${a}-${b}`, 'sentence', 'ما ناتج الجمع في هذه العبارة؟', lines('sum-name'), ['addition', 'add_vocabulary'], difficulty),
    subject: `sent:${a}:${b}:${a + b}`,
    options: numbers(a + b, [a, b]),
    fixedOrder: false,
    answer: `n${a + b}`,
    explain: [
      { text: `ناتج الجمع هو العدد بعد رمز يساوي: ${A(a + b)}`, clips: saysSentence(a, b) },
      { text: `${sentenceText(a, b)}\nناتج الجمع ${A(a + b)}`, clips: saysSentence(a, b) },
    ],
  }
}

// 3-4 and 3-8 «تكوين العدد» ─────────────────────────────────────────────────
/** The house of n: one floor for each way, from 0 + n up; `missing` hides a cell, `[floor, side]`. */
function houseQ(topic: TopicId, total: number, missing: [number, 0 | 1], difficulty: number): Question {
  const floors = Array.from({ length: Math.floor(total / 2) + 1 }, (_, a) => [a, total - a] as const)
  const [floor, side] = missing
  const answer = floors[floor]![side]
  const cells = floors.map(([a, b], n) => `${n === floor && side === 0 ? '?' : a}+${n === floor && side === 1 ? '?' : b}`)
  const [a, b] = floors[floor]!
  return {
    ...base(`house-${floor}-${side ? 'b' : 'a'}`.replace('house', `house${total}`), topic, 'أكمل بيت العدد.', lines('house-1', 'house-2'), ['addition', `make_${total}`, 'number_house'], difficulty),
    subject: `house:${total}:${cells.join(',')}`,
    options: numbers(answer),
    answer: `n${answer}`,
    explain: adding(a, b, `كل طابق في بيت العدد ${A(total)} مجموعه ${A(total)}`),
  }
}

/** «أكمل»: a + ? = total, or ? + b = total. */
function completeQ(topic: TopicId, a: number | '?', b: number | '?', total: number, difficulty: number): Question {
  const answer = a === '?' ? total - (b as number) : total - a
  const first = a === '?' ? answer : a
  const second = a === '?' ? (b as number) : answer
  return {
    ...base(`complete-${a === '?' ? 'x' : a}-${b === '?' ? 'x' : b}-${total}`, topic, 'أكمل.', lines('complete-1', 'complete-2'), ['addition', `make_${total}`, 'missing_addend'], difficulty),
    subject: `sent:${a}:${b}:${total}`,
    options: numbers(answer),
    answer: `n${answer}`,
    explain: adding(first, second, a === '?' ? countOn(second, answer) : countOn(first, answer)),
  }
}

/** «أكمل مستعينا بالصورة»: the picture shows both groups; the sentence hides the second one. */
function pictureQ(topic: TopicId, object: string, a: number, b: number, difficulty: number): Question {
  const total = a + b
  return {
    ...base(`picture-${a}-${b}`, topic, 'أكمل مستعينا بالصورة.', lines('picture-1', 'picture-2'), ['addition', `make_${total}`, 'missing_addend'], difficulty),
    subject: `picsent:${object}:${a}:${b}:b`,
    options: numbers(b),
    answer: `n${b}`,
    explain: adding(a, b, `في الصورة ${A(a)} و ${A(b)}، والكل ${A(total)}`),
  }
}

/** Part-part-whole: the whole below, one part given above. */
function bondQ(topic: TopicId, whole: number, part: number, side: 'a' | 'b', difficulty: number): Question {
  const answer = whole - part
  const a = side === 'a' ? part : answer
  const b = side === 'a' ? answer : part
  return {
    ...base(`bond-${whole}-${part}${side === 'b' ? '-l' : ''}`, topic, 'أكمل.', lines('bond-1', 'bond-2'), ['addition', `make_${whole}`, 'part_whole'], difficulty),
    subject: `bond:${whole}:${side === 'a' ? part : '?'}:${side === 'b' ? part : '?'}`,
    options: numbers(answer),
    answer: `n${answer}`,
    explain: adding(a, b, `${A(a)} و ${A(b)} يكونان ${A(whole)}`),
  }
}

/** «استكمل رسم العناصر. أكمل»: counters on one side, how many go on the other? */
function drawQ(topic: TopicId, given: number, total: number, difficulty: number): Question {
  const answer = total - given
  return {
    ...base(`draw-${given}-${total}`, topic, 'استكمل رسم العناصر. أكمل.', lines('draw-1', 'draw-2'), ['addition', `make_${total}`, 'missing_addend'], difficulty),
    subject: `domsent:${given}:${total}`,
    options: numbers(answer),
    answer: `n${answer}`,
    explain: adding(given, answer, `نرسم ${A(answer)} حتى يصير الكل ${A(total)}`),
  }
}

/** «أوجد الناتج». */
function resultQ(topic: TopicId, a: number, b: number, difficulty: number): Question {
  return {
    ...base(`result-${a}-${b}`, topic, 'أوجد الناتج.', lines('result-1', 'result-2'), ['addition', `make_${a + b}`, 'basic_facts'], difficulty),
    subject: `sent:${a}:${b}:?`,
    options: numbers(a + b),
    answer: `n${a + b}`,
    explain: adding(a, b, countOn(a, b)),
  }
}

/** «يمكننا الجمع بأي ترتيب والحصول على الناتج نفسه»: a + b = ? + a, or a + b = b + ?. */
function orderQ(topic: TopicId, a: number, b: number, hide: 'c' | 'd', difficulty: number): Question {
  const answer = hide === 'c' ? b : a
  return {
    ...base(`order-${a}-${b}`, topic, 'أكمل.', lines('order'), ['addition', `make_${a + b}`, 'any_order'], difficulty),
    subject: hide === 'c' ? `eq:${a}:${b}:?:${a}` : `eq:${a}:${b}:${b}:?`,
    options: numbers(answer, near(answer, [a + b])),
    answer: `n${answer}`,
    explain: [
      { text: `${A(a)} + ${A(b)} = ${A(b)} + ${A(a)}\nنجمع بأي ترتيب والناتج نفسه: ${A(a + b)}`, clips: saysSentence(a, b) },
      { text: `${A(b)} + ${A(a)} = ${A(a + b)}، و ${A(a)} + ${A(b)} = ${A(a + b)}`, clips: saysSentence(b, a) },
    ],
  }
}

/** Which sentence makes this number? */
function whichQ(topic: TopicId, total: number, right: [number, number], wrong: [number, number][], difficulty: number): Question {
  return {
    ...base(`which-${right[0]}-${right[1]}`, topic, `أي عبارة ناتجها ${A(total)}؟`, [[clip.num(total), clip.ask('which')]], ['addition', `make_${total}`, 'basic_facts'], difficulty),
    subject: `n:${total}`,
    options: [right, ...wrong].map(([a, b]) => sumOption(a, b)),
    answer: `e${right[0]}-${right[1]}`,
    explain: adding(right[0], right[1], wrong.map(([a, b]) => `${A(a)} + ${A(b)} = ${A(a + b)}`).join('، ')),
  }
}

/** «لون لتكون العدد ٩»: yellow and red circles; which sentence do they show? */
function paintQ(yellow: number, red: number, difficulty: number): Question {
  return {
    ...base(`paint-${yellow}-${red}`, 'make9', 'أي عبارة تناسب التلوين؟', lines('paint'), ['addition', 'make_9', 'colouring'], difficulty),
    subject: `paint:${yellow}:${red}`,
    options: sentenceOptions(yellow, red),
    answer: `s${yellow}-${red}-${yellow + red}`,
    explain: adding(yellow, red, `${A(yellow)} صفراء و ${A(red)} حمراء`),
  }
}

export const QUESTIONS: Question[] = [
  // 3-2 «عبارة الجمع» (pages 108-109): pictures, cubes and ten-frames; the number line; the signs.
  writeQ('pair', 2, 6, d(18), '🐦'),
  writeQ('pair', 2, 3, d(15), '🦊'),
  writeQ('pair', 5, 4, d(28), '🚗'),
  writeQ('pair', 3, 2, d(16), '🫑'),
  writeQ('pair', 4, 3, d(22)),
  writeQ('pair', 1, 6, d(22)),
  writeQ('pair', 5, 5, d(30)),
  writeQ('pair', 2, 4, d(18)),
  writeQ('cubes2', 5, 3, d(25)),
  writeQ('cubes2', 4, 2, d(20)),
  writeQ('cubes2', 6, 3, d(30)),
  writeQ('cubes2', 2, 5, d(24)),
  writeQ('frame2', 5, 1, d(20)),
  writeQ('frame2', 4, 3, d(26)),
  writeQ('frame2', 6, 2, d(28)),
  writeQ('frame2', 3, 3, d(24)),
  jumpQ(5, 2, d(25)),
  jumpQ(7, 3, d(35)),
  jumpQ(4, 4, d(32)),
  jumpQ(2, 3, d(25)),
  jumpQ(6, 2, d(28)),
  jumpQ(1, 5, d(32)),
  jumpQ(3, 4, d(32)),
  jumpQ(8, 2, d(36)),
  dotsQ(4, 1, d(15)),
  dotsQ(3, 3, d(20)),
  dotsQ(2, 4, d(22)),
  dotsQ(5, 2, d(24)),
  signQ('+', d(15)),
  signQ('=', d(20)),
  sumNameQ(2, 6, d(30)),
  sumNameQ(5, 2, d(30)),

  // 3-4 «تكوين العددين ٤، ٥» (pages 112-113)
  houseQ('make45', 4, [0, 1], d(18)),
  houseQ('make45', 4, [1, 1], d(25)),
  houseQ('make45', 4, [2, 1], d(25)),
  houseQ('make45', 4, [1, 0], d(30)),
  houseQ('make45', 5, [0, 1], d(18)),
  houseQ('make45', 5, [1, 1], d(25)),
  houseQ('make45', 5, [2, 1], d(28)),
  houseQ('make45', 5, [2, 0], d(32)),
  completeQ('make45', 1, '?', 4, d(25)),
  completeQ('make45', 2, '?', 5, d(28)),
  completeQ('make45', 2, '?', 4, d(25)),
  completeQ('make45', 5, '?', 5, d(32)),
  completeQ('make45', 3, '?', 4, d(22)),
  completeQ('make45', 4, '?', 5, d(22)),
  completeQ('make45', '?', 1, 5, d(35)),
  completeQ('make45', '?', 2, 4, d(35)),
  pictureQ('make45', '👧', 1, 3, d(22)),
  pictureQ('make45', '🦆', 2, 3, d(24)),
  pictureQ('make45', '🚲', 2, 2, d(22)),
  pictureQ('make45', '🕊️', 5, 0, d(35)),
  bondQ('make45', 4, 1, 'a', d(28)),
  bondQ('make45', 5, 3, 'a', d(30)),
  bondQ('make45', 4, 2, 'a', d(28)),
  bondQ('make45', 5, 4, 'b', d(32)),
  bondQ('make45', 5, 0, 'a', d(38)),
  drawQ('make45', 1, 4, d(25)),
  drawQ('make45', 3, 5, d(28)),
  drawQ('make45', 1, 5, d(28)),
  resultQ('make45', 4, 1, d(15)),
  resultQ('make45', 2, 2, d(15)),
  resultQ('make45', 4, 0, d(25)),
  resultQ('make45', 3, 2, d(20)),
  resultQ('make45', 3, 1, d(15)),
  resultQ('make45', 0, 5, d(25)),
  resultQ('make45', 1, 4, d(18)),
  orderQ('make45', 1, 3, 'c', d(35)),
  orderQ('make45', 4, 1, 'd', d(38)),
  orderQ('make45', 2, 3, 'd', d(38)),
  whichQ('make45', 4, [1, 3], [[2, 1], [3, 2]], d(30)),
  whichQ('make45', 5, [2, 3], [[2, 2], [1, 3]], d(32)),

  // 3-8 «تكوين العدد ٩» (pages 120-121)
  houseQ('make9', 9, [0, 1], d(25)),
  houseQ('make9', 9, [1, 1], d(30)),
  houseQ('make9', 9, [2, 1], d(32)),
  houseQ('make9', 9, [3, 1], d(34)),
  houseQ('make9', 9, [4, 1], d(34)),
  houseQ('make9', 9, [2, 0], d(38)),
  houseQ('make9', 9, [3, 0], d(38)),
  completeQ('make9', 3, '?', 9, d(38)),
  completeQ('make9', 7, '?', 9, d(32)),
  completeQ('make9', 8, '?', 9, d(28)),
  completeQ('make9', 1, '?', 9, d(36)),
  completeQ('make9', 5, '?', 9, d(36)),
  completeQ('make9', 4, '?', 9, d(38)),
  completeQ('make9', 6, '?', 9, d(36)),
  completeQ('make9', 2, '?', 9, d(36)),
  completeQ('make9', 0, '?', 9, d(30)),
  completeQ('make9', '?', 5, 9, d(42)),
  pictureQ('make9', '🐟', 3, 6, d(34)),
  pictureQ('make9', '🌷', 7, 2, d(30)),
  pictureQ('make9', '🧪', 8, 1, d(28)),
  bondQ('make9', 9, 2, 'a', d(35)),
  bondQ('make9', 9, 3, 'b', d(38)),
  bondQ('make9', 9, 5, 'a', d(36)),
  bondQ('make9', 9, 1, 'a', d(34)),
  bondQ('make9', 9, 4, 'b', d(38)),
  drawQ('make9', 1, 9, d(32)),
  drawQ('make9', 5, 9, d(36)),
  drawQ('make9', 6, 9, d(36)),
  resultQ('make9', 0, 9, d(25)),
  resultQ('make9', 7, 2, d(28)),
  resultQ('make9', 8, 1, d(25)),
  resultQ('make9', 5, 4, d(32)),
  resultQ('make9', 6, 3, d(32)),
  resultQ('make9', 2, 7, d(32)),
  resultQ('make9', 4, 5, d(32)),
  paintQ(8, 1, d(28)),
  paintQ(7, 2, d(30)),
  paintQ(5, 4, d(34)),
  paintQ(6, 3, d(34)),
  whichQ('make9', 9, [4, 5], [[4, 4], [3, 5]], d(38)),
  whichQ('make9', 9, [6, 3], [[6, 2], [5, 3]], d(38)),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Kuwaiti (Maryam Essa), sent without diacritics: two lines for each question style, written for this
// test. Kuwaiti words («نحط»، «وين»، «شنو»، «جذي»), counts said in full («ثلاثة»، «خمسة»), and no «…».
export const ASK_CLIPS = {
  'write-1': 'أي عبارة جمع تناسب الصورة؟',
  'write-2': 'نعد المجموعتين، ونختار العبارة الصح.',
  'jump-1': 'نبدأ من النقطة الحمرا ونقفز لليمين. وين نوصل؟',
  'jump-2': 'نعد القفزات على خط الأعداد. عند أي عدد نوقف؟',
  'result-1': 'نجمع العددين. كم الناتج؟',
  'result-2': 'شنو ناتج الجمع؟',
  sign: 'شلون نقرا هالرمز؟',
  'sum-name': 'وين ناتج الجمع في هالعبارة؟',
  'house-1': 'نكمل بيت العدد. أي رقم ناقص؟',
  'house-2': 'كل طابق في البيت مجموعه نفس العدد اللي فوق. شنو الناقص؟',
  'complete-1': 'أي عدد ناقص في العبارة؟',
  'complete-2': 'نكمل العبارة عشان تصير صح. شنو العدد الناقص؟',
  'picture-1': 'نطالع الصورة، ونكمل العبارة.',
  'picture-2': 'الصورة تساعدنا. أي عدد ناقص؟',
  'bond-1': 'العدد اللي تحت يتكون من جزئين. شنو الجزء الناقص؟',
  'bond-2': 'جزء وجزء يكونون العدد اللي تحت. أي عدد ناقص؟',
  'draw-1': 'كم نرسم في الجهة الفاضية؟',
  'draw-2': 'نكمل الرسم عشان يصير الكل نفس العدد. كم نرسم؟',
  order: 'نقدر نجمع بأي ترتيب، والناتج نفسه. أي عدد ناقص؟',
  which: 'أي عبارة ناتجها هالعدد؟',
  paint: 'نعد الأصفر والأحمر. أي عبارة تناسبهم؟',
} as const
export type AskClip = keyof typeof ASK_CLIPS

export const UI_CLIPS = {
  welcome: 'هلا والله! اليوم نتدرب على الجمع. نختار درس ونبدأ.',
  'test-intro': 'هذا مثل الاختبار القصير بالضبط. جاهزين؟ يلا نبدأ!',
  'match-wrong': 'مو هذي، نجرب وحدة ثانية.',
  'match-first': 'نبدأ بالمجموعة أول.',
  review: 'خلنا نشوفها مع بعض.',
  'done-great': 'جولة حساب ولا أروع! الجمع صار لعبتنا.',
  'done-good': 'زين! كل ما نتدرب على الجمع، نصير أسرع.',
  plus: 'زائد',
  equal: 'يساوي',
  'cheer-1': 'ناتج مضبوط!',
  'cheer-2': 'جمعناها صح!',
  'cheer-3': 'عقل حاسبة!',
  'cheer-4': 'صح، والجمع صار سهل.',
  'cheer-5': 'رقم ولا أحلى!',
  'cheer-6': 'حسبة نظيفة!',
  'cheer-7': 'هذي هي الرياضيات!',
  'cheer-8': 'جواب يلمع!',
  'cheer-9': 'تمام، ومن غير غلطة!',
  'cheer-10': 'الأرقام تحبنا!',
  'cheer-11': 'جواب مرتب مثل الأرقام!',
  'cheer-12': 'شطارة بالجمع!',
  'retry-1': 'ما عليه، نعدها مع بعض.',
  'retry-2': 'قريبة! نشوف الحسبة.',
  'retry-3': 'عادي، الجمع يبي له تمرين.',
  'retry-4': 'نعيدها على مهل.',
  'retry-5': 'خلنا نعدها سوا.',
  'retry-6': 'الحين نعرف الطريقة.',
} as const
export type UiClip = keyof typeof UI_CLIPS

export interface Cheer {
  text: string
  clip: string
}

export const CHEERS: Cheer[] = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('cheer-'))
  .map((id) => ({ text: UI_CLIPS[id], clip: clip.ui(id) }))

export const RETRIES = (Object.keys(UI_CLIPS) as UiClip[])
  .filter((id) => id.startsWith('retry-'))
  .map((id) => ({ text: UI_CLIPS[id], clip: clip.ui(id) }))

export interface AudioCue {
  id: string
  text: string
  /** `ar`: Kuwaiti (Maryam), without diacritics. */
  voice: 'ar'
}

export function bare(text: string): string {
  return text.replace(/[ً-ْٰ]/g, '')
}

export function audioCues(): AudioCue[] {
  const ar = (id: string, text: string): AudioCue => ({ id, text: bare(text), voice: 'ar' })
  return [
    ...NUMBER_WORDS.map((word, value) => ar(clip.num(value), `${word}.`)),
    ...(Object.keys(ASK_CLIPS) as AskClip[]).map((id) => ar(clip.ask(id), ASK_CLIPS[id])),
    ...(Object.keys(UI_CLIPS) as UiClip[]).map((id) => ar(clip.ui(id), UI_CLIPS[id])),
  ]
}

/** Every clip a round needs, so it can be loaded before the first question. */
export function roundClips(questions: Question[]): string[] {
  return [
    ...questions.flatMap((question) => [
      ...question.ask,
      ...question.options.flatMap((option) => (option.clip ? [option.clip] : [])),
      ...question.pairs.flatMap((pair) => (pair.clip ? [pair.clip] : [])),
      ...question.explain.flatMap((way) => way.clips),
    ]),
    clip.ui('match-wrong'),
    clip.ui('match-first'),
    clip.ui('review'),
    ...CHEERS.map((cheer) => cheer.clip),
    ...RETRIES.map((retry) => retry.clip),
    clip.ui('done-great'),
    clip.ui('done-good'),
  ]
}

/** A copy of the question for one round: pictures marked `*` get this round's object, and Maryam one of her lines. */
export function dressQuestion(question: Question, random: () => number = Math.random): Question {
  const object = COUNT_OBJECTS[Math.floor(random() * COUNT_OBJECTS.length)]!
  const fill = (art: string) => art.replace(/^(pair|picsent):\*:/, `$1:${object}:`)
  return {
    ...question,
    ask: question.asks[Math.floor(random() * question.asks.length)] ?? question.ask,
    subject: question.subject ? fill(question.subject) : undefined,
    options: question.options.map((option) => ({ ...option, art: fill(option.art) })),
    pairs: question.pairs.map((pair) => ({ ...pair, first: fill(pair.first) })),
  }
}
