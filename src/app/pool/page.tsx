'use client';

import { useState } from 'react';
import { useWeb3 } from '@/components/providers/Web3Provider';

export default function PoolPage() {
  const { account, provider } = useWeb3();
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [selectedPool, setSelectedPool] = useState('');

  const handleAddLiquidity = async () => {
    if (!account || !provider) {
      alert('Please connect your wallet first');
      return;
    }

    // TODO: Implement add liquidity logic
    console.log('Add liquidity initiated:', {
      token1Amount,
      token2Amount,
      selectedPool
    });
  };

  const handleRemoveLiquidity = async () => {
    if (!account || !provider) {
      alert('Please connect your wallet first');
      return;
    }

    // TODO: Implement remove liquidity logic
    console.log('Remove liquidity initiated:', {
      selectedPool
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Liquidity Pool</h1>

      {/* Pool Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Pool
        </label>
        <select
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Choose a pool</option>
          <option value="ETH-USDT">ETH/USDT</option>
          <option value="ETH-USDC">ETH/USDC</option>
          <option value="USDT-USDC">USDT/USDC</option>
        </select>
      </div>

      {/* Add Liquidity Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Add Liquidity</h2>
        
        <div className="space-y-6">
          {/* Token 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token 1 Amount
            </label>
            <div className="flex space-x-4">
              <input
                type="number"
                value={token1Amount}
                onChange={(e) => setToken1Amount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 border rounded-lg"
              />
              <select className="p-3 border rounded-lg">
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          {/* Token 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token 2 Amount
            </label>
            <div className="flex space-x-4">
              <input
                type="number"
                value={token2Amount}
                onChange={(e) => setToken2Amount(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-3 border rounded-lg"
              />
              <select className="p-3 border rounded-lg">
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddLiquidity}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            disabled={!account}
          >
            {account ? 'Add Liquidity' : 'Connect Wallet to Add Liquidity'}
          </button>
        </div>
      </div>

      {/* Remove Liquidity Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Remove Liquidity</h2>
        
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Your Pool Share</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Pool: ETH/USDT</p>
              <p>Share: 2.5%</p>
              <p>Value: $1,234.56</p>
            </div>
          </div>

          <button
            onClick={handleRemoveLiquidity}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
            disabled={!account}
          >
            {account ? 'Remove Liquidity' : 'Connect Wallet to Remove Liquidity'}
          </button>
        </div>
      </div>
    </div>
  );
} 