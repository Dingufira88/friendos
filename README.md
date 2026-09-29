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
7. Clarify, challenge, or refine the result through a versioned Mission Review.
8. Accept the strongest version, choose what the operator remembers, or start a linked mission.
9. Reopen the Friend to see mission history, memory, XP, skill mastery, balance, and wallet activity.

## Mission Review

Mission Review keeps follow-up work attached to a mission instead of turning FriendOS into a general-purpose chat window.

Implemented:

- Three structured review actions: **Clarify**, **Challenge**, and **Refine**.
- Up to three review rounds with selectable, preserved result versions.
- Skill-aware routing: Clarify uses Deep Research, Challenge uses Social Signal, and Refine reuses the mission's original skill.
- A specialist-install prompt when the recommended skill is missing, with an explicit native-ability fallback.
- Per-review RF receipts showing spend, burn, compute, ecosystem or creator allocation, skill, mastery, and confidence.
- Final-version acceptance and opt-in memory categories: conclusion, preference, rejected direction, and reusable workflow.
- Linked missions that retain the originating receipt relationship.
- Operator-specific memory persisted locally and displayed in the complete operator profile.
- Parent/child mission lineage displayed in history, with completed results reopenable from their receipts.
- Owner controls to edit or delete individual operator memories.

Remaining before production use:

- Route reviews through a disclosed, consent-aware live AI endpoint. The static Pages build currently uses deterministic local review output.
- Replace rule-based memory extraction with structured semantic extraction.
- Persist review state to a backend or wallet-linked store; browser storage is currently device-local.

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

```text
Guest or wallet owner
        |
        v
FriendOS React UI
   |          |-----------------------> Mission API (serverless hosts)
   |          |                             |-- OpenAI Responses API
   |          |                             `-- Deterministic offline reports
   |          |
   |          |-----------------------> Mission Review
   |                                        |-- Versioned clarify/challenge/refine
   |                                        |-- Skill routing + RF receipts
   |                                        `-- Acceptance + selective memory
   |          |
   |          `--> Operator state
   |                 |-- Missions and receipts
   |                 |-- Skills and mastery
   |                 `-- Simulated RF ledger
   |
   `--> FriendSDK wallet session --> Robinhood Chain
                                      |-- Owned Generations NFTs
                                      |-- On-chain sprites + Friend wallets
                                      `-- Read-only RF balance
```

The GitHub Pages demo is static and uses deterministic offline mission and review reports. `api/mission.ts` is available for serverless mission execution configured with `OPENAI_API_KEY`; a live review endpoint is not yet enabled.

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

Every push to `main` runs the production build and twenty-two desktop/mobile browser journeys before publishing `dist/` through GitHub Pages.

## Known limitations

- Economic actions and operator balances are simulated; only connected-wallet holdings are live read-only data.
- The signature confirms the local session but is not server-authenticated.
- GitHub Pages uses deterministic offline reports because it cannot host the serverless AI function.
- Mission Review acceptance, memory, and mission links are local-first and are not yet synchronized across devices.
- Skill submissions, moderation, payouts, pricing, success scoring, and public task markets are product concepts, not live services.
- Operator proficiency levels are FriendOS progression and are separate from canonical Generations tiers, upgrades, and promotions.
- The generated operator portrait sheet is original presentation artwork; owned Friends also retain canonical on-chain sprite identity data.
