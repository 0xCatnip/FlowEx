import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

export const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// 显式导出连接器元组
export const metaMaskConnector: [MetaMask, Web3ReactHooks] = [metaMask, hooks]; 