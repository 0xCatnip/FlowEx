"use client";

import { useEffect, useState } from "react";
import AddLiquidityWidget from "@/components/layout/AddLiquidityWidget";
import { useWallet } from "@/utils/WalletService";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { FlowExService } from "@/utils/FlowExService";
import { CurveAMMService } from "@/utils/CurveAMMService";
import LiquidityCard from "@/components/layout/LiquidityCard";
import RemoveLiquidityWidget from "@/components/layout/LiquidityRemoveForm";

interface Pool {
  tokenA: string; // Address of the first token in the pool
  tokenB: string; // Address of the second token in the pool
  poolAddress: string; // Address of the pool contract
  owner: string;
}

export interface Trade {
  poolOwner: string;
  pooladdress: string;
  user: string;
  action: string;
  tokenA: string;
  tokenB: string;
  amountA: ethers.BigNumberish;
  amountB: ethers.BigNumberish;
  share: ethers.BigNumberish;
  datetime: string;
}

interface Token {
  name: string;
  addr: string;
}

export default function PoolPage() {
  const { account, connect } = useWallet();
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showRemoveWidget, setShowRemoveWidget] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [preSelectedPoolAddr, setPreSelectedPoolAddr] = useState<string>("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [flowExService, setFlowExService] = useState<FlowExService | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!account) {
      connect(); // 尝试连接钱包
    }
  }, []);

  // 初始化 provider 和 service
  useEffect(() => {
    if (!window.ethereum || !account) return;
    const init = async () => {
      try {
        // console.log("init called with account:", account);
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
        await getAllTokens();
        await getAllPools();
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

  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      try {
        const results = await Promise.all(
          pools.map(async (p) => {
            const ps = new CurveAMMService(p.poolAddress, signer);
            const trades = await ps.getAllTrades(); // Trade[]

            return trades.map((trade) => ({
              poolOwner: p.owner,
              pooladdress: p.poolAddress,
              user: trade.user,
              action: trade.action,
              tokenA: fetchTokenName(trade.tokenA) ?? "N/A",
              tokenB: fetchTokenName(trade.tokenB) ?? "N/A",
              amountA: trade.amountA,
              amountB: trade.amountB,
              share: trade.share,
              datetime: new Date(
                Number(trade.timestamp) * 1000
              ).toLocaleString(),
            }));
          })
        );

        const allTrades = results.flat();
        setTrades(allTrades);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [pools]);

  const fetchTokenName = (addr: string) => {
    const fetched = tokens.find((t) => t.addr === addr);
    if (fetched) return fetched.name;
    else return "";
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
    // console.log(plainData);
  };

  return (
    <main className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-1/3 h-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              {"Liquidity".toUpperCase()}
            </p>
          </div>

          {/* Add Liquidity Button */}
          <button
            onClick={() => setShowAddWidget(true)}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 mb-4"
          >
            Add Liquidity
          </button>
          {/* Modal */}
          <AddLiquidityWidget
            visible={showAddWidget}
            preAddr={preSelectedPoolAddr}
            setVisible={setShowAddWidget}
          />

          <RemoveLiquidityWidget
            visible={showRemoveWidget}
            preAddr={preSelectedPoolAddr}
            setVisible={setShowRemoveWidget}
          />

          {/* Dummy Liquidity List */}
          <div className="h-96 overflow-y-auto">
            <div className="space-y-6">
              {trades.length === 0 ? (
                <p className="text-gray-400">
                  {isLoading ? "Loading" : "No liquidity positions found."}
                </p>
              ) : (
                trades.slice().reverse().map((t, i) => (
                  <div key={i}>
                    <LiquidityCard
                      trade={t}
                      onAddClick={(addr) => {
                        setPreSelectedPoolAddr(addr);
                        setShowAddWidget(true);
                      }}
                      onRemoveClick={(addr) => {
                        setPreSelectedPoolAddr(addr);
                        setShowRemoveWidget(true);
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
