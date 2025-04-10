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
      const token1Address = await amm.token1();
      const token2Address = await amm.token2();

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
      });
    }
    setSymbolToAddress(newSymbolToAddress);
    setAmmPools(pools);
    console.log(newSymbolToAddress);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 mt-10">
      <h1 className="text-2xl font-bold">Curve-style AMM Pools</h1>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Token A address"
          value={tokenA}
          onChange={(e) => setTokenA(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Token B address"
          value={tokenB}
          onChange={(e) => setTokenB(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={createAMM}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create AMM"}
        </button>
      </div>
      <button onClick={fetchAMMs} className="px-4 py-2 border rounded">
        Refresh Pools
      </button>
      <div className="space-y-2">
        {ammPools.length === 0 && (
          <p className="text-gray-500">No pools found</p>
        )}
        {ammPools.map((pool, idx) => (
          <div key={idx} className="p-3 border rounded bg-gray-50">
            <p>
              Pool #{idx + 1}: {pool.poolAddress}
            </p>
            <p>
              Token {pool.tokenA}: {pool.tokenAAddress}
            </p>
            <p>
              Token {pool.tokenB}: {pool.tokenBAddress}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
