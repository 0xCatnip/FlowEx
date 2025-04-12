"use client";

import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import AMM_CURVE_ABI from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json";
import FACTORY_ABI from "@/contracts/artifacts/src/contracts/CurveAMMFactory.sol/CurveAMMFactory.json";
import ERC20_ABI from "@/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;

export default function AMMPoolPage() {
  const [provider, setProvider] = useState<any>(null);
  const [factory, setFactory] = useState<any>(null);
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenBAddress, setTokenBAddress] = useState("");
  const [loading, setLoading] = useState(false);
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
    }[]
  >([]);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const factoryContract = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI.abi,
        signer
      );

      setProvider(browserProvider);
      setFactory(factoryContract);
    }
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAMMs();
    };

    fetchData();
  }, [factory]);

  const fetchTokenInfo = async (tokenAddress: string) => {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI.abi, provider);
    const symbol = await tokenContract.symbol();
    return { symbol };
  };

  const createAMM = async () => {
    await fetchAMMs();
    if (!factory || !provider) return;
    try {
      setLoading(true);
      const signer = await provider.getSigner();

      let addressA = symbolToAddress[tokenA] || "";
      let addressB = symbolToAddress[tokenB] || "";

      if (!tokenA || !tokenB) {
        alert("The input should not be empty");
        return;
      }

      // 如果 A 或 B 地址为空，部署新的 MockERC20
      if (!ethers.isAddress(addressA)) {
        const ERC20Factory = new ethers.ContractFactory(
          ERC20_ABI.abi,
          ERC20_ABI.bytecode,
          signer
        );
        const tokenAContract = await ERC20Factory.deploy(tokenA, tokenA);
        await tokenAContract.waitForDeployment();
        addressA = await tokenAContract.getAddress(); // ✅ 取地址
        setTokenAAddress(addressA);
        console.log("Deployed Token A at:", addressA);

        const tokenAWithMint = new ethers.Contract(
          await tokenAContract.getAddress(),
          ERC20_ABI.abi,
          signer
        );
        await tokenAWithMint.mint(
          await signer.getAddress(),
          ethers.parseUnits("1000000", 18)
        );
      }

      if (!ethers.isAddress(addressB)) {
        const ERC20Factory = new ethers.ContractFactory(
          ERC20_ABI.abi,
          ERC20_ABI.bytecode,
          signer
        );
        const tokenBContract = await ERC20Factory.deploy(tokenB, tokenB);
        await tokenBContract.waitForDeployment();
        addressB = await tokenBContract.getAddress();
        setTokenBAddress(addressB);
        console.log("Deployed Token B at:", addressB);

        const tokenBWithMint = new ethers.Contract(
          await tokenBContract.getAddress(),
          ERC20_ABI.abi,
          signer
        );
        await tokenBWithMint.mint(
          await signer.getAddress(),
          ethers.parseUnits("1000000", 18)
        );
      }

      // 检查是否已有 AMM
      const existingAMM = await factory.getAMM(addressA, addressB);
      if (existingAMM !== ethers.ZeroAddress) {
        alert("AMM already exists at: " + existingAMM);
        return;
      }

      // 创建 AMM
      const tx = await factory.createAMM(addressA, addressB);
      await tx.wait();
      console.log("AMM created for:", addressA, addressB);
      await fetchAMMs();
    } catch (err) {
      console.error("Create AMM failed:", err);
      alert("Create AMM failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAMMs = async () => {
    if (!factory) return;

    const pools: {
      tokenA: string;
      tokenB: string;
      tokenAAddress: string;
      tokenBAddress: string;
      poolAddress: string;
    }[] = [];

    const ammAddresses: string[] = await factory.getAMMs();

    const newSymbolToAddress: Record<string, string> = {};

    console.log(ammAddresses);

    for (const addr of ammAddresses) {
      const amm = new Contract(addr, AMM_CURVE_ABI.abi, provider);
      const tokenAAddress = await amm.token_0();
      const tokenBAddress = await amm.token_1();

      const tokenAInfo = await fetchTokenInfo(tokenAAddress);
      const tokenBInfo = await fetchTokenInfo(tokenBAddress);

      // 👇 建立 symbol 到 address 映射
      newSymbolToAddress[tokenAInfo.symbol] = tokenAAddress;
      newSymbolToAddress[tokenBInfo.symbol] = tokenBAddress;

      pools.push({
        poolAddress: addr,
        tokenA: tokenAInfo.symbol,
        tokenAAddress: tokenAAddress,
        tokenB: tokenBInfo.symbol,
        tokenBAddress: tokenBAddress,
      });
    }
    setSymbolToAddress(newSymbolToAddress);
    setAmmPools(pools);
    console.log(newSymbolToAddress);
  };

  return (
    <main className="min-h-screen">
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="w-1/3 h-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent text-3xl font-bold">
              Curve-style AMM Pools
            </p>
          </div>
          <div className="flex gap-2 my-6">
            <div className="flex-1">
              <label className="block text-xs text-gray-500">Name of Token A</label>
              <input
                type="text"
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                placeholder="Token A address"
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500">Name of Token B</label>
              <input
                type="text"
                placeholder="Token B address"
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={createAMM}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
          >
            {loading ? "Creating..." : "Create AMM"}
          </button>
          <button
            onClick={fetchAMMs}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 mb-4"
          >
            Refresh Pools
          </button>
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {ammPools.length === 0 && (
                <p className="text-gray-500">No pools found</p>
              )}
              {ammPools.map((pool, idx) => (
                <div key={idx} className="p-4 text-sm border rounded-lg bg-gray-50 shadow-md hover:shadow-lg transition duration-200">
                  <p className="font-semibold">Pool #{idx + 1}: {pool.poolAddress.slice(0,16)} ...</p>
                  <p className="text-xs">Token {pool.tokenA}: {pool.tokenAAddress.slice(0,16)} ...</p>
                  <p className="text-xs">Token {pool.tokenB}: {pool.tokenBAddress.slice(0,16)} ...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
