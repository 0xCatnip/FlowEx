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

export default function RemoveLiquidityWidget({
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
  const [isInvalid, setMaxReached] = useState(false);

  const [lpAmount, setLpAmount] = useState<string>("");

  const [withdrawPreview, setWithdrawPreview] = useState<{
    amountA: string;
    amountB: string;
    remainA: string;
    remainB: string;
  } | null>(null);

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
    if (fetched) return fetched.name;
    else return "";
  };

  const getAllTokens = async () => {
    if (!flowExService) return;
    const updatedTokens = await flowExService.getAllTokens();
    const plainData = updatedTokens.map((item) => ({
      name: item.name,
      addr: item.tokenAddress,
    }));
    setTokens(plainData);
    console.log(plainData);
  };

  const getAllPools = async () => {
    if (!flowExService) return;
    const updatedPools = await flowExService.getAllPools();
    const plainData: Pool[] = updatedPools.map((p) => ({
      tokenA: p.tokenA,
      tokenB: p.tokenB,
      poolAddress: p.poolAddress,
      owner: p.owner,
    }));
    setPools(plainData);
    console.log(plainData);
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
    if (!lpAmount || !selectedPool) {
      alert("Please enter all fields");
      return;
    }

    const LP = ethers.parseUnits(lpAmount, 18);

    const result = await poolService.removeLiquidity(LP);
    console.log(result);
    alert("Successfully Generated");
    setSelectedPool(undefined);
    setLpAmount("");
    setLpAmount("");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 h-full w-full z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-20">
      <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
            REMOVE LIQUIDITY
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

        {selectedPool && withdrawPreview && (
          <div className="mb-4 text-sm text-gray-600 p-3">
            <p className="text-sm font-semibold text-purple-600">
              Predicted Withdrawal:
            </p>
            <div className="mt-3 flex space-y-1 flex-col">
              <div className="flex">
                <div className="w-1/4">You’ll receive:</div>
                <div className="w-1/4">
                  {selectedPool.nameA.toUpperCase()}:{" "}
                  <span className="font-medium">
                    {withdrawPreview.amountA.slice(0, 6)}
                  </span>
                </div>
                <div>
                  {selectedPool.nameB.toUpperCase()}:
                  <span className="font-medium">
                    {withdrawPreview.amountB.slice(0, 6)}
                  </span>
                </div>
              </div>
              <div className="flex">
                <div className="w-1/4">Remaining in pool:</div>
                <div className="w-1/4">
                  {selectedPool.nameA.toUpperCase()}:{" "}
                  <span className="font-medium">
                    {withdrawPreview.remainA.slice(0, 6)}
                  </span>
                </div>
                <div className="w-1/4">
                  {selectedPool.nameB.toUpperCase()}:{" "}
                  <span className="font-medium">
                    {withdrawPreview.remainB.slice(0, 6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mb-2">
          <div className="flex space-x-4">
            <div className="w-full">
              <label className="block text-xs text-gray-500">Select Pool</label>
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
            </div>
            <div className="w-full">
              <label className="block text-xs text-gray-500">LP Amount</label>
              <input
                disabled={!selectedPool}
                type="number"
                value={lpAmount}
                onChange={async (e) => {
                  const newVal = e.target.value;
                  setLpAmount(newVal);

                  if (!poolService || !newVal) {
                    setWithdrawPreview(null);
                    setMaxReached(false);
                    return;
                  }

                  const parsedVal = parseFloat(newVal);

                  if (parsedVal < 0) {
                    setLpAmount("0");
                    return;
                  }

                  try {
                    const prediction = await poolService.predictWithdrawResult(
                      newVal
                    );
                    setWithdrawPreview(prediction);

                    const remainA = parseFloat(prediction.remainA);
                    const remainB = parseFloat(prediction.remainB);
                    const isNegative = remainA < 0 || remainB < 0;

                    setMaxReached(isNegative);
                  } catch (err) {
                    console.error("Prediction error", err);
                    setMaxReached(true);
                    setWithdrawPreview(null);
                  }
                }}
                placeholder="0.0"
                className={`w-full p-3 border rounded-lg ${
                  isInvalid ? "border-red-500" : ""
                }`}
              />
              {isInvalid && (
                <p className="text-red-500 text-xs mt-1">
                  Amount exceeds maximum withdrawable. Please lower the LP
                  amount.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between space-x-4">
          <button
            onClick={() => setVisible(false)}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-300"
          >
            Cancel
          </button>
          <button
            disabled={!selectedPool || isInvalid}
            onClick={onConfirm}
            className={`${
              selectedPool && !isInvalid
                ? "bg-gradient-to-r from-purple-400 to-blue-500"
                : "bg-gray-300"
            } w-full text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-300`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
