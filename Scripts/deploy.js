const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy Token A
  const TokenA = await ethers.getContractFactory("XianPazTokenA");
  const tokenA = await TokenA.deploy(deployer.address);
  await tokenA.waitForDeployment();
  tokenAAddress = await tokenA.getAddress();
  console.log("XianPazTokenA deployed at: ", tokenAAddress);

  // 2. Deploy Token B
  const TokenB = await ethers.getContractFactory("XianPazTokenB");
  const tokenB = await TokenB.deploy(deployer.address);
  await tokenB.waitForDeployment();
  tokenBAddress = await tokenB.getAddress();
  console.log("XianPazTokenB deployed at: ", tokenBAddress);

  // 3. Deploy SimpleSwap with both token addresses
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy(tokenAAddress, tokenBAddress);
  await simpleSwap.waitForDeployment();
  simpleSwapAddress = await simpleSwap.getAddress();
  console.log("SimpleSwap deployed at: ", simpleSwapAddress);

  // 4. Save contract metadata to FrontEnd
  const writeArtifact = async (name, addr) => {
    const artifact = await hre.artifacts.readArtifact(name);
    fs.writeFileSync(
      path.join(__dirname, "..", "FrontEnd", `${name}.json`),
      JSON.stringify({ address: addr, abi: artifact.abi }, null, 2)
    );
  };

  await writeArtifact("XianPazTokenA", tokenAAddress);
  await writeArtifact("XianPazTokenB", tokenBAddress);
  await writeArtifact("SimpleSwap", simpleSwapAddress);

  console.log("✅ All contracts deployed and metadata saved to FrontEnd/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
