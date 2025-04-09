'use client';

import { useWeb3 } from '../providers/Web3Provider';
import Link from 'next/link';

export default function Navbar() {
  const { account, connect, disconnect } = useWeb3();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              FlowEx
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/swap" className="hover:text-gray-300">
              Swap
            </Link>
            <Link href="/pool" className="hover:text-gray-300">
              Pool
            </Link>
            <Link href="/analytics" className="hover:text-gray-300">
              Analytics
            </Link>
            
            {account ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 