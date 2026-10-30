import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export interface CauldronHandle {
  /** Hex flicks one $BREW coin into the cauldron. */
  toss: () => void;
}

interface CauldronSceneProps {
  /** escrow fill 0..1: the brew glows and steams harder as it rises */
  fill: number;
  /** the bot is running a real cycle right now */
  running?: boolean;
  className?: string;
}

const PAW = { x: 292, y: 262 };
const MOUTH = { x: 420, y: 318 };
const EVERY = 4.2; // seconds between idle tosses while on screen

const BUBBLES = [
  { x: 330, r: 7, d: 0 },
  { x: 372, r: 10, d: 0.7 },
  { x: 418, r: 6, d: 1.4 },
  { x: 455, r: 9, d: 0.35 },
  { x: 496, r: 6, d: 1.9 },
  { x: 520, r: 8, d: 1.1 },
  { x: 395, r: 5, d: 2.2 },
];
const DROPS = 9;

/**
 * The first view: a hill on Halloween night. An iron cauldron over a log fire, a moon,
 * a few crooked graves, two jack-o'-lanterns, and Hex the black cat on the rim.
 * Drawn on an 800 by 560 grid.
 */
export const CauldronScene = forwardRef<CauldronHandle, CauldronSceneProps>(function CauldronScene({ fill, running = false, className }, ref) {
  const root = useRef<SVGSVGElement>(null);
  const busy = useRef(false);
  const tossRef = useRef<() => void>(undefined);

  const { contextSafe } = useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.current) return;
      // Hex blinks now and then
      const eyes = root.current.querySelectorAll('[data-eye]');
      const blink = gsap.timeline({ repeat: -1, repeatDelay: 3.4 });
      blink.to(eyes, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08 }).to(eyes, { scaleY: 1, duration: 0.1 });
      // and tosses on a loop, but only while the scene is on screen
      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 });
      io.observe(root.current);
      const loopId = window.setInterval(() => visible && document.visibilityState === 'visible' && tossRef.current?.(), EVERY * 1000);
      return () => {
        window.clearInterval(loopId);
        io.disconnect();
      };
    },
    { scope: root },
  );

  const toss = contextSafe(() => {
    if (busy.current || !root.current) return;
    const q = gsap.utils.selector(root.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(q('[data-flash]'), { opacity: 0.9 }, { opacity: 0, duration: 0.6 });
      return;
    }
    busy.current = true;
    const landX = MOUTH.x + gsap.utils.random(-50, 60);
    const coin = q('[data-coin]');
    const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });

    // 1. the paw lifts, the coin appears on it
    tl.set(coin, { opacity: 1, x: PAW.x, y: PAW.y, rotate: 0, scale: 1 })
      .to(q('[data-paw]'), { rotate: -38, svgOrigin: '300 296', duration: 0.22, ease: 'power2.out' }, 0)
      .to(q('[data-paw]'), { rotate: 0, svgOrigin: '300 296', duration: 0.4, ease: 'back.out(3)' }, 0.32)
      // 2. the flick: a high arc into the brew, spinning
      .to(coin, { x: landX, duration: 0.85, ease: 'none' }, 0.22)
      .to(coin, { y: 120, duration: 0.42, ease: 'power2.out' }, 0.22)
      .to(coin, { y: MOUTH.y, duration: 0.43, ease: 'power2.in' }, 0.64)
      .to(coin, { rotate: 540, duration: 0.85, ease: 'none' }, 0.22)
      .to(coin, { scale: 0.6, opacity: 0, duration: 0.08 }, 1.05)
      // 3. the splash: a green flash, droplets, a ring
      .set(q('[data-splash]'), { x: landX, y: MOUTH.y }, 1.05)
      .fromTo(q('[data-ring]'), { attr: { rx: 4, ry: 1 }, opacity: 1 }, { attr: { rx: 60, ry: 12 }, opacity: 0, duration: 0.7, ease: 'power2.out' }, 1.05)
      .fromTo(q('[data-flash]'), { opacity: 0.9 }, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 1.05);

    q('[data-drop]').forEach((d, i) => {
      const angle = -Math.PI * (0.15 + (0.7 * i) / (DROPS - 1));
      const dist = gsap.utils.random(40, 90);
      tl.fromTo(
        d,
        { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.6, 1.2) },
        {
          keyframes: { x: [0, Math.cos(angle) * dist * 0.6, Math.cos(angle) * dist], y: [0, Math.sin(angle) * dist, Math.sin(angle) * dist * 0.2 + 18] },
          opacity: 0,
          duration: 0.8,
          ease: 'power1.out',
        },
        1.05,
      );
    });
  });

  tossRef.current = toss;
  useImperativeHandle(ref, () => ({ toss }), [toss]);

  const glow = 0.25 + fill * 0.55;
  const steam = 0.25 + fill * 0.75;

  return (
    <svg ref={root} viewBox="0 0 800 560" className={`${className ?? ''} ${running ? 'running' : ''}`} role="img" aria-label="Hex the black cat sitting on a bubbling cauldron under the moon">
      <defs>
        <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6efd0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f6efd0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="brew-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9cf05a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#9cf05a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fire-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff7518" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff7518" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brew-surface" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c9ff8f" />
          <stop offset="1" stopColor="#5fbf34" />
        </linearGradient>
        <linearGradient id="pot" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0e0b12" />
          <stop offset="0.3" stopColor="#2a2233" />
          <stop offset="0.55" stopColor="#15111a" />
          <stop offset="1" stopColor="#09070c" />
        </linearGradient>
        <clipPath id="mouth-clip">
          <ellipse cx="420" cy="318" rx="146" ry="30" />
        </clipPath>
      </defs>

      {/* the moon */}
      <circle cx="640" cy="118" r="150" fill="url(#moon-glow)" />
      <circle cx="640" cy="118" r="70" fill="#f6efd0" />
      <circle cx="615" cy="100" r="12" fill="#e4dbb5" />
      <circle cx="662" cy="140" r="16" fill="#e4dbb5" />
      <circle cx="668" cy="92" r="7" fill="#e4dbb5" />
      <circle cx="622" cy="150" r="6" fill="#e4dbb5" />

      {/* stars */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 520 + 20} cy={(i * 61) % 200 + 18} r={i % 4 ? 1.3 : 2.2} fill="#f3eadb" opacity={i % 3 ? 0.45 : 0.85} />
      ))}

      {/* the far hill and its tree */}
      <path d="M0 400 Q140 300 300 350 Q460 400 560 330 Q680 260 800 330 V560 H0 Z" fill="#1a1326" />
      <g fill="none" stroke="#120d1a" strokeLinecap="round">
        <path d="M110 360 Q104 300 118 240" strokeWidth="11" />
        <path d="M116 262 Q86 240 66 214 M66 214 Q58 200 62 186 M114 285 Q150 262 166 228 M166 228 Q176 214 194 210 M118 244 Q124 218 112 196" strokeWidth="5" />
        <path d="M78 224 Q70 228 60 222 M150 246 Q160 250 172 246" strokeWidth="3" />
      </g>

      {/* graves on the far hill */}
      <g fill="#241b33" stroke="#33284a" strokeWidth="1.5">
        <path d="M600 332 v-34 a17 17 0 0 1 34 0 v34 z" />
        <path d="M690 314 v-26 a13 13 0 0 1 26 0 v26 z" transform="rotate(6 703 314)" />
        <path d="M200 352 h8 v-30 h-12 v-8 h12 v-10 h8 v10 h12 v8 h-12 v30 z" transform="rotate(-8 210 340)" />
      </g>
      <text x="617" y="322" textAnchor="middle" fontFamily="var(--font-display)" fontSize="12" fill="#4a3d60">RIP</text>

      {/* the near hill */}
      <path d="M0 470 Q200 420 400 440 Q620 460 800 420 V560 H0 Z" fill="#110c18" />

      {/* firelight on the ground */}
      <ellipse cx="420" cy="500" rx="260" ry="60" fill="url(#fire-glow)" />
      {/* the brew's light */}
      <ellipse cx="420" cy="300" rx="260" ry="150" fill="url(#brew-glow)" opacity={glow} />

      {/* steam */}
      <g opacity={steam} fill="#cfe9c0">
        {[0, 1.6, 3.2].map((d, i) => (
          <ellipse key={i} className="steam" style={{ animationDelay: `${d}s`, transformBox: 'fill-box', transformOrigin: '50% 100%' }} cx={370 + i * 50} cy={280} rx="26" ry="14" opacity="0" />
        ))}
      </g>

      {/* the fire and logs */}
      <g>
        <path className="flicker" d="M352 470 Q360 420 384 404 Q380 432 398 446 Q404 410 430 390 Q426 428 448 440 Q460 418 478 410 Q472 448 490 470 Z" fill="#ff7518" />
        <path className="flicker-b" d="M378 470 Q386 440 402 430 Q402 450 418 456 Q426 432 440 420 Q440 448 458 456 Q466 446 472 470 Z" fill="#ffb347" />
        <path className="flicker" d="M404 470 Q412 452 424 446 Q426 458 438 462 Q442 456 448 470 Z" fill="#fff1c2" />
        <rect x="330" y="466" width="190" height="18" rx="9" fill="#3a2418" transform="rotate(-6 425 475)" />
        <rect x="330" y="466" width="190" height="18" rx="9" fill="#2c1b12" transform="rotate(7 425 475)" />
        <circle cx="338" cy="486" r="7" fill="#5a3a26" />
        <circle cx="512" cy="486" r="7" fill="#5a3a26" />
      </g>

      {/* embers off the fire */}
      <g fill="#ffb347">
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} className="ember" style={{ animationDelay: `${(i * 0.37) % 3.2}s`, ['--dx' as string]: `${((i * 23) % 40) - 20}px` }} cx={372 + ((i * 29) % 96)} cy={430} r={i % 3 ? 1.6 : 2.4} />
        ))}
      </g>

      {/* the cauldron */}
      <g>
        <path d="M300 440 L284 474 M540 440 L556 474" stroke="#0e0b12" strokeWidth="12" strokeLinecap="round" />
        <path d="M268 322 Q262 410 330 446 Q420 486 510 446 Q578 410 572 322 Z" fill="url(#pot)" />
        <path d="M296 352 Q298 404 340 430" stroke="#3d3150" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* the brew */}
        <ellipse cx="420" cy="318" rx="146" ry="30" fill="url(#brew-surface)" />
        <g clipPath="url(#mouth-clip)">
          <ellipse data-flash cx="420" cy="318" rx="146" ry="30" fill="#f2ffd9" opacity="0" />
          {BUBBLES.map((b) => (
            <circle key={b.x} className="bubble" style={{ animationDelay: `${b.d}s` }} cx={b.x} cy={322} r={b.r} fill="#d6ffb0" stroke="#5fbf34" strokeWidth="1.5" />
          ))}
        </g>
        {/* the rim */}
        <ellipse cx="420" cy="318" rx="152" ry="33" fill="none" stroke="#2a2233" strokeWidth="12" />
        <ellipse cx="420" cy="314" rx="152" ry="32" fill="none" stroke="#4a3d60" strokeWidth="2" opacity="0.7" />
        {/* the label rune */}
        <text x="420" y="410" textAnchor="middle" fontFamily="var(--font-display)" fontSize="34" fontWeight="700" fill="#2f2540">dEaD</text>
      </g>

      {/* Hex, the black cat, on the rim */}
      <g>
        <path className="tail" d="M246 316 Q206 312 204 270 Q202 236 226 226" stroke="#0a070d" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M232 320 Q226 266 262 244 Q300 228 318 262 Q330 290 318 322 Z" fill="#0a070d" />
        <g data-paw>
          <path d="M300 296 Q296 274 292 262" stroke="#0a070d" strokeWidth="13" strokeLinecap="round" fill="none" />
        </g>
        <path d="M254 238 L250 196 L270 214 Q282 210 294 214 L314 196 L310 238 Q300 256 282 256 Q262 256 254 238 Z" fill="#0a070d" />
        <path d="M256 204 L266 214 M308 204 L298 214" stroke="#33284a" strokeWidth="2" strokeLinecap="round" />
        <g data-eye>
          <ellipse cx="270" cy="230" rx="7" ry="6" fill="#ff7518" />
          <rect x="268.6" y="225" width="2.8" height="10" rx="1.4" fill="#1a0d05" />
        </g>
        <g data-eye>
          <ellipse cx="294" cy="230" rx="7" ry="6" fill="#ff7518" />
          <rect x="292.6" y="225" width="2.8" height="10" rx="1.4" fill="#1a0d05" />
        </g>
        <path d="M279 241 l3 3 l3 -3" stroke="#33284a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M262 242 l-18 -3 M262 246 l-18 3 M302 242 l18 -3 M302 246 l18 3" stroke="#33284a" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* the jack-o'-lanterns */}
      {[
        { x: 180, s: 1 },
        { x: 640, s: 0.8 },
      ].map(({ x, s }) => (
        <g key={x} transform={`translate(${x} ${484 - 40 * s}) scale(${s})`}>
          <path d="M-4 -34 Q0 -46 10 -48" stroke="#3f6b2a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="-24" cy="0" rx="30" ry="34" fill="#d4520a" />
          <ellipse cx="24" cy="0" rx="30" ry="34" fill="#d4520a" />
          <ellipse cx="0" cy="0" rx="32" ry="38" fill="#ff7518" />
          <path d="M-8 -36 Q-14 0 -8 36 M8 -36 Q14 0 8 36" stroke="#d4520a" strokeWidth="2" fill="none" />
          <g className="flicker" fill="#ffe08a">
            <path d="M-30 -10 L-16 -22 L-10 -6 Z" />
            <path d="M30 -10 L16 -22 L10 -6 Z" />
            <path d="M-34 8 Q0 34 34 8 L24 12 L18 6 L10 14 L0 6 L-10 14 L-18 6 L-24 12 Z" />
          </g>
        </g>
      ))}

      {/* what Hex throws */}
      <g data-coin opacity="0">
        <circle r="13" fill="#ffb347" stroke="#c76a10" strokeWidth="3" />
        <text y="5.5" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="16" fill="#7a3a06">B</text>
      </g>
      <g data-splash>
        <ellipse data-ring rx="4" ry="1" fill="none" stroke="#e4ffc8" strokeWidth="3" opacity="0" />
        {Array.from({ length: DROPS }, (_, i) => (
          <circle key={i} data-drop r={i % 3 ? 4 : 6} fill={i % 2 ? '#9cf05a' : '#d6ffb0'} opacity="0" />
        ))}
      </g>
    </svg>
  );
});
