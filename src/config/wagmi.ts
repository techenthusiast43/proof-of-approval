import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botChainTestnet, botChainMainnet } from './botChain';

// Project ID from cloud.reown.com or demo/fallback
export const projectId =
  (import.meta as any).env?.VITE_REOWN_PROJECT_ID ||
  '21fef48091f12692cad574a6f7753648'; // Public demo walletconnect project ID

export const networks = [botChainTestnet, botChainMainnet] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [botChainTestnet, botChainMainnet],
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChainTestnet, botChainMainnet],
  defaultNetwork: botChainTestnet,
  projectId,
  metadata: {
    name: 'ProofOfApproval',
    description: 'BOT Chain Decentralized Governance & Approval Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://proofofapproval.io',
    icons: ['https://proofofapproval.io/icon.png'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#10b981',
    '--w3m-border-radius-master': '8px',
  },
});

export const config = wagmiAdapter.wagmiConfig;

