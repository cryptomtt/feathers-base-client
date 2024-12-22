import type { AppType } from './feathers';
import type { WalletWithProvider } from '@privy-io/react-auth';
import { BrowserProvider, type Eip1193Provider } from 'ethers';

export async function authenticateWithPrivy(app: AppType, wallet: WalletWithProvider) {
  try {
    // Get the wallet's provider
    const provider = await wallet.getEthersProvider();
    
    // Message to sign
    const message = 'Sign this message to authenticate with our service';
    
    // Get signature using ethers v6 syntax
    const signature = await wallet.sign(message);
    
    // Authenticate with backend
    const result = await app.authenticate({
      strategy: 'privy',
      walletAddress: wallet.address,
      signature: signature,
      message: message
    });

    return result;
  } catch (error) {
    console.error('Privy authentication error:', error);
    throw error;
  }
} 