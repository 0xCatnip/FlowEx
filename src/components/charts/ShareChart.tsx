"use client";

import { Trade } from "@/components/template";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatUnits } from "ethers";

// 新增 props: account
export default function ShareChart({ trades, account }: { trades: Trade[], account: string }) {
  // 只保留当前用户的交易
  const userTrades = trades.filter(t => t.user?.toLowerCase() === account?.toLowerCase());

  // 统计每个池子的A/B份额
  const poolShares: Record<string, { pool: string, tokenA: string, tokenB: string, shareA: number, shareB: number }> = {};

  userTrades.forEach(t => {
    const poolKey = `${t.tokenA}/${t.tokenB}`;
    if (!poolShares[poolKey]) {
      poolShares[poolKey] = {
        pool: poolKey,
        tokenA: t.tokenA,
        tokenB: t.tokenB,
        shareA: 0,
        shareB: 0,
      };
    }
    // 假设 AddLiquidity 增加份额，RemoveLiquidity 减少份额
    if (t.action === "AddLiquidity") {
      poolShares[poolKey].shareA += parseFloat(formatUnits(t.amountA, 18));
      poolShares[poolKey].shareB += parseFloat(formatUnits(t.amountB, 18));
    } else if (t.action === "RemoveLiquidity") {
      poolShares[poolKey].shareA -= parseFloat(formatUnits(t.amountA, 18));
      poolShares[poolKey].shareB -= parseFloat(formatUnits(t.amountB, 18));
    }
  });

  const data = Object.values(poolShares);

  const nameMap = {
    shareA: "Token A",
    shareB: "Token B",
  };

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Your Pool Shares</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="pool" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(6),
              nameMap[name as keyof typeof nameMap] || name
            ]}
          />
          <Legend />
          <Bar dataKey="shareA" name="Token A" fill="#82ca9d" />
          <Bar dataKey="shareB" name="Token B" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
