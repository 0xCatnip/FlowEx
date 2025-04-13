"use client";

import { Trade } from "@/components/template";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ethers } from "ethers"; // 从 ethers 导入 utils

export default function LiquidityChart({ trades }: { trades: Trade[] }) {
  let cumulativeA = ethers.parseUnits("0", 18); // 初始值设置为 BigNumber 类型
  let cumulativeB = ethers.parseUnits("0", 18);

  const data = trades.map((t) => {
    const deltaA =
      t.action === "AddLiquidity"
        ? ethers.parseUnits(t.amountA.toString(), 18) // 将 amountA 转换为 BigNumber
        : t.action === "RemoveLiquidity"
        ? -ethers.parseUnits(t.amountA.toString(), 18) // 将 amountA 转换为负值
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
      time: new Date(t.datetime).toLocaleTimeString(), // 时间转为小时:分钟:秒格式
      liquidityA: ethers.formatUnits(cumulativeA, 18), // 格式化为可读值
      liquidityB: ethers.formatUnits(cumulativeB, 18),
    };
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="liquidityA"
            stroke="#00bcd4"
            name="Token A Liquidity"
          />
          <Line
            type="monotone"
            dataKey="liquidityB"
            stroke="#ff9800"
            name="Token B Liquidity"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
