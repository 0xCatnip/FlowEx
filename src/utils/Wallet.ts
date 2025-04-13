import { BrowserProvider } from "ethers";

// 初始化 Provider 并自动连接
export const initWallet = async () => {
    if (!window.ethereum) throw new Error('MetaMask not installed');
  
    // 检查本地是否有缓存连接
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    
    if (wasConnected) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          return accounts[0]; // 返回当前账户
        }
      } catch (error) {
        localStorage.removeItem('walletConnected');
      }
    }
    return null;
  };

// 连接钱包（用户手动触发）
export const connectWallet = async () => {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });
    localStorage.setItem("walletConnected", "true");
    return accounts[0];
};