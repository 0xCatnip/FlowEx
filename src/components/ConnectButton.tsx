import React, { useState, useEffect } from 'react';
import { Button } from 'antd';

interface ConnectButtonProps {}

const ConnectButton: React.FC<ConnectButtonProps> = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 检查是否已经连接
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await (window.ethereum as any).request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('检查连接状态失败:', error);
        }
      }
    };

    checkConnection();
    
    // 监听账户变化
    if (window.ethereum) {
      (window.ethereum as any).on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        (window.ethereum as any).removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  // 格式化账户地址显示
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Button
      type="primary"
      onClick={account ? disconnectWallet : connectWallet}
      loading={isConnecting}
    >
      {account ? formatAddress(account) : '连接钱包'}
    </Button>
  );
};

export default ConnectButton;
