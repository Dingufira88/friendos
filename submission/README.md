# FriendOS

**Your Rare Friend can think, work, and spend.**

Builder: [@Dingufira88](https://github.com/Dingufira88)

Categories: Character Spotlight · Token Activity · Economy Potential

## One sentence

FriendOS turns a Rare Friends Generations NFT into an AI operator that spends $RAREFRIENDS on useful missions, earns persistent XP and CRED, and builds an economic history of its work.

## Working interaction

1. Choose a Rare Friend.
2. Enter its command center.
3. Assign a Research Mission.
4. Review and authorize the 5 RF cost.
5. Watch the Friend work through the mission.
6. Receive a structured report and economic receipt.
7. Revisit the Friend's persistent activity ledger.

## Why it belongs in Rare Friends

The Generations NFT is the operator, not decoration. Its deterministic identity, skills, XP, CRED, wallet budget and receipts remain attached to that Friend. The owner is assigning work to a digital friend that already fits the Rare Friends thesis: Friends have wallets, and wallets have Friends.

## $RAREFRIENDS economy

Research Mission costs 5 RF:

- 2.5 RF proposed burn
- 2 RF proposed compute/service treasury
- 0.5 RF proposed ecosystem pool
- 50 XP and 3 non-transferable CRED earned by the Friend

All RF balances, spending and burns in the Vibeathon build are simulated. No on-chain transaction occurs. CRED is internal reputation, not a launched token.

Long term, third-party builders can publish skills and mission templates. RF purchases and powers useful work; CRED records productive reputation and can unlock advanced skills, additional slots, and marketplace participation.

## Stack

- React, TypeScript and Vite
- Zustand persistence
- Framer Motion
- Zod validation
- OpenAI Responses API through an optional server-side function
- Browser wallet adapter for Robinhood mainnet
- Playwright desktop and mobile checks

FriendSDK is not used because FriendOS is an agent/tool rather than a sandboxed game. Its official Generations deployment and Robinhood network configuration informed the optional wallet adapter.

## Source and demo

- Source: https://github.com/Dingufira88/friendos
- Static demo: https://dingufira88.github.io/friendos/

The static demo automatically uses the offline report provider. A serverless deployment with `OPENAI_API_KEY` enables live AI reports without exposing credentials to the browser.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run build
npm run test:e2e
```

The automated journey covers Friend selection, Command Center navigation, Research Mission execution, the RF receipt, persistent balance changes, and the activity ledger on desktop and mobile viewports.

## Known limitations

- Wallet connection and Robinhood network switching are implemented, but owned Generations discovery remains a post-Vibeathon integration.
- RF accounting is simulated and stored locally.
- Static hosting uses the offline report provider; live AI requires the included serverless endpoint.
- Demo Friend artwork is placeholder presentation art pending canonical artwork integration.
