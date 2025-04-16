"use client";

import { Trade } from "@/components/template";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend, // 添加图例
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
      {/* 图例放到图表外部顶部 */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ color: "#ffc658", fontWeight: 600, marginRight: 16 }}>● Fees</span>
        <span style={{ color: "#82ca9d", fontWeight: 600 }}>● Cumulative Fees</span>
      </div>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 30, left: 10, bottom: 40 }} // 顶部margin减小，底部margin增大
        >
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis
            yAxisId="left"
            // 移除label
            tickFormatter={(value) => '$' + value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            // 移除label
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
