"use client";

import { Trade } from "@/components/template";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend, // 新增
} from "recharts";
import { ethers } from "ethers";

function formatLargeNumber(numStr: string) {
  const num = Number(numStr);
  if (num === 0) return "0.00";
  if (Math.abs(num) >= 1e6) return num.toExponential(2);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LiquidityChart({ trades, poolName }: { trades: Trade[], poolName: string }) {
  let cumulativeA = ethers.parseUnits("0", 18);
  let cumulativeB = ethers.parseUnits("0", 18);

  const data = trades.map((t) => {
    const deltaA =
      t.action === "AddLiquidity"
        ? ethers.parseUnits(t.amountA.toString(), 18)
        : t.action === "RemoveLiquidity"
        ? -ethers.parseUnits(t.amountA.toString(), 18)
        : ethers.parseUnits("0", 18);

    const deltaB =
      t.action === "AddLiquidity"
        ? ethers.parseUnits(t.amountB.toString(), 18)
        : t.action === "RemoveLiquidity"
        ? -ethers.parseUnits(t.amountB.toString(), 18)
        : ethers.parseUnits("0", 18);

    cumulativeA = cumulativeA + deltaA;
    cumulativeB = cumulativeB + deltaB;

    return {
      time: new Date(t.datetime).toLocaleTimeString(),
      liquidityA: ethers.formatUnits(cumulativeA, 18),
      liquidityB: ethers.formatUnits(cumulativeB, 18),
    };
  });

  const maxA = Math.max(...data.map(d => Number(d.liquidityA)), 0);
  const maxB = Math.max(...data.map(d => Number(d.liquidityB)), 0);
  const yMax = Math.max(maxA, maxB) * 1.2; // 最大值上浮20%，防止顶到顶部

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Liquidity Over Time for {poolName}</h2>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 40, right: 50, left: 30, bottom: 20 }}
        >
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis
            tickFormatter={formatLargeNumber}
            width={60}
            domain={[0, yMax]}
          />
          <Tooltip
            formatter={(value: string) => [
              formatLargeNumber(value),
              "Token Amount",
            ]}
          />
          <Legend /> {/* 新增图例 */}
          <Line
            type="monotone"
            dataKey="liquidityA"
            stroke="#00bcd4"
            name="Token A Liquidity"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="liquidityB"
            stroke="#ff9800"
            name="Token B Liquidity"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}