import { A } from '../data/catalog'

interface ArtProps {
  art: string
  className?: string
}

/**
 * Renders a picture at the size of its container. The art codes are listed with `ArtRef` in
 * the catalog: numbers in the book's digits, groups of objects, the ten-frame, the abacus,
 * bundles of sticks, cubes, the clock, the number train and line, and comparisons.
 * Comparison signs are always laid out left to right, so `<` is never mirrored by Arabic text.
 */
export function Art({ art, className = '' }: ArtProps) {
  const [kind = '', ...rest] = art.split(':')
  const value = rest.join(':')
  const classes = (name: string) => `art ${name} ${className}`

  switch (kind) {
    case 'n':
      return (
        <span className={classes('art-number')} aria-hidden="true">
          {A(Number(value))}
        </span>
      )
    case 'time':
      return (
        <span className={classes('art-time')} aria-hidden="true" dir="ltr">
          {A(Number(value))}:٠٠
        </span>
      )
    case 'txt':
      return (
        <span className={classes('art-text')} aria-hidden="true" dir="rtl">
          {value}
        </span>
      )
    case 'sym':
      return (
        <span className={classes('art-sign')} aria-hidden="true" dir="ltr">
          {value}
        </span>
      )
    case 'count': {
      const [object = '🍎', count = '0'] = rest
      return <Group object={object} count={Number(count)} className={className} />
    }
    case 'frame':
      return <TenFrames count={Number(value)} className={className} />
    case 'abacus':
      return <Abacus count={Number(value)} className={className} />
    case 'sticks':
      return <Sticks count={Number(value)} className={className} />
    case 'cubes':
      return <Cubes count={Number(value)} className={className} />
    case 'clock':
      return <Clock hour={Number(value)} className={className} />
    case 'train':
      return <Train items={value.split(',')} className={className} />
    case 'line':
      return <NumberLine items={value.split(',')} className={className} />
    case 'cmp': {
      const [right = '', left = '', sign = ''] = rest
      return (
        <span className={classes('art-compare')} aria-hidden="true" dir="ltr">
          <NumberBox value={left} />
          <span className={`compare-circle ${sign ? 'has-sign' : ''}`}>{sign}</span>
          <NumberBox value={right} />
        </span>
      )
    }
    case 'cmpg': {
      const [object = '🍎', right = '0', left = '0'] = rest
      return (
        <span className={classes('art-compare art-compare-groups')} aria-hidden="true" dir="ltr">
          <span className="compare-oval">
            <Group object={object} count={Number(left)} />
          </span>
          <span className="compare-circle" />
          <span className="compare-oval">
            <Group object={object} count={Number(right)} />
          </span>
        </span>
      )
    }
    case 'sent': {
      const [a = '?', b = '?', c = '?'] = rest
      return <Sentence parts={[a, '+', b, '=', c]} className={className} />
    }
    case 'sum':
      return <Sentence parts={[rest[0] ?? '?', '+', rest[1] ?? '?']} className={className} />
    case 'eq': {
      const [a = '?', b = '?', c = '?', e = '?'] = rest
      return <Sentence parts={[a, '+', b, '=', c, '+', e]} className={className} />
    }
    case 'pair': {
      const [object = '🍎', a = '0', b = '0'] = rest
      return <PairFrame object={object} a={Number(a)} b={Number(b)} className={className} />
    }
    case 'picsent': {
      const [object = '🍎', a = '0', b = '0', blank = 'b'] = rest
      return (
        <span className={classes('art-stack')} aria-hidden="true">
          <PairFrame object={object} a={Number(a)} b={Number(b)} />
          <Sentence parts={[a, '+', blank === 'b' ? '?' : b, '=', blank === 'c' ? '?' : String(Number(a) + Number(b))]} />
        </span>
      )
    }
    case 'cubes2':
      return <CubeRod a={Number(rest[0])} b={Number(rest[1])} className={className} />
    case 'frame2':
      return <TwoColourFrame a={Number(rest[0])} b={Number(rest[1])} className={className} />
    case 'dotsent': {
      const [a = '0', b = '0'] = rest
      return (
        <span className={classes('art-stack')} aria-hidden="true">
          <Domino a={Number(a)} b={Number(b)} />
          <Sentence parts={[a, '+', b, '=', '?']} />
        </span>
      )
    }
    case 'domsent': {
      const [given = '0', total = '0'] = rest
      return (
        <span className={classes('art-stack')} aria-hidden="true">
          <Domino a={Number(given)} b={null} />
          <Sentence parts={[given, '+', '?', '=', total]} />
        </span>
      )
    }
    case 'jump': {
      // As in the book: the sentence above the line; the jumps are drawn once the child has answered.
      const [start = '0', step = '0'] = rest
      return (
        <span className={classes('art-stack')} aria-hidden="true">
          <Sentence parts={[start, '+', step, '=', '?']} />
          <JumpLine start={Number(start)} step={Number(step)} />
        </span>
      )
    }
    case 'house': {
      const [total = '0', floors = ''] = rest
      return <NumberHouse total={total} floors={floors.split(',').map((floor) => floor.split('+') as [string, string])} className={className} />
    }
    case 'bond': {
      const [whole = '0', a = '?', b = '?'] = rest
      return <Bond whole={whole} a={a} b={b} className={className} />
    }
    case 'paint':
      return <PaintRow yellow={Number(rest[0])} red={Number(rest[1])} className={className} />
    default:
      return (
        <span className={classes('art-emoji')} aria-hidden="true">
          {art}
        </span>
      )
  }
}

function NumberBox({ value }: { value: string }) {
  return value === '?' ? <span className="compare-box is-missing">؟</span> : <span className="compare-box">{A(Number(value))}</span>
}

/** A group laid out in neat rows, as in the book: up to five in a row, two or three rows. */
function Group({ object, count, className = '', compact = false }: { object: string; count: number; className?: string; compact?: boolean }) {
  if (count === 0) {
    return (
      <span className={`art art-group is-empty ${className}`} aria-hidden="true">
        <span className="empty-set" />
      </span>
    )
  }
  // In a two-part frame a group stands in two rows from four on, so both groups fit a phone.
  const columns = compact ? (count <= 3 ? count : Math.ceil(count / 2)) : count <= 5 ? count : count <= 10 ? Math.ceil(count / 2) : Math.ceil(count / 3)
  return (
    <span className={`art art-group ${className}`} aria-hidden="true" style={{ '--columns': columns } as React.CSSProperties}>
      {Array.from({ length: count }, (_, n) => (
        <span key={n} className="group-item">
          {object}
        </span>
      ))}
    </span>
  )
}

/** Ten-frames: the top row fills first, then the bottom row; a second frame holds 11 and 12. */
function TenFrames({ count, className = '' }: { count: number; className?: string }) {
  const frames = count > 10 ? [10, count - 10] : [count]
  return (
    <span className={`art art-frames ${className}`} aria-hidden="true">
      {frames.map((filled, frame) => (
        <svg key={frame} className="ten-frame" viewBox="0 0 104 44">
          {Array.from({ length: 10 }, (_, cell) => {
            const x = 2 + (cell % 5) * 20
            const y = 2 + Math.floor(cell / 5) * 20
            return (
              <g key={cell}>
                <rect x={x} y={y} width="20" height="20" className="frame-cell" />
                {cell < filled ? <circle cx={x + 10} cy={y + 10} r="6.5" className="frame-dot" /> : null}
              </g>
            )
          })}
        </svg>
      ))}
    </span>
  )
}

/** The book's abacus: one «آحاد» rod below ten, «عشرات» and «آحاد» rods from ten on. */
function Abacus({ count, className = '' }: { count: number; className?: string }) {
  const rods = count >= 10 ? [{ label: 'عشرات', beads: Math.floor(count / 10) }, { label: 'آحاد', beads: count % 10 }] : [{ label: 'آحاد', beads: count }]
  const width = rods.length * 46 + 8
  return (
    <svg className={`art art-abacus ${className}`} viewBox={`0 0 ${width} 132`} aria-hidden="true">
      {rods.map((rod, n) => {
        const x = 4 + n * 46 + 23
        return (
          <g key={rod.label}>
            <line x1={x} y1="6" x2={x} y2="108" className="abacus-rod" />
            {Array.from({ length: rod.beads }, (_, b) => (
              <ellipse key={b} cx={x} cy={102 - b * 10.5} rx="13" ry="5.6" className="abacus-bead" />
            ))}
            <rect x={x - 22} y="106" width="44" height="22" rx="4" className="abacus-base" />
            <text x={x} y="122" textAnchor="middle" className="abacus-label">
              {rod.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** A bundle of ten sticks tied with a band, then single sticks. */
function Sticks({ count, className = '' }: { count: number; className?: string }) {
  const bundles = Math.floor(count / 10)
  const singles = count % 10
  const bundleWidth = 44
  const width = bundles * (bundleWidth + 14) + singles * 12 + 10
  return (
    <svg className={`art art-sticks ${className}`} viewBox={`0 0 ${width} 110`} aria-hidden="true">
      {Array.from({ length: bundles }, (_, b) => {
        const x0 = 6 + b * (bundleWidth + 14)
        return (
          <g key={`b${b}`}>
            {Array.from({ length: 10 }, (_, s) => (
              <rect key={s} x={x0 + s * 4} y="6" width="5" height="96" rx="2.5" className="stick" />
            ))}
            <rect x={x0 - 3} y="48" width={bundleWidth + 4} height="10" rx="3" className="stick-band" />
          </g>
        )
      })}
      {Array.from({ length: singles }, (_, s) => (
        <rect key={`s${s}`} x={6 + bundles * (bundleWidth + 14) + s * 12} y="6" width="6" height="96" rx="3" className="stick" />
      ))}
    </svg>
  )
}

/** Connecting cubes: a rod of ten standing up, then single cubes. */
function Cubes({ count, className = '' }: { count: number; className?: string }) {
  const rods = Math.floor(count / 10)
  const singles = count % 10
  const width = rods * 24 + singles * 22 + 12
  return (
    <svg className={`art art-cubes ${className}`} viewBox={`0 0 ${width} 214`} aria-hidden="true">
      {Array.from({ length: rods }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => <rect key={`${r}-${c}`} x={6 + r * 24} y={6 + c * 20} width="19" height="19" rx="3" className="cube" />),
      )}
      {Array.from({ length: singles }, (_, s) => (
        <rect key={`s${s}`} x={6 + rods * 24 + 6 + s * 22} y="186" width="19" height="19" rx="3" className="cube" />
      ))}
    </svg>
  )
}

/** The book's clock: green rim, Arabic digits, a long green minute hand and a short red hour hand. */
function Clock({ hour, className = '' }: { hour: number; className?: string }) {
  const angle = (hour % 12) * 30
  return (
    <svg className={`art art-clock ${className}`} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="clock-rim" />
      <circle cx="60" cy="60" r="49" className="clock-face" />
      {Array.from({ length: 60 }, (_, tick) => (
        <line
          key={tick}
          x1="60"
          y1={tick % 5 === 0 ? 13 : 13.5}
          x2="60"
          y2={tick % 5 === 0 ? 18 : 15.5}
          className={tick % 5 === 0 ? 'clock-tick is-hour' : 'clock-tick'}
          transform={`rotate(${tick * 6} 60 60)`}
        />
      ))}
      {Array.from({ length: 12 }, (_, n) => {
        const number = n + 1
        const a = (number * 30 * Math.PI) / 180
        return (
          <text key={number} x={60 + Math.sin(a) * 34} y={60 - Math.cos(a) * 34 + 4.6} textAnchor="middle" className="clock-number">
            {A(number)}
          </text>
        )
      })}
      <line x1="60" y1="60" x2="60" y2="21" className="clock-minute" />
      <line x1="60" y1="60" x2="60" y2="35" className="clock-hour" transform={`rotate(${angle} 60 60)`} />
      <circle cx="60" cy="60" r="4.5" className="clock-pin" />
    </svg>
  )
}

/** The number train: the engine leads on the right and the numbers grow towards the left. */
function Train({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <span className={`art art-train ${className}`} aria-hidden="true" dir="rtl">
      <span className="train-engine" />
      {items.map((item, n) => (
        <span key={n} className={`train-car ${item === '?' ? 'is-missing' : ''}`}>
          <span className="train-number">{item === '?' ? '؟' : A(Number(item))}</span>
        </span>
      ))}
    </span>
  )
}

/** A number line read from the right, as in the book. */
function NumberLine({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <span className={`art art-line ${className}`} aria-hidden="true" dir="rtl">
      <span className="line-rule" />
      {items.map((item, n) => (
        <span key={n} className="line-stop">
          <span className="line-tick" />
          <span className={`line-number ${item === '?' ? 'is-missing' : ''}`}>{item === '?' ? '؟' : A(Number(item))}</span>
        </span>
      ))}
    </span>
  )
}

// ── Addition (unit 3) ────────────────────────────────────────────────────
// Read from the right, as in the book: the first number of a sentence or a picture is on the right.

function Cell({ value, className = '' }: { value: string; className?: string }) {
  return value === '?' ? <span className={`sent-num is-missing ${className}`}>؟</span> : <span className={`sent-num ${className}`}>{A(Number(value))}</span>
}

/** «٢ + ٦ = ٨», each number in its box; `?` is the empty box to fill. */
function Sentence({ parts, className = '' }: { parts: string[]; className?: string }) {
  return (
    <span className={`art art-sentence ${className}`} aria-hidden="true" dir="rtl">
      {parts.map((part, n) =>
        part === '+' || part === '=' ? (
          <span key={n} className="sent-op">
            {part}
          </span>
        ) : (
          <Cell key={n} value={part} />
        ),
      )}
    </span>
  )
}

/** Two groups of the same thing in a two-part frame: the first on the right. */
function PairFrame({ object, a, b, className = '' }: { object: string; a: number; b: number; className?: string }) {
  return (
    <span className={`art art-pair ${className}`} aria-hidden="true" dir="rtl">
      <span className="pair-side">
        <Group object={object} count={a} compact />
      </span>
      <span className="pair-side">
        <Group object={object} count={b} compact />
      </span>
    </span>
  )
}

/** A rod of connecting cubes: a red cubes from the right, then b blue. */
function CubeRod({ a, b, className = '' }: { a: number; b: number; className?: string }) {
  const total = a + b
  const size = 30
  const width = total * size + 8
  return (
    <svg className={`art art-cuberod ${className}`} viewBox={`0 0 ${width} 46`} aria-hidden="true">
      {Array.from({ length: total }, (_, n) => {
        const x = width - 4 - (n + 1) * size
        const tone = n < a ? 'is-red' : 'is-blue'
        return (
          <g key={n} className={`rod-cube ${tone}`}>
            <rect x={x} y="10" width={size} height={size} rx="3" />
            <rect x={x + size / 2 - 6} y="4" width="12" height="7" rx="2" className="rod-knob" />
            <circle cx={x + size / 2} cy="25" r="5" className="rod-hole" />
          </g>
        )
      })}
    </svg>
  )
}

/** A ten-frame filled from the right, top row first: a red counters, then b yellow. */
function TwoColourFrame({ a, b, className = '' }: { a: number; b: number; className?: string }) {
  return (
    <svg className={`art art-frame2 ${className}`} viewBox="0 0 104 44" aria-hidden="true">
      {Array.from({ length: 10 }, (_, cell) => {
        const x = 2 + (4 - (cell % 5)) * 20
        const y = 2 + Math.floor(cell / 5) * 20
        return (
          <g key={cell}>
            <rect x={x} y={y} width="20" height="20" className="frame-cell" />
            {cell < a + b ? <ellipse cx={x + 10} cy={y + 10} rx="7.5" ry="5" className={cell < a ? 'counter-red' : 'counter-yellow'} /> : null}
          </g>
        )
      })}
    </svg>
  )
}

/** A two-part frame of counters: a red on the right, b blue on the left; `null` is the side still to draw. */
function Domino({ a, b }: { a: number; b: number | null }) {
  const dots = (count: number, tone: string) => (
    <span className="dom-dots" style={{ '--dom-columns': count > 4 ? 3 : 2 } as React.CSSProperties}>
      {Array.from({ length: count }, (_, n) => (
        <span key={n} className={`dom-dot ${tone}`} />
      ))}
    </span>
  )
  return (
    <span className="art art-domino" dir="rtl">
      <span className="dom-side">{dots(a, 'is-red')}</span>
      {b === null ? <span className="dom-side is-empty">؟</span> : <span className="dom-side">{dots(b, 'is-blue')}</span>}
    </span>
  )
}

/** The number line from 0 to 12, read from the left as in lesson 3-2: start at the red point, jump right. */
function JumpLine({ start, step, className = '' }: { start: number; step: number; className?: string }) {
  const x = (value: number) => 18 + value * 27
  return (
    <svg className={`art art-jump ${className}`} viewBox="0 0 360 96" aria-hidden="true">
      <defs>
        <marker id="jump-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="jump-head" />
        </marker>
      </defs>
      <line x1="6" y1="62" x2="354" y2="62" className="jump-rule" markerStart="url(#jump-head)" markerEnd="url(#jump-head)" />
      {Array.from({ length: 13 }, (_, value) => (
        <g key={value}>
          <circle cx={x(value)} cy="62" r={value === start ? 6.5 : 3.6} className={value === start ? 'jump-start' : 'jump-tick'} />
          <text x={x(value)} y="88" textAnchor="middle" className={`jump-number ${value === start ? 'is-start' : ''}`}>
            {A(value)}
          </text>
        </g>
      ))}
      {Array.from({ length: step }, (_, n) => {
        const from = x(start + n)
        const to = x(start + n + 1)
        return <path key={n} d={`M${from + 3} 54 Q${(from + to) / 2} 22 ${to - 3} 53`} className="jump-arc" markerEnd="url(#jump-head)" style={{ animationDelay: `${0.25 + n * 0.35}s` }} />
      })}
    </svg>
  )
}

/** The book's number house: the number on the roof, one floor for each way to make it. */
function NumberHouse({ total, floors, className = '' }: { total: string; floors: [string, string][]; className?: string }) {
  return (
    <span className={`art art-house ${className}`} aria-hidden="true">
      <span className="house-roof">
        <span className="house-total">{A(Number(total))}</span>
      </span>
      <span className="house-body">
        {floors.map(([a, b], n) => (
          <span key={n} className="house-floor" dir="rtl">
            <Cell value={a} />
            <span className="sent-op">+</span>
            <Cell value={b} />
          </span>
        ))}
      </span>
    </span>
  )
}

/** Part-part-whole: two part boxes above, joined to the whole below (the first part on the right). */
function Bond({ whole, a, b, className = '' }: { whole: string; a: string; b: string; className?: string }) {
  return (
    <span className={`art art-bond ${className}`} aria-hidden="true">
      <span className="bond-parts" dir="rtl">
        <Cell value={a} />
        <Cell value={b} />
      </span>
      <svg className="bond-links" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M24 0 50 30 M76 0 50 30" />
      </svg>
      <Cell value={whole} className="bond-whole" />
    </span>
  )
}

/** Circles in a row, coloured from the right: yellow first, then red. */
function PaintRow({ yellow, red, className = '' }: { yellow: number; red: number; className?: string }) {
  return (
    <span className={`art art-paint ${className}`} aria-hidden="true" dir="rtl">
      {Array.from({ length: yellow + red }, (_, n) => (
        <span key={n} className={`paint-dot ${n < yellow ? 'is-yellow' : 'is-red'}`} style={{ animationDelay: `${n * 70}ms` }} />
      ))}
    </span>
  )
}
