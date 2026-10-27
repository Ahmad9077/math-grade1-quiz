import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Art } from '../art/Art'
import { celebrate } from '../art/confetti'
import { useNarrator } from '../audio/NarratorContext'
import type { Cue } from '../audio/player'
import { sfx } from '../audio/sfx'
import { CHEERS, RETRIES, clip, roundClips, type Cheer, type Option, type Pair, type Question } from '../data/catalog'
import { TONES, toneStyle, type ToneId } from '../data/tones'
import { arabicNumber } from '../domain/format'
import { arrangeOptions, shuffle } from '../domain/round'
import type { Attempt } from '../hub/bridge'
import { ArrowIcon, BigButton, CloseButton, SpeakerButton, StarIcon, order } from './ui'

/** Cheers rest for this many answers before they can come back. */
const CHEER_REST = 5

// Narration starts once the question has settled on screen.
const ASK_DELAY_MS = 380

/** A random item that was not used recently; the pick joins the recent list. */
function fresh<T>(items: readonly T[], recent: T[], rest: number): T {
  const pool = items.filter((item) => !recent.includes(item))
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? items[0]!
  recent.push(pick)
  if (recent.length > rest) recent.shift()
  return pick
}

/** A stable number from text, so each round can explain an answer a different way. */
function spread(text: string): number {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

export interface Round {
  id: number
  kind: 'practice' | 'test'
  tone: ToneId
  questions: Question[]
}

interface QuizScreenProps {
  round: Round
  /** Played once before question one: the lesson or mock-test introduction. */
  intro?: string
  onExit: () => void
  onFinish: (attempts: Attempt[]) => void
}

type Phase = 'asking' | 'answered'

export function QuizScreen({ round, intro, onExit, onFinish }: QuizScreenProps) {
  const narrator = useNarrator()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [chosen, setChosen] = useState<string | null>(null)
  const [speakingOption, setSpeakingOption] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [cheer, setCheer] = useState<Cheer>(CHEERS[0]!)
  const [retry, setRetry] = useState(RETRIES[0]!)
  const [confirmExit, setConfirmExit] = useState(false)
  const recentCheers = useRef<Cheer[]>([])
  const recentRetries = useRef<(typeof RETRIES)[number][]>([])
  const tileRefs = useRef(new Map<string, HTMLElement>())
  const optionsRef = useRef<HTMLDivElement>(null)

  const question = round.questions[index]!
  const options = useMemo(() => arrangeOptions(question), [question])
  // One of the question's explanations, picked afresh for every round.
  const explanation = useMemo(() => question.explain[spread(`${round.id}:${question.key}`) % question.explain.length]!, [question, round.id])
  const correctOption = question.options.find((option) => option.id === question.answer)
  const tone = round.kind === 'test' ? question.topic : round.tone
  const explainCues: Cue[] = explanation.clips.map((id, n) => ({ clip: id, gap: n === 0 ? 450 : 200 }))

  const askCues = useMemo<Cue[]>(
    () => [
      ...question.ask.map((id, n) => ({ clip: id, gap: n === 0 ? 0 : 200, onStart: () => setSpeakingOption(null) })),
      ...options.flatMap((option) => (option.clip ? [{ clip: option.clip, onStart: () => setSpeakingOption(option.id) }] : [])),
    ],
    [question, options],
  )

  // Load every clip of the round up front, so no question waits for its audio.
  useEffect(() => {
    narrator.preload(roundClips(round.questions))
  }, [narrator, round.questions])

  useEffect(() => {
    const opening = intro && index === 0 ? [{ clip: intro }, { ...askCues[0]!, gap: 500 }, ...askCues.slice(1)] : askCues
    const timer = window.setTimeout(() => {
      void narrator.play(opening).then(() => setSpeakingOption(null))
    }, ASK_DELAY_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the introduction plays once, before question one
  }, [askCues, narrator])

  useEffect(() => () => narrator.stop(), [narrator])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // Keep the answers in view above the feedback sheet on short phone screens.
  useEffect(() => {
    if (phase !== 'answered') return
    const timer = window.setTimeout(() => {
      const box = optionsRef.current?.getBoundingClientRect()
      const sheet = document.querySelector('.feedback')?.getBoundingClientRect()
      if (!box || !sheet) return
      const overlap = box.bottom + 12 - sheet.top
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'smooth' })
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase])

  function replay() {
    if (phase === 'asking') void narrator.play(askCues).then(() => setSpeakingOption(null))
    else void narrator.play(explainCues)
  }

  function settle(correct: boolean, chosenId: string, anchor?: HTMLElement | null) {
    setPhase('answered')
    setAttempts((list) => [...list, { questionKey: question.key, chosen: chosenId, correct }])
    if (correct) {
      sfx.correct()
      const pick = fresh(CHEERS, recentCheers.current, CHEER_REST)
      setCheer(pick)
      celebrate(anchor ?? undefined, TONES[tone].tone)
      void narrator.play([{ clip: pick.clip, gap: 300 }, ...explainCues])
    } else if (question.kind === 'match') {
      sfx.wrong()
      void narrator.play([{ clip: clip.ui('review'), gap: 450 }, ...explainCues])
    } else {
      sfx.wrong()
      const pick = fresh(RETRIES, recentRetries.current, 2)
      setRetry(pick)
      const reveal: Cue[] = correctOption?.clip ? [{ clip: correctOption.clip, gap: 120 }] : []
      void narrator.play([{ clip: pick.clip, gap: 450 }, ...reveal, ...explainCues])
    }
  }

  function answer(option: Option) {
    if (phase !== 'asking') return
    narrator.stop()
    setSpeakingOption(null)
    setChosen(option.id)
    settle(option.id === question.answer, option.id, tileRefs.current.get(option.id))
  }

  function next() {
    sfx.tap()
    narrator.stop()
    if (index + 1 >= round.questions.length) {
      onFinish(attempts)
      return
    }
    setIndex(index + 1)
    setPhase('asking')
    setChosen(null)
  }

  const lastCorrect = attempts.at(-1)?.correct ?? false
  const register = (id: string) => (node: HTMLElement | null) => {
    if (node) tileRefs.current.set(id, node)
    else tileRefs.current.delete(id)
  }

  return (
    <main className={`screen quiz-screen ${phase === 'answered' ? 'has-feedback' : ''}`} style={toneStyle(tone)}>
      <header className="top-bar quiz-top">
        <CloseButton onClick={() => setConfirmExit(true)} />
        <div className="track" aria-label={`السؤال ${arabicNumber(index + 1)} من ${arabicNumber(round.questions.length)}`}>
          {round.questions.map((entry, n) => {
            const attempt = attempts[n]
            const state = attempt ? (attempt.correct ? 'is-right' : 'is-miss') : n === index ? 'is-current' : ''
            return (
              <span key={entry.key} className={`track-step ${state}`}>
                {attempt?.correct ? (
                  <span className="track-star pop">
                    <StarIcon />
                  </span>
                ) : null}
              </span>
            )
          })}
        </div>
        <span className="quiz-count">
          {arabicNumber(index + 1)}/{arabicNumber(round.questions.length)}
        </span>
      </header>

      <section key={question.key} className={`question question-${question.kind} topic-${question.topic} question-in`} data-question-key={question.key}>
        <div className="prompt-row">
          <SpeakerButton onClick={replay} />
          <h1 className="prompt">{question.prompt}</h1>
        </div>

        {question.subject ? (
          <div className={`subject pop ${subjectKind(question.subject)}`} style={order(0, { '--base-delay': '80ms' })} aria-hidden="true">
            <span className="subject-art">
              <Art art={question.subject} />
            </span>
          </div>
        ) : null}

        {question.kind === 'match' ? (
          <div ref={optionsRef} className="match-wrap">
            <MatchBoard
              question={question}
              locked={phase === 'answered'}
              onFirst={(pair) => (pair.clip ? void narrator.play([{ clip: pair.clip }]) : undefined)}
              onHit={() => sfx.tap()}
              onMiss={() => {
                sfx.wrong()
                void narrator.play([{ clip: clip.ui('match-wrong') }])
              }}
              onFirstColumnFirst={() => void narrator.play([{ clip: clip.ui('match-first') }])}
              onDone={(mistakes, board) => settle(mistakes === 0, `mistakes:${mistakes}`, board)}
            />
          </div>
        ) : (
          <div ref={optionsRef} className={`options holds-${optionKind(options[0]?.art ?? '')} count-${options.length}`}>
            {options.map((option, n) => {
              const isChosen = chosen === option.id
              const isAnswer = option.id === question.answer
              const state =
                phase === 'answered'
                  ? isChosen
                    ? isAnswer
                      ? 'is-correct'
                      : 'is-wrong'
                    : isAnswer
                      ? 'is-reveal'
                      : 'is-dim'
                  : speakingOption === option.id
                    ? 'is-speaking'
                    : ''
              return (
                <div key={option.id} className="option-slot rise" style={order(n, { '--base-delay': '140ms' })}>
                  <button
                    ref={register(option.id)}
                    type="button"
                    className={`option ${optionKind(option.art)} ${state}`}
                    onClick={() => answer(option)}
                    disabled={phase === 'answered'}
                    aria-label={option.label}
                    data-option={option.id}
                  >
                    <span className="option-art" aria-hidden="true">
                      <Art art={option.art} />
                    </span>
                    {state === 'is-correct' || state === 'is-reveal' ? (
                      <span className="option-badge badge-good pop">✓</span>
                    ) : state === 'is-wrong' ? (
                      <span className="option-badge badge-miss pop">✕</span>
                    ) : null}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {phase === 'answered' ? (
        <aside key={`feedback-${question.key}`} className={`feedback ${lastCorrect ? 'feedback-good' : 'feedback-miss'}`} role="status">
          <div className="feedback-head">
            {lastCorrect ? (
              <span className="feedback-star spin-in">
                <StarIcon />
              </span>
            ) : (
              <span className="feedback-bulb" aria-hidden="true">
                <Art art="💡" />
              </span>
            )}
            <div className="feedback-titles">
              {lastCorrect ? (
                <p className="feedback-title">{cheer.text}</p>
              ) : question.kind === 'match' ? (
                <p className="feedback-title">خلنا نتذكر:</p>
              ) : (
                <>
                  <p className="feedback-encourage">{retry.text}</p>
                  <p className="feedback-title">الجواب الصحيح:</p>
                  {correctOption ? (
                    <span className={`feedback-answer ${optionKind(correctOption.art)}`} aria-label={correctOption.label}>
                      <Art art={correctOption.art} />
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <ul className="feedback-facts">
            {explanation.text.split('\n').map((line) => (
              <li key={line} className="feedback-fact">
                {line}
              </li>
            ))}
          </ul>
          <div className="feedback-actions">
            <SpeakerButton onClick={() => void narrator.play(explainCues)} label="إعادة الشرح" />
            <BigButton onClick={next} pulse className="next-button">
              {index + 1 >= round.questions.length ? 'النتيجة' : 'التالي'}
              <ArrowIcon direction="next" />
            </BigButton>
          </div>
        </aside>
      ) : null}

      {confirmExit ? (
        <div className="sheet-backdrop fade-in">
          <div className="sheet pop" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <p id="exit-title" className="sheet-title">
              نطلع من الجولة؟
            </p>
            <p className="sheet-sub">إجابات هذي الجولة ما راح تنحفظ.</p>
            <div className="sheet-actions">
              <BigButton onClick={() => setConfirmExit(false)}>نكمل</BigButton>
              <BigButton tone="paper" onClick={onExit}>
                خروج
              </BigButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

/** The art code's kind: `clock:3` → `clock`; emoji have none. */
function artKind(art: string): string {
  const match = /^([a-z]+):/.exec(art)
  return match ? match[1]! : 'emoji'
}

function subjectKind(art: string): string {
  return `subject-${artKind(art)}`
}

function optionKind(art: string): string {
  return `option-${artKind(art)}`
}

interface MatchBoardProps {
  question: Question
  locked: boolean
  onFirst: (pair: Pair) => void
  onHit: () => void
  onMiss: () => void
  /** A number was tapped before choosing a group. */
  onFirstColumnFirst: () => void
  onDone: (mistakes: number, board: HTMLElement | null) => void
}

interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * The worksheet's «صل» exercise. Groups stand in the first column (on the right, where
 * Arabic reading starts) and are chosen first; the numbers answer them.
 */
function MatchBoard({ question, locked, onFirst, onHit, onMiss, onFirstColumnFirst, onDone }: MatchBoardProps) {
  const seconds = useMemo(() => {
    // Never leave every number directly opposite its group.
    let order = shuffle(question.pairs)
    for (let tries = 0; tries < 6 && order.every((pair, n) => pair.id === question.pairs[n]!.id); tries += 1) order = shuffle(question.pairs)
    return order
  }, [question])
  const [selected, setSelected] = useState<string | null>(null)
  const [nudge, setNudge] = useState(false)
  const [matched, setMatched] = useState<string[]>([])
  const [shaking, setShaking] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  useLayoutEffect(() => {
    function measure() {
      const board = boardRef.current?.getBoundingClientRect()
      if (!board) return
      setLines(
        matched.flatMap((id) => {
          const a = refs.current.get(`first-${id}`)?.getBoundingClientRect()
          const b = refs.current.get(`second-${id}`)?.getBoundingClientRect()
          if (!a || !b) return []
          // Join the facing edges, whichever side each column is on.
          const aRight = a.left > b.left
          return [
            {
              id,
              x1: (aRight ? a.left + 4 : a.right - 4) - board.left,
              y1: a.top + a.height / 2 - board.top,
              x2: (aRight ? b.right - 4 : b.left + 4) - board.left,
              y2: b.top + b.height / 2 - board.top,
            },
          ]
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [matched])

  function chooseFirst(pair: Pair) {
    if (locked || matched.includes(pair.id)) return
    onFirst(pair)
    setSelected(pair.id)
  }

  function answerSecond(pair: Pair) {
    if (locked || matched.includes(pair.id)) return
    if (!selected) {
      // Start from the groups: point the child back to them.
      onFirstColumnFirst()
      setNudge(true)
      window.setTimeout(() => setNudge(false), 650)
      return
    }
    onHit()
    if (selected === pair.id) {
      const done = [...matched, pair.id]
      setMatched(done)
      setSelected(null)
      if (done.length === question.pairs.length) window.setTimeout(() => onDone(mistakes, boardRef.current), 350)
      return
    }
    setMistakes((count) => count + 1)
    setShaking([`first-${selected}`, `second-${pair.id}`])
    setSelected(null)
    onMiss()
    window.setTimeout(() => setShaking([]), 450)
  }

  function cell(side: 'first' | 'second', pair: Pair, n: number) {
    const key = `${side}-${pair.id}`
    const colour = question.pairs.findIndex((entry) => entry.id === pair.id)
    const state = matched.includes(pair.id)
      ? `is-matched match-color-${colour}`
      : side === 'first' && selected === pair.id
        ? 'is-selected'
        : side === 'second' && !selected
          ? 'is-waiting'
          : ''
    const art = side === 'first' ? pair.first : pair.second
    return (
      <div key={key} className="match-slot rise" style={order(n + (side === 'second' ? 1 : 0), { '--base-delay': '140ms' })}>
        <button
          ref={(node) => {
            if (node) refs.current.set(key, node)
            else refs.current.delete(key)
          }}
          type="button"
          className={`match-item match-${side} ${optionKind(art)} ${state} ${shaking.includes(key) ? 'shake' : ''}`}
          onClick={() => (side === 'first' ? chooseFirst(pair) : answerSecond(pair))}
          disabled={locked}
          aria-label={side === 'first' ? pair.label : 'عدد'}
          aria-pressed={side === 'first' ? selected === pair.id : undefined}
          data-pair={pair.id}
          data-side={side}
        >
          <span className="option-art" aria-hidden="true">
            <Art art={art} />
          </span>
        </button>
      </div>
    )
  }

  return (
    <div ref={boardRef} className="match-board" dir="rtl">
      <svg className="match-lines" aria-hidden="true">
        {lines.map((line) => (
          <line
            key={line.id}
            className={`match-line match-color-${question.pairs.findIndex((pair) => pair.id === line.id)}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>
      <div className={`match-column match-column-first ${nudge ? 'nudge' : ''}`}>{question.pairs.map((pair, n) => cell('first', pair, n))}</div>
      <div className="match-column">{seconds.map((pair, n) => cell('second', pair, n))}</div>
    </div>
  )
}
