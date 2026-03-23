import { http, createConfig } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),            // For MetaMask and other injected wallets (including Coinbase)
    coinbaseWallet({      // Explicit Coinbase Wallet connector (optional)
      appName: 'SibolMarket',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});