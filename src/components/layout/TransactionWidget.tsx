// components/LiquidityCard.tsx
import React from "react";
import { ethers } from "ethers";
import { Trade } from "@/app/liquidity/page";

type Props = {
  trade: Trade;
};

export default function TransactionCard({
  trade,
}: Props) {
  const formatAmount = (val: ethers.BigNumberish) =>
    ethers.formatUnits(val, 18);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold">
          FlowEx: {trade.tokenA}&{trade.tokenB} ({trade.tokenB}&{trade.tokenA})
        </h2>
        <span className="text-xs text-gray-500">{trade.datetime}</span>
      </div>

      <div className="space-y-2 text-xs text-gray-700">
        <p>
          <strong>Action:</strong> {trade.action}
        </p>
        <p>
          <strong>Input Amount:</strong> {formatAmount(trade.amountA)}{" "}
          {trade.tokenA}
        </p>
        <p>
          <strong>Output Amount:</strong> {formatAmount(trade.amountB)}{" "}
          {trade.tokenB}
        </p>
        {/* <p>
          <strong>Share:</strong> {trade.share}%
        </p> */}
      </div>
    </div>
  );
}
