// src/context/WalletContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

type WalletContextType = {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);

  // 初始化检查连接状态
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) setAccount(accounts[0].address);
      }
    };
    init();
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const connect = async () => {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
  };

  const disconnect = () => setAccount(null);

  return (
    <WalletContext.Provider value={{ account, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}