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

export function RitualSequence({ tokenSymbol, escrow, threshold, fill, claimedETH, routerName, nextCycle }: RitualSequenceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
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

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-step]', rootRef.current).forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => self.isActive && setStep(i) });
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="ritual" aria-labelledby="ritual-title" className="relative px-4 pb-24 pt-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[84rem]">
        <p className="m-0 label text-pumpkin">the ritual</p>
        <h2 id="ritual-title" className="m-0 mt-3 max-w-[16ch] display text-[clamp(2.8rem,6vw,5.2rem)] text-bone">
          One run, from fee to cauldron
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* the stage: sticky on every size */}
          <div className="sticky top-[4.5rem] z-10 mx-auto aspect-[4/3] w-full max-w-[22rem] self-start overflow-hidden rounded-[18px] border border-panel-line shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),0_0_0_6px_rgba(12,9,16,0.9)] sm:top-24 sm:max-w-[30rem] lg:order-2 lg:top-[calc(50svh-min(19rem,30vw))] lg:max-w-none">
            <Stage step={step} trick={trick} />
            <p className="absolute left-4 top-3 m-0 flex items-baseline gap-2 text-bone" aria-hidden="true">
              <span className="tabular font-mono text-[0.72rem] text-pumpkin">{String(step + 1).padStart(2, '0')}</span>
              <span className="label text-[0.62rem]">{steps[step].name}</span>
            </p>
            <ol className="absolute bottom-3 left-4 m-0 flex list-none gap-1.5 p-0" aria-hidden="true">
              {steps.map((s, i) => (
                <li key={s.name} className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${i <= step ? 'bg-pumpkin' : 'bg-panel-line'}`} />
              ))}
            </ol>
          </div>

          <ol className="m-0 list-none p-0 lg:order-1">
            {steps.map((s, i) => (
              <li key={s.name} data-step className={`flex min-h-[56svh] flex-col justify-center pt-24 transition-opacity duration-500 sm:pt-0 lg:min-h-[78svh] ${i === step ? 'opacity-100' : 'opacity-35'}`}>
                <span className="tabular font-mono text-[0.9rem] text-pumpkin" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')} / 05
                </span>
                <h3 className="m-0 mt-2 display text-[clamp(2rem,3.2vw,2.8rem)] text-bone">{s.name}</h3>
                <p className="m-0 mt-4 max-w-[44ch] text-[1.08rem] leading-relaxed text-bone/90">{s.body}</p>
                <div className="mt-5 inline-flex flex-wrap items-baseline gap-3 self-start border-t border-panel-line pt-3">
                  <span className="label text-bone-dim">{s.readingLabel}</span>
                  <span className={`tabular font-mono text-[1rem] ${i === 4 ? (trick ? 'text-brew' : 'text-treat') : 'text-bone'}`}>{s.reading}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
