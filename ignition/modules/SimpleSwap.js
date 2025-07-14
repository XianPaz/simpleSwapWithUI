const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SimpleSwapModule = buildModule("SimpleSwapModule", (m) => {
  const simpleSwap = m.contract("SimpleSwap", ["0x1AF67737eEED0a51CB8F570670C2B0F999b6928d","0x87aE74E2a9c5aB9447C047Ddf89E9aC6D03B2e01"]);

  return { simpleSwap };
});

module.exports = SimpleSwapModule;