# Mythomachy: Clash of Legends

> **Next-Generation Real-Time Fighting Game Engineered for Monad's 10,000 TPS Parallel Execution**  
> Melding high-octane 60 FPS fighting game combat with instantaneous (<600ms) on-chain gacha summons and verifiable match settlement on Monad Testnet.

---

## Live Links & Smart Contract Verification

* **Project Name**: Mythomachy: Clash of Legends
* **Live Web Application**: `[INSERT_LIVE_VERCEL_URL_HERE]`
* **GitHub Repository**: `[INSERT_PUBLIC_GITHUB_REPO_URL_HERE]`
* **Monad Testnet Contract Address**: [`0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3`](https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3)
* **Monad Testnet Explorer**: [https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3](https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3)
* **Monad Testnet Chain ID**: `10143` (`0x279f`) | Native Token: `MON`
* **Monad Mainnet Contract Address**: `[INSERT_MAINNET_ADDRESS_OR_TBD]`

---

## 1. What It Does & Core Mechanics

Mythomachy is a browser-based, high-fidelity competitive fighting game featuring mythological gods and folklore legends from diverse world mythologies. Unlike traditional Web3 games that suffer from cumbersome wallet confirmation dialogs or heavy 3D asset downloads, Mythomachy runs entirely in the browser with **instant start-up, zero external `.glb` dependencies, zero blockchain terminology friction, and 60 FPS deterministic physics**.

### Key Combat & Gameplay Features:
1. **Dynamic Dual-View 2D/3D Fighting Engine**:
   - Players can toggle between classic 2D orthographic fighting arcade mode and cinematic 3D perspective mode in real time without pausing or resetting combat.
   - Built on procedural articulated Three.js rigs with custom bone hierachies, dynamic limb kinematics, and zero external 3D asset loading overhead.
2. **11 Mythological Legends**:
   - **8 Vanguard Legends (Unlocked by default)**:
     - **Gatotkaca** (Indonesian Mythology) - *Satria Pringgondani* with Brajamusti power punches and iron-bone defense.
     - **Athena** (Greek Mythology) - Goddess of tactical combat wielding the Aegis parry shield and spear thrusts.
     - **Thor** (Norse Mythology) - God of Thunder wielding Mjolnir with chain lightning and electrical stuns.
     - **Anubis** (Egyptian Mythology) - Guardian of the underworld with soul-stealing life drain and jackal fury.
     - **Susanoo** (Japanese Mythology) - Storm god with rapid Murakumo katana multi-slashes.
     - **Garuda** (Indonesian / Hindu Mythology) - Lord of the skies with dual articulated golden wings and aerial cyclones.
     - **Sun Wukong** (Chinese Mythology) - The Monkey King with acrobatic Ruyi Jingu Bang staff extensions.
     - **Quetzalcoatl** (Aztec Mythology) - The Feathered Serpent with emerald dual wings and vortex topan pulls.
   - **3 Apex Legends (Locked behind Kuil Pemanggilan Gacha)**:
     - **Gilgamesh** (Mesopotamian Mythology) - King of Uruk summoning Gate of Babylon celestial golden blades.
     - **Nyi Roro Kidul** (Indonesian Mythology) - Queen of the Southern Ocean summoning crushing tidal waves and ocean heal.
     - **Chronos-Aethelgard** (Primordial Titan of Time) - Manipulates temporal fields to slow opponents down by 80%.
3. **Kuil Pemanggilan (On-Chain Gacha Temple with Guaranteed Pity)**:
   - Full on-chain verifiable summons executed directly on Monad (`summonApexLegend(uint256 clientSeed)`).
   - 35% base chance to summon an Apex Legend.
   - **Guaranteed Pity Protection**: Hard pity guarantees an unowned Apex Legend on or before the **4th pull** (`pityCounter >= 4`).
   - Duplicate pulls reward 25 Relic Shards; collecting **75 Relic Shards** automatically converts into an Apex Legend.
4. **Dynamic Camera Occlusion Transparency**:
   - Real-time Three.js raycasting checks line-of-sight from the active camera to both fighters.
   - Any foreground obstacle (marble pillars, lush trees) blocking fighter visibility smoothly transitions to `0.20` opacity with depth-write toggling, preventing visual obstruction.
5. **Strict Anti-Clipping Sub-Stepped Collision Physics**:
   - Sub-stepped cylindrical collision solver (`minDistance = r1 + r2`) prevents fighters from ever clipping through or overlapping each other during dash bursts, leaps, or wall bounces.
6. **3 Immersive Battle Arenas**:
   - **Sanctum of Monad**: Floating purple obelisks with point light illuminations.
   - **Primeval Othrys**: Ancient marble pantheon columns with dynamic camera-occluding foreground trees.
   - **Chronos Horizon**: Real-time atmospheric skybox and solar illumination synchronized with the player's local device clock (Dawn, Day, Golden Sunset, Midnight).
7. **Public & Private Waiting Rooms with QR Code Joining**:
   - Host private lobbies with 6-character room codes (`bytes6`), instant URL sharing, and scannable SVG QR codes for instant mobile-to-desktop cross-device duels.
8. **Web Audio API Procedural Synthesizer**:
   - Custom real-time audio synthesis engine generating heavy punches, slash whooshes, thunder strikes, ocean waves, and victory chimes without downloading external `.mp3` or `.wav` files.

---

## 2. Why Monad (Architecture Fit & Technical Innovation)

Mythomachy was purposefully architected from day one to exploit the breakthrough technical properties of Monad:

```
+-----------------------------------------------------------------------------------+
|                            MYTHOMACHY ARCHITECTURE                                |
|                                                                                   |
|   +-----------------------+     60 FPS Loop      +----------------------------+   |
|   | 60 FPS Off-Chain      | -------------------> | Rolling Keccak-256 State   |   |
|   | Combat Physics Engine |                      | Rollback Motion Hash       |   |
|   +-----------------------+                      +----------------------------+   |
|               |                                                |                  |
|               | Sub-600ms Silent Background Tx                 | Commit on Settle |
|               v                                                v                  |
|   +---------------------------------------------------------------------------+   |
|   |                  MONAD TESTNET (10,000 TPS / CHAIN ID 10143)              |   |
|   |                                                                           |   |
|   |   * 0.3s Block Time & 0.6s Finality: Instantaneous confirmation           |   |
|   |   * eth_sendRawTransactionSync: Synchronous receipt in single round-trip  |   |
|   |   * MonadDb Parallel Execution: mapping(address => PlayerProfile)         |   |
|   |     Isolated memory slots eliminate cross-contract write locks            |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

### 1. Sub-600ms Instant Finality via `eth_sendRawTransactionSync`
Traditional Ethereum transactions require 12 to 15 seconds per block, which completely destroys the pace of an arcade fighting game. Monad's **0.3-second block times and 0.6-second 1-slot BFT finality** allow Mythomachy to submit gacha pulls and match settlement proofs via `eth_sendRawTransactionSync`. Players receive confirmed on-chain receipts before their victory animation finishes, with zero waiting screens.

### 2. MonadDb & Optimistic Parallel Execution Harmony
In traditional EVMs, games storing state in a shared array or monolithic game loop encounter state-access write locks when multiple matches settle concurrently. Mythomachy's smart contract (`MythomachyArena.sol`) isolates all mutating player state inside independent storage slots:
```solidity
mapping(address => PlayerProfile) private profiles;
mapping(bytes6 => Room) public rooms;
```
Because match settlements for Room A (`rooms[codeA]`) and player A (`profiles[addrA]`) access entirely different storage keys from Room B (`rooms[codeB]`) and player B (`profiles[addrB]`), Monad's **Optimistic Parallel Execution engine processes hundreds of simultaneous match results concurrently with zero lock contention**.

### 3. Gas Pricing Predictability (Gas Limit Accounting)
Monad computes gas costs based on transaction `gas_limit` rather than variable fluctuating gas used. Mythomachy precisely caps contract invocation limits to 250,000 gas, ensuring deterministic micro-fees and preventing failed transaction gas drains.

---

## 3. Product-Market Fit & Revenue Strategy

### Target Market & Competitive Edge:
* **The Web2 Fighter Audience**: Millions of competitive players love games like *Street Fighter*, *Guilty Gear*, and *Tekken*, but abandon Web3 games due to sluggish MetaMask popup interruptions on every attack or summon. Mythomachy delivers a pure, responsive 60 FPS combat experience with invisible background signing.
* **The Web3 Competitive & Gacha Audience**: Crypto natives demand true asset ownership, provable fairness in gacha drop rates, and verifiable win/loss match records. Mythomachy provides verifiable on-chain pity mechanisms and cryptographically anchored match settlement receipts.

### Three-Pillar Sustainable Revenue Model:
1. **Kuil Pemanggilan (Gacha Summons) Micro-Transactions**:
   - Players can summon Apex Legends using testnet/mainnet MON.
   - Guaranteed transparent on-chain pity protection builds immense trust compared to opaque Web2 gacha games.
2. **Cosmetic Arena Skins & Custom Battle Passes**:
   - Seasonal map themes, specialized visual auras, custom weapon glyphs, and character recolors sold directly through smart contract passes without pay-to-win stat advantages.
3. **Sponsored Tournament Rooms with Protocol Settlement Fees**:
   - Esports organizers, guilds, and DAOs can host sponsored tournament rooms (`createRoom`) with customizable entrance stakes. The protocol claims a modest 2.5% settlement fee upon executing `settleMatch`.

---

## 4. Smart Contract Functions & Architecture

The smart contract `MythomachyArena.sol` is deployed at address [`0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3`](https://testnet.monadexplorer.com/address/0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3) on Monad Testnet (Chain ID `10143`).

| Function | Type | Description | Frontend Binding |
|---|---|---|---|
| `getPlayerProfile(address)` | `view` | Fetches bitmask unlock flags, pity counter, relic shards, and victory records | Auto-loaded in Header, Lobby, and Gacha Temple |
| `summonApexLegend(uint256 clientSeed)` | `payable` | Executes random on-chain gacha pull with 4-pull pity and 75-shard redemption | Kuil Pemanggilan modal & Judge Verification Bar |
| `createRoom(bytes6 roomCode, bool isPrivate, uint8 mapId)` | `external` | Initializes a new active waiting room on-chain | Lobby Create Room modal |
| `joinRoom(bytes6 roomCode)` | `external` | Matches challenger into the specified room code | Join Room by Code input & QR Code scanner |
| `settleMatch(bytes6 roomCode, address winner, uint8 host, uint8 challenger)` | `external` | Verifies victor, increments match stats, awards 15 relic shards, closes room | Automated post-match KO trigger |

---

## 5. Step-by-Step Local Setup & Reproduction Guide

Judges and developers can reproduce and run Mythomachy locally from scratch without external assistance.

### Prerequisites:
* **Node.js**: `v20.0.0` or higher (verified on Node v20/v22)
* **Package Manager**: `npm` or `pnpm` (pnpm v9+ recommended)
* **Git**: Installed and configured

### Step 1: Clone Repository & Install Dependencies
```bash
git clone [INSERT_PUBLIC_GITHUB_REPO_URL_HERE]
cd Mythomachy
npm install
```

### Step 2: Configure Environment Variables
Copy the provided `.env.example` file to `.env`:
```bash
cp .env.example .env
```
The application comes pre-configured with the official deployed contract address (`0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3`) and Monad Testnet RPC (`https://testnet-rpc.monad.xyz`).

### Step 3: (Optional) Recompile Smart Contract
To compile the Solidity contract locally using solc `0.8.24`:
```bash
npm run compile
```
This generates `src/config/contractArtifact.json` containing the clean ABI and bytecode.

### Step 4: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Step 5: Production Build Verification
To verify TypeScript types and bundle the production build:
```bash
npm run build
```
The output directory is created at `dist/` ready for immediate deployment on Vercel or Netlify.

---

## 6. How to Test for Hackathon Judges

1. **Launch App**: Open `http://localhost:5173` (or the live URL).
2. **Inspect Judge Verification Bar**: At the bottom of the screen, view the current Session Burner Wallet, Live Monad Testnet Contract, and balance.
3. **Test On-Chain Proof**: Click **`TRIGGER LIVE ON-CHAIN PROOF`** to execute an immediate live transaction on Monad Testnet and inspect the transaction hash directly on Monad Explorer.
4. **Try Kuil Pemanggilan (Gacha)**: Click the **KUIL PEMANGGILAN** button in the header dock, pull an Apex Legend, and observe the live on-chain pity counter updating in real time.
5. **Start Combat**: Select **Gatotkaca** or **Thor**, choose an arena (e.g. *Primeval Othrys*), and enter combat. Test camera occlusion transparency by stepping behind the foreground trees.
6. **Toggle 2D/3D**: Switch between 2D and 3D camera modes seamlessly on the top bar or pause menu.
7. **Inspect Audit View**: Click the **Audit & Telemetri** button in the header dock to view real-time Monad RPC latency, block heights, and raw contract ABI inspectors.

---

## Technical Documentation Index in `docs/`

For deep technical specifications, refer to the exhaustive documentation in the [`docs/`](docs/) directory:
* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Rigging hierarchies, state machines, and dual-wallet network flows.
* [`docs/SMART_CONTRACT.md`](docs/SMART_CONTRACT.md): Bitmask 16-bit encoding, pseudo-random entropy, and parallel storage design.
* [`docs/COMBAT_ENGINE.md`](docs/COMBAT_ENGINE.md): 60 FPS physics loops, anti-clipping cylinder solvers, and camera occlusion raycasting.
* [`docs/CHARACTERS_GUIDE.md`](docs/CHARACTERS_GUIDE.md): Movesets, damage multipliers, and lore for all 11 mythological legends.
* [`docs/WALLETS_AND_NETWORKING.md`](docs/WALLETS_AND_NETWORKING.md): Session burner architecture, MetaMask EIP-1193 service, and auto-faucet fallbacks.
* [`docs/TELEMETRY_AND_AUDIT.md`](docs/TELEMETRY_AND_AUDIT.md): Telemetry metrics, RPC inspectors, and interactive playgrounds.
* [`docs/DEPLOYMENT_AND_SETUP.md`](docs/DEPLOYMENT_AND_SETUP.md): Step-by-step compilation, deployment, and testing guide.

---

## License

MIT License. Developed for the Monad Hackathon 2026.
