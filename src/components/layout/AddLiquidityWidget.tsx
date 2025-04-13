"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/utils/WalletService";
import { FlowExService } from "@/utils/FlowExService";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";
import { CurveAMMService } from "@/utils/CurveAMMService";

interface PoolInfo {
  poolAddr: string;
  nameA: string;
  nameB: string;
  addrA: string;
  addrB: string;
  reserveA: bigint;
  reserveB: bigint;
}

type Props = {
  visible: boolean;
  preAddr: string;
  setVisible: (v: boolean) => void;
};

export default function AddLiquidityWidget({
  visible,
  preAddr,
  setVisible,
}: Props) {
  if (!visible) return null;
  const { account, connect } = useWallet();

  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  const [flowExService, setFlowExService] = useState<FlowExService | null>(
    null
  );
  const [poolService, setPoolService] = useState<CurveAMMService | null>(null);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);

  const [selectedPool, setSelectedPool] = useState<PoolInfo>();
  const [selectedPoolAddr, setSelectedPoolAddr] = useState(preAddr);

  const [tokenA, setTokenA] = useState<Token>();
  const [tokenB, setTokenB] = useState<Token>();
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [addrA, setAddrA] = useState("");
  const [addrB, setAddrB] = useState("");

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
    }
  };

  const onConfirm = async () => {
    if (!poolService) return;
    if (!amountA || !amountB || !selectedPool) {
      alert("Please enter all fields");
      return;
    }

    const A = ethers.parseUnits(amountA, 18);
    const B = ethers.parseUnits(amountB, 18);

    const result = await poolService.addLiquidity(
      A,
      B,
      selectedPool.addrA,
      selectedPool.addrB
    );
    alert("Successfully Generated");
    setSelectedPool(undefined);
    setAmountA("");
    setAmountA("");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 h-full w-full z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-20">
      <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
            ADD LIQUIDITY
          </p>
        </div>

        {selectedPool && (
          <div className="mb-4 text-sm text-gray-600 space-y-1 p-3 rounded-lg border bg-gray-50">
            <p>
              <span className="font-semibold">Pool Address:</span>{" "}
              {selectedPool.poolAddr.slice(0, 16)}
            </p>
            <p>
              <span className="font-semibold">
                Reserve of {selectedPool.nameA.toUpperCase()}:
              </span>{" "}
              {ethers.formatUnits(selectedPool.reserveA, 18)}
            </p>
            <p>
              <span className="font-semibold">
                Reserve of {selectedPool.nameB.toUpperCase()}:
              </span>{" "}
              {ethers.formatUnits(selectedPool.reserveB, 18)}
            </p>
          </div>
        )}

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
            {pools.map((pool, index) => (
              <option key={index} value={pool.poolAddress}>
                {fetchTokenName(pool.tokenA)?.toUpperCase()} /{" "}
                {fetchTokenName(pool.tokenB)?.toUpperCase()}
              </option>
            ))}
          </select>
          <Link
            href="/mint"
            className="text-xs hover:text-gray-300 transition duration-300 text-right block mt-1"
          >
            Need more pools?
          </Link>
        </div>

        <div>
          <div className="flex space-x-4">
            <div className="w-full">
              <label className="block text-xs text-gray-500">
                {selectedPool ? selectedPool.nameA.toUpperCase() : "Token A"}{" "}
                Amount
              </label>
              <input
                disabled={!selectedPool}
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs text-gray-500">
                {selectedPool ? selectedPool.nameB.toUpperCase() : "Token B"}{" "}
                Amount
              </label>
              <input
                disabled={!selectedPool}
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between space-x-4">
            <button
              onClick={() => {
                setVisible(false);
              }}
              className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-300"
            >
              Cancel
            </button>
            <button
              disabled={!selectedPool}
              onClick={onConfirm}
              className={`${
                selectedPool && "bg-gradient-to-r from-purple-400 to-blue-500"
              } w-full text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-300`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
