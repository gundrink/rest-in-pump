# Rest In Pump

A Halloween graveyard for dead Solana memecoins. Walk a public hill of fictional EXAMPLE tombstones, or open a personal plot by pasting a wallet address or connecting a wallet in read-only mode.

This is a memorial and a joke we are all in. It is not financial advice, not a trading app, and not a promise of profit, an airdrop, or a refund. There is no token and no smart contract.

The product notes live in [product.md](product.md).

## What you can do

- **Landing.** A ghost-and-pumpkin mascot, the tagline, and a few example stones.
- **Public graveyard.** Tombstone cards with name, ticker, born and died dates, peak, cause of death, and an epitaph. Every public coin is labelled EXAMPLE.
- **My graveyard.** Connect Phantom or Solflare, or paste any Solana address. The connect button reads the public address only. It never asks for a signature, a transaction, or a seed phrase.
- **Epitaphs.** At least 30 templates, chosen deterministically from the coin's stats. The same coin always gets the same line.
- **Share.** Download a picture ("My graveyard has 14 tombstones") and open a pre-filled X post. The picture does not include the wallet address. The X link includes the page URL, which does.
- **Hide the numbers.** A switch tucks prices and drawdowns before you share. The epitaph stays.

## Dead coin

A coin is buried when either rule is true:

- its price is **down more than 90%** from its peak (exactly 90% stays alive), or
- **24h volume is near zero** for several days.

Thresholds live in the environment (see `.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `DEAD_DRAWDOWN` | `0.9` | Dead when drawdown is strictly greater than this |
| `DEAD_NEAR_ZERO_VOLUME_USD` | `500` | 24h volume at or under this is near zero |
| `DEAD_LOW_VOLUME_DAYS` | `3` | How many consecutive low-volume days the volume rule needs |

On the public EXAMPLE set, those days are part of the seed data. Live mode does not keep a database of daily volume. If DexScreener's 24h, 6h, and 1h windows are all near zero, the app treats that as the configured streak. A quiet 24h with a busier shorter window counts as one day, which is not enough on its own.

## Mock mode and live data

Leave `HELIUS_API_KEY` empty. Wallet pages and `/api/wallet/[address]` then return **mock mode**: a deterministic subset of the EXAMPLE coins, with a banner that says so. No Helius or DexScreener call is made. The public hill is always the EXAMPLE source unless you add another one.

To turn on live wallet lookups:

1. Copy `.env.example` to `.env.local`.
2. Set `HELIUS_API_KEY` to a [Helius](https://www.helius.dev/) key.
3. Restart the server.

Live mode then:

- reads current fungible balances with Helius DAS `getAssetsByOwner`
- reads up to `HELIUS_TX_LIMIT` recent enhanced transactions for mints the wallet sent or received
- skips wrapped SOL and the common stables (they are not memecoins)
- prices up to `WALLET_MINT_CAP` mints (30, DexScreener's batch limit) with the public DexScreener token API
- caches the classified report in server memory for `CACHE_TTL_SECONDS`

The server route is `GET /api/wallet/[address]`. The My Graveyard page uses the same function, so a pasted address works without JavaScript. Responses are cached only in memory for the TTL. Nothing is written to a database.

`GET /api/graveyard` returns the public EXAMPLE hill. `GET /api/share?count=14&kind=mine&mode=mock` returns the PNG.

### Swapping the public data source

Public coins come from `lib/public-graveyard.ts`. The shipped source id is `example`. To add another source, implement `PublicGraveyardSource`, register it, set `GRAVEYARD_SOURCE`, and redeploy. Wallet data is a separate path and is not that source.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

Mock mode needs no API key. `npm test` covers the dead-coin rules, epitaph determinism, address checks, and the mock wallet report.

## Deploy on Vercel

The app is a Next.js App Router project and deploys with the default Vercel Next.js preset. No `vercel.json` is required.

1. Import the repository.
2. Leave the framework as Next.js. Build command `npm run build`, output handled by Next.
3. Add `HELIUS_API_KEY` in Project Settings → Environment Variables for Production (and Preview, if you want live data there). Leave it unset on a preview if you want that preview to stay in mock mode. Optional: set `NEXT_PUBLIC_SITE_URL` to the public origin so share-card Open Graph URLs match the domain. On Vercel the deployment host is used when that variable is empty.
4. Set the other variables from `.env.example` only if you want non-default thresholds.
5. Deploy.

Do not commit `.env.local` or a real key. `.env.example` has empty secrets on purpose.

## Read-only wallet

`components/wallet-gate.tsx` uses `@solana/wallet-adapter` for Phantom and Solflare. `autoConnect` is off. The only wallet fields used are `publicKey`, `connected`, `connecting`, and `disconnect`. There is no call to `signMessage`, `signTransaction`, or `sendTransaction`. The adapter's RPC endpoint is a placeholder and is not used to load balances. Helius is called on the server, and the key never ships to the browser.

The page says this in the UI, next to the button. If a wallet popup asks you to sign, approve a transaction, or type a seed phrase, close it. That is not Rest In Pump.

Pasting an address uses the same read as a connect. Any wallet on Solana is public chain data. The tone stays "we have all been rugged", and **Hide the numbers** is there so a screenshot does not have to show the figures.

## Caveats

- **Live peaks are not full all-time highs.** DexScreener exposes recent price-change windows. The app reconstructs a peak from those and labels it "Peak (24h estimate)". If the windows are flat, the peak is unknown and only the volume rule can bury the coin. A coin that rugged months ago and still has real volume can be missed. EXAMPLE stones use recorded peaks.
- **History is capped.** Live mode looks at current balances plus the most recent transactions (default 100) and at most 30 mints. Older bags can stay underground, unlisted. The page says when the scan was truncated.
- **No multi-day volume database.** The "several days" rule is real for EXAMPLE data. Live mode approximates it from the 24h, 6h, and 1h windows, as described above.
- **Unpriced tokens are not buried.** If DexScreener has no market, the coin is counted as unpriced and left out. The app does not invent a funeral.
- **Cache is per server instance.** A warm Vercel function reuses it. A cold start fetches again. Wallet reports send `Cache-Control: private`.
- **Rate limit.** Wallet API calls are limited per IP (default 10 per minute) so a busy link does not hammer Helius.
- **Out of scope.** No app token, voting, airdrop, buyback, user accounts, or permanent database. See product.md.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Classifier, epitaph, address, and mock-mode tests |
| `npm run lint` | ESLint |
