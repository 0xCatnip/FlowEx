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

    const volume =
      parseFloat(formatUnits(trade.amountA, 18)) +
      parseFloat(formatUnits(trade.amountB, 18));

    const existing = acc.find((item) => item.time === timeKey);

    if (existing) {
      existing.volume += volume;
    } else {
      acc.push({ time: timeKey, volume });
    }

    return acc;
  }, [] as { time: string; volume: number }[]);

  return (
    <div className="h-[24rem] w-full">
      <h2 className="text-xl font-semibold mb-2">Volume Over Time</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
