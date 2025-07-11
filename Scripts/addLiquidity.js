const fs = require("fs");
const path = require("path");

async function main() {

  // Mint tokens
  await mintTokenA();
  await mintTokenB();

  // Add liquidity
  await addLiquidity();
}

async function mintTokenA() {
  const [signer] = await ethers.getSigners();

  // Load contract address and ABI from the JSON file
  const tokenAJsonPath = path.join(__dirname, "..", "FrontEnd", "XianPazTokenA.json");
  const { address, abi } = JSON.parse(fs.readFileSync(tokenAJsonPath, "utf8"));

  // Connect to contract
  tokenA = new ethers.Contract(address, abi, signer);

  // Define amount to mint: 100000 * 1e18 (assuming 18 decimals)
  const amount = ethers.parseEther("100000");

  // Call mint (if the deployer has permission)
  const tx = await tokenA.mint(signer.address, amount);
  console.log("Minting in progress...");
  await tx.wait();

  console.log(`✅ Minted 100,000 XPTA to ${signer.address}`);
}

async function mintTokenB() {
  const [signer] = await ethers.getSigners();

  // Load contract address and ABI from the JSON file
  const tokenBJsonPath = path.join(__dirname, "..", "FrontEnd", "XianPazTokenB.json");
  const { address, abi } = JSON.parse(fs.readFileSync(tokenBJsonPath, "utf8"));

  // Connect to contract
  tokenB = new ethers.Contract(address, abi, signer);

  // Define amount to mint: 100000 * 1e18 (assuming 18 decimals)
  const amount = ethers.parseEther("100000");

  // Call mint (if the deployer has permission)
  const tx = await tokenB.mint(signer.address, amount);
  console.log("Minting in progress...");
  await tx.wait();

  console.log(`✅ Minted 100,000 XPTB to ${signer.address}`);
}

async function addLiquidity() {
  const [signer] = await ethers.getSigners();

  const tokenAJsonPath = path.join(__dirname, "..", "FrontEnd", "XianPazTokenA.json");
  const { address: addressA, abi: abiA } = JSON.parse(fs.readFileSync(tokenAJsonPath, "utf8"));
  tokenA = await new ethers.Contract(addressA, abiA, signer);

  const tokenBJsonPath = path.join(__dirname, "..", "FrontEnd", "XianPazTokenB.json");
  const { address: addressB, abi: abiB } = JSON.parse(fs.readFileSync(tokenBJsonPath, "utf8"));
  tokenB = await new ethers.Contract(addressB, abiB, signer);

  const simpleSwapJsonPath = path.join(__dirname, "..", "FrontEnd", "SimpleSwap.json");
  const { address: addressSS, abi: abiSS } = JSON.parse(fs.readFileSync(simpleSwapJsonPath, "utf8"));
  simpleSwap = await new ethers.Contract(addressSS, abiSS, signer);

  // Amounts to add
  const amountA = ethers.parseEther("50000");
  const amountB = ethers.parseEther("25000");

  // Approve tokens
  console.log("Approving tokenA...");
  await (await tokenA.approve(simpleSwap.getAddress(), amountA)).wait();
  console.log("Approving tokenB...");
  await (await tokenB.approve(simpleSwap.getAddress(), amountB)).wait();

  // Add liquidity
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min from now

  console.log("Adding liquidity...");
  const tx = await simpleSwap.addLiquidity(
    await tokenA.getAddress(),
    await tokenB.getAddress(),
    amountA,
    amountB,
    0,
    0,
    signer.address,
    deadline
  );

  const receipt = await tx.wait();
  console.log("✅ Liquidity added");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
