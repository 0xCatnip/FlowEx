"use client";

import { useState } from "react";
import { useWeb3 } from "@/components/providers/Web3Provider";

export default function PoolPage() {
  const { account, provider } = useWeb3();
  const [token1Amount, setToken1Amount] = useState("");
  const [token2Amount, setToken2Amount] = useState("");
  const [selectedPool, setSelectedPool] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleAddLiquidity = async () => {
    if (!account || !provider) {
      alert("Please connect your wallet first");
      return;
    }

    // TODO: Implement add liquidity logic
    console.log("Add liquidity initiated:", {
      token1Amount,
      token2Amount,
      selectedPool,
    });
  };

  const handleAddLiquidityWindow = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleRemoveLiquidity = async () => {
    if (!account || !provider) {
      alert("Please connect your wallet first");
      return;
    }

    // TODO: Implement remove liquidity logic
    console.log("Remove liquidity initiated:", {
      selectedPool,
    });
  };

  return (
    <main className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-1/3 h-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              POOL
            </p>
          </div>

          {/* Add Liquidity Form */}
          <button
            onClick={handleAddLiquidityWindow}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
            disabled={!account}
          >
            {account ? "Add Liquidity" : "Connect Wallet to Add Liquidity"}
          </button>
          {showModal && (
            <div className="fixed inset-0 h-full w-full z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-20">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
                    ADD LIQUIDITY
                  </p>
                </div>
                <div className="mb-8">
                  <label className="block text-xs text-gray-500">
                    Select Pool
                  </label>
                  {/* Pool Selection Buttons */}
                  <div className="flex justify-around space-x-3">
                    <button
                      onClick={() => setSelectedPool("ETH-USDT")}
                      className={`w-1/3 p-3 rounded-lg transition duration-300 ${
                        selectedPool === "ETH-USDT"
                          ? "bg-purple-400 text-white"
                          : "bg-gray-200 text-gray-500 hover:bg-purple-400 hover:text-white"
                      }`}
                    >
                      ETH/USDT
                    </button>
                    <button
                      onClick={() => setSelectedPool("ETH-USDC")}
                      className={`w-1/3 p-3 rounded-lg transition duration-300 ${
                        selectedPool === "ETH-USDC"
                          ? "bg-gradient-to-r from-purple-400 to-blue-500 text-white"
                          : "bg-gray-200 text-gray-500 hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-500 hover:text-white"
                      }`}
                    >
                      ETH/USDC
                    </button>
                    <button
                      onClick={() => setSelectedPool("USDT-USDC")}
                      className={`w-1/3 p-3 rounded-lg transition duration-300 ${
                        selectedPool === "USDT-USDC"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500 hover:bg-blue-500 hover:text-white"
                      }`}
                    >
                      USDT/USDC
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Token 1 */}
                  <div>
                    <label className="block text-xs text-gray-500">
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
                    <label className="block text-xs text-gray-500">
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
                  <div className="mt-4 flex justify-between space-x-4">
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-300 text-white py-3 rounded-xl hover:bg-gray-400 disabled:bg-gray-400 mb-4"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddLiquidity}
                      className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remove Liquidity Form */}
          <h2 className="text-lg font-semibold mb-2">Your Liquidity</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="mb-2">ETH/USDT</h2>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p>Share: 2.5%</p>
                  <p>Value: $1,234.56</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleRemoveLiquidity}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                  disabled={!account}
                >
                  Remove
                </button>
                <button
                  onClick={handleAddLiquidity}
                  className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!account}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
