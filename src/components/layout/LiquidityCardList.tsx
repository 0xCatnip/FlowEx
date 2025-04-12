"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import LiquidityCard from "@/components/layout/LiquidityCard";
import erc20Abi from "@/contracts/artifacts/src/contracts/MockERC20.sol/MockERC20.json"
import factoryAbi from "@/contracts/artifacts/src/contracts/CurveAMMFactory.sol/CurveAMMFactory.json";
import curveAmmAbi from "@/contracts/artifacts/src/contracts/CurveAMM.sol/CurveAMM.json";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS!;

interface LiquidityItem {
  pairName: string;
  share: string;
  value: string;
}

export default function LiquidityList() {
  const [liquidityList, setLiquidityList] = useState<LiquidityItem[]>([]);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    const fetchLiquidityData = async () => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi.abi, provider);
      const ammAddresses: string[] = await factory.getAMMs();

      const data = await Promise.all(
        ammAddresses.map(async (ammAddr) => {
          try {
            const amm = new ethers.Contract(ammAddr, curveAmmAbi.abi, provider);

            const [token0Addr, token1Addr] = await Promise.all([
              amm.token_0(),
              amm.token_1(),
            ]);

            const [reserve0, reserve1, totalSupply, userBalance] = await Promise.all([
              amm.token_0_reserve(),
              amm.token_1_reserve(),
              amm.total_lp_supply(),
              amm.user_lp_balance(userAddress),
            ]);

            const token0 = new ethers.Contract(token0Addr, erc20Abi.abi, provider);
            const token1 = new ethers.Contract(token1Addr, erc20Abi.abi, provider);
            const [symbol0, symbol1] = await Promise.all([
              token0.symbol(),
              token1.symbol(),
            ]);

            const share = totalSupply && totalSupply.gt(0)
              ? `${((userBalance.mul(10000).div(totalSupply)).toNumber() / 100).toFixed(2)}%`
              : "0%";

            const totalValue = reserve0+reserve1;
            const userValue = totalSupply && totalSupply.gt(0)
              ? ethers.formatUnits(userBalance.mul(totalValue).div(totalSupply), 18)
              : "0";

            return {
              pairName: `${symbol0}/${symbol1}`,
              share,
              value: userValue,
            };
          } catch (err) {
            console.error("Failed to fetch AMM data:", err);
            return null;
          }
        })
      );

      const filtered = data.filter((item): item is LiquidityItem => item !== null);
      setLiquidityList(filtered);
    };

    fetchLiquidityData();
  }, []);

  const handleAddLiquidity = (pairName: string) => {
    console.log("Add to", pairName);
  };

  const handleRemoveLiquidity = (pairName: string) => {
    console.log("Remove from", pairName);
  };

  return (
    <div className="space-y-6">
      {liquidityList.length === 0 ? (
        <p className="text-gray-400">No liquidity positions found.</p>
      ) : (
        liquidityList.map((item, index) => (
          <LiquidityCard
            key={index}
            pairName={item.pairName}
            share={item.share}
            value={item.value}
            onAdd={() => handleAddLiquidity(item.pairName)}
            onRemove={() => handleRemoveLiquidity(item.pairName)}
            disabled={false}
          />
        ))
      )}
    </div>
  );
}
