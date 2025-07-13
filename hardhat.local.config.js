require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

module.exports = {
  
  networks: {
    hardhat: {
    },
    localhost: {
      url: "http://127.0.0.1:8545", // local node started with `npx hardhat node`
      chainId: 31337,               // Hardhat local chain ID
    }
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}
