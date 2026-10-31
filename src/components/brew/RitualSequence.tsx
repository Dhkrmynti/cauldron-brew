import { useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface RitualSequenceProps {
  tokenSymbol: string;
  escrow: number;
  threshold: number;
  fill: number;
  claimedETH: number;
  routerName: string;
  nextCycle: 'burn' | 'keep';
}

interface Step {
  name: string;
  body: ReactNode;
  readingLabel: string;
  reading: string;
}

/** Shows a group only from one step (and, optionally, until another). */
const at = (step: number, from: number, until = 99) =>
  ({ opacity: step >= from && step <= until ? 1 : 0, transition: 'opacity 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1)' }) as const;

const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const FLASK = 'M-10 -84 H10 V-62 Q34 -50 32 -22 Q30 2 0 2 Q-30 2 -32 -22 Q-34 -50 -10 -62 Z';

/**
 * The stage: one run of the ritual on the same hill as the first view, drawn on a 400 by 300 grid.
 * The flask sits on a shelf at the left, the cauldron bubbles over its fire at the right, Hex sits between.
 */
function Stage({ step, trick }: { step: number; trick: boolean }) {
  const level = step === 0 ? 0.35 : step === 1 ? 1 : 0;
  const ink = trick ? '#9cf05a' : '#c88bff';
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label={`Step ${step + 1} of the ritual`}>
      <defs>
        <linearGradient id="st-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#24173a" />
          <stop offset="1" stopColor="#120d1a" />
        </linearGradient>
        <radialGradient id="st-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9cf05a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#9cf05a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="st-fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff7518" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff7518" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="st-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6efd0" stopOpacity="0.3" />
          <stop offset="1" stopColor="#f6efd0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="st-flask">
          <path d={FLASK} />
        </clipPath>
      </defs>

      {/* sky, moon, stars, hills */}
      <rect width="400" height="300" fill="url(#st-sky)" />
      <circle cx="338" cy="56" r="60" fill="url(#st-moon)" />
      <circle cx="338" cy="56" r="24" fill="#f6efd0" />
      <circle cx="330" cy="50" r="4.5" fill="#e4dbb5" />
      <circle cx="346" cy="64" r="6" fill="#e4dbb5" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={(i * 67) % 260 + 40} cy={(i * 41) % 100 + 30} r={i % 4 ? 0.9 : 1.5} fill="#f3eadb" opacity={i % 3 ? 0.4 : 0.8} />
      ))}
      <path d="M0 214 Q90 178 180 200 Q280 222 400 186 V300 H0 Z" fill="#1a1326" />
      <path d="M302 200 v-16 a8 8 0 0 1 16 0 v16 z" fill="#241b33" />
      <path d="M0 250 Q120 232 220 240 Q320 248 400 236 V300 H0 Z" fill="#0c0910" />

      {/* firelight and brew light */}
      <ellipse cx="290" cy="262" rx="110" ry="30" fill="url(#st-fire)" />
      <ellipse cx="290" cy="196" rx="110" ry="60" fill="url(#st-glow)" style={{ opacity: step >= 2 ? 1 : 0.5, transition: 'opacity 0.6s' }} />

      {/* the shelf */}
      <rect x="44" y="208" width="128" height="7" rx="2" fill="#3a2418" />
      <path d="M58 215 V246 M158 215 V246" stroke="#2c1b12" strokeWidth="6" strokeLinecap="round" />

      {/* I. trades drip coins into the flask */}
      <g style={at(step, 0, 0)}>
        {[0, 1, 2].map((i) => (
          <circle key={i} className="coin-drop" style={{ animationDelay: `${i * 0.6}s` }} cx={108} cy={100} r="7" fill="#ffb347" stroke="#c76a10" strokeWidth="2" />
        ))}
        <text x="96" y="96" textAnchor="end" fontSize="9" fontWeight="700" letterSpacing="2" fill="#a99cb8">EVERY TRADE</text>
      </g>

      {/* the flask: fills on I and II, flies over the cauldron and tips on III */}
      <g style={{ transform: step === 2 ? 'translate(197px,120px) rotate(125deg)' : 'translate(108px,208px)', transition: `transform 0.9s ${EASE}, opacity 0.5s`, opacity: step >= 3 ? 0 : 1 }}>
        <g clipPath="url(#st-flask)">
          <rect x="-40" y="-90" width="80" height="96" fill="#1b1424" />
          <rect x="-40" y="0" width="80" height="80" fill={ink} style={{ transform: `translateY(${2 - 64 * level}px)`, transition: `transform 0.9s ${EASE}` }} />
          <circle className="bubble" cx="-10" cy="-8" r="3" fill="#ffffff" opacity={level > 0.5 ? 0.5 : 0} />
          <circle className="bubble" style={{ animationDelay: '0.9s' }} cx="12" cy="-12" r="2.4" fill="#ffffff" opacity={level > 0.5 ? 0.5 : 0} />
        </g>
        <path d={FLASK} fill="none" stroke="#a99cb8" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-22 -34 Q-24 -16 -14 -6" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="-13" y="-90" width="26" height="7" rx="3" fill="#6e5640" style={{ opacity: step === 2 ? 0 : 1, transition: 'opacity 0.3s' }} />
      </g>
      <text x="108" y="232" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill="#a99cb8" style={at(step, 0, 1)}>
        FEE ESCROW
      </text>
      <text x="150" y="128" fontFamily="var(--font-hand)" fontSize="22" fill={ink} style={{ ...at(step, 1, 1), transform: 'rotate(-6deg)', transformOrigin: '150px 128px' }}>
        full!
      </text>

      {/* III. the pour */}
      <path d="M268 168 Q273 182 276 196" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" style={at(step, 2, 2)} />

      {/* IV. the buy: ETH becomes $BREW above the pot */}
      <g style={{ ...at(step, 3, 3), transform: step === 3 ? 'none' : 'translateY(10px)' }}>
        <circle cx="212" cy="112" r="14" fill="#a99cb8" />
        <text x="212" y="117" textAnchor="middle" fontSize="14" fontWeight="700" fill="#120d1a">Ξ</text>
        <path d="M232 112 H262 M254 105 L263 112 L254 119" stroke="#ff7518" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={284 + i * 12} cy={114 - i * 6} r="11" fill="#ffb347" stroke="#c76a10" strokeWidth="2.2" />
        ))}
        <text x="298" y="146" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2" fill="#ffb347">$BREW</text>
      </g>

      {/* V. the fork: coins fall in on a trick; the treat bag fills on a treat */}
      <g style={at(step, 4)}>
        {[0, 1, 2].map((i) => (
          <circle key={i} className="coin-drop" style={{ animationDelay: `${i * 0.5}s` }} cx={trick ? 270 + i * 14 : 96 + i * 12} cy={trick ? 172 : 170} r="7" fill="#ffb347" stroke="#c76a10" strokeWidth="2" />
        ))}
      </g>
      <g style={{ ...at(step, 4), transform: step === 4 ? 'none' : 'translateY(14px)' }}>
        <g opacity={trick ? 0.45 : 1}>
          <path d="M80 206 Q74 176 82 166 Q96 158 108 162 Q120 158 134 166 Q142 176 136 206 Z" fill="#6b2fa8" stroke="#c88bff" strokeWidth="2" />
          <path d="M88 168 Q108 176 128 168" stroke="#c88bff" strokeWidth="1.8" fill="none" />
          <path d="M96 186 l4 -5 l4 5 m8 0 l4 -5 l4 5 M98 196 Q108 202 118 196" stroke="#ffe08a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
        <text x="108" y="232" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1.5" fill="#c88bff" opacity={trick ? 0.5 : 1}>
          TREAT · WALLET
        </text>
        <text x="290" y="292" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1.5" fill="#9cf05a" opacity={trick ? 1 : 0.5}>
          TRICK · 0x…dEaD
        </text>
      </g>

      {/* the fire and the cauldron, always there */}
      <g>
        <path className="flicker" d="M252 276 Q258 252 270 244 Q268 258 278 264 Q282 246 296 236 Q294 256 306 262 Q312 250 322 246 Q318 264 328 276 Z" fill="#ff7518" />
        <path className="flicker-b" d="M266 276 Q272 260 280 256 Q280 266 290 268 Q294 256 302 250 Q302 264 312 268 Q316 262 318 276 Z" fill="#ffb347" />
        <rect x="236" y="272" width="108" height="9" rx="4.5" fill="#3a2418" transform="rotate(-5 290 276)" />
        <rect x="236" y="272" width="108" height="9" rx="4.5" fill="#2c1b12" transform="rotate(6 290 276)" />
        <path d="M244 250 L236 268 M336 250 L344 268" stroke="#0e0b12" strokeWidth="6" strokeLinecap="round" />
        <path d="M224 198 Q220 240 254 256 Q290 270 326 256 Q360 240 356 198 Z" fill="#15111a" />
        <path d="M238 214 Q238 238 258 250" stroke="#3d3150" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="290" cy="198" rx="64" ry="12" fill={step === 4 && !trick ? '#4a3d60' : '#9cf05a'} style={{ transition: 'fill 0.5s' }} />
        <circle className="bubble" cx="268" cy="200" r="4" fill="#d6ffb0" />
        <circle className="bubble" style={{ animationDelay: '0.8s' }} cx="302" cy="200" r="5" fill="#d6ffb0" />
        <circle className="bubble" style={{ animationDelay: '1.6s' }} cx="322" cy="200" r="3" fill="#d6ffb0" />
        <ellipse cx="290" cy="198" rx="67" ry="13.5" fill="none" stroke="#2a2233" strokeWidth="5" />
      </g>

      {/* Hex, between the shelf and the pot, watching */}
      <g transform="translate(196 250)">
        <path className="tail" d="M-12 -2 Q-34 -2 -34 -22 Q-34 -36 -24 -40" stroke="#0a070d" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M-16 0 Q-20 -30 -2 -40 Q16 -46 22 -28 Q26 -12 20 0 Z" fill="#0a070d" />
        <path d="M-6 -40 L-8 -60 L2 -52 Q8 -54 14 -52 L24 -60 L22 -40 Q16 -32 8 -32 Q-2 -32 -6 -40 Z" fill="#0a070d" />
        <ellipse cx="3" cy="-45" rx="3.4" ry={step === 2 ? 3.4 : 2.6} fill="#ff7518" />
        <ellipse cx="15" cy="-45" rx="3.4" ry={step === 2 ? 3.4 : 2.6} fill="#ff7518" />
        <rect x="2.3" y="-48" width="1.4" height="6" rx="0.7" fill="#1a0d05" />
        <rect x="14.3" y="-48" width="1.4" height="6" rx="0.7" fill="#1a0d05" />
        <text x="-48" y="-66" fontFamily="var(--font-hand)" fontSize="18" fill="#ffb347" style={at(step, 2, 2)}>
          mine now.
        </text>
      </g>
    </svg>
  );
}


const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const pad = (i: number) => String(i + 1).padStart(2, '0');

interface LayoutProps {
  steps: Step[];
  trick: boolean;
}

function Reading({ s, i, trick }: { s: Step; i: number; trick: boolean }) {
  return (
    <div className="inline-flex flex-wrap items-baseline gap-3 self-start border-t border-panel-line pt-3">
      <span className="label text-bone-dim">{s.readingLabel}</span>
      <span className={`tabular font-mono text-[1rem] ${i === 4 ? (trick ? 'text-brew' : 'text-treat') : 'text-bone'}`}>{s.reading}</span>
    </div>
  );
}

/** Five tarot cards, I to V, one per step of a run. They turn over one by one as the row scrolls into view. */
function TarotLayout({ steps, trick }: LayoutProps) {
  const ref = useRef<HTMLOListElement>(null);
  const [turned, setTurned] = useState(0);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTurned(5);
        return;
      }
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 85%',
        end: 'center 45%',
        onUpdate: (self) => setTurned((prev) => Math.max(prev, Math.min(5, Math.ceil(self.progress * 5.2)))),
        onLeave: () => setTurned(5),
      });
    },
    { scope: ref },
  );

  const tilt = ['lg:-rotate-[5deg] lg:translate-y-8', 'lg:-rotate-[2.5deg] lg:translate-y-2', '', 'lg:rotate-[2.5deg] lg:translate-y-2', 'lg:rotate-[5deg] lg:translate-y-8'];

  return (
    <ol ref={ref} className="m-0 mt-14 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto p-0 pb-10 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-16">
      {steps.map((s, i) => {
        const up = i < turned;
        return (
          <li key={s.name} className={`w-[80%] shrink-0 snap-center [perspective:1400px] sm:w-[46%] lg:w-auto ${tilt[i]} transition-transform duration-500 hover:z-10 lg:hover:-translate-y-3 lg:hover:rotate-0`}>
            <div className="relative h-full min-h-[34rem] transition-transform duration-[900ms] [transform-style:preserve-3d]" style={{ transform: up ? 'rotateY(0deg)' : 'rotateY(180deg)', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)', transitionDelay: `${(i % 5) * 60}ms` }}>
              {/* the face */}
              <div className="absolute inset-0 flex flex-col rounded-[16px] border border-[#6b5228] bg-[linear-gradient(180deg,#1f172b,#140f1b)] p-3 shadow-[0_30px_50px_-24px_rgba(0,0,0,0.95),inset_0_0_0_4px_#140f1b,inset_0_0_0_5px_rgba(255,179,71,0.35)] [backface-visibility:hidden]">
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="font-[Georgia,serif] text-[1.35rem] font-bold leading-none tracking-wider text-pumpkin-hot">{ROMAN[i]}</span>
                  <span className="label text-[0.58rem] text-bone-dim">{pad(i)} / 05</span>
                </div>
                <div className="mt-2 aspect-[4/3] overflow-hidden rounded-[10px] border border-panel-line">
                  <Stage step={i} trick={trick} />
                </div>
                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <h3 className="m-0 display text-[1.65rem] leading-[1] text-bone">{s.name}</h3>
                  <p className="m-0 mt-3 text-[0.9rem] leading-relaxed text-bone/80">{s.body}</p>
                  <div className="mt-auto pt-4">
                    <Reading s={s} i={i} trick={trick} />
                  </div>
                </div>
              </div>
              {/* the back */}
              <div className="absolute inset-0 flex items-center justify-center rounded-[16px] border border-[#6b5228] bg-[radial-gradient(circle_at_50%_45%,#3a1f5c,#1a1026_70%)] shadow-[0_30px_50px_-24px_rgba(0,0,0,0.95),inset_0_0_0_6px_#1a1026,inset_0_0_0_7px_rgba(255,179,71,0.4)] [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden="true">
                <svg viewBox="0 0 120 180" className="h-[70%] w-[70%]">
                  <circle cx="60" cy="90" r="44" fill="none" stroke="#ffb347" strokeOpacity="0.45" strokeWidth="1.2" />
                  <circle cx="60" cy="90" r="36" fill="none" stroke="#ffb347" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 4" />
                  <path d="M60 46 L86 126 L18 76 H102 L34 126 Z" fill="none" stroke="#ffb347" strokeOpacity="0.3" strokeWidth="1" />
                  <ellipse cx="48" cy="88" rx="7" ry="6" fill="#ff7518" />
                  <ellipse cx="72" cy="88" rx="7" ry="6" fill="#ff7518" />
                  <rect x="46.8" y="83" width="2.4" height="10" rx="1.2" fill="#1a0d05" />
                  <rect x="70.8" y="83" width="2.4" height="10" rx="1.2" fill="#1a0d05" />
                  <text x="60" y="166" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="16" fill="#ffb347" opacity="0.8">{ROMAN[i]}</text>
                  <text x="60" y="26" textAnchor="middle" fontFamily="var(--font-display)" fontSize="13" fill="#ffb347" opacity="0.6">Cauldron</text>
                </svg>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RitualSequence({ tokenSymbol, escrow, threshold, fill, claimedETH, routerName, nextCycle }: RitualSequenceProps) {
  const trick = nextCycle === 'burn';

  const steps: Step[] = [
    {
      name: 'Trades drip in',
      body: <>Every {tokenSymbol} buy and sell pays a creator fee in ETH. It drips into the Pons fee escrow, our flask on the shelf.</>,
      readingLabel: 'in the flask now',
      reading: `${escrow.toFixed(4)} ETH`,
    },
    {
      name: 'The flask fills',
      body: <>It fills up to the size of the next run: 0.01 ETH on a trick, 0.02 ETH on a treat. Full flask, the ritual starts.</>,
      readingLabel: 'flask filled',
      reading: `${Math.round(fill * 100)}% of ${threshold ? threshold.toFixed(2) : '—'} ETH`,
    },
    {
      name: 'Hex claims it',
      body: <>Hex, the bot, claims everything in the escrow on its own. It never sleeps; cats on Halloween don’t.</>,
      readingLabel: 'ETH claimed so far',
      reading: `${claimedETH.toFixed(4)} ETH`,
    },
    {
      name: `It buys ${tokenSymbol}`,
      body: <>On a trick the claimed ETH market-buys {tokenSymbol} on {routerName}. Real buying, every run.</>,
      readingLabel: 'buying on',
      reading: routerName.replace(/^the /, ''),
    },
    {
      name: 'Trick or treat',
      body: (
        <>
          Runs take turns. <strong className="font-semibold text-brew">Odd runs are tricks: every coin bought goes in the cauldron</strong>, which is 0x…dEaD, and nothing climbs back out.{' '}
          <strong className="font-semibold text-treat">Even runs are treats: the fees go in the treat bag</strong>, the project wallet that keeps the fire lit.
        </>
      ),
      readingLabel: 'next run',
      reading: trick ? 'trick · into the cauldron' : 'treat · into the bag',
    },
  ];

  return (
    <section id="ritual" aria-labelledby="ritual-title" className="relative px-4 pb-24 pt-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[84rem]">
        <p className="m-0 label text-pumpkin">the ritual</p>
        <h2 id="ritual-title" className="m-0 mt-3 max-w-[16ch] display text-[clamp(2.8rem,6vw,5.2rem)] text-bone">
          One run, from fee to cauldron
        </h2>

        <TarotLayout steps={steps} trick={trick} />
      </div>
    </section>
  );
}
