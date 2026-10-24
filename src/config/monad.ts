import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com'
    }
  },
  testnet: true
});

export const MONAD_CONFIG = {
  chainId: 10143,
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  explorerUrl: 'https://testnet.monadexplorer.com',
  chainName: 'Monad Testnet',
  currencySymbol: 'MON',
  blockTimeMs: 300,
  finalityMs: 600
};
