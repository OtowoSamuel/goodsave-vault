import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { defineChain } from 'viem';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'goodsave-dev-fallback';

const celoMainnet = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io/apis?id=42220' },
  },
});

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
  chains: [foundry, celoMainnet, celoSepolia],
  transports: {
    [foundry.id]: http('http://127.0.0.1:8545'),
    [celoMainnet.id]: http('https://forno.celo.org'),
    [celoSepolia.id]: http('https://forno.celo-sepolia.celo-testnet.org'),
  },
  ssr: false,
});
