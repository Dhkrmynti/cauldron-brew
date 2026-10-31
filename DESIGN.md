# Design System: CAULDRON ($BREW)

**North star: "Halloween night on the hill."** A moonlit night, an iron cauldron bubbling over a log fire, Hex the black cat on its rim. Everything thrown in is gone for good (0x…dEaD). Spooky-fun, never gory.

## Colors (`src/index.css` `@theme`)
- **Night** `#0c0910`, night-2 `#140f1b`, panel `#1b1424`, panel-line `#33284a`: the sky and raised surfaces.
- **Bone** `#f3eadb` (text), bone-dim `#a99cb8` (secondary text).
- **Parchment** `#ecdfc2` with ink `#2a1a12`, ink-soft `#6e5640`, blood `#a8261b`: the grimoire page and the log drawer.
- Three signal inks, one meaning each:
  - **Pumpkin** `#ff7518` / pumpkin-hot `#ffb347`: live state and the primary action (BUY, the live burned total, focus, hover).
  - **Brew green** `#9cf05a` / brew-deep `#2f7a22`: the trick (burn) and the cauldron's light.
  - **Candy violet** `#c88bff` / treat-ink `#6b2fa8`: the treat (keep runs), shown openly.
- Legacy aliases (soot, ember, plaque, ring, fuel, …) are remapped for `/memex` and the shared drawer only.

## Type
- Display: **Grenze Gotisch** (700) for names and headings.
- Body: **Hanken Grotesk**; `.label` = 0.72rem, 650, uppercase, 0.16em tracking.
- Readings: **JetBrains Mono**, tabular numerals for every live number.
- Hand: **Reenie Beanie** for Hex's speech, log remarks and gravestone notes.

## Surfaces
- `.slab`: rounded 18px night panel with a hairline and a deep shadow (the flask meter).
- `.stone`: a gravestone, rounded top (Hex's watch, the legend).
- `.parch`: noisy parchment with burnt corners (the grimoire).
- Buttons are pills: `.btn-pumpkin` (primary, glowing), `.btn-ghost` (night), `.btn-ink` (on parchment).

## Signature pieces (`src/components/brew/`)
- **CauldronScene**: SVG hill, moon, graves, pumpkins, fire, cauldron, Hex. Brew glow and steam follow the escrow fill; `toss()` flicks a coin into the brew (on load, on a loop while visible, on click, and every 1.8s while the bot is really running).
- **BrewFlask**: the fee escrow as a potion flask; green when the next run is a trick, violet for a treat.
- **RitualSequence**: five tarot cards (I to V), one per step of a run, each with its own scene, text and live reading. Face-down at first, they turn over one by one as the row scrolls in; a swipeable row on phones.
- **Grimoire**: tricks on parchment, each with a candle sized to the burn, plus the treat bag runs.
- **HexWatch**: the bot's live status on a gravestone; Hex's eyes open wide while it works.
- Finale: the green brew rises over the screen on desktop scroll.
- **WalletButton** (header): connect through the engine's `connectWallet()` (switches to Robinhood Chain). Connected: address chip with a green dot; its panel shows ETH and $BREW balances (read from the Robinhood RPC), share of supply, explorer link, disconnect. Wrong network turns the chip pumpkin and switches on click. No injected wallet: a panel with MetaMask / Rabby links. Read-only, never asks to sign.

All motion is gated behind `prefers-reduced-motion` with a complete still state.
