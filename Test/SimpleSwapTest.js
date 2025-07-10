const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let tokenA, tokenB, swap, owner, user;

  before(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy Token A
    const TokenA = await ethers.getContractFactory("XianPazTokenA");
    tokenA = await TokenA.deploy(owner);
    await tokenA.waitForDeployment();

    // Mint Token A
    await tokenA.mint(owner, ethers.parseEther("100000"));

    // Deploy Token B
    const TokenB = await ethers.getContractFactory("XianPazTokenB");
    tokenB = await TokenB.deploy(owner);
    await tokenB.waitForDeployment();

    // Mint Token B
    await tokenB.mint(owner, ethers.parseEther("100000"));

    // Deploy SimpleSwap
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    swap = await SimpleSwap.deploy(tokenA.getAddress(), tokenB.getAddress());
    await swap.waitForDeployment();

    // Approve and add custom liquidity
    const liquidityTokenA = ethers.parseEther("50000");
    const liquidityTokenB = ethers.parseEther("25000");

    await tokenA.approve(swap.getAddress(), liquidityTokenA);
    await tokenB.approve(swap.getAddress(), liquidityTokenB);

    await swap.addLiquidity(
      tokenA.getAddress(),
      tokenB.getAddress(),
      liquidityTokenA,
      liquidityTokenB,
      0,
      0,
      owner,
      Math.floor(Date.now() / 1000) + 60
    );
  });

  it("should deploy correctly with reserves", async () => {
    const resA = await swap.reserveA();
    const resB = await swap.reserveB();

    expect(resA).to.equal(ethers.parseEther("50000"));
    expect(resB).to.equal(ethers.parseEther("25000"));
  });

  it("should allow token swap (A → B)", async () => {
    const amountIn = ethers.parseEther("1000");

    await tokenA.transfer(user, amountIn);

    await tokenA.approve(swap.getAddress(), amountIn);

    const path = [tokenA.getAddress(), tokenB.getAddress()];
    const deadline = Math.floor(Date.now() / 1000) + 60;

    const balBefore = await tokenB.balanceOf(user);

    await swap.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      user,
      deadline
    );

    const balAfter = await tokenB.balanceOf(user);
    expect(balAfter).to.be.gt(balBefore);
  });

  it("should return the correct price A → B", async () => {
    const price = await swap.getPrice(tokenA.getAddress(), tokenB.getAddress());
    const formatted = parseFloat(ethers.formatUnits(price, 18));

    // Expect 1 A ≈ 0.5 B (25000 / 50000)
    expect(formatted).to.be.closeTo(0.5, 0.02);
  });

  it("should remove liquidity", async () => {
    const liquidity = await swap.totalLiquidity();

    const balABefore = await tokenA.balanceOf(owner);
    const balBBefore = await tokenB.balanceOf(owner);

    await swap.removeLiquidity(
      tokenA.getAddress(),
      tokenB.getAddress(),
      liquidity,
      0,
      0,
      owner,
      Math.floor(Date.now() / 1000) + 60
    );

    const balAAfter = await tokenA.balanceOf(owner.address);
    const balBAfter = await tokenB.balanceOf(owner.address);

    expect(balAAfter).to.be.gt(balABefore);
    expect(balBAfter).to.be.gt(balBBefore);
  });
});
