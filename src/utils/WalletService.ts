// src/hooks/useWallet.ts
import { useEffect, useState } from 'react';
import { initWallet, connectWallet } from './Wallet';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);

  // 初始化时自动尝试连接
  useEffect(() => {
    const loadAccount = async () => {
      const acc = await initWallet();
      setAccount(acc ? acc.address : null);
    };
    loadAccount();
  }, []);

  // 手动连接
  const handleConnect = async () => {
    const acc = await connectWallet();
    setAccount(acc);
  };

  return { account, connect: handleConnect };
}