// Content for «الرياضيات - الأول الابتدائي» — the first math test (Wednesday 28 Oct 2026).
// The school's card: unit 1 lessons 1-12 (the numbers 1 to 5) and 1-13 (comparing numbers),
// and all of unit 2 — the numbers 6 to 12 and zero, whole hours, before and after, the
// calendar and the days of the week. Questions follow the Ministry book «الرياضيات» (Grade 1,
// term 1, 2026/2027) and its six official «نموذج اختبار تحصيلي الأول» papers:
//   count    — count a group, a ten-frame, an abacus, a bundle of sticks; join groups to numbers
//   order    — the number train and number line, the number before or after, biggest/smallest
//   compare  — < > = between two numbers or two groups; complete a true statement
//   clock    — read whole hours, find the clock, one hour before or after
//   calendar — months of the Gregorian and Hijri years, the National Day, days of the week
//
// One Kuwaiti voice (Maryam) reads short, reusable phrases; numbers, the hour, days and
// months are their own clips and are joined at play time, so the bank can grow without new
// recordings (the user asked to spend as few ElevenLabs credits as possible). Group pictures marked `*` take a different object every round. Wording never
// speaks to a girl or a boy. Question keys are permanent Hub identifiers.
// This file is self-contained so Node scripts can import it directly.

export const QUIZ_ID = 'math-grade1'

export type TopicId = 'count' | 'order' | 'compare' | 'clock' | 'calendar'
export type QuestionKind = 'pick' | 'match'

/**
 * What a tile or the question shows:
 *   n:<k>                 a number                     time:<h>       a digital time, h:00
 *   count:<emoji|*>:<k>   a group of k objects         clock:<h>      a clock at h o'clock
 *   frame:<k>             ten-frame(s) with k counters abacus:<k>     beads on the tens/ones rods
 *   sticks:<k>            a bundle of ten and singles  cubes:<k>      a rod of ten cubes and singles
 *   train:<a,b,?,…>       the number train, ? missing  line:<a,b,?,…> a number line, ? missing
 *   cmp:<right>:<left>[:<sign>]  two numbers to compare (? unknown); cmpg:<emoji>:<right>:<left> two groups
 *   sym:<sign>            a comparison sign            txt:<text>     a word (a day or a month)
 * Arabic is read from the right, so «right» is the first number read.
 */
export type ArtRef = string

const DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
/** A number in the book's digits. */
export const A = (value: number) => String(value).replace(/\d/g, (d) => DIGITS[Number(d)]!)
/** A whole hour as the book writes it, ٥:٠٠, isolated left to right so Arabic text never reorders it. */
export const T = (hour: number) => `\u2066${A(hour)}:٠٠\u2069`

const NUMBER_WORDS = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر']

export const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] as const
const DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
export const MONTHS = {
  jan: 'يناير',
  feb: 'فبراير',
  mar: 'مارس',
  oct: 'أكتوبر',
  muharram: 'محرم',
  rajab: 'رجب',
  ramadan: 'رمضان',
  shawwal: 'شوال',
  dhulqada: 'ذو القعدة',
  dhulhijja: 'ذو الحجة',
} as const
type MonthId = keyof typeof MONTHS

/** Objects for groups marked `*`: one is picked for each round, so the pictures keep changing. */
export const COUNT_OBJECTS = ['🍎', '🍓', '🍊', '🍌', '🎈', '⭐', '🦆', '🐟', '🚗', '✏️', '🌸', '⚽', '🐞', '🦋', '🧁', '🐢', '🍉', '🎁']

// ── Clip ids ──────────────────────────────────────────────────────────────
export const clip = {
  num: (value: number) => `ar/n/${value}`,
  day: (day: (typeof DAYS)[number]) => `ar/d/${DAY_IDS[DAYS.indexOf(day)]}`,
  month: (id: MonthId) => `ar/m/${id}`,
  ask: (id: AskClip) => `ar/q/${id}`,
  ui: (id: UiClip) => `ar/ui/${id}`,
}

// ── Explanations ──────────────────────────────────────────────────────────
/** One way to explain an answer: shown on screen and spoken as a short run of clips. */
export interface Explanation {
  text: string
  clips: string[]
}

const saysNumber = (value: number) => [clip.ui('count-is'), clip.num(value)]
const saysHour = (hour: number) => [clip.ui('hour'), clip.num(hour)]

type Relation = 'greater' | 'smaller' | 'equal'
const RELATION_TEXT: Record<Relation, string> = { greater: 'أكبر من', smaller: 'أصغر من', equal: 'يساوي' }
const relationOf = (right: number, left: number): Relation => (right > left ? 'greater' : right < left ? 'smaller' : 'equal')
/** The sign as it looks between the numbers: its open side faces the bigger number. */
const signOf = (right: number, left: number) => (right > left ? '<' : right < left ? '>' : '=')

function comparing(right: number, left: number): Explanation[] {
  const relation = relationOf(right, left)
  const sentence = `${A(right)} ${RELATION_TEXT[relation]} ${A(left)}`
  const clips = [clip.num(right), clip.ui(relation), clip.num(left)]
  const hint = relation === 'equal' ? 'العددان متساويان، فنضع رمز يساوي' : 'فتحة الرمز تكون جهة العدد الأكبر'
  return [
    { text: sentence, clips },
    { text: `${sentence}\n${hint}`, clips },
  ]
}

// ── Topics ────────────────────────────────────────────────────────────────
export interface Topic {
  id: TopicId
  title: string
  art: ArtRef[]
}

export const TOPICS: Topic[] = [
  { id: 'count', title: 'العد والأعداد', art: ['🐠', 'n:5'] },
  { id: 'order', title: 'ترتيب الأعداد', art: ['🚂', 'n:7'] },
  { id: 'compare', title: 'مقارنة الأعداد', art: ['🐙', 'sym:<'] },
  { id: 'clock', title: 'الساعة', art: ['⏰', 'clock:3'] },
  { id: 'calendar', title: 'التقويم وأيام الأسبوع', art: ['📅', '🌙'] },
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
  /** The group, chosen first. */
  first: ArtRef
  /** The number that answers it. */
  second: ArtRef
  label: string
  clip?: string
}

export interface Question {
  key: string
  topic: TopicId
  kind: QuestionKind
  prompt: string
  ask: string[]
  subject?: ArtRef
  options: Option[]
  /** Signs keep the book's order instead of being shuffled. */
  fixedOrder?: boolean
  pairs: Pair[]
  answer: string
  /** Ways to explain the answer; one is chosen each time so it does not repeat word for word. */
  explain: Explanation[]
  difficulty: number
  skills: string[]
}

const d = (difficulty: number) => difficulty

function base(key: string, topic: TopicId, kind: QuestionKind, prompt: string, ask: string[], skills: string[], difficulty: number) {
  return { key: `${topic}:${key}`, topic, kind, prompt, ask, options: [] as Option[], pairs: [] as Pair[], skills, difficulty }
}

const numberOption = (value: number): Option => ({ id: `n${value}`, art: `n:${value}`, label: A(value) })
const timeOption = (hour: number): Option => ({ id: `t${hour}`, art: `time:${hour}`, label: T(hour) })
const clockOption = (hour: number): Option => ({ id: `c${hour}`, art: `clock:${hour}`, label: `ساعة تشير إلى ${T(hour)}` })
const dayOption = (day: (typeof DAYS)[number]): Option => ({ id: DAY_IDS[DAYS.indexOf(day)]!, art: `txt:${day}`, label: day, clip: clip.day(day) })
const monthOption = (id: MonthId): Option => ({ id, art: `txt:${MONTHS[id]}`, label: MONTHS[id], clip: clip.month(id) })

// 1. Counting ─────────────────────────────────────────────────────────────
type CountArt = 'count' | 'frame' | 'abacus' | 'sticks' | 'cubes'

function howCounted(kind: CountArt, value: number): string {
  const tens = Math.floor(value / 10)
  const ones = value % 10
  switch (kind) {
    case 'frame':
      return value > 10 ? `لوحة عشرة كاملة و ${A(ones)} في اللوحة الثانية: ${A(value)}` : `في لوحة العشرة ${A(value)}`
    case 'abacus':
      return tens ? `${A(tens)} في العشرات و ${A(ones)} في الآحاد: ${A(value)}` : `${A(value)} خرزات في الآحاد`
    case 'sticks':
      return tens ? `حزمة فيها عشرة و ${A(ones)} وحدها: ${A(value)}` : `${A(value)} أعواد`
    case 'cubes':
      return tens ? `عشرة مكعبات متصلة و ${A(ones)}: ${A(value)}` : `${A(value)} مكعبات`
    default:
      return value === 0 ? 'المجموعة خالية، عددها صفر' : `نعد واحدا واحدا: ${A(value)}`
  }
}

function countQ(kind: CountArt, value: number, others: number[], difficulty: number, object = '*') {
  const art = kind === 'count' ? `count:${object}:${value}` : `${kind}:${value}`
  return {
    ...base(`${kind}-${value}`, 'count', 'pick', 'كم العدد؟', [clip.ask('count')], ['count', `count_${kind}`], difficulty),
    subject: art,
    options: [value, ...others].map(numberOption),
    answer: `n${value}`,
    explain: [
      { text: howCounted(kind, value), clips: saysNumber(value) },
      { text: `العدد ${A(value)} (${NUMBER_WORDS[value]})`, clips: saysNumber(value) },
    ],
  }
}

/** «حوّط الطبق الذي يحتوي على ٦ تفاحات»: which group has this many? */
function groupQ(value: number, others: number[], difficulty: number): Question {
  return {
    ...base(`group-${value}`, 'count', 'pick', `أي مجموعة فيها ${A(value)}؟`, [clip.num(value), clip.ask('which-group')], ['count', 'count_group'], difficulty),
    subject: `n:${value}`,
    options: [value, ...others].map((k) => ({ id: `g${k}`, art: `count:*:${k}`, label: `مجموعة فيها ${A(k)}` })),
    answer: `g${value}`,
    explain: [
      { text: `المجموعة الصحيحة فيها ${A(value)}`, clips: saysNumber(value) },
      { text: `نعد كل مجموعة، ونختار اللي فيها ${A(value)}`, clips: saysNumber(value) },
    ],
  }
}

/** «صل كل مجموعة برمز العدد المناسب». */
function countBoard(key: string, groups: [string, number][], difficulty: number): Question {
  return {
    ...base(`board-${key}`, 'count', 'match', 'نصل كل مجموعة بعددها', [clip.ask('match-count')], ['count', 'count_match'], difficulty),
    pairs: groups.map(([object, value]) => ({ id: `p${value}`, first: `count:${object}:${value}`, second: `n:${value}`, label: `مجموعة فيها ${A(value)}` })),
    answer: groups.map(([, value]) => `p${value}`).join(','),
    explain: [{ text: groups.map(([, value]) => (value === 0 ? 'المجموعة الخالية: ٠' : `${A(value)}`)).join('، '), clips: [] }],
  }
}

// 2. Order ────────────────────────────────────────────────────────────────
function sequenceQ(style: 'train' | 'line', start: number, length: number, missing: number, others: number[], difficulty: number): Question {
  const values = Array.from({ length }, (_, n) => start + n)
  const shown = values.map((value) => (value === missing ? '?' : String(value))).join(',')
  return {
    ...base(`${style}-${start}-${missing}`, 'order', 'pick', 'ما العدد الناقص؟', [clip.ask('missing')], ['order', `order_${style}`], difficulty),
    subject: `${style}:${shown}`,
    options: [missing, ...others].map(numberOption),
    answer: `n${missing}`,
    explain: [
      { text: `نعد بالترتيب: ${values.map(A).join('، ')}`, clips: saysNumber(missing) },
      { text: `العدد الناقص ${A(missing)}`, clips: saysNumber(missing) },
    ],
  }
}

function nextQ(side: 'after' | 'before', value: number, others: number[], difficulty: number): Question {
  const target = side === 'after' ? value + 1 : value - 1
  const prompt = side === 'after' ? `ما العدد الذي بعد ${A(value)}؟` : `ما العدد الذي قبل ${A(value)}؟`
  return {
    ...base(`${side}-${value}`, 'order', 'pick', prompt, [clip.num(value), clip.ask(side)], ['order', `order_${side}`], difficulty),
    subject: side === 'after' ? `train:${value},?` : `train:?,${value}`,
    options: [target, ...others].map(numberOption),
    answer: `n${target}`,
    explain: [
      { text: side === 'after' ? `بعد ${A(value)} يأتي ${A(target)}` : `قبل ${A(value)} يأتي ${A(target)}`, clips: saysNumber(target) },
      { text: side === 'after' ? `${A(value)}، ${A(target)}: نزيد واحدا` : `${A(target)}، ${A(value)}: العدد الأصغر بواحد`, clips: saysNumber(target) },
    ],
  }
}

function extremeQ(side: 'biggest' | 'smallest', values: number[], difficulty: number): Question {
  const target = side === 'biggest' ? Math.max(...values) : Math.min(...values)
  const runnerUp = [...values].sort((a, b) => (side === 'biggest' ? b - a : a - b))[1]!
  const relation: Relation = side === 'biggest' ? 'greater' : 'smaller'
  return {
    ...base(`${side}-${values.join('-')}`, 'order', 'pick', side === 'biggest' ? 'أي عدد هو الأكبر؟' : 'أي عدد هو الأصغر؟', [clip.ask(side)], ['order', `order_${side}`], difficulty),
    options: values.map(numberOption),
    answer: `n${target}`,
    explain: [
      { text: `${A(target)} ${RELATION_TEXT[relation]} ${values.filter((v) => v !== target).map(A).join(' و ')}`, clips: [clip.num(target), clip.ui(relation), clip.num(runnerUp)] },
      { text: `على خط الأعداد، ${A(target)} ${side === 'biggest' ? 'يأتي بعدها' : 'يأتي قبلها'}`, clips: [clip.num(target), clip.ui(relation), clip.num(runnerUp)] },
    ],
  }
}

// 3. Comparing ────────────────────────────────────────────────────────────
const SIGNS = ['>', '=', '<'] as const
const signOption = (sign: (typeof SIGNS)[number]): Option => ({
  id: sign === '<' ? 'lt' : sign === '>' ? 'gt' : 'eq',
  art: `sym:${sign}`,
  label: sign === '=' ? 'يساوي' : sign === '<' ? 'أكبر من' : 'أصغر من',
})

function compareQ(right: number, left: number, difficulty: number): Question {
  const sign = signOf(right, left)
  return {
    ...base(`${right}-${left}`, 'compare', 'pick', 'أي رمز نضع في الدائرة؟', [clip.ask('compare')], ['compare', 'compare_numbers'], difficulty),
    subject: `cmp:${right}:${left}`,
    options: SIGNS.map(signOption),
    fixedOrder: true,
    answer: signOption(sign).id,
    explain: comparing(right, left),
  }
}

function compareGroupsQ(object: string, right: number, left: number, difficulty: number): Question {
  const sign = signOf(right, left)
  return {
    ...base(`groups-${right}-${left}`, 'compare', 'pick', 'نعد المجموعتين: أي رمز نضع؟', [clip.ask('compare')], ['compare', 'compare_groups'], difficulty),
    subject: `cmpg:${object}:${right}:${left}`,
    options: SIGNS.map(signOption),
    fixedOrder: true,
    answer: signOption(sign).id,
    explain: comparing(right, left),
  }
}

/** «أكمل لتحصل على عبارة صحيحة»: the left number is missing. */
function completeQ(right: number, relation: Relation, answer: number, others: number[], difficulty: number): Question {
  const sign = relation === 'greater' ? '<' : relation === 'smaller' ? '>' : '='
  return {
    ...base(`complete-${right}-${relation}`, 'compare', 'pick', 'أي عدد يجعل العبارة صحيحة؟', [clip.ask('complete')], ['compare', 'compare_complete'], difficulty),
    subject: `cmp:${right}:?:${sign}`,
    options: [answer, ...others].map(numberOption),
    answer: `n${answer}`,
    explain: comparing(right, answer),
  }
}

// 4. The clock ────────────────────────────────────────────────────────────
const wrap = (hour: number) => ((hour - 1 + 12) % 12) + 1

const readingClock = (hour: number): Explanation[] => [
  { text: `العقرب القصير على ${A(hour)}، والعقرب الطويل على ١٢: الساعة ${T(hour)}`, clips: saysHour(hour) },
  { text: `الساعة ${T(hour)}`, clips: saysHour(hour) },
]

function readQ(hour: number, others: number[], difficulty: number): Question {
  return {
    ...base(`read-${hour}`, 'clock', 'pick', 'كم الساعة؟', [clip.ask('clock-read')], ['clock', 'clock_read'], difficulty),
    subject: `clock:${hour}`,
    options: [hour, ...others].map(timeOption),
    answer: `t${hour}`,
    explain: readingClock(hour),
  }
}

function findClockQ(hour: number, others: number[], difficulty: number): Question {
  return {
    ...base(`find-${hour}`, 'clock', 'pick', `أي ساعة تشير إلى ${T(hour)}؟`, [...saysHour(hour).slice(0), clip.ask('clock-find')], ['clock', 'clock_find'], difficulty),
    subject: `time:${hour}`,
    options: [hour, ...others].map(clockOption),
    answer: `c${hour}`,
    explain: readingClock(hour),
  }
}

/** «إذا كانت الساعة الآن ٤:٠٠، كم تصبح الساعة بعد ساعة؟» */
function hourLaterQ(side: 'after' | 'before', hour: number, others: number[], difficulty: number, asClocks = false): Question {
  const target = wrap(side === 'after' ? hour + 1 : hour - 1)
  const prompt = side === 'after' ? `الساعة الآن ${T(hour)}. كم تصبح بعد ساعة؟` : `الساعة الآن ${T(hour)}. كم كانت قبل ساعة؟`
  return {
    ...base(`${side}-${hour}`, 'clock', 'pick', prompt, [...saysHour(hour), clip.ask(side === 'after' ? 'hour-after' : 'hour-before')], ['clock', `clock_${side}`], difficulty),
    subject: `clock:${hour}`,
    options: [target, ...others].map(asClocks ? clockOption : timeOption),
    answer: `${asClocks ? 'c' : 't'}${target}`,
    explain: [
      {
        text: side === 'after' ? `بعد ساعة من ${T(hour)} تصبح ${T(target)}` : `قبل ساعة من ${T(hour)} كانت ${T(target)}`,
        clips: saysHour(target),
      },
      {
        text: side === 'after' ? `العقرب القصير يتقدم من ${A(hour)} إلى ${A(target)}` : `العقرب القصير يرجع من ${A(hour)} إلى ${A(target)}`,
        clips: saysHour(target),
      },
    ],
  }
}

// 5. Calendar and days ────────────────────────────────────────────────────
function calendarQ(key: string, prompt: string, ask: string[], options: Option[], answer: string, fact: string, answerClip: string, difficulty: number, skill: string): Question {
  return {
    ...base(key, 'calendar', 'pick', prompt, ask, ['calendar', skill], difficulty),
    options,
    answer,
    explain: [{ text: fact, clips: [answerClip] }],
  }
}

const numbersOf = (values: number[]) => values.map(numberOption)

function dayNextQ(side: 'after' | 'before', day: (typeof DAYS)[number], others: (typeof DAYS)[number][], difficulty: number): Question {
  const index = DAYS.indexOf(day)
  const target = DAYS[(index + (side === 'after' ? 1 : 6)) % 7]!
  return calendarQ(
    `${side}-${DAY_IDS[index]}`,
    side === 'after' ? `ما اليوم الذي يأتي بعد ${day}؟` : `ما اليوم الذي يأتي قبل ${day}؟`,
    [clip.day(day), clip.ask(side === 'after' ? 'day-after' : 'day-before')],
    [target, ...others].map(dayOption),
    DAY_IDS[DAYS.indexOf(target)]!,
    `أيام الأسبوع بالترتيب: ${DAYS.join('، ')}`,
    clip.day(target),
    difficulty,
    'calendar_days',
  )
}

export const QUESTIONS: Question[] = [
  // 1. Counting: groups, ten-frames, the abacus, bundles of sticks and cubes (the book's «عد. اكتب رمز العدد»)
  countQ('count', 1, [2, 7], d(8)),
  countQ('count', 2, [1, 3], d(10)),
  countQ('count', 3, [1, 2], d(10), '🦆'),
  countQ('count', 4, [3, 5], d(12)),
  countQ('count', 5, [4, 6], d(15)),
  countQ('count', 6, [5, 7], d(20)),
  countQ('count', 7, [8, 9], d(25)),
  countQ('count', 8, [7, 9], d(30)),
  countQ('count', 9, [7, 8], d(32)),
  countQ('count', 10, [9, 11], d(35)),
  countQ('count', 11, [10, 12], d(42)),
  countQ('count', 12, [10, 11], d(45)),
  countQ('count', 0, [1, 6], d(25), '🍎'),
  countQ('frame', 4, [3, 5], d(15)),
  countQ('frame', 6, [5, 7], d(22)),
  countQ('frame', 8, [6, 9], d(28)),
  countQ('frame', 10, [9, 11], d(32)),
  countQ('frame', 12, [10, 11], d(45)),
  countQ('abacus', 6, [5, 9], d(25)),
  countQ('abacus', 9, [8, 6], d(32)),
  countQ('abacus', 10, [1, 11], d(45)),
  countQ('abacus', 11, [2, 12], d(50)),
  countQ('abacus', 12, [3, 10], d(52)),
  countQ('sticks', 10, [1, 12], d(40)),
  countQ('sticks', 11, [10, 12], d(45)),
  countQ('sticks', 12, [10, 11], d(48)),
  countQ('cubes', 10, [9, 11], d(38)),
  countQ('cubes', 11, [12, 10], d(45)),
  groupQ(6, [5, 4], d(25)),
  groupQ(7, [6, 8], d(30)),
  groupQ(9, [8, 7], d(35)),
  groupQ(3, [2, 4], d(15)),
  countBoard('a', [['⭐', 6], ['💧', 3], ['🍎', 0]], d(30)),
  countBoard('b', [['🐦', 4], ['🍓', 9], ['🎈', 7]], d(35)),
  countBoard('c', [['🦆', 3], ['🍊', 2], ['⚽', 1]], d(15)),
  countBoard('d', [['🐞', 8], ['🌸', 5], ['🚗', 10]], d(40)),

  // 2. Order: the number train and number line, before and after, biggest and smallest
  sequenceQ('train', 1, 5, 3, [2, 4], d(12)),
  sequenceQ('train', 1, 9, 6, [5, 8], d(25)),
  sequenceQ('train', 0, 8, 5, [4, 6], d(28)),
  sequenceQ('train', 4, 6, 7, [6, 8], d(30)),
  sequenceQ('train', 6, 7, 10, [9, 11], d(38)),
  sequenceQ('train', 7, 6, 11, [10, 12], d(45)),
  sequenceQ('train', 0, 5, 0, [1, 5], d(30)),
  sequenceQ('line', 1, 5, 2, [4, 5], d(15)),
  sequenceQ('line', 1, 5, 4, [2, 5], d(18)),
  sequenceQ('line', 0, 7, 0, [4, 1], d(32)),
  sequenceQ('line', 3, 7, 8, [7, 9], d(35)),
  sequenceQ('line', 6, 7, 12, [11, 10], d(45)),
  nextQ('after', 5, [4, 7], d(18)),
  nextQ('after', 7, [6, 9], d(25)),
  nextQ('after', 9, [8, 11], d(32)),
  nextQ('after', 11, [10, 9], d(42)),
  nextQ('after', 0, [2, 3], d(28)),
  nextQ('before', 6, [7, 4], d(25)),
  nextQ('before', 10, [11, 8], d(35)),
  nextQ('before', 12, [10, 9], d(42)),
  nextQ('before', 1, [2, 3], d(32)),
  extremeQ('biggest', [4, 6, 7], d(20)),
  extremeQ('biggest', [10, 12, 8], d(38)),
  extremeQ('biggest', [9, 5, 11], d(40)),
  extremeQ('smallest', [5, 3, 7], d(20)),
  extremeQ('smallest', [4, 0, 2], d(32)),
  extremeQ('smallest', [11, 10, 12], d(42)),

  // 3. Comparing with < > = (lesson 1-13 and every number lesson of unit 2)
  compareQ(3, 2, d(15)),
  compareQ(1, 5, d(15)),
  compareQ(2, 2, d(15)),
  compareQ(4, 1, d(18)),
  compareQ(3, 4, d(20)),
  compareQ(5, 6, d(25)),
  compareQ(6, 3, d(25)),
  compareQ(8, 8, d(28)),
  compareQ(3, 8, d(30)),
  compareQ(8, 5, d(30)),
  compareQ(9, 10, d(35)),
  compareQ(10, 10, d(35)),
  compareQ(0, 3, d(35)),
  compareQ(4, 0, d(35)),
  compareQ(12, 8, d(40)),
  compareQ(11, 12, d(45)),
  compareQ(12, 12, d(42)),
  compareQ(10, 7, d(40)),
  compareGroupsQ('✏️', 3, 2, d(20)),
  compareGroupsQ('📘', 2, 3, d(22)),
  compareGroupsQ('🪑', 4, 4, d(25)),
  compareGroupsQ('🍏', 4, 5, d(28)),
  completeQ(3, 'greater', 1, [4, 5], d(40)),
  completeQ(4, 'greater', 2, [5, 7], d(42)),
  completeQ(5, 'equal', 5, [3, 6], d(38)),
  completeQ(3, 'smaller', 6, [2, 1], d(45)),

  // 4. The clock: whole hours (2-9), before and after (2-10, 2-11)
  readQ(3, [9, 12], d(20)),
  readQ(4, [5, 8], d(22)),
  readQ(7, [1, 12], d(25)),
  readQ(1, [7, 11], d(25)),
  readQ(9, [3, 10], d(28)),
  readQ(12, [6, 1], d(25)),
  readQ(5, [4, 11], d(28)),
  readQ(6, [12, 7], d(30)),
  readQ(10, [2, 11], d(35)),
  readQ(2, [10, 3], d(30)),
  readQ(8, [4, 9], d(32)),
  readQ(11, [1, 10], d(38)),
  findClockQ(5, [4, 7], d(30)),
  findClockQ(4, [5, 8], d(30)),
  findClockQ(7, [1, 12], d(32)),
  findClockQ(12, [6, 3], d(30)),
  findClockQ(9, [3, 12], d(35)),
  findClockQ(1, [7, 2], d(35)),
  hourLaterQ('after', 4, [3, 6], d(40), true),
  hourLaterQ('after', 6, [5, 8], d(40)),
  hourLaterQ('after', 12, [11, 2], d(50)),
  hourLaterQ('after', 9, [8, 11], d(42), true),
  hourLaterQ('before', 8, [9, 6], d(45)),
  hourLaterQ('before', 5, [6, 3], d(45), true),
  hourLaterQ('before', 1, [2, 11], d(55)),
  hourLaterQ('before', 10, [11, 8], d(45)),

  // 5. Calendar (2-12) and days of the week (2-13)
  calendarQ('months-gregorian', 'كم عدد الأشهر في السنة الميلادية؟', [clip.ask('months-gregorian')], numbersOf([10, 11, 12]), 'n12', 'السنة الميلادية فيها ١٢ شهرا', clip.num(12), d(25), 'calendar_months'),
  calendarQ('months-hijri', 'كم عدد الأشهر في السنة الهجرية؟', [clip.ask('months-hijri')], numbersOf([12, 10, 11]), 'n12', 'السنة الهجرية فيها ١٢ شهرا أيضا', clip.num(12), d(30), 'calendar_months'),
  calendarQ('national-day', 'في أي شهر تحتفل الكويت باليوم الوطني؟', [clip.ask('national-day')], (['feb', 'jan', 'mar'] as MonthId[]).map(monthOption), 'feb', 'نحتفل باليوم الوطني للكويت في شهر فبراير', clip.month('feb'), d(30), 'calendar_months'),
  calendarQ('first-gregorian', 'ما أول شهر في السنة الميلادية؟', [clip.ask('first-gregorian')], (['jan', 'mar', 'oct'] as MonthId[]).map(monthOption), 'jan', 'السنة الميلادية تبدأ بشهر يناير', clip.month('jan'), d(30), 'calendar_months'),
  calendarQ('first-hijri', 'ما أول شهر في السنة الهجرية؟', [clip.ask('first-hijri')], (['muharram', 'ramadan', 'shawwal'] as MonthId[]).map(monthOption), 'muharram', 'السنة الهجرية تبدأ بشهر محرم', clip.month('muharram'), d(40), 'calendar_months'),
  calendarQ('fasting', 'في أي شهر يصوم المسلمون؟', [clip.ask('fasting')], (['ramadan', 'rajab', 'shawwal'] as MonthId[]).map(monthOption), 'ramadan', 'يصوم المسلمون في شهر رمضان', clip.month('ramadan'), d(20), 'calendar_months'),
  calendarQ('hajj', 'في أي شهر يحج المسلمون؟', [clip.ask('hajj')], (['dhulhijja', 'dhulqada', 'shawwal'] as MonthId[]).map(monthOption), 'dhulhijja', 'يحج المسلمون في شهر ذي الحجة', clip.month('dhulhijja'), d(35), 'calendar_months'),
  calendarQ('week-days', 'كم عدد أيام الأسبوع؟', [clip.ask('week-days')], numbersOf([7, 4, 6]), 'n7', `في الأسبوع ٧ أيام: ${DAYS.join('، ')}`, clip.num(7), d(20), 'calendar_days'),
  calendarQ('school-start', 'في أي يوم يبدأ الأسبوع الدراسي؟', [clip.ask('school-start')], (['الأحد', 'الإثنين', 'الأربعاء'] as const).map(dayOption), 'sun', 'يبدأ الأسبوع الدراسي يوم الأحد', clip.day('الأحد'), d(25), 'calendar_days'),
  calendarQ('weekend', 'أي يوم من أيام عطلة نهاية الأسبوع؟', [clip.ask('weekend')], (['الجمعة', 'الإثنين', 'الثلاثاء'] as const).map(dayOption), 'fri', 'عطلة نهاية الأسبوع: الجمعة والسبت', clip.day('الجمعة'), d(30), 'calendar_days'),
  dayNextQ('after', 'الأربعاء', ['السبت', 'الثلاثاء'], d(30)),
  dayNextQ('after', 'السبت', ['الجمعة', 'الإثنين'], d(40)),
  dayNextQ('after', 'الخميس', ['الأربعاء', 'الأحد'], d(35)),
  dayNextQ('after', 'الأحد', ['السبت', 'الثلاثاء'], d(30)),
  dayNextQ('before', 'الإثنين', ['الثلاثاء', 'السبت'], d(38)),
  dayNextQ('before', 'الجمعة', ['السبت', 'الأربعاء'], d(40)),
]

// ── Narration ─────────────────────────────────────────────────────────────
// Kuwaiti (Maryam Essa), sent without diacritics. Short phrases that many questions share.
export const ASK_CLIPS = {
  count: 'كم العدد؟',
  'which-group': 'أي مجموعة فيها هالعدد؟',
  'match-count': 'نوصل كل مجموعة بعددها.',
  missing: 'شنو العدد الناقص؟',
  after: 'شنو العدد اللي بعده؟',
  before: 'شنو العدد اللي قبله؟',
  biggest: 'وين العدد الأكبر؟',
  smallest: 'وين العدد الأصغر؟',
  compare: 'أي رمز نحط في الدائرة؟',
  complete: 'أي عدد يخلي الجملة صحيحة؟',
  'clock-read': 'كم الساعة؟',
  'clock-find': 'أي ساعة تبين هالوقت؟',
  'hour-after': 'كم تصير الساعة بعد ساعة؟',
  'hour-before': 'كم كانت الساعة قبل ساعة؟',
  'months-gregorian': 'كم شهر في السنة الميلادية؟',
  'months-hijri': 'كم شهر في السنة الهجرية؟',
  'national-day': 'في أي شهر اليوم الوطني للكويت؟',
  'first-gregorian': 'شنو أول شهر في السنة الميلادية؟',
  'first-hijri': 'شنو أول شهر في السنة الهجرية؟',
  fasting: 'في أي شهر نصوم؟',
  hajj: 'في أي شهر الحج؟',
  'week-days': 'كم يوم في الأسبوع؟',
  'school-start': 'في أي يوم يبدأ الأسبوع الدراسي؟',
  weekend: 'أي يوم عطلة نهاية الأسبوع؟',
  'day-after': 'شنو اليوم اللي بعده؟',
  'day-before': 'شنو اليوم اللي قبله؟',
} as const
export type AskClip = keyof typeof ASK_CLIPS

export const UI_CLIPS = {
  welcome: 'هلا! نختار درس ونبدأ.',
  'test-intro': 'هذا اختبار تجريبي… فيه أسئلة من كل الدروس. يلا نبدأ!',
  'match-wrong': 'لا… نجرب مرة ثانية.',
  'match-first': 'نبدأ بالمجموعة أول.',
  review: 'خلنا نتذكر مع بعض…',
  'done-great': 'واو! نتيجة رائعة!',
  'done-good': 'حلو! نتدرب مرة ثانية… ونصير أقوى.',
  'count-is': 'العدد',
  hour: 'الساعة',
  greater: 'أكبر من',
  smaller: 'أصغر من',
  equal: 'يساوي',
  'cheer-1': 'كفو!',
  'cheer-2': 'ما شاء الله! صح.',
  'cheer-3': 'واو! جواب صح!',
  'cheer-4': 'برافو! جواب ممتاز.',
  'cheer-5': 'الله! جواب حلو.',
  'cheer-6': 'تمام التمام!',
  'cheer-7': 'عفية!',
  'cheer-8': 'صح! رائع.',
  'cheer-9': 'زين! جواب صحيح.',
  'cheer-10': 'يا سلام! صح.',
  'retry-1': 'مو مشكلة… الجواب الصح…',
  'retry-2': 'قربنا! الجواب الصح…',
  'retry-3': 'خلنا نتعلمها مع بعض… الجواب الصح…',
  'retry-4': 'محاولة حلوة! الجواب الصح…',
  'retry-5': 'نشوف مع بعض… الجواب الصح…',
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
  .map((id) => ({ text: UI_CLIPS[id].replace('الجواب الصح…', '').replace('…', '').trim(), clip: clip.ui(id) }))

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
    ...DAYS.map((day) => ar(clip.day(day), `${day}.`)),
    ...(Object.keys(MONTHS) as MonthId[]).map((id) => ar(clip.month(id), `${MONTHS[id]}.`)),
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

/** A copy of the question for one round: groups marked `*` get this round's object. */
export function dressQuestion(question: Question, random: () => number = Math.random): Question {
  const object = COUNT_OBJECTS[Math.floor(random() * COUNT_OBJECTS.length)]!
  const fill = (art: string) => art.replace(/^count:\*:/, `count:${object}:`)
  return {
    ...question,
    subject: question.subject ? fill(question.subject) : undefined,
    options: question.options.map((option) => ({ ...option, art: fill(option.art) })),
    pairs: question.pairs.map((pair) => ({ ...pair, first: fill(pair.first) })),
  }
}
