/** The mark: Hex peeking over the cauldron (artwork in /public/brew-logo-*.png). */
export function BrewMark({ className, title }: { className?: string; title?: string }) {
  return (
    <img
      src="/brew-logo-192.png"
      srcSet="/brew-logo-192.png 192w, /brew-logo-512.png 512w"
      sizes="(min-width: 640px) 80px, 64px"
      width={192}
      height={192}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      draggable={false}
      className={`rounded-full object-cover ${className ?? ''}`}
    />
  );
}
