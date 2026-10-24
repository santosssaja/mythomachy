import { useState, useEffect } from 'react';
import {
  createWalletClient,
  custom,
  formatEther,
  getAddress,
  parseEther,
  EIP1193Provider
} from 'viem';
import { monadTestnet, MONAD_CONFIG } from '../config/monad';
import { publicClient } from './monadRpc';

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  isMonadTestnet: boolean;
  balance: string;
  rawBalance: bigint;
  isConnecting: boolean;
  error: string | null;
}

const MONAD_CHAIN_ID = MONAD_CONFIG.chainId; // 10143
const MONAD_HEX_CHAIN_ID = `0x${MONAD_CHAIN_ID.toString(16)}`; // '0x279f'

let currentState: MetaMaskState = {
  isInstalled: typeof window !== 'undefined' && Boolean(window.ethereum),
  isConnected: false,
  address: null,
  chainId: null,
  isMonadTestnet: false,
  balance: '0.0000 MON',
  rawBalance: 0n,
  isConnecting: false,
  error: null
};

const listeners = new Set<(state: MetaMaskState) => void>();

function notify() {
  listeners.forEach(fn => fn({ ...currentState }));
}

function updateState(partial: Partial<MetaMaskState>) {
  currentState = { ...currentState, ...partial };
  notify();
}

/**
 * Check if MetaMask / web3 browser wallet is injected
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

/**
 * Fetch on-chain MON balance of connected MetaMask address
 */
export async function refreshMetaMaskBalance(address?: `0x${string}`): Promise<string> {
  const addr = address || currentState.address;
  if (!addr) return '0.0000 MON';

  try {
    const raw = await publicClient.getBalance({ address: addr });
    const eth = Number(formatEther(raw));
    const formatted = `${eth.toFixed(4)} MON`;
    updateState({ balance: formatted, rawBalance: raw });
    return formatted;
  } catch {
    return currentState.balance;
  }
}

/**
 * Prompt MetaMask to switch to Monad Testnet or register the chain if not added yet
 */
export async function switchToMonadTestnet(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_HEX_CHAIN_ID }]
    });
    updateState({ isMonadTestnet: true, chainId: MONAD_CHAIN_ID });
    return true;
  } catch (switchError: unknown) {
    // Error code 4902 indicates chain is not added to MetaMask yet
    const err = switchError as { code?: number; message?: string };
    if (err?.code === 4902 || err?.message?.includes('unrecognized') || err?.message?.includes('4902')) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MONAD_HEX_CHAIN_ID,
              chainName: 'Monad Testnet',
              nativeCurrency: {
                name: 'Monad',
                symbol: 'MON',
                decimals: 18
              },
              rpcUrls: [MONAD_CONFIG.rpcUrl],
              blockExplorerUrls: [MONAD_CONFIG.explorerUrl]
            }
          ]
        });
        updateState({ isMonadTestnet: true, chainId: MONAD_CHAIN_ID });
        return true;
      } catch (addError) {
        console.error('Failed to add Monad Testnet:', addError);
        return false;
      }
    }
    console.error('Failed to switch to Monad Testnet:', switchError);
    return false;
  }
}

/**
 * Connect to MetaMask and request user accounts
 */
export async function connectMetaMask(): Promise<{ success: boolean; address?: `0x${string}`; error?: string }> {
  if (!window.ethereum) {
    const err = 'MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask di peramban Anda.';
    updateState({ error: err });
    window.open('https://metamask.io/download/', '_blank');
    return { success: false, error: err };
  }

  updateState({ isConnecting: true, error: null });

  try {
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts'
    })) as string[];

    if (!accounts || accounts.length === 0) {
      updateState({ isConnecting: false, error: 'Tidak ada akun yang dipilih.' });
      return { success: false, error: 'Tidak ada akun yang dipilih.' };
    }

    const rawAddr = accounts[0];
    const checksummed = getAddress(rawAddr);

    // Check chain
    let chainIdNum: number | null = null;
    try {
      const hexChain = (await window.ethereum.request({ method: 'eth_chainId' })) as string;
      chainIdNum = parseInt(hexChain, 16);
    } catch {}

    const isMonad = chainIdNum === MONAD_CHAIN_ID;

    // Save auto-connect flag
    localStorage.setItem('mythomachy_metamask_connected', 'true');

    updateState({
      isInstalled: true,
      isConnected: true,
      address: checksummed,
      chainId: chainIdNum,
      isMonadTestnet: isMonad,
      isConnecting: false,
      error: null
    });

    // If connected on different chain, suggest switching to Monad
    if (!isMonad) {
      await switchToMonadTestnet();
    }

    // Refresh balance
    await refreshMetaMaskBalance(checksummed);

    return { success: true, address: checksummed };
  } catch (error: unknown) {
    const errObj = error as { code?: number; message?: string };
    const errMsg = errObj?.code === 4001
      ? 'Koneksi dibatalkan oleh pengguna di MetaMask.'
      : (errObj?.message || 'Gagal menyambungkan MetaMask.');

    updateState({ isConnecting: false, error: errMsg });
    return { success: false, error: errMsg };
  }
}

/**
 * Disconnect MetaMask session
 */
export function disconnectMetaMask() {
  localStorage.removeItem('mythomachy_metamask_connected');
  updateState({
    isConnected: false,
    address: null,
    isMonadTestnet: false,
    balance: '0.0000 MON',
    rawBalance: 0n,
    error: null
  });
}

/**
 * Initialize listeners for account & chain changes, auto-reconnecting if previously connected
 */
export function initMetaMask() {
  if (typeof window === 'undefined' || !window.ethereum) return;

  // Listen for account switches
  window.ethereum.on?.('accountsChanged', (accounts: unknown) => {
    const list = accounts as string[];
    if (list && list.length > 0) {
      const addr = getAddress(list[0]);
      updateState({ address: addr, isConnected: true });
      refreshMetaMaskBalance(addr);
    } else {
      disconnectMetaMask();
    }
  });

  // Listen for network / chain switches
  window.ethereum.on?.('chainChanged', (chainHex: unknown) => {
    const num = parseInt(chainHex as string, 16);
    updateState({
      chainId: num,
      isMonadTestnet: num === MONAD_CHAIN_ID
    });
    refreshMetaMaskBalance();
  });

  // Silent reconnect if previously authorized
  if (localStorage.getItem('mythomachy_metamask_connected') === 'true') {
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(async accounts => {
        const list = accounts as string[];
        if (list && list.length > 0) {
          const addr = getAddress(list[0]);
          let chainIdNum: number | null = null;
          try {
            const hex = (await window.ethereum!.request({ method: 'eth_chainId' })) as string;
            chainIdNum = parseInt(hex, 16);
          } catch {}

          updateState({
            isInstalled: true,
            isConnected: true,
            address: addr,
            chainId: chainIdNum,
            isMonadTestnet: chainIdNum === MONAD_CHAIN_ID
          });
          refreshMetaMaskBalance(addr);
        }
      })
      .catch(() => {});
  }
}

/**
 * Returns current snapshot of MetaMask state
 */
export function getMetaMaskState(): MetaMaskState {
  return { ...currentState };
}

/**
 * Subscribe to state changes
 */
export function subscribeMetaMask(listener: (state: MetaMaskState) => void): () => void {
  listeners.add(listener);
  listener({ ...currentState });
  return () => {
    listeners.delete(listener);
  };
}

/**
 * React Hook for seamless component integration
 */
export function useMetaMask(): MetaMaskState & {
  connect: () => Promise<{ success: boolean; address?: `0x${string}`; error?: string }>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshBalance: () => Promise<string>;
} {
  const [state, setState] = useState<MetaMaskState>(getMetaMaskState);

  useEffect(() => {
    return subscribeMetaMask(setState);
  }, []);

  return {
    ...state,
    connect: connectMetaMask,
    disconnect: disconnectMetaMask,
    switchNetwork: switchToMonadTestnet,
    refreshBalance: refreshMetaMaskBalance
  };
}

/**
 * Get Viem WalletClient powered by connected MetaMask
 */
export function getMetaMaskWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum || !currentState.address) {
    return null;
  }

  return createWalletClient({
    account: currentState.address,
    chain: monadTestnet,
    transport: custom(window.ethereum)
  });
}
