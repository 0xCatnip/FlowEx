"use client";

import { Trade } from "@/components/template";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ShareChart({ trades }: { trades: Trade[] }) {
  const data = trades
    .filter((t) => t.action !== "Swap")
    .map((t) => ({
      time: t.datetime,
      share: Number(t.share),
      type: t.action,
    }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="share" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
