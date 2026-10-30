interface BrewFlaskProps {
  escrow: number;
  threshold: number;
  fill: number;
  nextCycle: 'burn' | 'keep';
  live: boolean;
  running: boolean;
}

/**
 * The fee escrow as a potion flask. Every trade pours a drop in; when it is full,
 * Hex pours it into the cauldron (trick: burn) or into the treat bag (treat: keep).
 */
export function BrewFlask({ escrow, threshold, fill, nextCycle, live, running }: BrewFlaskProps) {
  const trick = nextCycle === 'burn';
  const pct = Math.round(fill * 100);
  // the liquid lives in the flask body, y 40..112 of the drawing
  const level = 112 - 72 * fill;
  const liquid = trick ? '#9cf05a' : '#c88bff';
  const status = !live
    ? 'waiting for the contract address'
    : running
      ? trick
        ? 'pouring: into the cauldron now'
        : 'pouring: into the treat bag now'
      : fill >= 0.85
        ? 'almost at a boil'
        : 'every trade adds a drop';

  return (
    <div className="slab flex items-stretch gap-5 p-5 sm:p-6">
      <svg viewBox="0 0 80 120" className="h-36 w-24 shrink-0" role="meter" aria-label="Fee escrow toward the next run" aria-valuemin={0} aria-valuemax={threshold || 1} aria-valuenow={escrow}>
        <defs>
          <clipPath id="flask-clip">
            <path d="M30 6 H50 V38 Q76 52 74 84 Q72 114 40 114 Q8 114 6 84 Q4 52 30 38 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#flask-clip)">
          <rect x="0" y="0" width="80" height="120" fill="#120d1a" />
          <g style={{ transform: `translateY(${level}px)`, transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1)' }}>
            <rect x="0" y="0" width="80" height="120" fill={liquid} />
            <rect x="0" y="0" width="80" height="4" fill="#ffffff" opacity="0.35" />
          </g>
          {fill > 0.05 ? (
            <>
              <circle className="bubble" cx="28" cy="104" r="3" fill="#ffffff" opacity="0.5" />
              <circle className="bubble" style={{ animationDelay: '1.1s' }} cx="50" cy="100" r="2.4" fill="#ffffff" opacity="0.5" />
            </>
          ) : null}
        </g>
        <path d="M30 6 H50 V38 Q76 52 74 84 Q72 114 40 114 Q8 114 6 84 Q4 52 30 38 Z" fill="none" stroke="#a99cb8" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="26" y="2" width="28" height="7" rx="3" fill="#6e5640" />
        <path d="M16 70 Q14 90 26 102" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <span className="label text-bone-dim">fee escrow</span>
          <span className={`tabular font-mono text-[0.85rem] ${trick ? 'text-brew' : 'text-treat'}`}>{pct}%</span>
        </div>
        <div className="mt-1 tabular font-mono text-[1.35rem] text-bone">
          {escrow.toFixed(4)} <span className="text-[0.9rem] text-bone-dim">/ {threshold ? threshold.toFixed(2) : '—'} ETH</span>
        </div>
        <p className={`m-0 mt-2 flex items-center gap-2 text-[0.9rem] ${running ? 'text-pumpkin-hot' : 'text-bone-dim'}`} aria-live="polite">
          <span className={`h-2 w-2 shrink-0 rounded-full ${!live ? 'bg-panel-line' : running ? 'bg-pumpkin shadow-[0_0_10px_2px_rgba(255,117,24,0.6)]' : 'bg-brew shadow-[0_0_8px_1px_rgba(156,240,90,0.5)]'}`} />
          {status}
        </p>
        <div className="mt-auto border-t border-panel-line pt-3 max-sm:mt-3">
          <span className="label text-bone-dim">next run</span>
          <p className="m-0 mt-1 text-[0.98rem] leading-snug text-bone">
            {trick ? (
              <>
                <b className="font-semibold text-brew">Trick:</b> buy $BREW and throw it in the cauldron
              </>
            ) : (
              <>
                <b className="font-semibold text-treat">Treat:</b> the fees go in the treat bag
              </>
            )}
            <span className="block text-[0.82rem] text-bone-dim">{trick ? 'odd runs burn, at 0.01 ETH' : 'even runs keep, at 0.02 ETH'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
