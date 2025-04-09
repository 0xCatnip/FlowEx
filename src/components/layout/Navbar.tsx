"use client";

import { useWeb3 } from "@/components/providers/Web3Provider";
import Link from "next/link";
import { md5 } from "js-md5";
import { useState } from "react";

export default function Navbar() {
  const { account, connect, disconnect } = useWeb3();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const toggleDisconnectButton = () => {
    setShowDisconnect((prev) => !prev);
    setShowAccountInfo((prev) => !prev);
  };

  return (
    <nav className="bg-white bg-opacity-20 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold hover:text-gray-300 transition duration-300"
            >
              FlowEx
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/swap"
              className="hover:text-gray-300 transition duration-300"
            >
              Swap
            </Link>
            <Link
              href="/pool"
              className="hover:text-gray-300 transition duration-300"
            >
              Pool
            </Link>
            <Link
              href="/analytics"
              className="hover:text-gray-300 transition duration-300"
            >
              Analytics
            </Link>

            {account ? (
              <div className="flex items-center space-x-2">
                <img
                  src={`https://www.gravatar.com/avatar/${md5(
                    account.trim().toLowerCase()
                  )}?d=identicon`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer transition-transform transform hover:scale-110"
                  onClick={toggleDisconnectButton}
                />
                <span className="text-sm">{account.slice(0, 6)}</span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300 shadow-lg hover:shadow-xl"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {showAccountInfo && account && (
        <div className="absolute right-0 mt-2 w-64 bg-white bg-opacity-20 text-white p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Account Information</h3>
          <p className="text-sm mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
            <strong>Address:</strong> {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </p>
          </div>
          <button
            onClick={disconnect}
            className="border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white w-full px-2 py-1 rounded transition duration-300 shadow-md hover:shadow-lg"
          >
            <span className="text-sm">Disconnect</span>
          </button>
        </div>
      )}
    </nav>
  );
}
