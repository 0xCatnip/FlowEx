// components/LiquidityCard.tsx
import React from "react";
import { ethers } from "ethers";
import { Trade } from "@/app/liquidity/page";

type Props = {
  trade: Trade;
  onAddClick: (poolAddr: string) => void;
  onRemoveClick: (poolAddr: string) => void;
};

export default function LiquidityCard({
  trade,
  onRemoveClick,
  onAddClick,
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
          <strong>Amount A:</strong> {formatAmount(trade.amountA)}{" "}
          {trade.tokenA}
        </p>
        <p>
          <strong>Amount B:</strong> {formatAmount(trade.amountB)}{" "}
          {trade.tokenB}
        </p>
        {/* <p>
          <strong>Share:</strong> {trade.share}%
        </p> */}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => onRemoveClick(trade.pooladdress)}
          className="w-full bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
          // disabled={disabled}
        >
          Remove
        </button>
        <button
          onClick={() => onAddClick(trade.pooladdress)}
          className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-1.5 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add
        </button>
      </div>
    </div>
  );
}
