"use client";

import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import CurveAMMABI from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json";
import FACTORY_ABI from "@/contracts/artifacts/src/contracts/CurveAMMFactory.sol/CurveAMMFactory.json";
import ERC20_ABI from "@/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json";
import LiquidityList from "@/components/layout/LiquidityCardList";
import Link from "next/link";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;

export default function PoolPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [factory, setFactory] = useState<any>(null);

  const [tokenA, setTokenA] = useState<string>("");
  const [tokenB, setTokenB] = useState<string>("");
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");
  const [selectedPool, setSelectedPool] = useState<{
    tokenA: string;
    tokenB: string;
    tokenAAddress: string;
    tokenBAddress: string;
    poolAddress: string;
    reserveA: bigint;
    reserveB: bigint;
  }>({
    tokenA: "",
    tokenB: "",
    tokenAAddress: "",
    tokenBAddress: "",
    poolAddress: "",
    reserveA: BigInt(0),
    reserveB: BigInt(0),
  });
  const [selectedPoolCon, setSelectedPoolCon] = useState<Contract>();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [symbolToAddress, setSymbolToAddress] = useState<
    Record<string, string>
  >({});

  const [ammPools, setAmmPools] = useState<
    {
      tokenA: string;
      tokenB: string;
      tokenAAddress: string;
      tokenBAddress: string;
      poolAddress: string;
      reserveA: bigint;
      reserveB: bigint;
    }[]
  >([]);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();
      const factoryContract = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI.abi,
        signer
      );
      setAccount(userAddress);
      setProvider(browserProvider);
      setFactory(factoryContract);
    }
    init();
  }, []);

  const fetchTokenInfo = async (tokenAddress: string) => {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI.abi, provider);
    const symbol = await tokenContract.symbol();
    return { symbol };
  };

  const fetchAMMs = async () => {
    if (!factory) return;

    const pools: {
      tokenA: string;
      tokenB: string;
      tokenAAddress: string;
      tokenBAddress: string;
      poolAddress: string;
      reserveA: bigint;
      reserveB: bigint;
    }[] = [];

    const ammAddresses: string[] = await factory.getAMMs();

    const newSymbolToAddress: Record<string, string> = {};

    console.log(ammAddresses);

    for (const addr of ammAddresses) {
      const amm = new Contract(addr, CurveAMMABI.abi, provider);

      const reserve1 = await amm.token_0_reserve();
      const reserve2 = await amm.token_1_reserve();

      const token1Address = await amm.token_0();
      const token2Address = await amm.token_1();

      const token1Info = await fetchTokenInfo(token1Address);
      const token2Info = await fetchTokenInfo(token2Address);

      // 👇 建立 symbol 到 address 映射
      newSymbolToAddress[token1Info.symbol] = token1Address;
      newSymbolToAddress[token2Info.symbol] = token2Address;

      pools.push({
        poolAddress: addr,
        tokenA: token1Info.symbol,
        tokenAAddress: token1Address,
        tokenB: token2Info.symbol,
        tokenBAddress: token2Address,
        reserveA: BigInt(reserve1),
        reserveB: BigInt(reserve2),
      });
    }
    setSymbolToAddress(newSymbolToAddress);
    console.log(newSymbolToAddress);
    setAmmPools(pools);
    console.log(pools);
  };

  const handleAddLiquidity = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    if (!token1Amount || !token2Amount || !selectedPool) {
      alert("Please enter all fields");
      return;
    }

    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const poolAddress = selectedPool.poolAddress;
      console.log(poolAddress);
      const poolContract = new ethers.Contract(
        poolAddress,
        CurveAMMABI.abi,
        signer
      );

      const token1 = new ethers.Contract(
        symbolToAddress[tokenA],
        ERC20_ABI.abi,
        signer
      );
      const token2 = new ethers.Contract(
        symbolToAddress[tokenB],
        ERC20_ABI.abi,
        signer
      );

      const amount1 = ethers.parseUnits(token1Amount, 18);
      const amount2 = ethers.parseUnits(token2Amount, 18);

      const signerAddr = await signer.getAddress();
      const poolConAddr = await poolContract.getAddress();

      const allowance1 = await token1.allowance(signerAddr, poolConAddr);
      if (allowance1 < amount1) {
        const tx1 = await token1.approve(poolConAddr, amount1);
        await tx1.wait();
      }

      const allowance2 = await token2.allowance(signerAddr, poolConAddr);
      if (allowance2 < amount2) {
        const tx2 = await token2.approve(poolConAddr, amount2);
        await tx2.wait();
      }

      const tx = await poolContract.addLiquidity(amount1, amount2);
      await tx.wait();

      alert("Liquidity added successfully");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!window.ethereum || !selectedPool) {
      alert("Please connect your wallet and select a pool");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const poolAddress = selectedPool.poolAddress;
      const poolContract = new ethers.Contract(
        poolAddress,
        CurveAMMABI.abi,
        signer
      );

      const liquidityAmount = ethers.parseUnits("1.0", 18); // 示例值

      const tx = await poolContract.removeLiquidity(liquidityAmount);
      await tx.wait();

      alert("Liquidity removed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to remove liquidity");
    }
  };

  const handleAddLiquidityWindow = () => {
    fetchAMMs();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
              <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
                    ADD LIQUIDITY
                  </p>
                </div>
                {selectedPool.poolAddress != "" && (
                  <div className="mb-6 text-sm text-gray-600 space-y-1 p-3 rounded-lg border bg-gray-50">
                    <p>
                      <span className="font-semibold">Pool Address:</span>{" "}
                      {selectedPool.poolAddress.slice(0, 16)}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {selectedPool.tokenA} Reserve:
                      </span>{" "}
                      {ethers.formatUnits(selectedPool.reserveA, 18) ??
                        "Loading..."}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {selectedPool.tokenB} Reserve:
                      </span>{" "}
                      {ethers.formatUnits(selectedPool.reserveB, 18) ??
                        "Loading..."}
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <label className="block text-xs text-gray-500 mb-1">
                    Select Pool
                  </label>
                  <select
                    value={selectedPool?.poolAddress}
                    onChange={(e) => {
                      const selectedAddress = e.target.value;
                      const selected = ammPools.find(
                        (pool) => pool.poolAddress === selectedAddress
                      );
                      if (selected) {
                        setSelectedPool(selected);
                        setTokenA(selected.tokenA);
                        setTokenB(selected.tokenB);
                      }
                    }}
                    className="w-full p-3 border rounded-lg bg-white text-gray-700"
                  >
                    <option value="" disabled>
                      -- Select a Pool --
                    </option>
                    {ammPools.map((pool, index) => (
                      <option key={index} value={pool.poolAddress}>
                        {pool.tokenA}/{pool.tokenB}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/amm"
                    className="text-xs hover:text-gray-300 transition duration-300 text-right"
                  >
                    Need more pools?
                  </Link>
                </div>
                <div className="space-y-3">
                  {/* Token 1 */}
                  <div>
                    <label className="block text-xs text-gray-500">
                      {selectedPool.tokenA == ""
                        ? "Selected"
                        : selectedPool.tokenA}{" "}
                      Amount
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        value={token1Amount}
                        onChange={(e) => setToken1Amount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 p-3 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Token 2 */}
                  <div>
                    <label className="block text-xs text-gray-500">
                      {selectedPool.tokenB == ""
                        ? "Selected"
                        : selectedPool.tokenB}{" "}
                      Amount
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        value={token2Amount}
                        onChange={(e) => setToken2Amount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 p-3 border rounded-lg"
                      />
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
          <div className="h-96 overflow-y-auto">
            <LiquidityList />
          </div>
        </div>
      </div>
    </main>
  );
}
