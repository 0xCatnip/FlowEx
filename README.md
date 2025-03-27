# FlowEx - Decentralized Exchange

A decentralized exchange built with Next.js, featuring Curve-style AMM, liquidity pool management, and real-time data analytics.

## Features

- Web3 wallet integration (MetaMask)
- Token exchange with ERC-20 tokens
- Curve-style AMM implementation
- Liquidity pool management (add/remove liquidity)
- Transaction history
- Real-time data analytics
- Price charts and volume analysis

## Tech Stack

- Frontend:
  - Next.js
  - Tailwind CSS
  - Web3.js/Ethers.js
  - Chart.js (for data visualization)

- Backend:
  - Next.js API Routes
  - Redis (for caching)
  - The Graph (for historical data)

- Blockchain:
  - Hardhat (local development)
  - Solidity (smart contracts)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start local blockchain:
   ```bash
   npx hardhat node
   ```

5. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

## Project Structure

- `src/app/`: Next.js app directory
- `src/contracts/`: Smart contracts
- `src/components/`: Reusable React components
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions and configurations
- `src/types/`: TypeScript type definitions
- `src/utils/`: Helper functions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 