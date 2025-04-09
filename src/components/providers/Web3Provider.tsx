'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Checking connection...');
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log('Connected to network:', network);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          console.log('Connected account:', accounts[0].address);
          setAccount(accounts[0].address);
          setProvider(provider);
          setSigner(signer);
        } else {
          console.log('No accounts connected');
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    } else {
      console.log('MetaMask not installed');
    }
  };

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Connecting to wallet...');
        const provider = new BrowserProvider(window.ethereum);
        
        // 请求连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await provider.listAccounts();
        const signer = await provider.getSigner();
        
        console.log('Connected to account:', accounts[0].address);
        setAccount(accounts[0].address);
        setProvider(provider);
        setSigner(signer);
      } catch (error) {
        console.error('Failed to connect:', error);
        throw error;
      }
    } else {
      console.error('Please install MetaMask!');
      alert('Please install MetaMask!');
    }
  };

  const disconnect = () => {
    console.log('Disconnecting...');
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  useEffect(() => {
    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Account changed:', accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkConnection(); // 重新获取 provider 和 signer
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        console.log('Network changed, reloading...');
        window.location.reload();
      });

      window.ethereum.on('connect', (connectInfo: { chainId: string }) => {
        console.log('Wallet connected:', connectInfo);
        checkConnection();
      });

      window.ethereum.on('disconnect', (error: { code: number; message: string }) => {
        console.log('Wallet disconnected:', error);
        disconnect();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('connect', () => {});
        window.ethereum.removeListener('disconnect', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{ account, provider, signer, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
} 