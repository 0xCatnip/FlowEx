'use client';

import { useState } from 'react';
import { useWeb3 } from '@/components/providers/Web3Provider';

export default function SwapPage() {
  const { account, provider } = useWeb3();
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  const handleSwap = async () => {
    if (!account || !provider) {
      alert('Please connect your wallet first');
      return;
    }

    // TODO: Implement swap logic
    console.log('Swap initiated:', {
      fromToken,
      toToken,
      amount,
      slippage
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Swap Tokens</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* From Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              placeholder="0.0"
              className="flex-1 p-3 border rounded-lg"
            />
            <select className="p-3 border rounded-lg">
              <option value="">Select Token</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* To Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              placeholder="0.0"
              className="flex-1 p-3 border rounded-lg"
            />
            <select className="p-3 border rounded-lg">
              <option value="">Select Token</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full p-3 border rounded-lg"
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
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!account}
        >
          {account ? 'Swap' : 'Connect Wallet to Swap'}
        </button>

        {/* Price Information */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Price Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Exchange Rate: 1 ETH = 2000 USDT</p>
            <p>Price Impact: 0.5%</p>
            <p>Network Fee: ~$5.00</p>
          </div>
        </div>
      </div>
    </div>
  );
} 