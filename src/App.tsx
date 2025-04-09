import React, { useState, useCallback, useEffect } from 'react';
import { ConfigProvider, Button, message, Card, Input, Space, Divider, Statistic } from 'antd';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 合约相关状态
  const [curveAMM, setCurveAMM] = useState<any>(null);
  const [token1, setToken1] = useState<any>(null);
  const [token2, setToken2] = useState<any>(null);
  const [token1Symbol, setToken1Symbol] = useState('');
  const [token2Symbol, setToken2Symbol] = useState('');
  const [token1Balance, setToken1Balance] = useState('0');
  const [token2Balance, setToken2Balance] = useState('0');
  const [lpBalance, setLpBalance] = useState('0');
  const [reserves, setReserves] = useState({ reserve1: '0', reserve2: '0' });
  
  // 流动性操作相关状态
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [lpAmount, setLpAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 初始化和监听钱包事件
  useEffect(() => {
    // 检查是否已连接
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
          message.info(`已切换到账户: ${accounts[0].substring(0, 6)}...`);
        } else {
          setAccount(null);
          message.warning('已断开钱包连接');
        }
      });
      
      // 监听链变化
      (window.ethereum as any).on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    // 组件卸载时清除监听器
    return () => {
      if (window.ethereum) {
        (window.ethereum as any).removeListener('accountsChanged', () => {});
        (window.ethereum as any).removeListener('chainChanged', () => {});
      }
    };
  }, []);
  
  // 当账户变化时初始化合约
  useEffect(() => {
    if (!account) return;
    
    const initContracts = async () => {
      try {
        if (!window.ethereum) return;
        
        // 合约地址
        const curveAMMAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
        const token1Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        const token2Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const signer = provider.getSigner();
        
        // 定义最简单的ABI
        const tokenAbi = [
          'function balanceOf(address) view returns (uint256)',
          'function approve(address, uint256) returns (bool)',
          'function symbol() view returns (string)'
        ];
        
        const curveAbi = [
          'function balanceOf(address) view returns (uint256)',
          'function reserve1() view returns (uint256)',
          'function reserve2() view returns (uint256)',
          'function totalSupply() view returns (uint256)',
          'function addLiquidity(uint256, uint256) returns (uint256)',
          'function removeLiquidity(uint256) returns (uint256, uint256)',
        ];
        
        // 初始化合约
        const curveAMMContract = new ethers.Contract(curveAMMAddress, curveAbi, signer);
        const token1Contract = new ethers.Contract(token1Address, tokenAbi, signer);
        const token2Contract = new ethers.Contract(token2Address, tokenAbi, signer);
        
        setCurveAMM(curveAMMContract);
        setToken1(token1Contract);
        setToken2(token2Contract);
        
        // 加载Token信息
        loadTokenInfo(token1Contract, token2Contract, curveAMMContract, account);
      } catch (error) {
        console.error('初始化合约失败:', error);
        message.error('初始化合约失败');
      }
    };
    
    initContracts();
  }, [account]);
  
  // 加载Token信息
  const loadTokenInfo = async (token1Contract: any, token2Contract: any, curveAMMContract: any, userAccount: string) => {
    try {
      const [symbol1, symbol2, balance1, balance2, lpTokens, reserve1, reserve2] = await Promise.all([
        token1Contract.symbol(),
        token2Contract.symbol(),
        token1Contract.balanceOf(userAccount),
        token2Contract.balanceOf(userAccount),
        curveAMMContract.balanceOf(userAccount),
        curveAMMContract.reserve1(),
        curveAMMContract.reserve2()
      ]);
      
      setToken1Symbol(symbol1);
      setToken2Symbol(symbol2);
      setToken1Balance(ethers.utils.formatEther(balance1));
      setToken2Balance(ethers.utils.formatEther(balance2));
      setLpBalance(ethers.utils.formatEther(lpTokens));
      setReserves({
        reserve1: ethers.utils.formatEther(reserve1),
        reserve2: ethers.utils.formatEther(reserve2)
      });
    } catch (error) {
      console.error('加载Token信息失败:', error);
    }
  };
  
  // 添加流动性
  const addLiquidity = async () => {
    if (!account || !curveAMM || !token1 || !token2) {
      message.warning('请先连接钱包');
      return;
    }
    
    if (!token1Amount || !token2Amount) {
      message.warning('请输入Token数量');
      return;
    }
    
    setIsProcessing(true);
    try {
      const amount1 = ethers.utils.parseEther(token1Amount);
      const amount2 = ethers.utils.parseEther(token2Amount);
      
      // 批准Token转账
      message.info(`批准${token1Symbol}转账...`);
      const tx1 = await token1.approve(curveAMM.address, amount1);
      await tx1.wait();
      
      message.info(`批准${token2Symbol}转账...`);
      const tx2 = await token2.approve(curveAMM.address, amount2);
      await tx2.wait();
      
      // 添加流动性
      message.info('添加流动性...');
      const tx3 = await curveAMM.addLiquidity(amount1, amount2);
      await tx3.wait();
      
      message.success('流动性添加成功!');
      
      // 刷新状态
      await loadTokenInfo(token1, token2, curveAMM, account);
      
      // 清空输入
      setToken1Amount('');
      setToken2Amount('');
    } catch (error) {
      console.error('添加流动性失败:', error);
      message.error('添加流动性失败');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 移除流动性
  const removeLiquidity = async () => {
    if (!account || !curveAMM) {
      message.warning('请先连接钱包');
      return;
    }
    
    if (!lpAmount) {
      message.warning('请输入LP数量');
      return;
    }
    
    setIsProcessing(true);
    try {
      const amount = ethers.utils.parseEther(lpAmount);
      
      // 移除流动性
      message.info('移除流动性...');
      const tx = await curveAMM.removeLiquidity(amount);
      await tx.wait();
      
      message.success('流动性移除成功!');
      
      // 刷新状态
      await loadTokenInfo(token1, token2, curveAMM, account);
      
      // 清空输入
      setLpAmount('');
    } catch (error) {
      console.error('移除流动性失败:', error);
      message.error('移除流动性失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 格式化账户地址显示
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      message.error('请安装MetaMask钱包');
      return;
    }

    setIsConnecting(true);
    try {
      // 请求用户授权
      const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        message.success('钱包连接成功');
        
        // 获取网络ID并检查
        const chainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
        if (chainId !== '0x7a69') { // 0x7a69 是 Hardhat 的链 ID (十进制: 31337)
          message.warning('请切换到Hardhat网络 (Chain ID: 31337)');
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      message.error('连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 断开钱包连接
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    message.info('已断开钱包连接');
  }, []);

  return (
    <ConfigProvider>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>FlowEx DEX</h1>
          <Button 
            type="primary" 
            onClick={account ? disconnectWallet : connectWallet}
            loading={isConnecting}
          >
            {account ? formatAddress(account) : '连接钱包'}
          </Button>
        </div>
        
        {!account ? (
          <Card title="欢迎使用FlowEx DEX">
            <p>这是一个基于Curve AMM的去中心化交易所。</p>
            <p>请先连接钱包以使用流动性功能。</p>
          </Card>
        ) : (
          <>
            {/* 池子信息 */}
            <Card title="流动性池信息" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Statistic
                  title={`${token1Symbol} 储备`}
                  value={reserves.reserve1}
                  precision={4}
                  suffix={token1Symbol}
                />
                <Statistic
                  title={`${token2Symbol} 储备`}
                  value={reserves.reserve2}
                  precision={4}
                  suffix={token2Symbol}
                />
                <Statistic
                  title="您的LP代币"
                  value={lpBalance}
                  precision={4}
                  suffix="LP"
                />
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Statistic
                  title={`您的 ${token1Symbol} 余额`}
                  value={token1Balance}
                  precision={4}
                  suffix={token1Symbol}
                />
                <Statistic
                  title={`您的 ${token2Symbol} 余额`}
                  value={token2Balance}
                  precision={4}
                  suffix={token2Symbol}
                />
              </div>
            </Card>
            
            {/* 流动性操作 */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* 添加流动性 */}
              <Card title="添加流动性" style={{ flex: 1, minWidth: '300px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>{token1Symbol} 数量</div>
                    <Input 
                      placeholder="输入数量" 
                      value={token1Amount}
                      onChange={e => setToken1Amount(e.target.value)}
                      suffix={token1Symbol}
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: '8px' }}>{token2Symbol} 数量</div>
                    <Input 
                      placeholder="输入数量" 
                      value={token2Amount}
                      onChange={e => setToken2Amount(e.target.value)}
                      suffix={token2Symbol}
                    />
                  </div>
                  <Button 
                    type="primary"
                    onClick={addLiquidity}
                    loading={isProcessing}
                    block
                  >
                    添加流动性
                  </Button>
                </Space>
              </Card>
              
              {/* 移除流动性 */}
              <Card title="移除流动性" style={{ flex: 1, minWidth: '300px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>LP 代币数量</div>
                    <Input 
                      placeholder="输入数量" 
                      value={lpAmount}
                      onChange={e => setLpAmount(e.target.value)}
                      suffix="LP"
                    />
                  </div>
                  <Button 
                    type="primary" 
                    danger
                    onClick={removeLiquidity}
                    loading={isProcessing}
                    block
                  >
                    移除流动性
                  </Button>
                </Space>
              </Card>
            </div>
          </>
        )}
      </div>
    </ConfigProvider>
  );
}

export default App; 