import { Art } from '../art/Art'
import { BigButton, PreviewBadge, order } from './ui'

const ORBIT = ['🐙', 'n:3', '🐠', 'clock:3', '⛵', 'n:7', '🐢', 'sym:<']

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen splash">
      <div className="splash-top">
        <PreviewBadge />
      </div>

      <div className="splash-stage">
        <div className="orbit" aria-hidden="true">
          {ORBIT.map((art, index) => {
            const angle = (index / ORBIT.length) * Math.PI * 2
            return (
              <span
                key={art}
                className="orbit-item pop"
                style={order(index, {
                  '--base-delay': '250ms',
                  left: `${50 + Math.cos(angle) * 44}%`,
                  top: `${50 + Math.sin(angle) * 40}%`,
                })}
              >
                <span className="orbit-bob" style={order(index)}>
                  <Art art={art} />
                </span>
              </span>
            )
          })}
        </div>

        <div className="logo logo-in">
          <LetterBlocks />
          <h1 className="logo-word">الرياضيات</h1>
        </div>
      </div>

      <p className="splash-tagline rise" style={order(0, { '--base-delay': '450ms' })}>
        نتدرب معا على اختبار الرياضيات للصف الأول
      </p>

      <div className="rise" style={order(0, { '--base-delay': '700ms' })}>
        <BigButton onClick={onStart} pulse className="start-button">
          <span>هيا نبدأ</span>
          <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 5L6 12l10 7z" />
          </svg>
        </BigButton>
      </div>
    </main>
  )
}

/** Three toy blocks, ١ ٢ ٣: the mark for «الرياضيات». */
export function LetterBlocks({ className = 'blocks-mark' }: { className?: string }) {
  const blocks = [
    { x: 34, y: 30, letter: '١', fill: '#1f7fc4' },
    { x: 4, y: 30, letter: '٢', fill: '#f08a24' },
    { x: 19, y: 2, letter: '٣', fill: '#22a06b' },
  ]
  return (
    <svg className={className} viewBox="0 0 64 60" aria-hidden="true">
      {blocks.map(({ x, y, letter, fill }) => (
        <g key={letter} transform={`translate(${x} ${y})`}>
          <rect x="0" y="0" width="26" height="26" rx="5" fill={fill} stroke="#2b2d55" strokeWidth="2.6" />
          <rect x="3.5" y="3.5" width="19" height="19" rx="3" fill="#fffaf0" />
          <text x="13" y="20.5" textAnchor="middle" fontFamily="'Baloo Bhaijaan 2', sans-serif" fontWeight="800" fontSize="17" fill={fill}>
            {letter}
          </text>
        </g>
      ))}
    </svg>
  )
}
