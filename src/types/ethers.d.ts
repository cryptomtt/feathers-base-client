declare module 'ethers' {
  import { BrowserProvider, Contract, Eip1193Provider } from 'ethers';
  
  export {
    BrowserProvider,
    Contract,
    Eip1193Provider
  };
  
  export function parseUnits(value: string | number, decimals: number): bigint;
  export function formatUnits(value: bigint | string, decimals: number): string;
} 