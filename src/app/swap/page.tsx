"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { useWallet } from "@/utils/WalletService";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { FlowExService } from "@/utils/FlowExService";
import { Pool, PoolInfo, Token, Trade } from "@/components/template";
import { CurveAMMService } from "@/utils/CurveAMMService";
import Link from "next/link";
import TransactionCard from "@/components/layout/TransactionWidget";

export default function SwapPage() {
  const { account, connect } = useWallet();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();
  const [trades, setTrades] = useState<Trade[]>([]);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);

  const [selectedPoolAddr, setSelectedPoolAddr] = useState("");
  const [selectedPool, setSelectedPool] = useState<PoolInfo>();

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("0");
  const [toAmount, setToAmount] = useState("0");
  const [fromRemain, setFromRemain] = useState(0);
  const [toRemain, setToRemain] = useState(0);
  const [expectedSlippage, setExpectedSlippage] = useState(0);
  const [slippage, setSlippage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [flowExService, setFlowExService] = useState<FlowExService | null>(
    null
  );
  const [poolService, setPoolService] = useState<CurveAMMService | null>(null);

  const [activeTab, setActiveTab] = useState("SWAP");

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
        const filted = allTrades.filter(
          (t) => t.action === "Swap"
        );
        setTrades(filted);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [pools]);

  // 获取 token 列表
  useEffect(() => {
    const fetchTokens = async () => {
      if (selectedPoolAddr) {
        const selected = pools.find((p) => p.poolAddress === selectedPoolAddr);
        if (selected) await fetchPoolToInfo(selected);
      }
    };

    fetchTokens();
  }, [tokens, pools]);

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

  const fetchPoolToInfo = async (pool: Pool) => {
    if (signer) {
      const poolService = new CurveAMMService(pool.poolAddress, signer);
      setPoolService(poolService);
      const tnr = await poolService.getTokensAndReserve();
      const selectedPool = {
        poolAddr: pool.poolAddress,
        nameA: fetchTokenName(tnr.tokenA),
        nameB: fetchTokenName(tnr.tokenB),
        addrA: tnr.tokenA,
        addrB: tnr.tokenB,
        reserveA: BigInt(tnr.reserveA),
        reserveB: BigInt(tnr.reserveB),
      };

      setSelectedPool(selectedPool);
      setFromToken(selectedPool.addrA);
      setToToken(selectedPool.addrB);
      const fn = ethers.formatUnits(selectedPool.reserveA.toString(), 18);
      setFromRemain(Number(fn));

      const tn = ethers.formatUnits(selectedPool.reserveB.toString(), 18);
      setToRemain(Number(tn));
    }
  };

  const handleSwap = async () => {
    if (!poolService) return;
    if (!fromAmount || !toAmount || !selectedPool) {
      alert("Please enter all fields");
      return;
    }
    try {
      const inputAmount = ethers.parseUnits(fromAmount, 18);
      const result = await poolService.swap(fromToken, inputAmount);
      window.location.reload();
    } catch (error) {
      alert(error);
    }
  };

  const handleTokenSwap = () => {
    setFromToken(toToken); // Swap the fromToken and toToken
    setToToken(fromToken);
    if (fromAmount) {
      setFromAmount(toAmount);
      keyInNum(toAmount);
    }
  };

  const keyInNum = async (num: string) => {
    setFromAmount(num);
    if (!poolService) return;
    const inputAmount = ethers.parseUnits(num, 18);
    if (!fromToken) return;
    const result = await poolService.previewSwap(fromToken, inputAmount);
    if (result) {
      const num = ethers.formatUnits(result.outputAmount, 18);
      setToAmount(num);
      const expectedOutput =
        result.outputAmount +
        ((await poolService.contract.feeRate()) * inputAmount) / 10000n;
      const slippage = calculateSlippage(expectedOutput, result.outputAmount);
      // console.log("Slippage:", slippage.toFixed(2) + "%");
      setSlippage(slippage);
    }
  };

  /**
   * 计算滑点百分比
   * @param expectedOutput 预期输出（不含费用）
   * @param actualOutput 实际输出（合约计算含费用）
   * @returns 滑点百分比（如 0.5 表示 0.5%）
   */
  function calculateSlippage(
    expectedOutput: bigint,
    actualOutput: bigint
  ): number {
    if (expectedOutput <= 0n) return 0;
    const diff = expectedOutput - actualOutput;
    const slippage = Number((diff * 10000n) / expectedOutput) / 100; // 精确到 0.01%
    return Math.max(0, slippage);
  }

  return (
    <main className="min-h-screen py-12">
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-1/3 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-semibold">
              SWAP
            </p>
          </div>

          {/* 标签区 */}
          <div className="flex border-b mb-4 cursor-pointer">
            {/* 标签: Pools */}
            <div
              onClick={() => setActiveTab("SWAP")}
              className={`flex-1 text-center py-2 ${
                activeTab === "SWAP"
                  ? "text-purple-500 font-bold border-b-2 border-purple-500"
                  : "text-gray-500"
              } transition`}
            >
              Swap
            </div>

            <div
              onClick={() => setActiveTab("TRADES")}
              className={`flex-1 text-center py-2 ${
                activeTab === "TRADES"
                  ? "text-purple-500 font-bold border-b-2 border-purple-500"
                  : "text-gray-500"
              } transition`}
            >
              Trades
            </div>
          </div>
          {/* From Token */}
          {activeTab === "SWAP" && (
            <>
              <div className="flex mb-3">
                <div className="flex w-1/2">
                  <div className="w-full">
                    <label className="block text-sm text-gray-500 space-x-1">
                      <span>From</span>
                      <span className="font-bold text-purple-500">
                        {fetchTokenName(fromToken)}
                      </span>
                      <span className="text-purple-500">
                        ({(fromRemain + Number(fromAmount)).toFixed(2)})
                      </span>
                    </label>
                    <div
                      className={`flex w-full border rounded-xl shadow-sm px-2 ${
                        !selectedPool
                          ? "bg-gradient-to-r from-gray-100 to-gray-200"
                          : "bg-gradient-to-r from-blue-100 to-purple-100"
                      } `}
                    >
                      {/* <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="w-5 p-3 bg-transparent"
                  >
                    <option value="" disabled>
                      --
                    </option>
                    {tokens.map((t) => (
                      <option key={t.addr} value={t.addr}>
                        {t.name.toUpperCase()} ({t.addr.slice(0, 4)})
                      </option>
                    ))}
                  </select> */}
                      <input
                        disabled={!selectedPool}
                        type="number"
                        step={0.1}
                        min={0}
                        value={fromAmount}
                        onChange={async (e) => {
                          const num = e.target.value;
                          await keyInNum(num);
                        }}
                        className="w-full p-3 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <button
                    className="hover:text-purple-200 text-purple-500"
                    onClick={handleTokenSwap}
                  >
                    <ArrowsRightLeftIcon className="h-6 w-6 " />
                  </button>
                </div>
                {/* To Token */}
                <div className="flex w-1/2">
                  <div className="w-full">
                    <label className="block text-sm text-gray-500 space-x-1">
                      <span>To</span>
                      <span className="font-bold text-purple-500">
                        {fetchTokenName(toToken)}
                      </span>
                      <span className="text-purple-500">
                        ({(toRemain - Number(toAmount)).toFixed(2)})
                      </span>
                    </label>
                    <div
                      className={`flex w-full border rounded-xl shadow-sm px-2 ${
                        !selectedPool
                          ? "bg-gradient-to-r from-gray-400 to-gray-500"
                          : "bg-gradient-to-r from-blue-400 to-purple-500"
                      } `}
                    >
                      {/* <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="w-5 p-3 bg-transparent"
                  >
                    <option value="" disabled>
                      --
                    </option>
                    {tokens.map((t) => (
                      <option key={t.addr} value={t.addr}>
                        {t.name.toUpperCase()} ({t.addr.slice(0, 4)})
                      </option>
                    ))}
                  </select> */}
                      <input
                        disabled
                        type="number"
                        value={toAmount}
                        className="w-full p-3 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Select Pool
                </label>
                <select
                  value={selectedPoolAddr}
                  onChange={async (e) => {
                    const selectedPoolAddr = e.target.value;
                    setSelectedPoolAddr(selectedPoolAddr);
                    const selected = pools.find(
                      (p) => p.poolAddress === selectedPoolAddr
                    );
                    if (selected) {
                      await fetchPoolToInfo(selected);
                      // setTokenA(selected);
                    }
                  }}
                  className="w-full p-3 border rounded-lg bg-white text-gray-700"
                >
                  <option value="" disabled>
                    -- Select a Pool --
                  </option>
                  {pools.map((pool) => (
                    <option key={pool.poolAddress} value={pool.poolAddress}>
                      {fetchTokenName(pool.tokenA)?.toUpperCase()} /{" "}
                      {fetchTokenName(pool.tokenB)?.toUpperCase()} (
                      {pool.owner.slice(0, 12)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slippage */}
              <div className="mb-6">
                <label className="block text-xs text-gray-500">
                  Slippage Tolerance (%)
                </label>
                <input
                  type="number"
                  value={expectedSlippage}
                  onChange={(e) => setExpectedSlippage(Number(e.target.value))}
                  step="0.1"
                  max={1}
                  min={0}
                  className="w-full p-3 border rounded-lg"
                />
                {slippage > Number(expectedSlippage) && (
                  <span className="text-xs text-red-500">
                    The slippage ({slippage.toFixed(2)}%) is out of expectation
                  </span>
                )}
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                disabled={
                  !account || !toAmount || !fromAmount || !fromToken || !toToken
                }
              >
                {account ? "Swap" : "Connect Wallet to Swap"}
              </button>

              {/* Price Information */}
              {selectedPool && fromAmount && toAmount ? (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-medium mb-2 text-lg text-gray-800">
                    Price Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Exchange Rate:</span> 1{" "}
                      {fetchTokenName(fromToken) || "--"} ≈{" "}
                      {(+toAmount / +fromAmount).toFixed(6)}{" "}
                      {fetchTokenName(toToken) || "--"}
                    </p>
                    <p>
                      <span className="font-medium">Price Impact:</span>{" "}
                      {slippage ? `${slippage.toFixed(2)}%` : "--"}
                    </p>
                    <p>
                      <span className="font-medium">Slippage Tolerance:</span>{" "}
                      {expectedSlippage
                        ? `${expectedSlippage.toFixed(2)}%`
                        : "--"}
                    </p>
                    <p>
                      <span className="font-medium">Network Fee:</span> ~$5.00{" "}
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {activeTab === "TRADES" && (
            <>
              <div className="h-96 overflow-y-auto">
                <div className="space-y-6">
                  {trades.length === 0 ? (
                    <p className="text-gray-400">
                      {isLoading ? "Loading" : "No liquidity positions found."}
                    </p>
                  ) : (
                    trades
                      .slice()
                      .reverse()
                      .map((t, i) => (
                        <div key={i}>
                          <TransactionCard trade={t} />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
