import { ScrollText } from 'lucide-react';
import type { FlywheelState, MachineConfig } from '../../types';

interface HexWatchProps {
  state: FlywheelState;
  config: MachineConfig;
  live: boolean;
  onOpenLog: () => void;
}

const PHASE: Record<string, string> = {
  accumulate: 'waiting for the flask to fill',
  claim: 'claiming the escrow',
  buyback: 'buying $BREW',
  burn: 'throwing it in the cauldron',
  keep: 'filling the treat bag',
};

/** Hex's watch: what the bot is doing right now, read from the engine. */
export function HexWatch({ state, config, live, onOpenLog }: HexWatchProps) {
  const running = state.isWheelSpinning;
  const doing = !live ? 'asleep until the contract address is set' : running ? PHASE[state.currentPhase] ?? 'working' : 'watching the flask';
  const rows = [
    { k: 'runs done', v: String(state.cycleCount || 0) },
    { k: 'next run', v: state.nextCycleType === 'keep' ? 'treat · 0.02 ETH' : 'trick · 0.01 ETH' },
    { k: 'buys on', v: state.swapRouter === 'uniswap' || state.isTokenMigrated ? 'Uniswap v4' : 'Pons curve' },
    { k: 'ETH claimed', v: `${(state.totalFeesClaimedETH || 0).toFixed(4)} ETH` },
    { k: 'ETH to treats', v: `${(state.totalFeesRetainedETH || 0).toFixed(4)} ETH` },
    { k: 'the cauldron', v: `${config.deadAddress.slice(0, 6)}…${config.deadAddress.slice(-4)}` },
  ];

  return (
    <section id="hex" aria-labelledby="hex-title" className="relative px-4 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <p className="m-0 label text-pumpkin">the bot</p>
          <h2 id="hex-title" className="m-0 mt-3 display text-[clamp(2.8rem,6vw,5.2rem)] text-bone">
            Hex keeps watch
          </h2>
          <p className="m-0 mt-5 max-w-[46ch] text-[1.08rem] leading-relaxed text-bone-dim">
            Hex is the bot: a black cat who never leaves the rim. It checks the fee escrow around the clock, claims it when the flask is full, and runs the ritual on its own. Every move it makes lands on chain.
          </p>
        </div>

        <div className="stone px-6 pb-7 pt-16 sm:px-12 sm:pb-9 sm:pt-20">
          {/* the cat's eyes in the dark, wide when it works */}
          <svg viewBox="0 0 120 40" className="mx-auto block h-10 w-32" aria-hidden="true">
            <path d="M18 22 L14 2 L30 12 Q60 4 90 12 L106 2 L102 22" fill="#0a070d" />
            {[38, 82].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="26" rx="11" ry={running ? 10 : 6} fill={live ? '#ff7518' : '#4a3d60'} style={{ transition: 'ry 0.4s' }} />
                <rect x={cx - 1.6} y="18" width="3.2" height="16" rx="1.6" fill="#1a0d05" />
              </g>
            ))}
          </svg>
          <div className="mt-5 text-center">
            <div className="label text-bone-dim">right now</div>
            <div className={`mt-1 display text-[clamp(1.7rem,2.6vw,2.3rem)] ${running ? 'text-pumpkin' : 'text-bone'}`} aria-live="polite">
              {doing}
            </div>
            {state.lastActionText ? <div className="mx-auto mt-1 max-w-[40ch] truncate font-mono text-[0.78rem] text-bone-dim">{state.lastActionText}</div> : null}
          </div>
          <dl className="m-0 mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-panel-line pt-6 sm:grid-cols-3">
            {rows.map((r) => (
              <div key={r.k}>
                <dt className="label text-[0.64rem] text-bone-dim">{r.k}</dt>
                <dd className="m-0 mt-1 font-mono text-[0.95rem] tabular text-bone">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex justify-center">
            <button type="button" onClick={onOpenLog} className="btn-ghost cursor-pointer px-5 py-2.5 text-[0.76rem]">
              <ScrollText className="h-4 w-4" />
              open the full grimoire
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
