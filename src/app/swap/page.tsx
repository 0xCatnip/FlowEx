'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/components/providers/Web3Provider';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

type TokenSymbol = 'USDT' | 'USDC';

const STABLECOIN_SWAP_ABI = [
  "function swap(uint256 amountIn, bool isToken1) external returns (uint256)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public view returns (uint256)",
  "function token1() external view returns (address)",
  "function reserve1() external view returns (uint256)",
  "function reserve2() external view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export default function SwapPage() {
  const { account, provider, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [inputToken, setInputToken] = useState<TokenSymbol | ''>('');
  const [outputToken, setOutputToken] = useState<TokenSymbol | ''>('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [priceImpact, setPriceImpact] = useState<string>('0');
  
  // 用户钱包余额
  const [walletBalances, setWalletBalances] = useState<{
    USDT: string;
    USDC: string;
  }>({
    USDT: '0',
    USDC: '0'
  });
  
  // 池子储备金
  const [poolReserves, setPoolReserves] = useState<{
    USDT: string;
    USDC: string;
  }>({
    USDT: '0',
    USDC: '0'
  });

  // 添加调试信息
  useEffect(() => {
    console.log('Web3 Connection Status:', {
      account,
      hasProvider: !!provider,
      hasSigner: !!signer,
      networkId: provider?.getNetwork().then(net => console.log('Network:', net))
    });
  }, [account, provider, signer]);

  // 获取代币余额和池子信息
  const updateBalancesAndReserves = async () => {
    if (!account || !provider) return;

    try {
      // 获取用户钱包余额
      const usdtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDT,
        ERC20_ABI,
        provider
      );

      const usdcContract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDC,
        ERC20_ABI,
        provider
      );
      
      // 获取池子合约实例
      const swapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STABLECOIN_SWAP,
        STABLECOIN_SWAP_ABI,
        provider
      );

      // 获取用户钱包余额
      const usdtBalance = await usdtContract.balanceOf(account);
      const usdcBalance = await usdcContract.balanceOf(account);

      setWalletBalances({
        USDT: ethers.formatUnits(usdtBalance, 18),
        USDC: ethers.formatUnits(usdcBalance, 18)
      });

      // 获取池子储备金
      const reserve1 = await swapContract.reserve1();
      const reserve2 = await swapContract.reserve2();

      setPoolReserves({
        USDT: ethers.formatUnits(reserve1, 18),
        USDC: ethers.formatUnits(reserve2, 18)
      });

      console.log('User Wallet Balances:', {
        USDT: ethers.formatUnits(usdtBalance, 18),
        USDC: ethers.formatUnits(usdcBalance, 18)
      });
      
      console.log('Pool Reserves:', {
        USDT: ethers.formatUnits(reserve1, 18),
        USDC: ethers.formatUnits(reserve2, 18)
      });
    } catch (error) {
      console.error('Error updating balances and reserves:', error);
    }
  };

  useEffect(() => {
    updateBalancesAndReserves();
  }, [account, provider]);

  // 在选择代币时更新交换率
  const handleInputTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TokenSymbol;
    setInputToken(value);
    if (value === outputToken) {
      setOutputToken(value === 'USDT' ? 'USDC' : 'USDT');
    }
  };

  const handleOutputTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TokenSymbol;
    setOutputToken(value);
    if (value === inputToken) {
      setInputToken(value === 'USDT' ? 'USDC' : 'USDT');
    }
  };

  const updateExchangeRate = async () => {
    if (!inputToken || !outputToken || !amount || !provider) return;
    
    try {
      const swapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STABLECOIN_SWAP,
        STABLECOIN_SWAP_ABI,
        provider
      );

      const amountIn = ethers.parseUnits(amount, 18);
      const isToken1 = inputToken === 'USDT'; // USDT 是 token1，USDC 是 token2

      // 获取当前储备金
      const reserve1 = await swapContract.reserve1();
      const reserve2 = await swapContract.reserve2();
      
      // 更新储备金信息
      setPoolReserves({
        USDT: ethers.formatUnits(reserve1, 18),
        USDC: ethers.formatUnits(reserve2, 18)
      });

      const reserveIn = isToken1 ? reserve1 : reserve2;
      const reserveOut = isToken1 ? reserve2 : reserve1;

      const amountOut = await swapContract.getAmountOut(amountIn, reserveIn, reserveOut);
      const rate = Number(ethers.formatUnits(amountOut, 18)) / Number(amount);
      setExchangeRate(rate.toFixed(6));

      // 计算价格影响
      const impact = Math.abs((1 - rate) * 100);
      setPriceImpact(impact.toFixed(2));
    } catch (error) {
      console.error('Error updating exchange rate:', error);
    }
  };

  useEffect(() => {
    updateExchangeRate();
  }, [inputToken, outputToken, amount]);

  const handleSwap = async () => {
    if (!account || !provider || !signer) {
      alert('Please connect your wallet first');
      return;
    }

    if (!inputToken || !outputToken || !amount) {
      alert('Please select tokens and enter amount');
      return;
    }

    try {
      // 添加网络检查
      const network = await provider.getNetwork();
      console.log('Current network:', network);

      setLoading(true);
      const amountIn = ethers.parseUnits(amount, 18);
      const isToken1 = inputToken === 'USDT'; // USDT 是 token1

      console.log('Swap Parameters:', {
        amountIn: ethers.formatUnits(amountIn, 18),
        isToken1,
        inputToken,
        outputToken
      });

      // 创建合约实例
      const swapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STABLECOIN_SWAP,
        STABLECOIN_SWAP_ABI,
        signer
      );

      const inputTokenAddress = inputToken === 'USDT' 
        ? CONTRACT_ADDRESSES.USDT 
        : CONTRACT_ADDRESSES.USDC;

      const inputTokenContract = new ethers.Contract(
        inputTokenAddress,
        ERC20_ABI,
        signer
      );

      // 检查代币余额
      const balance = await inputTokenContract.balanceOf(account);
      console.log('Input token balance:', ethers.formatUnits(balance, 18));
      
      if (balance < amountIn) {
        throw new Error(`Insufficient ${inputToken} balance`);
      }

      // 检查授权
      console.log('Checking allowance...');
      console.log('Input token address:', inputTokenAddress);
      console.log('Swap contract address:', CONTRACT_ADDRESSES.STABLECOIN_SWAP);
      
      const allowance = await inputTokenContract.allowance(account, CONTRACT_ADDRESSES.STABLECOIN_SWAP);
      console.log('Current allowance:', allowance.toString());
      console.log('Required amount:', amountIn.toString());

      if (allowance < amountIn) {
        console.log('Approving tokens...');
        setApproving(true);
        
        try {
          // 发送大量授权，避免频繁授权
          const maxApproval = ethers.MaxUint256;
          console.log('Approving max amount:', maxApproval.toString());
          
          const approveTx = await inputTokenContract.approve(
            CONTRACT_ADDRESSES.STABLECOIN_SWAP, 
            maxApproval
          );
          
          console.log('Approval transaction sent:', approveTx.hash);
          const approveReceipt = await approveTx.wait();
          console.log('Approval confirmed:', approveReceipt.hash);
          
          // 再次检查授权
          const newAllowance = await inputTokenContract.allowance(account, CONTRACT_ADDRESSES.STABLECOIN_SWAP);
          console.log('New allowance:', newAllowance.toString());
          
        } catch (error) {
          console.error('Approval failed:', error);
          throw new Error('Failed to approve tokens');
        } finally {
          setApproving(false);
        }
      } else {
        console.log('Sufficient allowance exists');
      }

      // 执行交换
      console.log('Executing swap...');
      try {
        // 检查金额是否为 0 或非常小
        if (amountIn < ethers.parseUnits('0.0001', 18)) {
          console.error('Amount is too small, might result in 0 output');
        }

        console.log('Contract address:', CONTRACT_ADDRESSES.STABLECOIN_SWAP);
        
        // 获取当前储备金
        const reserve1 = await swapContract.reserve1();
        const reserve2 = await swapContract.reserve2();
        console.log('Current reserves:', {
          reserve1: ethers.formatUnits(reserve1, 18),
          reserve2: ethers.formatUnits(reserve2, 18)
        });
        
        // 尝试估算交换结果
        try {
          const reserveIn = isToken1 ? reserve1 : reserve2;
          const reserveOut = isToken1 ? reserve2 : reserve1;
          
          console.log('Calculating output with:', {
            amountIn: ethers.formatUnits(amountIn, 18),
            reserveIn: ethers.formatUnits(reserveIn, 18),
            reserveOut: ethers.formatUnits(reserveOut, 18)
          });
          
          const estimatedOutput = await swapContract.getAmountOut(amountIn, reserveIn, reserveOut);
          console.log('Estimated output:', ethers.formatUnits(estimatedOutput, 18));
          
          if (Number(ethers.formatUnits(estimatedOutput, 18)) <= 0) {
            throw new Error('Calculated output amount is 0 or negative. Try a larger input amount.');
          }
        } catch (error) {
          console.warn('Failed to estimate output or output is too small:', error);
        }
        
        // 实际执行交换
        console.log('Calling swap function with params:', {
          amountIn: ethers.formatUnits(amountIn, 18),
          isToken1
        });
        
        const swapTx = await swapContract.swap(amountIn, isToken1, {
          gasLimit: 500000
        });
        
        console.log('Swap transaction sent:', swapTx.hash);
        const receipt = await swapTx.wait();
        console.log('Swap confirmed:', receipt.hash);
        
        // 清空输入
        setAmount('');
        
        // 更新余额和储备金
        updateBalancesAndReserves();
        
        alert('Swap successful!');
      } catch (error: any) {
        console.error('Detailed swap error:', error);
        if (error.data) {
          console.error('Error data:', error.data);
        }
        throw error;
      }

    } catch (error: any) {
      console.error('Swap failed:', error);
      alert(error.message || 'Swap failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Stablecoin Swap</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Pool Reserves Info */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Pool Reserves</h2>
          <div className="flex justify-between">
            <div>USDT: {poolReserves.USDT}</div>
            <div>USDC: {poolReserves.USDC}</div>
          </div>
        </div>
        
        {/* Input Token (From) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Token (Your wallet: {inputToken ? walletBalances[inputToken] : '0'})
          </label>
          <div className="flex space-x-4">
            <select
              className="w-full p-3 border rounded-lg"
              disabled={loading}
              value={inputToken}
              onChange={handleInputTokenChange}
            >
              <option value="">Select Token</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Output Token (To) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Token (Your wallet: {outputToken ? walletBalances[outputToken] : '0'})
          </label>
          <div className="flex space-x-4">
            <select 
              className="w-full p-3 border rounded-lg"
              disabled={loading}
              value={outputToken}
              onChange={handleOutputTokenChange}
            >
              <option value="">Select Token</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Slippage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slippage Tolerance (%)
          </label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            step="0.1"
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
        </div>

        {/* Exchange Rate Info */}
        {inputToken && outputToken && amount && (
          <div className="space-y-2 text-sm text-gray-600">
            <p>Exchange Rate: 1 {inputToken} = {exchangeRate} {outputToken}</p>
            <p>Price Impact: {priceImpact}%</p>
            <p>Estimated Output: {(Number(amount) * Number(exchangeRate)).toFixed(6)} {outputToken}</p>
            <p>Minimum Received: {(Number(amount) * Number(exchangeRate) * (1 - Number(slippage)/100)).toFixed(6)} {outputToken}</p>
          </div>
        )}

        {/* Connection Status */}
        {!account && (
          <div className="text-red-500 text-sm">
            Please connect your wallet to continue
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!account || loading || !inputToken || !outputToken || !amount}
        >
          {!account 
            ? 'Connect Wallet to Swap'
            : loading 
              ? approving 
                ? 'Approving...'
                : 'Swapping...'
              : 'Swap'
          }
        </button>

        {/* Transaction Status */}
        {loading && (
          <div className="text-sm text-gray-600">
            {approving ? 'Approving tokens...' : 'Processing swap...'}
          </div>
        )}
        
        {/* Swap Description */}
        <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium mb-1">How the swap works:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Your {inputToken} tokens will be transferred from your wallet to the pool</li>
            <li>{outputToken} tokens will be transferred from the pool to your wallet</li>
            <li>A 0.3% fee is applied to the swap</li>
          </ol>
        </div>
      </div>
    </div>
  );
}