'use client';

import React from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { bscTestnet } from '@/config/chains';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet', 'email'],
        defaultChain: bscTestnet,
        supportedChains: [bscTestnet],
        appearance: {
          theme: 'light',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
} 