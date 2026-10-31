import { useState, useEffect, useRef } from 'react';
import { useFlywheelEngine } from './hooks/useBurnEngine';
import { PONS_V2_CONFIG } from './contracts';
import { sounds } from './utils/audio';
import { Volume2, VolumeX, Copy, Check, ArrowUpRight, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BurnLedgerDrawer } from './components/BurnLedgerDrawer';
import { MemexAdmin } from './components/MemexAdmin';
import { BrewMark } from './components/brew/BrewMark';
import { LiveNumber } from './components/brew/LiveNumber';
import { CauldronScene, type CauldronHandle } from './components/brew/CauldronScene';
import { BrewFlask } from './components/brew/BrewFlask';
import { RitualSequence } from './components/brew/RitualSequence';
import { Grimoire } from './components/brew/Grimoire';
import { HexWatch } from './components/brew/HexWatch';
import { Bats } from './components/brew/Bats';
import { WalletButton } from './components/brew/WalletButton';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** What Hex says when a coin goes in. */
const HEX_SAYS = [
  'mrrp. in it goes.',
  'bubble bubble.',
  'odd runs: trick. even runs: treat.',
  'keep trading, mortal.',
  'nothing climbs back out.',
  'purrr.',
  'the pot is always hungry.',
  'happy halloween.',
];

/** X account for the project: empty until there is one. */
const X_URL = '';
const EXPLORER_URL = 'https://explorer.mainnet.chain.robinhood.com';
/** Where to trade and where to watch, once the CA is known. */
const buyUrl = (ca: string) => (ca ? `https://ponsfamily.com/launchpad/${ca}` : EXPLORER_URL);
const chartUrl = (ca: string) => (ca ? `https://dexscreener.com/robinhood/${ca}` : EXPLORER_URL);

const STORY = [
  {
    day: 'Night 0',
    title: 'The pot',
    text: 'Someone left an iron cauldron on a hill one Halloween night, lit the fire, and never came back. A black cat moved in and stayed. Its name is Hex.',
    note: 'it never blinks first',
  },
  {
    day: 'Night 1',
    title: 'The bottom',
    text: 'The cauldron has no bottom. Whatever falls in is gone for good. On chain, the bottom has an address: 0x…dEaD.',
    note: 'nothing climbs back out',
  },
  {
    day: 'Every night since',
    title: 'The ritual',
    text: 'Every $BREW trade drips a little ETH into the fee escrow. When the flask is full, Hex runs the ritual: tricks throw $BREW in the cauldron, treats fill the bag.',
    note: 'the pot is always hungry',
  },
];

export function App() {
  const { state, config, setConfig, logs, burnLedger } = useFlywheelEngine();

  const getIsMemex = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/memex') || hash.startsWith('#memex') || hash.startsWith('#/memex');
  };

  const [isMemexRoute, setIsMemexRoute] = useState(getIsMemex());
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);
  const [copiedDead, setCopiedDead] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [thrown, setThrown] = useState(0);
  const [sayIndex, setSayIndex] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const potRef = useRef<CauldronHandle>(null);

  useEffect(() => {
    const handleLocationChange = () => setIsMemexRoute(getIsMemex());
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Late fonts change line heights; re-measure every trigger once they land
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // While the bot is really running, Hex keeps throwing
  useEffect(() => {
    if (!state.isWheelSpinning) return;
    const id = window.setInterval(() => potRef.current?.toss(), 1800);
    return () => window.clearInterval(id);
  }, [state.isWheelSpinning]);

  const throwOne = () => {
    setThrown((prev) => prev + 1);
    setSayIndex((prev) => (prev + 1) % HEX_SAYS.length);
    potRef.current?.toss();
    sounds.playBuybackSound();
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsMemexRoute(false);
  };

  const threshold = state.currentThresholdETH || state.claimThresholdETH || config.claimThresholdETH || 0;
  const escrow = state.currentEscrowBalanceETH || 0;
  const barFill = threshold > 0 ? Math.max(0, Math.min(1, escrow / threshold)) : 0;

  // The brew glows brighter as the flask fills
  useEffect(() => {
    document.documentElement.style.setProperty('--hearth', barFill.toFixed(3));
  }, [barFill]);

  useGSAP(
    () => {
      if (isMemexRoute) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Arrival: the name rises out of the fog, then Hex flicks the first coin in
        const intro = gsap.timeline();
        intro
          .from('[data-rise]', { yPercent: 60, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.1)
          .from('[data-hero-line]', { y: 18, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, 0.45)
          .from('[data-scene]', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
          .call(() => potRef.current?.toss(), [], 1.4);

        // Leaving the first view: the moonlit scene sinks slower than the page
        gsap.to('[data-scene]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });

        // Gravestones and log rows rise as they come into view
        gsap.utils.toArray<HTMLElement>('[data-entry]').forEach((el, i) => {
          gsap.from(el, { y: 70, opacity: 0, duration: 1, ease: 'expo.out', delay: (i % 3) * 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        ScrollTrigger.batch('[data-log-row]', {
          start: 'top 92%',
          once: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 }),
        });
      });

      // The finale (desktop): the brew rises and fills the screen
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const fin = gsap.timeline({ scrollTrigger: { trigger: '[data-exit]', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
        fin
          .fromTo('[data-final-brew]', { yPercent: 86 }, { yPercent: 0, ease: 'power1.inOut', duration: 1 })
          .fromTo('[data-final-copy]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.6);
      });
      return () => {
        mm.revert();
      };
    },
    { scope: pageRef, dependencies: [isMemexRoute] },
  );

  if (isMemexRoute) {
    return <MemexAdmin onBack={navigateToHome} />;
  }

  const copyCA = () => {
    if (!config.tokenAddress) return;
    navigator.clipboard.writeText(config.tokenAddress);
    setCopiedCA(true);
    sounds.playClaimSound();
    setTimeout(() => setCopiedCA(false), 2500);
  };

  const copyDead = () => {
    navigator.clipboard.writeText(config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress);
    setCopiedDead(true);
    sounds.playBurnSound();
    setTimeout(() => setCopiedDead(false), 2000);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.floor(num));

  const totalTokensBurned =
    state.totalTokensBurned > 0
      ? state.totalTokensBurned
      : burnLedger.reduce((acc, cur) => acc + (cur.burnedJollyburn || cur.burnedMuseburn || cur.burnedIncinerator || 0), 0);

  const burnedPercent =
    state.burnedPercentageOfSupply > 0
      ? state.burnedPercentageOfSupply
      : state.totalSupply > 0
        ? (totalTokensBurned / state.totalSupply) * 100
        : 0;

  const tokenSymbol = '$BREW';
  const deadAddress = config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress;
  const isConfigured = Boolean(config.tokenAddress && config.tokenAddress.startsWith('0x') && config.tokenAddress.length === 42);
  const nextCycle = state.nextCycleType || 'burn';
  const routerName = state.swapRouter === 'uniswap' || state.isTokenMigrated ? 'Uniswap v4' : 'the Pons bonding curve';

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-clip bg-night font-body text-bone">
      {/* ───────── The nav ───────── */}
      <header className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${scrolled ? 'border-panel-line bg-night/85 backdrop-blur-md' : 'border-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-[84rem] items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-10 lg:px-16">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateToHome();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 text-bone no-underline"
            aria-label="Cauldron home"
          >
            <BrewMark className="h-9 w-9 transition-transform duration-500 group-hover:-rotate-12" />
            <span className="display text-[1.9rem] leading-none">Cauldron</span>
          </a>

          <nav className="hidden items-center gap-7 label text-[0.7rem] text-bone-dim md:flex" aria-label="Sections">
            <a href="#ritual" className="no-underline transition-colors hover:text-pumpkin-hot">the ritual</a>
            <a href="#grimoire" className="no-underline transition-colors hover:text-pumpkin-hot">grimoire</a>
            <a href="#treats" className="no-underline transition-colors hover:text-pumpkin-hot">treats</a>
            <a href="#hex" className="no-underline transition-colors hover:text-pumpkin-hot">hex</a>
            <button type="button" onClick={() => setIsLogOpen(true)} className="label cursor-pointer text-[0.7rem] transition-colors hover:text-pumpkin-hot">
              full log
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
              title={config.soundEnabled ? 'Hush the cauldron' : 'Turn the sounds on'}
              aria-label={config.soundEnabled ? 'Hush the cauldron' : 'Turn the sounds on'}
              className="btn-ghost h-10 w-10 cursor-pointer"
            >
              {config.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {X_URL ? (
              <a href={X_URL} target="_blank" rel="noreferrer" title="Cauldron on X" aria-label="Cauldron on X" className="btn-ghost h-10 w-10">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z" />
                </svg>
              </a>
            ) : null}
            <WalletButton tokenAddress={config.tokenAddress} tokenSymbol={tokenSymbol} totalSupply={state.totalSupply} explorerUrl={EXPLORER_URL} />
            {config.tokenAddress ? (
              <button type="button" onClick={copyCA} className="btn-pumpkin hidden h-10 cursor-pointer px-4 text-[0.68rem] lg:inline-flex" title="Copy contract address">
                {copiedCA ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCA ? 'Copied' : <>CA <span className="font-mono text-[0.78rem] normal-case tracking-normal">{`${config.tokenAddress.slice(0, 6)}…${config.tokenAddress.slice(-4)}`}</span></>}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ───────── The hill on Halloween night ───────── */}
        <section data-hero aria-labelledby="hero-title" className="night-sky relative flex min-h-[100svh] flex-col overflow-hidden pt-16 sm:pt-[4.5rem]">
          <Bats />
          <div className="fog pointer-events-none absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />

          <div className="relative mx-auto grid w-full max-w-[84rem] flex-1 items-center gap-6 px-4 pb-12 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:px-16 lg:pb-16">
            <div className="min-w-0">
              <p data-hero-line className="m-0 label text-pumpkin">Halloween on Robinhood Chain</p>
              <h1 id="hero-title" className="m-0 mt-2 display text-[clamp(4.6rem,13vw,10.5rem)] leading-[0.95] text-bone" aria-label="Cauldron">
                <span data-rise className="inline-block [text-shadow:0_0_40px_rgba(156,240,90,0.25)]" aria-hidden="true">
                  Cauldron
                </span>
              </h1>

              {isConfigured || totalTokensBurned > 0 ? (
                <div data-hero-line className="mt-6 border-l-2 border-pumpkin pl-4 sm:pl-5">
                  <p className="m-0 label text-bone-dim">{tokenSymbol} thrown in the cauldron</p>
                  <div className="mt-1 display tabular text-[clamp(2.8rem,6.4vw,5rem)] leading-none text-pumpkin [text-shadow:0_0_30px_rgba(255,117,24,0.45)]">
                    <LiveNumber value={totalTokensBurned} format={(n) => formatNumber(n)} />
                  </div>
                  <p className="m-0 mt-2 font-mono text-[0.85rem] text-bone">
                    {burnedPercent > 0 ? (Math.floor(burnedPercent * 100) / 100).toFixed(2) : '0.00'}% of the whole supply · gone for good
                  </p>
                </div>
              ) : (
                <div data-hero-line className="mt-6 border-l-2 border-panel-line pl-4 sm:pl-5">
                  <p className="m-0 label text-bone-dim">{tokenSymbol} thrown in the cauldron</p>
                  <p className="m-0 mt-1 display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-none text-bone">The fire is laid.</p>
                  <p className="m-0 mt-2 text-[0.98rem] text-bone-dim">
                    The count starts with the first trick after launch, <span className="text-pumpkin-hot">live from Robinhood Chain.</span>
                  </p>
                </div>
              )}

              <p data-hero-line className="m-0 mt-6 max-w-[52ch] text-[1.06rem] leading-relaxed text-bone/85">
                Every {tokenSymbol} trade drips ETH into the fee escrow. When the flask is full, Hex the cat claims it, buys {tokenSymbol} back and throws it in the cauldron at 0x…dEaD. Every other run is a treat for the project wallet.
              </p>

              <div data-hero-line className="mt-7 flex flex-col gap-4">
                {config.tokenAddress ? (
                  <button type="button" onClick={copyCA} className="group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-full border border-panel-line bg-panel/80 py-2 pl-5 pr-2 text-left transition-colors hover:border-pumpkin sm:max-w-[30rem]" title="Copy contract address">
                    <span className="min-w-0">
                      <span className="label block text-[0.6rem] text-bone-dim">contract address</span>
                      <span className="block truncate font-mono text-[0.8rem] text-bone">{config.tokenAddress}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-parch px-3 py-1.5 label text-[0.62rem] text-ink">
                      {copiedCA ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCA ? 'copied' : 'copy'}
                    </span>
                  </button>
                ) : (
                  <p className="m-0 rounded-full border border-dashed border-panel-line px-5 py-3 text-[0.95rem] text-bone-dim sm:max-w-[30rem]">The contract address appears here at launch.</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <a href={buyUrl(config.tokenAddress)} target="_blank" rel="noreferrer" className="btn-pumpkin px-7 py-3.5 text-[0.9rem] no-underline">
                    buy {tokenSymbol}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a href={chartUrl(config.tokenAddress)} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-3 text-[0.74rem] no-underline">
                    chart
                  </a>
                  <button type="button" onClick={() => setIsLogOpen(true)} className="btn-ghost cursor-pointer px-4 py-3 text-[0.74rem]" aria-label="Open the full log">
                    <ScrollText className="h-4 w-4" />
                    <span className="hidden sm:inline">log</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div data-scene className="relative">
                <CauldronScene ref={potRef} fill={barFill} running={state.isWheelSpinning} className="block h-auto w-full [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent),linear-gradient(to_bottom,#000_78%,transparent)]" />
                <div className="absolute left-[4%] top-[6%] flex max-w-[60%] flex-col items-start gap-2" aria-live="polite">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={sayIndex}
                      initial={{ opacity: 0, y: 8, rotate: -2 }}
                      animate={{ opacity: 1, y: 0, rotate: -2 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="m-0 rounded-2xl rounded-bl-none bg-parch px-4 py-2 hand text-[1.55rem] text-ink shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)]"
                    >
                      hex: “{HEX_SAYS[sayIndex]}”
                    </motion.p>
                  </AnimatePresence>
                  <button type="button" onClick={throwOne} className="btn-ghost cursor-pointer px-3.5 py-1.5 text-[0.62rem]">
                    toss one in · {thrown}
                  </button>
                </div>
              </div>
              <div data-hero-line className="relative mt-2 lg:-mt-6 lg:ml-[18%]">
                <BrewFlask escrow={escrow} threshold={threshold} fill={barFill} nextCycle={nextCycle} live={isConfigured} running={state.isWheelSpinning} />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── One run, step by step ───────── */}
        <RitualSequence tokenSymbol={tokenSymbol} escrow={escrow} threshold={threshold} fill={barFill} claimedETH={state.totalFeesClaimedETH || 0} routerName={routerName} nextCycle={nextCycle} />

        {/* ───────── The grimoire and the treat bag ───────── */}
        <Grimoire
          burnLedger={burnLedger}
          totalBurned={totalTokensBurned}
          logs={logs}
          tokenSymbol={tokenSymbol}
          deadAddress={deadAddress}
          explorerUrl={EXPLORER_URL}
          copiedDead={copiedDead}
          onCopyDead={copyDead}
          onOpenLog={() => setIsLogOpen(true)}
        />

        {/* ───────── Hex keeps watch ───────── */}
        <HexWatch state={state} config={config} live={isConfigured} onOpenLog={() => setIsLogOpen(true)} />

        {/* ───────── How the cauldron got here ───────── */}
        <section id="story" aria-labelledby="story-title" className="relative px-4 pb-32 pt-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <p className="m-0 label text-pumpkin">the legend</p>
            <h2 id="story-title" className="m-0 mt-3 max-w-[18ch] display text-[clamp(2.8rem,6vw,5.2rem)] text-bone">
              How the cauldron got here
            </h2>
            <ol className="m-0 mt-16 grid list-none items-end gap-8 p-0 md:grid-cols-3">
              {STORY.map((d, i) => (
                <li key={d.title} data-entry className={`stone px-7 pb-8 pt-16 text-center ${i === 1 ? 'md:min-h-[27rem]' : 'md:min-h-[23rem]'}`}>
                  <p className="m-0 label text-bone-dim">{d.day}</p>
                  <h3 className="m-0 mt-2 display text-[clamp(2.2rem,3vw,2.8rem)] text-bone">{d.title}</h3>
                  <p className="m-0 mt-4 text-[1.02rem] leading-relaxed text-bone/85">{d.text}</p>
                  <p className="m-0 mt-5 hand text-[1.6rem] text-pumpkin-hot">{d.note}</p>
                </li>
              ))}
            </ol>
            {/* the ground the stones stand on */}
            <div className="mt-[-1px] h-px bg-gradient-to-r from-transparent via-panel-line to-transparent" aria-hidden="true" />
          </div>
        </section>

        {/* ───────── The finale: the brew rises ───────── */}
        <section data-exit aria-labelledby="exit-title" className="relative h-auto lg:h-[200svh]">
          <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-night px-4 py-24 sm:px-10 lg:sticky lg:top-0 lg:h-[100svh] lg:py-0">
            <div data-final-brew className="absolute inset-0" aria-hidden="true">
              <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[60px] w-full">
                <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30 V60 H0 Z" fill="#3f9a2c" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 top-[58px] bg-[linear-gradient(#3f9a2c,#1c4f16_45%,#0f2a0c)]" />
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="bubble absolute block rounded-full border-2 border-[#9cf05a]/60 bg-[#d6ffb0]/20" style={{ left: `${(i * 71) % 100}%`, top: `${15 + ((i * 37) % 70)}%`, width: 10 + (i % 4) * 8, height: 10 + (i % 4) * 8, animationDelay: `${(i % 5) * 0.5}s` }} />
              ))}
            </div>
            <div data-final-copy className="relative z-10 mx-auto max-w-[56rem] pt-12 text-center">
              <BrewMark className="mx-auto h-24 w-24 shadow-[0_0_60px_10px_rgba(156,240,90,0.25)]" />
              <h2 id="exit-title" className="m-0 mt-6 display text-[clamp(3.4rem,9vw,7rem)] text-bone [text-shadow:0_6px_30px_rgba(0,0,0,0.6)]">
                Throw it in the cauldron.
              </h2>
              <p className="mx-auto mt-6 max-w-[44ch] text-[1.15rem] font-medium leading-relaxed text-bone">
                Hold {tokenSymbol}, trade {tokenSymbol}, and watch Hex throw the supply in, one trick at a time.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <a href={buyUrl(config.tokenAddress)} target="_blank" rel="noreferrer" className="btn-pumpkin px-8 py-4 text-[0.95rem] no-underline">
                  buy {tokenSymbol}
                  <ArrowUpRight className="h-5 w-5" />
                </a>
                {config.tokenAddress ? (
                  <button type="button" onClick={copyCA} className="btn-ghost cursor-pointer px-6 py-4 text-[0.8rem]">
                    {copiedCA ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    {copiedCA ? 'copied' : 'copy CA'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <footer className="relative border-t border-panel-line bg-night">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-12 pt-8 text-[0.95rem] text-bone-dim sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
            <div className="flex items-center gap-2.5">
              <BrewMark className="h-8 w-8" />
              <span className="label text-[0.68rem] text-bone">{tokenSymbol} on Robinhood Chain</span>
            </div>
            <p className="m-0 max-w-[52ch]">Tricks and treats are run by a bot and every one is on chain. A meme, not financial advice.</p>
            <div className="font-mono text-[0.8rem]">
              Chain ID 4663 · {!isConfigured ? 'fire not lit' : state.isWheelSpinning ? 'ritual in progress' : 'hex on watch'}
            </div>
          </div>
        </footer>
      </main>

      <BurnLedgerDrawer isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} logs={logs} burnLedger={burnLedger} state={state} config={config} />
    </div>
  );
}

export default App;
