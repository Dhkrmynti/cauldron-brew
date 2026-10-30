const BATS = [
  { top: '14%', dur: '22s', delay: '-3s', size: 34 },
  { top: '26%', dur: '28s', delay: '-14s', size: 24 },
  { top: '8%', dur: '34s', delay: '-22s', size: 18 },
];

/** A few bats crossing the sky. Purely decorative; still under reduced motion. */
export function Bats({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
      {BATS.map((b, i) => (
        <div key={i} className="bat-path absolute left-0" style={{ top: b.top, ['--dur' as string]: b.dur, animationDelay: b.delay }}>
          <svg viewBox="0 0 40 20" width={b.size} height={b.size / 2} className="bat">
            <path d="M20 8 Q17 3 14 6 Q9 1 2 4 Q7 6 6 10 Q10 8 13 12 Q16 10 20 14 Q24 10 27 12 Q30 8 34 10 Q33 6 38 4 Q31 1 26 6 Q23 3 20 8 Z" fill="#06040a" />
          </svg>
        </div>
      ))}
    </div>
  );
}
