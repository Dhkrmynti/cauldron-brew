<p align="center">
  <img src="public/brew-logo-transparent.png" alt="Cauldron" width="180" />
</p>

<h1 align="center">Cauldron ($BREW)</h1>

<p align="center"><b>Throw it in the cauldron.</b><br/>
An autonomous buyback-and-burn engine on <b>Robinhood Chain</b> (chain ID 4663), built for tokens launched on <a href="https://docs.ponsfamily.com/v2">Pons Family v2</a>.</p>

---

## How it works

Hex, a black cat sitting on the rim of a bubbling cauldron, is the bot. The cauldron is the dead address `0x000000000000000000000000000000000000dEaD`: whatever falls in never climbs back out.

1. **Trades drip in.** Every $BREW buy and sell pays a creator fee in ETH into the Pons Fee Escrow.
2. **The flask fills.** It fills up to the size of the next run: 0.01 ETH on a trick, 0.02 ETH on a treat.
3. **Hex claims it.** The bot calls `escrow.claim()` on its own, 24/7.
4. **It buys $BREW.** On a trick, the claimed ETH market-buys $BREW on the Pons bonding curve (or Uniswap v4 after graduation).
5. **Trick or treat.** Runs take turns:
   - **Odd runs are tricks:** every token bought is sent to `0x…dEaD`, burned for good.
   - **Even runs are treats:** the fees go to the project wallet (the treasury) to keep the fire lit.

Every claim, buy, burn and treasury transfer is a real transaction on Robinhood Chain, shown live on the site with its tx link.

## Status

The code is ready; the token is **not launched yet**. Before going live:

- [ ] Verify the Pons contract addresses below on mainnet (`cast code <address> --rpc-url …`)
- [ ] Deploy the bot (24/7, e.g. a VPS with PM2) and the website
- [ ] Set `ADMIN_SECRET` and `CREATOR_PRIVATE_KEY` in the server's `.env`
- [ ] Launch $BREW on Pons, then set its contract address in `/memex`
- [ ] Check the live site with real data (burn total, grimoire, flask, wallet balances)

## Contracts (Robinhood Chain, ID 4663)

| Contract | Address |
|---|---|
| Pons Factory | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| Pons Fee Escrow | `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e` |
| Uniswap v4 Universal Router | `0x8876789976dEcBfCbBbe364623C63652db8C0904` |
| The cauldron (dead address) | `0x000000000000000000000000000000000000dEaD` |
| $BREW token | set after launch |

RPC: `https://rpc.mainnet.chain.robinhood.com` · Explorer: `https://explorer.mainnet.chain.robinhood.com`

## Deploy

Step-by-step VPS guide (PM2 for the bot, nginx for the site): [deploy/DEPLOY.md](deploy/DEPLOY.md).

## Quick start

```bash
npm install
cp .env.example .env    # then fill it in, see below
npm run dev             # website on http://localhost:3095
npm run bot             # the bot and its API on port 5015
```

### `.env`

```env
VITE_TOKEN_NAME="Cauldron"
VITE_TOKEN_SYMBOL="BREW"
VITE_TOKEN_ADDRESS=""            # $BREW contract address after launch (or set it in /memex)
VITE_CREATOR_ADDRESS=""          # treasury: where treat runs send the fees
VITE_CLAIM_THRESHOLD_ETH="0.01"
VITE_RPC_URL="https://rpc.mainnet.chain.robinhood.com"

CREATOR_PRIVATE_KEY=""           # the bot's operator wallet (the Pons creator), server only
ADMIN_SECRET=""                  # required for /memex, 16+ characters: openssl rand -hex 24
```

`CREATOR_PRIVATE_KEY` and `ADMIN_SECRET` stay on the server. Never commit `.env`.

## The operator panel (`/memex`)

Open `/memex` on the site to set the token address, the treasury and the operator key without editing files. Every change needs the **Admin Secret** (the `ADMIN_SECRET` from the server's `.env`); the secret is kept only for that browser tab.

## Security

- The website is a read-only tracker. The **Connect wallet** button only reads your address and balances; the site never asks you to sign or send anything.
- The admin API (`POST /api/admin/save`, `POST /api/config`, `GET /api/admin/config`) refuses every request without an `x-admin-secret` header matching `ADMIN_SECRET`, and stays shut (503) when `ADMIN_SECRET` is unset.
- The operator private key is never sent to the browser, and never served by `/api/status`.
- Tokens sent to `0x…dEaD` are provably unrecoverable.

## Testing

An end-to-end run drives the real, unmodified bot against a throwaway local chain (never mainnet), with a stand-in escrow at the real Pons escrow address:

```bash
anvil --chain-id 4663 --port 8599          # Foundry
E2E_RPC=http://127.0.0.1:8599 npm run test:e2e
```

It checks the threshold, a burn run, a treat run, a crash right after a claim (no double claim, nothing stranded), and the admin secret (22 checks).

## Project layout

```
src/App.tsx                    the page: hero, ritual, grimoire, Hex's watch, finale
src/components/brew/           the Cauldron UI (scene, flask, tarot ritual, grimoire, wallet…)
src/components/MemexAdmin.tsx  the operator panel (/memex)
src/hooks/useBurnEngine.ts     reads the engine state and the burn ledger
src/utils/web3.ts              chain reads, connectWallet()
bot/pons-burn-bot.ts           the 24/7 bot: claim → buy → burn / treat, plus its API
test/e2e.ts                    end-to-end bot test on a local chain
DESIGN.md                      the design system
```

---

A meme, not financial advice. Pons Family v2 docs: [docs.ponsfamily.com/v2](https://docs.ponsfamily.com/v2)
