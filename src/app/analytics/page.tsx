"use client";

import FeesChart from "@/components/charts/FeesChart";
import LiquidityChart from "@/components/charts/LiquidityChart";
import ShareChart from "@/components/charts/ShareChart";
import VolumeChart from "@/components/charts/VolumeChart";
import { Pool, Token, Trade } from "@/components/template";
import { CurveAMMService } from "@/utils/CurveAMMService";
import { FlowExService } from "@/utils/FlowExService";
import { useWallet } from "@/utils/WalletService";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedPool, setSelectedPool] = useState("ETH-USDT");

  const { account, connect } = useWallet();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  const [flowExService, setFlowExService] = useState<FlowExService | null>(
    null
  );
  const [poolService, setPoolService] = useState<CurveAMMService | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);

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
        console.log("init called with account:", account);
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
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
        const filted = allTrades.filter((t) => t.action === "Swap");
        setTrades(filted);
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
    return fetched ? fetched.name : addr.slice(0, 6) + "...";
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
  };

  return (
    <main className="w-full">
      <div className="p-16">
        <div className="flex w-full items-center">
          <div>
            <h1 className="text-white text-6xl font-bold mb-8">
              {"Analytics".toUpperCase()}
            </h1>
          </div>
          <div>
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              className="text-white p-3 bg-transparent"
            >
              <option value="ETH-USDT">ETH/USDT</option>
              <option value="ETH-USDC">ETH/USDC</option>
              <option value="USDT-USDC">USDT/USDC</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          {/* <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select> */}
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
            <ShareChart trades={trades}/>
          </div>

          {/* Volume Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <VolumeChart trades={trades} />
          </div>

          {/* Liquidity Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <LiquidityChart trades={trades}/>
          </div>

          {/* Fees Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <FeesChart trades={trades}/>
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
    </main>
  );
}
