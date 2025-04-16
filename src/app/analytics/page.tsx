"use client";

import FeesChart from "@/components/charts/FeesChart";
import LiquidityChart from "@/components/charts/LiquidityChart";
import ShareChart from "@/components/charts/ShareChart";
import VolumeChart from "@/components/charts/BalanceChart";
import { Pool, Token, Trade } from "@/components/template";
import { CurveAMMService } from "@/utils/CurveAMMService";
import { FlowExService } from "@/utils/FlowExService";
import { useWallet } from "@/utils/WalletService";
import { BrowserProvider, JsonRpcSigner, formatUnits } from "ethers";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedPool, setSelectedPool] = useState("");

  const { account, connect } = useWallet();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  const [flowExService, setFlowExService] = useState<FlowExService | null>(null);
  const [poolService, setPoolService] = useState<CurveAMMService | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [totalValueLocked, setTotalValueLocked] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [fees24h, setFees24h] = useState(0);
  const [apy, setApy] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!account) {
      connect(); // Attempt to connect wallet
    }
  }, []);

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
  }, [account]);

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
            const trades = await ps.getAllTrades();
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
              datetime: new Date(Number(trade.timestamp) * 1000).toLocaleString(),
            }));
          })
        );

        const allTrades = results.flat();
        setTrades(allTrades);

        const now = new Date();
        const trades24h = allTrades.filter(trade => {
          const tradeTime = new Date(trade.datetime);
          return now.getTime() - tradeTime.getTime() <= 24 * 60 * 60 * 1000;
        });

        const tvl = allTrades.reduce((sum, trade) => {
          const amountA = parseFloat(formatUnits(trade.amountA, 18));
          const amountB = parseFloat(formatUnits(trade.amountB, 18));
          return sum + amountA + amountB;
        }, 0);

        const volume = trades24h.reduce((sum, trade) => {
          const amountA = parseFloat(formatUnits(trade.amountA, 18));
          const amountB = parseFloat(formatUnits(trade.amountB, 18));
          return sum + amountA + amountB;
        }, 0);

        const fees = volume * 0.003;
        const yearlyFees = fees * 365;
        const calculatedApy = tvl > 0 ? (yearlyFees / tvl) * 100 : 0;

        setTotalValueLocked(tvl);
        setVolume24h(volume);
        setFees24h(fees);
        setApy(calculatedApy);
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

  // Filter trades for the selected pool
  const selectedPoolTrades = selectedPool
    ? trades.filter((trade) => trade.pooladdress === selectedPool)
    : [];
  const selectedPoolObj = pools.find((pool) => pool.poolAddress === selectedPool);
  const poolName = selectedPoolObj
    ? `${fetchTokenName(selectedPoolObj.tokenA)}/${fetchTokenName(selectedPoolObj.tokenB)}`
    : "No Pool Selected";

  return (
    <main className="w-full">
      <div className="p-16 mt-12">
        <div className="flex w-full items-center">
          <div>
            <h1 className="text-white text-6xl font-bold mb-8">
              {"Analytics".toUpperCase()}
            </h1>
          </div>
          <div className="ml-8"> {/* 添加左边距 */}
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              className="text-white p-3 bg-transparent"
            >
              <option value="">Select a pool</option>
              {pools.map((pool) => (
                <option key={pool.poolAddress} value={pool.poolAddress}>
                  {`${fetchTokenName(pool.tokenA)}/${fetchTokenName(pool.tokenB)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          {/* Time range filter (currently commented out) */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm text-gray-500 mb-2">Total Value Locked</h3>
            <p className="text-2xl font-bold">${totalValueLocked.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm text-gray-500 mb-2">24h Volume</h3>
            <p className="text-2xl font-bold">${volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm text-gray-500 mb-2">24h Fees</h3>
            <p className="text-2xl font-bold">${fees24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-sm text-gray-500 mb-2">APY</h3>
            <p className="text-2xl font-bold">{apy.toFixed(2)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ShareChart trades={selectedPoolTrades} account={account || ""} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <VolumeChart trades={selectedPoolTrades} account={account || ""} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <LiquidityChart trades={selectedPoolTrades} poolName={poolName} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <FeesChart trades={selectedPoolTrades} />
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Token A</th>
                  <th className="pb-2">Token B</th>
                  <th className="pb-2">Amount A</th>
                  <th className="pb-2">Amount B</th>
                </tr>
              </thead>
              <tbody>
                {selectedPoolTrades.slice().reverse().slice(0, 10).map((trade, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{trade.datetime}</td>
                    <td className="py-2">{trade.action}</td>
                    <td className="py-2">{trade.tokenA}</td>
                    <td className="py-2">{trade.tokenB}</td>
                    <td className="py-2">{parseFloat(formatUnits(trade.amountA, 18)).toFixed(6)}</td>
                    <td className="py-2">{parseFloat(formatUnits(trade.amountB, 18)).toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}