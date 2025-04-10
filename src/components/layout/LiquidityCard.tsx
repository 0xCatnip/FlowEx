// components/LiquidityCard.tsx
import React from "react";

type Props = {
  pairName: string;
  share: string;
  value: string;
  onAdd: () => void;
  onRemove: () => void;
  disabled?: boolean;
};

export default function LiquidityCard({
  pairName,
  share,
  value,
  onAdd,
  onRemove,
  disabled,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      <h2 className="mb-2">{pairName}</h2>
      <div className="space-y-6">
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p>Share: {share}</p>
            <p>Value: ${value}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onRemove}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
            disabled={disabled}
          >
            Remove
          </button>
          <button
            onClick={onAdd}
            className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={disabled}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
