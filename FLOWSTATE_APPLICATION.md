# GoodSave (GoodBuilders Season 4)

## Summary
GoodSave is a permissionless vault that lets users deposit and lock GoodDollar (G$) for customizable terms to earn a variable APY sourced from Aave V3. The frontend provides gasless UX, lock-duration controls, and yield projections.

## Links
- Website / Demo: https://goodsave-vault.vercel.app
- GitHub repo: https://github.com/OtowoSamuel/goodsave-vault
- Flow State application draft: https://flowstate.network/flow-councils/application/42220/0x582e3314d4ef56c18930acb10bb64313525e7820/draft_7a3940d4205c

---

#### 1. Admin
- Project Name*: GoodSave (GoodBuilders Season 4)
- Manager Addresses*: PLEASE REPLACE with the EOA(s) you want as managers (example format: 0x1234...abcd)
- Default Funding Address*: 0x7dDc81eF207f7c08E66Ba16BE57444496b16148A

---

#### 2. Basics
- Description*:
	GoodSave makes it simple to grow G$ holdings by locking tokens into a transparent, auditable vault backed by Aave V3 strategies. Users choose a lock duration, preview projected returns, and deposit with a gasless-friendly frontend.
- Logo*: upload a 1:1 image (recommend: /public/assets/logo.png)
- Banner*: upload a 3:1 image (recommend: /public/assets/banner.png)
- Website*: https://goodsave-vault.vercel.app
- Demo/Application Link: https://goodsave-vault.vercel.app

---

#### 3. Social
- Twitter / X: https://x.com/OtowoSamuel (replace if different)
- Farcaster: (add Farcaster handle if available)
- Telegram Group: (add link)
- Discord: (add invite)
- Karma / Gardens Pool: (add links if used)

---

#### 4. Technical
- GitHub Repositories*:
	- https://github.com/OtowoSamuel/goodsave-vault
- Smart Contracts (Mainnet / Celo)
	- GoodSaveVault: 0x5Abcba0F71915a15ae0b2C437F0BC2c503568349
		- Etherscan: https://etherscan.io/address/0x5Abcba0F71915a15ae0b2C437F0BC2c503568349
	- GoodSaveStream: 0xd561e7431059160f49310138a404b0cfaa1c44cb
		- Etherscan: https://etherscan.io/address/0xd561e7431059160f49310138a404b0cfaa1c44cb
	- GoodSaveStrategy: 0x9893db0eeaa7612fb7f2cbb93f5b425a5ab579f3
		- Etherscan: https://etherscan.io/address/0x9893db0eeaa7612fb7f2cbb93f5b425a5ab579f3

Notes: these contracts were deployed and verified; include them in the Flow State form for metrics and verification.

---

#### 5. Additional
- Other Links:
	- Deployment notes: contracts/docs/MainnetDeployment.md
	- Broadcast artifact: contracts/broadcast/DeployMainnet.s.sol/42220/run-latest.json

---

If you want, I can replace the manager and funding addresses now (provide the EOA(s) or multisig), add social links, or upload logo/banner assets from the repo into this file.

---

## Round Application Draft Answers (Additional Form)

#### 1. Previous Participation
- 1.1 Have you participated in GoodBuilders before?*: No
- 1.2 Number of seasons: 0
- 1.3 Previous Karma updates: N/A (first-time applicant)
- 1.4 What's the current state of your project today?*:
	GoodSave is a live, functional Celo dApp with deployed and verified contracts on Celo mainnet and a production frontend. Core user flow (connect wallet, approve G$, deposit/lock, and monitor position) is implemented. Current focus is UX polish, onboarding friction reduction, and growth distribution for real user adoption.

#### 2. Maturity & Usage
- 2.1 Project Stage*: Live product
- 2.2 Lifetime Users (0 is valid if early)*: 10
- 2.3 Active Users*: 5
- 2.4 Active Users Frequency*: Weekly Active Users
- 2.5 Other relevant usage data:
	Mainnet contracts are deployed and verified. End-to-end deposit flow is functioning with approval and lock mechanics. We are currently transitioning from builder/testing usage to broader community onboarding.

#### 3. Integration
- 3.1 G$ Integration Status*: Live
- 3.2 Integration Type*: G$ Supertoken/streaming
- 3.2 Integration Type*: Payments/rewards using G$
- 3.3 Describe your G$ integration & why it matters (1-3 sentences)*:
	GoodSave integrates G$ directly as the savings asset: users deposit and lock G$ to earn variable yield from an Aave V3 strategy, while preserving principal on early exits (yield forfeited). This gives GoodDollar users a simple path from passive holding to productive, transparent on-chain savings. It strengthens G$ utility by making long-term retention and recurring savings behavior economically meaningful.

#### 4. What you'll build
- 4.1 Primary Build Goal (1 sentence)*:
	Deliver a production-grade G$ savings experience on Celo with improved UX, safer contract operations, and clear user-facing yield transparency.
- 4.2 Build Milestones*:
	1. Finalize responsive UX and onboarding improvements (including Add G$ wallet flow and explorer-aware links).
	2. Expand analytics/events to track activation, deposit completion, and retention cohorts.
	3. Introduce growth-focused loops (referrals/campaign hooks) tied to saver milestones.
	4. Harden operations with monitoring, runbooks, and deployment governance practices.
- 4.3 Ecosystem Impact (1-2 sentences):
	GoodSave increases practical demand for G$ by turning it into an active savings primitive, not just a transfer token. More locked and reused G$ supports deeper ecosystem utility and stronger user retention across GoodDollar products.

#### 5. How you'll grow
- 5.1 Primary Growth Goal (1 sentence)*:
	Acquire and retain recurring G$ savers by making first deposit completion and repeat lock cycles frictionless.
- 5.2 Target Users, Communities, and/or Partners*:
	Existing GoodDollar holders, MiniPay/Celo users, community builders in GoodDollar and Celo channels, and ecosystem partners focused on financial inclusion use cases.
- 5.3 Growth Milestones*:
	1. Launch onboarding campaign for first deposits.
	2. Convert first-time depositors into repeat lockers through milestone prompts.
	3. Partner with ecosystem communities to drive qualified user cohorts.
	4. Publish transparent monthly metrics (users, deposits, retention trends).
- 5.4 Ecosystem Impact (1-2 sentences):
	Growth in GoodSave creates a compounding loop: more users hold and lock G$, protocol utility improves, and ecosystem partners gain a stronger base of financially engaged users.

#### 6. Team
- 6.1 Primary Contact Name*: PLEASE REPLACE
- 6.2 Primary Contact Role Description*: Product and engineering lead responsible for protocol integration, frontend delivery, growth operations, and ecosystem coordination.
- 6.3 Primary Contact Telegram: PLEASE REPLACE
- 6.4 Primary Contact GitHub or LinkedIn: https://github.com/OtowoSamuel
- 6.5 Additional Teammates:
	PLEASE REPLACE (add names, roles, and links if available)

#### 7. Additional
- 7.1 Additional comments:
	GoodSave is already live and mainnet-integrated; GoodBuilders support will directly accelerate user acquisition, retention loops, and product hardening for sustainable ecosystem impact.
- 7.2 How did you hear about GoodBuilders?: GoodBuilders Mentors

