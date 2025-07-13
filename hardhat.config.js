require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;          // alchemy sepolia node
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;  // who execute txs and pay the gas
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;      // used to verify contract

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
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

