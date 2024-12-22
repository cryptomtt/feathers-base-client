declare module '@privy-io/react-auth' {
  import { FC, ReactNode } from 'react';
  
  export interface WalletWithProvider {
    address: string;
    chainId: number;
    getEthersProvider: () => Promise<any>;
    sign: (message: string) => Promise<string>;
    switchChain: (chainId: number) => Promise<void>;
  }

  interface PrivyUser {
    id: string;
    createdAt: string;
    hasAcceptedTerms: boolean;
    isGuest: boolean;
    linkedAccounts: {
      email?: { 
        address: string;
        verified: boolean;
      };
      google?: {
        email: string;
        subject: string;
      };
      facebook?: {
        email: string;
        subject: string;
      };
      phone?: {
        number: string;
        verified: boolean;
      };
      wallet?: {
        address: string;
        chainId: number;
        verified: boolean;
      };
    };
    verifiedEmails: string[];
    verifiedPhones: string[];
    verifiedWallets: {
      address: string;
      chainId: number;
    }[];
  }

  export interface PrivyInterface {
    ready: boolean;
    authenticated: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    wallets: WalletWithProvider[];
    user: PrivyUser | null;
    getAccessToken: () => Promise<string>;
  }

  export interface PrivyClientConfig {
    loginMethods?: string[];
    defaultChain?: any;
    supportedChains?: any[];
    appearance?: {
      theme?: 'light' | 'dark';
    };
    embeddedWallets?: {
      createOnLogin?: 'users-without-wallets' | 'all-users' | 'no-users';
      noPromptOnSignature?: boolean;
    };
  }

  export interface PrivyProviderProps {
    appId: string;
    config?: PrivyClientConfig;
    children: ReactNode;
  }

  export const PrivyProvider: FC<PrivyProviderProps>;
  export const usePrivy: () => PrivyInterface;
  export const useWallets: () => {
    wallets: WalletWithProvider[];
  };
} 