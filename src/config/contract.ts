import artifact from './contractArtifact.json';

export const MYTHOMACHY_ABI = artifact.abi;
export const MYTHOMACHY_BYTECODE = artifact.bytecode;

// Fallback verified testnet contract address (or overridable via .env or settings/demo bar)
export const DEFAULT_CONTRACT_ADDRESS =
  (import.meta.env.VITE_MONAD_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x8E1256B48bF729F4a0a19Ccf22b827e81D3910A3';

export const REPOSITORY_URL = 'https://github.com/santoso/Mythomachy';
export const LIVE_DEMO_URL = window.location.origin;
