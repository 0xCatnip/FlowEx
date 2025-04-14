"use client";

import { Trade } from "@/components/template";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatUnits } from "ethers";

export default function FeesChart({ trades }: { trades: Trade[] }) {
  const data = trades.reduce((acc, t) => {
    const time = new Date(t.datetime);
    const timeKey = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}-${String(
      time.getDate()
    ).padStart(2, "0")} ${String(time.getHours()).padStart(2, "0")}:${String(
      time.getMinutes()
    ).padStart(2, "0")}`;

    const amountA = parseFloat(formatUnits(t.amountA, 18));
    const amountB = parseFloat(formatUnits(t.amountB, 18));
    const fees = (amountA + amountB) * 0.003;

    const existing = acc.find(item => item.time === timeKey);
    if (existing) {
      existing.fees += fees;
      existing.cumulativeFees = (acc[acc.length - 1]?.cumulativeFees || 0) + fees;
    } else {
      const lastCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativeFees : 0;
      acc.push({
        time: timeKey,
        fees,
        cumulativeFees: lastCumulative + fees
      });
    }

    return acc;
  }, [] as { time: string; fees: number; cumulativeFees: number }[]);

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Fees Collected</h2>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis
            yAxisId="left"
            label={{ value: 'Fees (USD)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => '$' + value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Cumulative Fees (USD)', angle: 90, position: 'insideRight' }}
            tickFormatter={(value) => '$' + value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          />
          <Tooltip
            formatter={(value: number) => [
              '$' + value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              value === data[data.length - 1]?.cumulativeFees ? 'Cumulative Fees' : 'Fees'
            ]}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="fees"
            name="Fees"
            stroke="#ffc658"
            fill="#ffc658"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeFees"
            name="Cumulative Fees"
            stroke="#82ca9d"
            fill="#82ca9d"
            opacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
