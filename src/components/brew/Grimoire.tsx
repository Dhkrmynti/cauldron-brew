import { useMemo } from 'react';
import { Check, Copy, ExternalLink, ScrollText } from 'lucide-react';
import type { ActivityLog, BurnLedgerEntry } from '../../types';

interface GrimoireProps {
  burnLedger: BurnLedgerEntry[];
  logs: ActivityLog[];
  totalBurned: number;
  tokenSymbol: string;
  deadAddress: string;
  explorerUrl: string;
  copiedDead: boolean;
  onCopyDead: () => void;
  onOpenLog: () => void;
}

const REMARKS = ['gone.', 'into the brew.', 'no take-backs.', 'bubble bubble.', 'trick!', 'one less out there.', 'hex purrs.', 'the pot says thanks.'];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.floor(n));
const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1, roundingMode: 'floor' } as Intl.NumberFormatOptions).format(n);
const shortHash = (h: string) => `${h.slice(0, 6)}…${h.slice(-4)}`;
const when = (e: BurnLedgerEntry) => {
  // ledger timestamps from the chain are in seconds
  const ms = e.timestamp && e.timestamp < 1e12 ? e.timestamp * 1000 : e.timestamp;
  const d = ms ? new Date(ms) : null;
  if (!d || Number.isNaN(d.getTime())) return e.timeStr?.split(' (')[0] ?? '';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};
const burned = (e: BurnLedgerEntry) => e.burnedJollyburn || e.burnedMuseburn || e.burnedIncinerator || 0;

interface TreatRun {
  key: string;
  eth: number;
  time: string;
  tx: string;
}

/** A candle that burns down: its height is the drop's size next to the biggest one shown. */
function Candle({ share }: { share: number }) {
  const h = 10 + share * 34;
  return (
    <svg viewBox="0 0 20 56" className="h-14 w-5 shrink-0" aria-hidden="true">
      <path className="flicker" d={`M10 ${50 - h - 12} Q15 ${50 - h - 4} 10 ${50 - h} Q5 ${50 - h - 4} 10 ${50 - h - 12} Z`} fill="#ff7518" />
      <rect x="9.3" y={50 - h - 2} width="1.4" height="3" fill="#2a1a12" />
      <rect x="5" y={50 - h} width="10" height={h} rx="1.5" fill="#f3eadb" stroke="#6e5640" strokeWidth="1" />
      <rect x="2" y="50" width="16" height="4" rx="2" fill="#6e5640" />
    </svg>
  );
}

/** Every coin thrown in the cauldron, and every treat run, each with its transaction. */
export function Grimoire({ burnLedger, logs, totalBurned, tokenSymbol, deadAddress, explorerUrl, copiedDead, onCopyDead, onOpenLog }: GrimoireProps) {
  const tricks = useMemo(() => {
    const chrono = [...burnLedger].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return chrono
      .filter((e) => e.cycleType !== 'keep' && (burned(e) > 0 || e.burnTx))
      .map((e, i) => ({ e, n: i + 1 }))
      .reverse();
  }, [burnLedger]);

  // treat runs: keep entries from the ledger, plus the bot's "forwarded … to treasury" log lines
  const treats = useMemo(() => {
    const out: TreatRun[] = [];
    const seen = new Set<string>();
    for (const e of burnLedger) {
      if (e.cycleType !== 'keep') continue;
      const tx = e.claimTx || '';
      seen.add(tx || e.id);
      out.push({ key: e.id, eth: e.retainedETH || e.claimedETH || 0, time: when(e), tx });
    }
    for (const l of logs) {
      const m = /forwarded\s+([\d.]+)\s*ETH\s+to\s+treasury/i.exec(l.details || '');
      if (!m) continue;
      const tx = l.txHash || '';
      const key = tx || l.id;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, eth: parseFloat(m[1]) || 0, time: l.timestamp, tx });
    }
    return out;
  }, [burnLedger, logs]);

  const shown = tricks.slice(0, 8);
  const biggest = Math.max(1, ...shown.map(({ e }) => burned(e)));

  return (
    <section id="grimoire" aria-labelledby="grimoire-title" className="relative px-4 pb-24 pt-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="m-0 label text-pumpkin">the grimoire</p>
            <h2 id="grimoire-title" className="m-0 mt-3 display text-[clamp(2.8rem,6vw,5.2rem)] text-bone">
              Every trick, written down
            </h2>
          </div>
          <p className="m-0 max-w-[50ch] text-[1.08rem] leading-relaxed text-bone-dim lg:justify-self-end">
            Every time {tokenSymbol} goes in the cauldron, it is written here with its transaction, read straight from Robinhood Chain. Each candle is that drop’s size next to the biggest one shown.
          </p>
        </div>

        <div className="parch mt-12 -rotate-[0.4deg] px-5 pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-7">
          {/* the wax seal */}
          <svg viewBox="0 0 80 80" className="absolute -right-3 -top-6 h-16 w-16 rotate-12 drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)] sm:-right-6 sm:-top-8 sm:h-20 sm:w-20" aria-hidden="true">
            <path d="M40 4 Q50 8 56 6 Q62 14 70 16 Q72 26 76 32 Q72 42 76 50 Q68 56 66 64 Q56 66 50 74 Q40 70 32 76 Q26 68 16 66 Q14 56 6 50 Q10 40 4 32 Q12 26 12 16 Q22 14 26 6 Q32 8 40 4 Z" fill="#a8261b" />
            <circle cx="40" cy="40" r="22" fill="none" stroke="#7a1a12" strokeWidth="2.5" />
            <path d="M30 48 L29 30 L35 35 Q40 33.5 45 35 L51 30 L50 48 Q46 53 40 53 Q34 53 30 48 Z" fill="#7a1a12" />
          </svg>
          <p className="m-0 mb-3 hand text-[1.7rem] leading-none text-blood/80">the book of tricks</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-ink/25 pb-4 text-[0.85rem] text-ink-soft">
            <span className="label text-ink-soft">
              tricks <span className="text-blood">{tricks.length}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="label text-ink-soft">the cauldron</span>
              <span className="truncate font-mono text-ink" title={deadAddress}>
                {deadAddress.slice(0, 8)}…{deadAddress.slice(-6)}
              </span>
              <button type="button" onClick={onCopyDead} className="btn-ink cursor-pointer px-2.5 py-1 text-[0.66rem]">
                {copiedDead ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedDead ? 'copied' : 'copy'}
              </button>
            </span>
          </div>

          <ol className="m-0 list-none p-0" aria-label="Recent tricks: coins thrown in the cauldron">
            {shown.length === 0 ? (
              <li data-log-row className="flex items-center gap-4 py-8">
                <Candle share={1} />
                <p className="m-0 text-[1.05rem] text-ink-soft">
                  {totalBurned > 0 ? `${compact(totalBurned)} ${tokenSymbol} already went in. Reading the tricks from the chain…` : 'Nothing in the cauldron yet. The first trick shows up here with its transaction.'}
                </p>
              </li>
            ) : (
              shown.map(({ e, n }) => {
                const tx = e.burnTx || e.buyTx || e.claimTx;
                const amt = burned(e);
                return (
                  <li key={e.id} data-log-row className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-5 gap-y-1 border-b border-ink/15 py-4 last:border-b-0 sm:grid-cols-[1.25rem_minmax(0,1.2fr)_minmax(0,0.8fr)_auto]">
                    <Candle share={Math.max(0.05, amt / biggest)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="label text-ink-soft">trick {n}</span>
                        <span className="font-mono text-[0.8rem] text-ink-soft">{when(e)}</span>
                      </div>
                      <div className="display text-[clamp(1.7rem,2.6vw,2.3rem)] tabular text-ink">
                        {fmt(amt)} <span className="text-[0.62em] text-blood">{tokenSymbol}</span>
                      </div>
                    </div>
                    <span className="col-start-2 hand -rotate-2 text-[1.6rem] text-blood sm:col-start-auto" aria-hidden="true">
                      {REMARKS[(n - 1) % REMARKS.length]}
                    </span>
                    {tx && tx.startsWith('0x') ? (
                      <a href={`${explorerUrl}/tx/${tx}`} target="_blank" rel="noreferrer" className="col-start-2 inline-flex items-center gap-1 font-mono text-[0.82rem] text-ink underline decoration-ink/40 hover:text-blood sm:col-start-auto sm:justify-self-end">
                        {shortHash(tx)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </li>
                );
              })
            )}
          </ol>
          <button type="button" onClick={onOpenLog} className="btn-ink mt-6 cursor-pointer px-5 py-2.5 text-[0.78rem]">
            <ScrollText className="h-4 w-4" />
            open the full grimoire
          </button>
        </div>

        <div id="treats" className="mt-20 grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex items-start gap-5">
            <svg viewBox="0 0 64 64" className="mt-1 h-16 w-16 shrink-0" aria-hidden="true">
              <path d="M12 22 Q6 58 32 60 Q58 58 52 22 Q42 14 32 17 Q22 14 12 22 Z" fill="#6b2fa8" stroke="#c88bff" strokeWidth="2" />
              <path d="M16 23 Q32 30 48 23" stroke="#c88bff" strokeWidth="2" fill="none" />
              <circle cx="24" cy="12" r="5" fill="#ff7518" />
              <circle cx="38" cy="10" r="4" fill="#9cf05a" />
              <path d="M22 40 l4 -5 l4 5 m4 0 l4 -5 l4 5 M24 48 Q32 54 40 48" stroke="#ffe08a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </svg>
            <div>
              <h3 className="m-0 display text-[clamp(2.2rem,3.4vw,3rem)] text-treat">The treat bag</h3>
              <p className="m-0 mt-3 max-w-[44ch] text-[1.03rem] leading-relaxed text-bone-dim">
                Every other run is a treat: the fees go to the project wallet instead of the cauldron, to keep the fire lit. Those runs are written up here too, in full.
              </p>
            </div>
          </div>
          {treats.length === 0 ? (
            <div className="self-end rounded-[18px] border border-dashed border-treat/35 bg-treat-ink/10 px-6 py-5">
              <p className="m-0 label text-treat">no treat runs yet</p>
              <p className="m-0 mt-2 text-[1rem] leading-relaxed text-bone-dim">The next one shows up here with its transaction. Older ones are in the project wallet’s history.</p>
            </div>
          ) : (
            <ol className="m-0 list-none self-end p-0">
              {treats.slice(0, 4).map((f) => (
                <li key={f.key} data-log-row className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-panel-line py-3">
                  <span className="label text-treat">treat run</span>
                  <span className="tabular font-mono text-[1rem] text-bone">{f.eth.toFixed(4)} ETH</span>
                  <span className="font-mono text-[0.85rem] text-bone-dim">{f.time}</span>
                  {f.tx && f.tx.startsWith('0x') ? (
                    <a href={`${explorerUrl}/tx/${f.tx}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[0.85rem] text-treat underline decoration-treat/40">
                      {shortHash(f.tx)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
