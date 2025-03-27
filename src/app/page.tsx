import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to FlowEx
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A decentralized exchange with Curve-style AMM implementation
        </p>
        <div className="space-x-4">
          <Link
            href="/swap"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Start Trading
          </Link>
          <Link
            href="/pool"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Add Liquidity
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Token Exchange</h3>
          <p className="text-gray-600">
            Trade between different ERC-20 tokens with minimal slippage using our Curve-style AMM.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Liquidity Pools</h3>
          <p className="text-gray-600">
            Add or remove liquidity from our pools and earn fees from trades.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Analytics</h3>
          <p className="text-gray-600">
            Track price movements, volume, and pool statistics in real-time.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-semibold mb-2">Connect Wallet</h4>
            <p className="text-gray-600">Connect your Web3 wallet to get started</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-semibold mb-2">Choose Action</h4>
            <p className="text-gray-600">Select between trading or providing liquidity</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-semibold mb-2">Set Parameters</h4>
            <p className="text-gray-600">Configure your transaction details</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-semibold mb-2">Confirm</h4>
            <p className="text-gray-600">Review and confirm your transaction</p>
          </div>
        </div>
      </section>
    </div>
  );
} 