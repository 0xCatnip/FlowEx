"use client";

import { useState } from "react";
import { useWeb3 } from "@/components/providers/Web3Provider";
import { ArrowDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function SwapPage() {
  const { account, provider } = useWeb3();
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const handleSwap = async () => {
    if (!account || !provider) {
      alert("Please connect your wallet first");
      return;
    }

    // TODO: Implement swap logic
    console.log("Swap initiated:", {
      fromToken,
      toToken,
      amount,
      slippage,
    });
  };

  return (
    <main className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-1/3 h-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              SWAP
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              From (estimated)
            </label>
            <div className="flex space-x-4 border rounded-xl shadow-sm px-2">
              <input
                type="number"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                placeholder="Number"
                className="flex-1 p-3 bg-transparent"
              />
              <select className="p-3 bg-transparent">
                <option value="">Token</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center mt-3">
            <ArrowDownIcon className="h-5 w-5 text-purple-500" />
          </div>

          {/* To Token */}
          <div className="">
            <label className="block text-xs text-gray-500">To</label>
            <div className="flex space-x-4 border rounded-xl shadow-sm px-2">
              <input
                type="number"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                placeholder="Number"
                className="flex-1 p-3 bg-transparent"
              />
              <select className="p-3 bg-transparent">
                <option value="">Token</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          {/* Slippage */}
          <div className="mt-3">
            <label className="block text-xs text-gray-500">
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
            className="mt-3 w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!account}
          >
            {account ? "Swap" : "Connect Wallet to Swap"}
          </button>

          {/* Price Information */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Price Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Exchange Rate: 1 ETH = 2000 USDT</p>
              <p>Price Impact: 0.5%</p>
              <p>Network Fee: ~$5.00</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
