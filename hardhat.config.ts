require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@typechain/hardhat");
require("ts-node/register");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/contracts/artifacts",
    cache: "./src/contracts/cache"
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  }
}; 