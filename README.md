# FriendOS

**Your Rare Friend can think, work, and spend.**

FriendOS turns a Rare Friends Generations NFT into a persistent AI operator with its own identity, wallet view, skills, mastery, mission history, reputation, and `$RAREFRIENDS` operating budget.

## Live demo

**https://dingufira88.github.io/friendos/**

The public demo works without a wallet. Guest mode includes three operators, simulated RF balances, skill installation, missions, receipts, progression, wallet controls, and Skill NFT training.

Connecting a wallet adds Robinhood Chain switching through FriendSDK v0.1.2, a free session-confirmation signature, discovery of up to three owned Generations NFTs, canonical on-chain sprite data, each Friend's NFT wallet address, and the connected wallet's real `$RAREFRIENDS` balance as a read-only value.

## Core interaction

1. Choose an operator.
2. Inspect **What can this Friend do?**
3. Select Quick Ask, Social Content, Blockchain Analytics, or Narrative Strategy.
4. Give the Friend a brief and launch the mission.
5. Continue exploring while the compact progress panel shows the Friend working.
6. Receive a category-specific report and RF receipt.
7. Reopen the Friend to see mission history, XP, skill mastery, balance, and wallet activity.

## Why Rare Friends

The Generations NFT is the operator, not a profile picture beside a generic assistant. Identity and progression are keyed to the token ID, so switching Friends changes the operator, wallet, budget, history, installed skills, and mastery.

```text
Generations NFT → persistent operator identity → skills + missions + RF budget
→ useful output + receipt → mastery + reputation + economic history
```

## Skill economy

Operators acquire skills from a marketplace. A skill defines a capability, installation price, usage cost, developer, and proposed developer revenue share. Matching missions increase that skill's mastery faster than baseline capabilities.

The no-code Skill NFT training concept follows this loop:

```text
Free trainee mint → choose specialty → review evidence-backed questions
→ approve/reject conclusions → gain judgment XP → accept public tasks
→ establish success/accuracy → publish a priced operator skill
```

Developer submissions and live payouts are **not active** in this MVP.

## Economy disclosure

All mission charges, skill purchases, operator funding, burns, rewards, developer shares, and internal wallet transactions are simulated and stored locally in the browser. No token approval, transfer, burn, or other on-chain transaction occurs.

Connected-wallet `$RAREFRIENDS` holdings are real read-only chain data and are displayed separately from simulated operator budgets. CRED is internal, non-transferable reputation—not a launched token.

## Architecture

```mermaid
flowchart LR
    A[Guest or wallet owner] --> B[FriendOS React UI]
    B --> C[FriendSDK wallet session]
    C --> D[Robinhood Chain]
    D --> E[Owned Generations NFTs]
    D --> F[On-chain sprite and Friend wallet]
    D --> G[Read-only RF balance]
    B --> H[Zustand operator state]
    H --> I[Missions and receipts]
    H --> J[Skills and mastery]
    H --> K[Simulated RF ledger]
    B --> L[/api/mission]
    L --> M[OpenAI Responses API]
    L -. unavailable .-> N[Deterministic offline reports]
```

The GitHub Pages demo is static and uses deterministic offline reports. `api/mission.ts` is available for serverless deployments configured with `OPENAI_API_KEY`.

## FriendSDK integration

Version: `@rarefriends/friendsdk` **v0.1.2**.

FriendOS uses:

- `createFriendWalletSession` for discovery and wallet lifecycle.
- `createFriendPublicClient` for Robinhood Chain reads.
- `readOwnedFriends` for owned Generations discovery.
- `createGenerationSpriteReader` for canonical on-chain Friend art data.

FriendOS is a standalone agent/tool rather than a sandboxed SDK game, so it uses FriendSDK's advanced wallet, ownership, and sprite modules instead of the 960 × 640 game runtime.

## Stack

- React 19, TypeScript and Vite
- FriendSDK v0.1.2 and viem
- Zustand persistence
- Framer Motion
- Zod validation
- Optional OpenAI Responses API serverless function
- Playwright desktop and mobile browser tests

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run build
npm run test:e2e
```

To enable live AI on a serverless host, copy `.env.example`, set `OPENAI_API_KEY`, and optionally set `OPENAI_MODEL`. Never expose the key through a `VITE_` environment variable.

## Deployment

Every push to `main` runs the production build and twelve desktop/mobile browser journeys before publishing `dist/` through GitHub Pages.

## Known limitations

- Economic actions and operator balances are simulated; only connected-wallet holdings are live read-only data.
- The signature confirms the local session but is not server-authenticated.
- GitHub Pages uses deterministic offline reports because it cannot host the serverless AI function.
- Skill submissions, moderation, payouts, pricing, success scoring, and public task markets are product concepts, not live services.
- Operator proficiency levels are FriendOS progression and are separate from canonical Generations tiers, upgrades, and promotions.
- The generated operator portrait sheet is original presentation artwork; owned Friends also retain canonical on-chain sprite identity data.
