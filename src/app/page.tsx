import Link from "next/link";

export default function Home() {
  return (
    <main className="text-white px-12">
      {/* Hero Section */}
      <section className="flex flex-col h-screen items-center justify-center text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-6xl font-extrabold">
            {"Welcome to FlowEx".toUpperCase()}
          </h1>
          <p className="text-2xl">
            A decentralized exchange with Curve-style AMM implementation
          </p>
        </div>
        <div className="flex space-x-10">
          <Link
            href="/swap"
            className="border border-white text-white bg-transparent hover:bg-purple-500 transition duration-300 px-8 py-4 rounded-lg shadow-lg transform hover:scale-105"
          >
            {"Start Trading".toUpperCase()}
          </Link>
          <Link
            href="/pool"
            className="border border-white text-white bg-transparent hover:bg-blue-500 transition duration-300 px-8 py-4 rounded-lg shadow-lg transform hover:scale-105"
          >
            {"Add Liquidity".toUpperCase()}
          </Link>
        </div>
      </section>

      <div className="bg-white bg-opacity-25 h-1"></div>

      {/* Features Section */}
      <section className="flex flex-col h-screen items-center justify-center px-4">
        {/* Intro Heading */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful DeFi Tools, Simplified
          </h2>
          <p className="text-lg text-gray-200">
            Our platform offers a seamless, gas-efficient way to trade, provide
            liquidity, and analyze token performance—all powered by a
            Curve-inspired AMM for optimal pricing.
          </p>
        </div>

        {/* Feature Cards */}
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Token Exchange */}
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Token Exchange
            </h3>
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Seamlessly trade between a wide variety of ERC-20 tokens with
              minimal slippage using our advanced Curve-style Automated Market
              Maker (AMM). Our platform ensures efficient price discovery and
              optimized trade execution.
            </p>
          </div>

          {/* Card 2: Liquidity Pools */}
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Liquidity Pools
            </h3>
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Provide liquidity to our dynamic pools and become an integral part
              of the ecosystem. Earn rewards and a share of transaction fees
              generated from trades in the pool.
            </p>
          </div>

          {/* Card 3: Analytics */}
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Analytics
            </h3>
            <p className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Gain valuable insights into the market with our comprehensive
              analytics tools. Monitor real-time price movements, trading
              volume, and liquidity pool performance statistics.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white bg-opacity-25 h-1"></div>

      {/* How It Works Section */}
      <section className="flex flex-col h-screen items-center justify-center">
        <h2 className="text-4xl font-extrabold text-center mb-24 text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-semibold mb-2 text-gray-800">Connect Wallet</h4>
            <p className="text-gray-600">
              Connect your Web3 wallet to get started.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-semibold mb-2 text-gray-800">Choose Action</h4>
            <p className="text-gray-600">
              Select between trading or providing liquidity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-semibold mb-2 text-gray-800">Set Parameters</h4>
            <p className="text-gray-600">Configure your transaction details.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-semibold mb-2 text-gray-800">Confirm</h4>
            <p className="text-gray-600">Review and confirm your transaction.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
