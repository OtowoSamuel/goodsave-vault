import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { celo, foundry } from 'wagmi/chains';
import { defineChain } from 'viem';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'goodsave-dev-fallback';

// Celo Sepolia Testnet (replaces the decommissioned Alfajores)
const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://celo-sepolia.blockscout.com' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'GoodSave',
  projectId,
  chains: [foundry, celo, celoSepolia],
  transports: {
    [foundry.id]: http('http://127.0.0.1:8545'),
    [celo.id]: http(),
    [celoSepolia.id]: http('https://forno.celo-sepolia.celo-testnet.org'),
  },
  ssr: false,
});
