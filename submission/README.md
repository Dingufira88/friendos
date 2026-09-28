# FriendOS

**Your Rare Friend can think, work, and spend.**

- **Builder:** [@Dingufira88](https://github.com/Dingufira88)
- **Contact:** GitHub profile above
- **Categories:** Character Spotlight · Token Activity · Economy Potential
- **Source:** https://github.com/Dingufira88/friendos
- **Working demo:** https://dingufira88.github.io/friendos/
- **FriendSDK:** v0.1.2 advanced wallet, owned-Friend, public-client, and sprite modules

## One sentence

FriendOS turns a Generations NFT into a persistent AI operator that uses skills to complete useful missions, spends simulated `$RAREFRIENDS`, earns mastery and reputation, and preserves an economic history on that Friend's profile.

## How to try it

No wallet is required for the complete judging flow.

1. Select one of the three guest operators.
2. Open **What can this Friend do?** to inspect its abilities.
3. Choose Social Content, Blockchain Analytics, Narrative Strategy, or Quick Ask.
4. Enter a brief and launch the mission.
5. Continue exploring while the compact progress panel shows the Friend working.
6. Review the detailed report and economic receipt.
7. Open Agent Profile to see the Friend's mission history, wallet ledger, XP, skills, and mastery.
8. Visit Skills to install a community skill on a selected operator or try the no-code Skill NFT training concept.

Optional wallet flow: connect an injected wallet, switch to Robinhood Chain, sign the free session-confirmation message, and FriendOS discovers up to three owned Generations NFTs plus canonical sprite data, Friend wallet addresses, and the connected wallet's real RF balance.

## Working core interaction

```text
Select Friend → inspect abilities → assign mission → spend simulated RF
→ receive useful output + receipt → relevant skill gains mastery
→ result remains in that Friend's history
```

## Character Spotlight

The NFT is the operator and state boundary. Every token ID has a separate identity, Generations metadata, Friend wallet, mission history, receipts, RF operating budget, spending policy, installed skills, mastery, XP, CRED, and level.

Switching operators changes the complete working profile, not only the avatar.

## Token Activity

The demo models recurring RF demand through mission execution, skill installation, skill usage, operator funding, and future training and public task participation.

Research-style missions demonstrate a proposed 50% burn allocation, with the remainder representing compute/service and ecosystem allocation. Marketplace skills add a proposed developer revenue share.

All economic actions are simulated and clearly separated from the connected wallet's live read-only RF holdings. No approval, transfer, burn, or other on-chain transaction occurs.

## Economy Potential

Third-party developers can publish specialized skills and earn a proposed percentage of usage fees. Non-developers can participate through the Skill NFT training concept: mint a free trainee, select its expertise, approve or reject evidence-backed conclusions, build judgment XP, complete public tasks, and establish accuracy and success metrics that inform marketplace price.

Developer submissions, moderation, public task markets, skill pricing, and payouts are not live in this MVP.

## FriendSDK and stack

FriendOS is a standalone web agent/tool rather than a sandboxed SDK game. It uses FriendSDK v0.1.2 for wallet discovery, Robinhood Chain lifecycle, public-chain reads, owned Generations discovery, and canonical on-chain sprite data.

The remaining stack is React, TypeScript, Vite, Zustand, Framer Motion, Zod, an optional OpenAI Responses API serverless endpoint, and Playwright.

## Checks

- Production TypeScript/Vite build passes.
- Twelve Playwright journeys pass in desktop Chromium and a Pixel 7 mobile viewport.
- CI builds and tests every push before GitHub Pages deployment.
- Public Pages deployment is verified at the demo link above.

## Assets

- Canonical Generations identity data and sprites are read through FriendSDK.
- The three guest operator portraits are original AI-generated presentation artwork created for FriendOS.
- Silkscreen is used for display typography to align with the Rare Friends visual language.

## Known limitations and risks

- Mission spending, burns, rewards, developer shares, and operator balances are simulated browser state.
- Connected-wallet RF holdings are read-only and are not used automatically by missions.
- The signature confirms a local session and is not server-authenticated.
- The static GitHub Pages demo uses deterministic offline reports; a serverless deployment with `OPENAI_API_KEY` enables live AI.
- Skill quality scoring, moderation, developer payouts, contribution submissions, and public task execution are future integrations.
- FriendOS operator levels describe task proficiency and are separate from canonical Generations protocol tiers and upgrades.
