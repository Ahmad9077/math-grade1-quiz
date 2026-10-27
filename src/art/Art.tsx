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
function Group({ object, count, className = '' }: { object: string; count: number; className?: string }) {
  if (count === 0) {
    return (
      <span className={`art art-group is-empty ${className}`} aria-hidden="true">
        <span className="empty-set" />
      </span>
    )
  }
  const columns = count <= 5 ? count : count <= 10 ? Math.ceil(count / 2) : Math.ceil(count / 3)
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
