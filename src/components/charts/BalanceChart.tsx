"use client";

import { Trade } from "@/components/template";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatUnits } from "ethers";

interface VolumeChartProps {
  trades: Trade[];
  account: string;
}

export default function VolumeChart({ trades, account }: VolumeChartProps) {
  // 只保留当前用户的交易
  const userTrades = trades.filter(
    (t) => t.user?.toLowerCase() === account?.toLowerCase()
  );

  // 累计每种代币的余额随时间变化
  type BalanceMap = Record<string, number>;
  let balances: BalanceMap = {};

  // 生成每个时间点的余额快照
  const data = userTrades.map((trade) => {
    // 处理 AddLiquidity/RemoveLiquidity
    const deltaA =
      trade.action === "AddLiquidity"
        ? parseFloat(formatUnits(trade.amountA, 18))
        : trade.action === "RemoveLiquidity"
        ? -parseFloat(formatUnits(trade.amountA, 18))
        : 0;
    const deltaB =
      trade.action === "AddLiquidity"
        ? parseFloat(formatUnits(trade.amountB, 18))
        : trade.action === "RemoveLiquidity"
        ? -parseFloat(formatUnits(trade.amountB, 18))
        : 0;

    // 累加余额
    balances = { ...balances }; // 拷贝
    balances[trade.tokenA] = (balances[trade.tokenA] || 0) + deltaA;
    balances[trade.tokenB] = (balances[trade.tokenB] || 0) + deltaB;

    // 记录快照
    return {
      time: new Date(trade.datetime).toLocaleTimeString(),
      ...balances,
    };
  });

  // 获取所有出现过的代币
  const tokenSet = new Set<string>();
  userTrades.forEach((t) => {
    tokenSet.add(t.tokenA);
    tokenSet.add(t.tokenB);
  });
  const tokenList = Array.from(tokenSet);

  return (
    <div className="h-[24rem] w-full">
      <h2 className="text-xl font-semibold mb-2">Your Token Balances Over Time</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" align="right" /> {/* 图例放到右上角 */}
          {tokenList.map((token, idx) => (
            <Line
              key={token}
              type="monotone"
              dataKey={token}
              name={token}
              stroke={["#8884d8", "#82ca9d", "#ff9800", "#00bcd4", "#e91e63"][idx % 5]}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
