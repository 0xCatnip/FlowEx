"use client";

import { useEffect, useState } from "react";
import { ethers, BrowserProvider } from "ethers";
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
  const [tokenA, setTokenA] = useState<Token>();
  const [tokenB, setTokenB] = useState<Token>();
  const [addrA, setAddrA] = useState("");
  const [addrB, setAddrB] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPool, setNewPool] = useState();
  const [pools, setPools] = useState<Pool[]>([]);

  const [mintNumber, setMintNumber] = useState<string>("");

  const [activeTab, setActiveTab] = useState("POOL");

  interface Token {
    name: string;
    addr: string;
  }

  interface Pool {
    tokenA: string; // Address of the first token in the pool
    tokenB: string; // Address of the second token in the pool
    poolAddress: string; // Address of the pool contract
    owner: string;
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
        getAllPools();
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      }
    };

    fetchTokens();
  }, [flowExService]);

  const fetchTokenName = (addr: string) => {
    const fetched = tokens.find((t) => t.addr === addr);
    return fetched?.name;
  };

  const getAllTokens = async () => {
    if (!flowExService) return;
    const updatedTokens = await flowExService.getAllTokens();
    const plainData = updatedTokens.map((item) => ({
      name: item.name,
      addr: item.tokenAddress,
    }));
    setTokens(plainData);
  };

  const getAllPools = async () => {
    if (!flowExService) return;
    const updatedPools = await flowExService.getAllPools();
    const plainData = updatedPools.map((p) => ({
      tokenA: p.tokenA,
      tokenB: p.tokenB,
      poolAddress: p.poolAddress,
      owner: p.owner,
    }));
    setPools(plainData);
    console.log(plainData);
  };

  const createNewPool = async () => {
    if (!flowExService || !tokenA?.addr.trim()) return;

    try {
      setLoading(true);

      // 如果未连接钱包，先连接
      if (!account) {
        await connect();
        return;
      }

      if (addrA === addrB) {
        throw new Error(
          "You cannot select 2 same type of token in a single pool"
        );
      }

      await flowExService.addPool(addrA, addrB);

      // 刷新列表
      getAllPools();

      alert("Pool created successfully");
    } catch (err) {
      console.error("Error creating pool:", err);
      alert(err instanceof Error ? err.message : "Failed to create pool");
    } finally {
      setAddrA("");
      setAddrB("");
      setLoading(false);
    }
  };

  const createNewToken = async () => {
    if (!flowExService || !token.trim()) return;

    try {
      setLoading(true);

      // 如果未连接钱包，先连接
      if (!account) {
        await connect();
        return;
      }

      await flowExService.addToken(token);
      // console.log(token)

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

  const mintToken = async () => {
    if (!flowExService || !addrA) return;

    try {
      const num = ethers.parseUnits(mintNumber, 18);
      const updatedTokens = await flowExService.mintCoin(addrA, num);
      alert("Pool created successfully");
    } catch (err) {
      console.error("Error Mint:", err);
      alert(err instanceof Error ? err.message : "Failed to mint coin");
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
          {/* 标签区 */}
          <div className="flex border-b mb-4 cursor-pointer">
            {/* 标签: Pools */}
            <div
              onClick={() => setActiveTab("POOL")}
              className={`flex-1 text-center py-2 ${
                activeTab === "POOL"
                  ? "text-purple-500 font-bold border-b-2 border-purple-500"
                  : "text-gray-500"
              } transition`}
            >
              Pools
            </div>

            {/* 标签: Create Pool */}
            <div
              onClick={() => setActiveTab("COIN")}
              className={`flex-1 text-center py-2 ${
                activeTab === "COIN"
                  ? "text-purple-500 font-bold border-b-2 border-purple-500"
                  : "text-gray-500"
              } transition`}
            >
              Coins
            </div>
            {/* 标签: Create Pool */}
            <div
              onClick={() => setActiveTab("MINT")}
              className={`flex-1 text-center py-2 ${
                activeTab === "MINT"
                  ? "text-purple-500 font-bold border-b-2 border-purple-500"
                  : "text-gray-500"
              } transition`}
            >
              Mint
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              {activeTab === "POOL"
                ? "Pool Registration Panel"
                : "Token Registration Panel"}
            </p>
          </div>

          {/* 连接状态提示 */}
          {!account && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
              Wallet not connected. Click "Connect" to connect first.
            </div>
          )}

          {activeTab === "POOL" && (
            <>
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">
                  Select Token A and B
                </label>
                <div className="flex space-x-4">
                  <select
                    value={addrA}
                    onChange={(e) => {
                      const selectedAddr = e.target.value;
                      setAddrA(selectedAddr);
                      const selected = tokens.find(
                        (t) => t.addr === selectedAddr
                      );
                      if (selected) {
                        setTokenA(selected);
                      }
                    }}
                    className="w-full p-3 border rounded-lg bg-white text-gray-700"
                  >
                    <option value="" disabled>
                      --
                    </option>
                    {tokens.map((t, index) => (
                      <option key={index} value={t.addr}>
                        {t.name.toUpperCase()} ({t.addr.slice(0, 4)})
                      </option>
                    ))}
                  </select>

                  <select
                    value={addrB}
                    onChange={(e) => {
                      const selectedAddr = e.target.value;
                      setAddrB(selectedAddr);
                      const selected = tokens.find(
                        (t) => t.addr === selectedAddr
                      );
                      if (selected) {
                        setTokenB(selected);
                      }
                    }}
                    className="w-full p-3 border rounded-lg bg-white text-gray-700"
                  >
                    <option value="" disabled>
                      --
                    </option>
                    {tokens.map((t, index) => (
                      <option key={index} value={t.addr}>
                        {t.name.toUpperCase()} ({t.addr.slice(0, 4)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={createNewPool}
                disabled={loading || !addrA.trim() || !addrB.trim()}
                className={`${
                  !addrA.trim() || !addrB.trim()
                    ? "bg-gray-100"
                    : "bg-gradient-to-r from-purple-400 to-blue-500"
                } w-full text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4`}
              >
                {!account ? "Connect" : "Register Pool"}
              </button>

              <button
                onClick={handleRefresh}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
              >
                Refresh Lists
              </button>

              {/* Pool 列表 */}
              <div className="max-h-60 overflow-y-auto">
                {pools.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tokens found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pools.map((p, index) => (
                      <div
                        key={index}
                        className="flex flex-col text-xs justify-between p-3 border rounded-lg bg-gray-50 hover:shadow-md transition hover:cursor-pointer"
                      >
                        <span className="text-sm font-bold break-all">
                          Service: {fetchTokenName(p.tokenA)?.toUpperCase()} /{" "}
                          {fetchTokenName(p.tokenB)?.toUpperCase()}
                        </span>
                        <span className="">
                          Address: {p.poolAddress.slice(0, 16).toUpperCase()}
                        </span>
                        <span className="">
                          Owner: {p.owner.slice(0, 16).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "MINT" && (
            <>
              <div className="mb-4">
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-xs text-gray-500">Coin</label>
                    <select
                      value={addrA}
                      onChange={(e) => {
                        const selectedAddr = e.target.value;
                        setAddrA(selectedAddr);
                        const selected = tokens.find(
                          (t) => t.addr === selectedAddr
                        );
                        if (selected) {
                          setTokenA(selected);
                        }
                      }}
                      className="w-full p-3 border rounded-lg bg-white text-gray-700"
                    >
                      <option value="" disabled>
                        --
                      </option>
                      {tokens.map((t, index) => (
                        <option key={index} value={t.addr}>
                          {t.name.toUpperCase()} ({t.addr.slice(0, 4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full">
                    <label className="block text-xs text-gray-500">
                      Amount
                    </label>
                    <input
                      disabled={!tokenA}
                      type="number"
                      value={mintNumber}
                      onChange={(e) => setMintNumber(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={mintToken}
                disabled={loading || !addrA.trim()}
                className={`${
                  !addrA.trim()
                    ? "bg-gray-100"
                    : "bg-gradient-to-r from-purple-400 to-blue-500"
                } w-full text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4`}
              >
                {!account ? "Connect" : "Mint"}
              </button>
            </>
          )}

          {activeTab === "COIN" && (
            <>
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
                  <p className="text-gray-500 text-center py-4">
                    No tokens found
                  </p>
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
