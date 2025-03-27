'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedPool, setSelectedPool] = useState('ETH-USDT');

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-8">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="24h">24 Hours</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
        </select>

        <select
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="ETH-USDT">ETH/USDT</option>
          <option value="ETH-USDC">ETH/USDC</option>
          <option value="USDT-USDC">USDT/USDC</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm text-gray-500 mb-2">Total Value Locked</h3>
          <p className="text-2xl font-bold">$1,234,567</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm text-gray-500 mb-2">24h Volume</h3>
          <p className="text-2xl font-bold">$123,456</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm text-gray-500 mb-2">24h Fees</h3>
          <p className="text-2xl font-bold">$1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm text-gray-500 mb-2">APY</h3>
          <p className="text-2xl font-bold">12.34%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Price chart will be implemented here</p>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Volume Chart</h2>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Volume chart will be implemented here</p>
          </div>
        </div>

        {/* Liquidity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Liquidity Chart</h2>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Liquidity chart will be implemented here</p>
          </div>
        </div>

        {/* Fees Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Fees Chart</h2>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Fees chart will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Time</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">2 minutes ago</td>
                <td className="py-2">Swap</td>
                <td className="py-2">1.5 ETH</td>
                <td className="py-2">$2,000</td>
                <td className="py-2">$3,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">5 minutes ago</td>
                <td className="py-2">Add Liquidity</td>
                <td className="py-2">10 ETH</td>
                <td className="py-2">$2,000</td>
                <td className="py-2">$20,000</td>
              </tr>
              <tr>
                <td className="py-2">10 minutes ago</td>
                <td className="py-2">Remove Liquidity</td>
                <td className="py-2">5 ETH</td>
                <td className="py-2">$2,000</td>
                <td className="py-2">$10,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 