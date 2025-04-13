"use client";

import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import AMM_CURVE_ABI from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json";
import FACTORY_ABI from "@/contracts/artifacts/src/contracts/CurveAMMFactory.sol/CurveAMMFactory.json";
import ERC20_ABI from "@/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json";
import { FlowExService } from "@/utils/FlowExService";
import { useWallet } from "@/app/context/WalletContext";

export default function AMMPoolPage() {
  const { account, connect } = useWallet();
  const [flowExService, setFlowExService] = useState<FlowExService | null>(
    null
  );
  const [token, setToken] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  interface Token {
    name: string;
    addr: string;
  }

  // 初始化 provider 和 service
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum || !account) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setFlowExService(new FlowExService(signer));
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();
  }, [account]); // 依赖 account 变化

  // 获取 token 列表
  useEffect(() => {
    const fetchTokens = async () => {
      if (!flowExService) return;
      try {
        getAllTokens();
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      }
    };

    fetchTokens();
  }, [flowExService]);

  const getAllTokens = async () => {
    if (!flowExService) return;
    const updatedTokens = await flowExService.getAllTokens();
    const plainData = updatedTokens.map((item) => ({
      name: item.name,
      addr: item.tokenAddress,
    }));
    setTokens(plainData);
  };

  const createNewToken= async () => {
    if (!flowExService || !token.trim()) return;

    try {
      setLoading(true);

      // 如果未连接钱包，先连接
      if (!account) {
        await connect();
        return;
      }

      await flowExService.addToken(token);

      // 刷新列表
      getAllTokens();

      alert("Pool created successfully");
    } catch (err) {
      console.error("Error creating pool:", err);
      alert(err instanceof Error ? err.message : "Failed to create pool");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!flowExService) return;

    try {
      const updatedTokens = await flowExService.getAllTokens();
      console.log(updatedTokens);
    } catch (error) {
      console.error("Refresh failed:", error);
      alert("Failed to refresh token list");
    }
  };

  return (
    <main className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-1/3 h-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              Token Registration Panel
            </p>
          </div>

          {/* 连接状态提示 */}
          {!account && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
              Wallet not connected. Click "Connect" to connect first.
            </div>
          )}

          <div className="flex gap-2 my-6">
            <div className="flex-1">
              <label className="block text-xs text-gray-500">
                Name of New Token
              </label>
              <input
                type="text"
                placeholder="Token Name"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={createNewToken}
            disabled={loading || !token.trim()}
            className={`${
              !token.trim()
                ? "bg-gray-100"
                : "bg-gradient-to-r from-purple-400 to-blue-500"
            } w-full text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4`}
          >
            {!account ? "Connect" : "Register Token"}
          </button>

          <button
            onClick={handleRefresh}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
          >
            Refresh Lists
          </button>

          {/* Token 列表 */}
          <div className="max-h-60 overflow-y-auto">
            {tokens.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tokens found</p>
            ) : (
              <div className="space-y-2">
                {tokens.map((t, index) => (
                  <div
                    key={index}
                    className="flex text-sm justify-between p-3 border rounded-lg bg-gray-50 hover:shadow-md transition hover:cursor-pointer"
                  >
                    <span className="font-medium break-all">
                      Token {t.name.slice(0, 3)}:
                    </span>
                    <span className="">{t.addr.slice(0, 16)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
