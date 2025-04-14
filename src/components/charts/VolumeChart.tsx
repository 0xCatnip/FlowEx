"use client";

import { Trade } from "@/components/template";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatUnits } from "ethers";

interface VolumeChartProps {
  trades: Trade[];
}

export default function VolumeChart({ trades }: VolumeChartProps) {
  const data = trades.reduce((acc, trade) => {
    const time = new Date(trade.datetime);
    const timeKey = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}-${String(
      time.getDate()
    ).padStart(2, "0")} ${String(time.getHours()).padStart(2, "0")}:${String(
      time.getMinutes()
    ).padStart(2, "0")}`;

    // 假设每个代币的价格为1美元进行计算
    const volumeUSD =
      parseFloat(formatUnits(trade.amountA, 18)) +
      parseFloat(formatUnits(trade.amountB, 18));

    const existing = acc.find((item) => item.time === timeKey);

    if (existing) {
      existing.volumeUSD += volumeUSD;
      existing.cumulativeVolume = (existing.cumulativeVolume || 0) + volumeUSD;
    } else {
      const lastCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativeVolume : 0;
      acc.push({
        time: timeKey,
        volumeUSD,
        cumulativeVolume: lastCumulative + volumeUSD
      });
    }

    return acc;
  }, [] as { time: string; volumeUSD: number; cumulativeVolume: number }[]);


  return (
    <div className="h-[24rem] w-full">
      <h2 className="text-xl font-semibold mb-2">Volume Over Time</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis
            yAxisId="left"
            label={{ value: 'Volume (USD)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Cumulative Volume (USD)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value: number) => ['$' + value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }), 'Volume']}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="volumeUSD"
            name="Volume"
            stroke="#8884d8"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeVolume"
            name="Cumulative Volume"
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
