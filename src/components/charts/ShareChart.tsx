"use client";

import { Trade } from "@/components/template";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { formatUnits } from "ethers";

export default function ShareChart({ trades }: { trades: Trade[] }) {
  const data = trades
    .filter((t) => t.action !== "Swap")
    .map((t) => {
      const shareValue = Number(formatUnits(t.share, 18));
      return {
        time: t.datetime,
        share: shareValue,
        percentage: (shareValue * 100).toFixed(2) + '%',
        type: t.action,
      };
    });

  return (
    <div className="w-full h-80">
      <h2 className="text-xl font-semibold mb-2">Pool Share Distribution</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="time" minTickGap={20} />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(6)} (${data.find(d => d.share === value)?.percentage})`,
              'Share'
            ]}
          />
          <Legend />
          <Bar dataKey="share" name="Pool Share" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
