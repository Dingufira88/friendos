# FriendOS

**Your Friend can think, work, and spend.**

FriendOS turns a Rare Friends Generations NFT into an AI-powered operator with a persistent identity, mission history, skills, reputation, and a simulated $RAREFRIENDS operating budget.

## Status

Phase 1 is complete: repository foundation, boot experience, Friend selection, and deterministic identity.

## Product phases

1. Foundation and Friend selection
2. Command Center (complete)
3. Research Mission vertical slice (complete with demo agent)
4. Progression, economic ledger, and receipts (complete with per-Friend local persistence)
5. Real AI and wallet enhancements (Responses API endpoint, offline fallback, and optional Robinhood wallet connection complete)
6. Testing, deployment, and Vibeathon submission (complete)

## Public preview

The deployment workflow publishes the static, offline-capable build to `https://dingufira88.github.io/friendos/` after the production build and browser tests pass.

The release gate is one complete interaction: select a Friend, run a Research Mission, spend simulated RF, receive a result, earn XP and CRED, and save the receipt.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Local Vite development always uses the offline report fallback. Deploy with a serverless host that supports the `/api/mission` function and set `OPENAI_API_KEY` to enable live reports. See `.env.example`; never expose the key with a `VITE_` prefix.

## Economy disclosure

The MVP economy is simulated. No on-chain transaction occurs. CRED is internal, non-transferable reputation and is not a launched token.
