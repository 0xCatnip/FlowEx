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
  const data = trades.map((t) => {
    const time = new Date(t.datetime);
    const timeKey = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, "0")}-${String(
      time.getDate()
    ).padStart(2, "0")} ${String(time.getHours()).padStart(2, "0")}:${String(
      time.getMinutes()
    ).padStart(2, "0")}`;

    const amountA = parseFloat(formatUnits(t.amountA, 18));
    const amountB = parseFloat(formatUnits(t.amountB, 18));
    const fees = (amountA + amountB) * 0.003;

    return {
      time: timeKey,
      fees,
    };
  });

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Fees Collected</h2>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="fees" stroke="#ffc658" fill="#ffc658" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
