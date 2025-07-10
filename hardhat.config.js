require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

module.exports = {
  solidity: "0.8.27", // or your preferred version
  networks: {
    hardhat: {
      // default network, no need to change this for local testing
    },
    localhost: {
      url: "http://127.0.0.1:8545", // local node started with `npx hardhat node`
      chainId: 31337,               // Hardhat local chain ID
      // Optional: you can use private keys if using a custom account
      // accounts: [privateKey1, privateKey2]
    },
  },
};

/**
require("dotenv").config();
const INFURA_NODO = process.env.NODO; // ESCRIBIR EN LA BLOCKCHAIN
const SEPOLIA_PRIVATE_KEY = process.env.PRKEY; // eL QUE PAGA EL GAS
const ETHERSCAN_API_KEY = process.env.ETHSCAN_KEY; // VERIFICAR EL CONTRATO


module.exports = {
  solidity: "0.8.28",
  gasReporter:{
    enabled: true,
  },
  networks: {
    sepolia: {
      url: INFURA_NODO,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

**/

