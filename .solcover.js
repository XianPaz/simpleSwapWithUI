module.exports = {
  skipFiles: ["test", "mocks"], // optional
  configureYulOptimizer: false,
  mocha: {
    timeout: 200000,
  },
};