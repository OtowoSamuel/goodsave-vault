# Product Requirements Document: GoodSave (G$ Micro-Savings & Yield Vault)

## 1. Executive Summary

GoodSave is a DeFi-native savings primitive for G$ holders. With over 700K+ claimers in the GoodDollar ecosystem, there is currently no productive use for G$ beyond peer-to-peer transfers. GoodSave solves this by offering a fixed-term savings vault that allows users to deposit their G$ and earn a predictable yield.

Aligned with GoodBuilders Season 4, GoodSave represents a real, non-trivial G$ integration that targets the program's core audience, aiming to increase total value locked (TVL) and provide a measurable growth lever for the GoodDollar economy.

## 2. Problem & Solution

**The Problem:** 700K+ GoodDollar claimers have no productive, on-chain use for their accumulated G$.
**The Solution:** GoodSave is a smart contract vault on Celo that accepts G$ deposits, locks them for a fixed term (e.g., 30 days), and generates yield for users who hold to maturity.

### Explicitly Out of Scope (v1)
- Multi-chain deployment (Celo only for v1).
- Native iOS/Android apps (Progressive Web App / mobile-responsive web only).
- Governance-voted yield mechanisms.
- Automated DEX Swaps (liquidity constraints require manual yield orchestration for v1).

## 3. Yield Source & Strategy

GoodSave utilizes a **Yield Orchestration** strategy to generate yield safely:
1. **Deposit:** User deposits G$ into the GoodSave vault via 1-click ERC-677 `transferAndCall`.
2. **Yield Streaming:** Since Superfluid is not available on Celo, we built a custom `GoodSaveStream` linear streaming module. This drips yield into the vault on a second-by-second basis over the term period.
3. **Manual Swap & Yield Generation:** Due to shallow G$/USDm Uniswap V3 liquidity, the strategy pivots to manual admin-triggered swaps of bulk funds when liquidity allows, depositing into Aave V3.
4. **Withdrawal:** At maturity, the principal + accrued yield is distributed to the user.

**Expected APY:** 5-8% (from Aave V3 lending rates and grant incentives).

### Fee Transparency & Risks
- **Regulatory:** Framed strictly as a "savings incentive" rather than an investment product to align with UBI token regulations.

## 4. User Flow & Early Withdrawal

1. **Onboarding:** User connects their wallet (MetaMask, Valora, etc.) via RainbowKit.
2. **Deposit:** User deposits G$ with a 1-click transaction bypassing standard ERC20 approvals.
3. **Lock:** Funds are locked for a 30-day term. The dashboard tracks the user's share of the incoming stream yield in real-time.
4. **Early Withdrawal Penalty:** Users *can* withdraw early, but they will forfeit **100% of accrued yield**. This forfeited yield is not burned; it is redistributed pro-rata to the remaining vault participants, creating a positive-sum incentive to hold to maturity.
5. **Maturity:** User withdraws principal + generated yield.

## 5. Technical Architecture

### 5.1 Smart Contract Layer
- **Language:** Solidity ^0.8.24
- **Framework:** Foundry (forge, cast, anvil) for native fuzzing and invariant testing.
- **Vault Standard:** **ERC-4626**.
- **Yield Mechanism:** Custom `GoodSaveStream` linear streaming contract.
- **Patterns:** OpenZeppelin Contracts v5.x (SafeERC20, Pausable, AccessControl).

### 5.2 Frontend & Infrastructure
- **Frontend:** Vite + React (TypeScript), Tailwind CSS v4.
- **Web3:** RainbowKit v2 + Wagmi v2 + viem. 
- **Environment:** Configured using dynamic `VITE_` environment variables for seamless local/testnet/mainnet switching.

## 6. Security & Audit Plan

- **Automated Analysis:** Slither, Aderyn, and Forge linters.
- **Testing:** Comprehensive unit, fuzz, and invariant testing via Foundry. Mainnet fork integration testing directly interacting with the GoodDollar Reserve.
- **Launch Safeguards:** Soft launch with a strict **deposit cap of 100,000 G$** during the pilot phase and an individual cap of 10,000 G$. Emergency `pause()` functions controlled by administration.

## 7. Metrics & KPIs

*Baseline Seed Liquidity:* 50,000 G$ provided by founder capital.

| Phase | Metric | Target |
|---|---|---|
| Week 4 (Pilot) | TVL | 100,000 G$ (Deposit Cap Reached) |
| Week 8 (Public) | TVL | 250,000 G$ |
| Week 12 | TVL | 500,000 G$ |
| Week 12 | Total Unique Savers | 500 |
| Week 12 | Retention | 70% of 30-day term users roll over deposits |

## 8. Revised Timeline (Execution Complete)

- **Week 1:** Finalized yield strategy (Aave V3 integration). Validated G$/USDm swap liquidity constraints.
- **Week 2:** Built core vault contract (ERC-4626) + linear streaming module.
- **Week 3:** Completed Yield strategy contract (Aave integration) + Mainnet Fork Integration tests.
- **Week 4:** Built Frontend MVP: RainbowKit connect, ERC-677 deposit flow, real-time dashboard. 
- **Week 5:** Completed automated security analysis. Fixed 14 audit findings (P0-P3).
- **Week 6:** Finalized deployment scripts (Local + Testnet mocks) for Soft Launch readiness.
