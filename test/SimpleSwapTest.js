const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let tokenA, tokenB, swap, owner, user;

  before(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy Token A
    // const tokenA = await ethers.deployContract("XianPazTokenA", owner.getAddress());
    // console.log(owner.address, owner.getAddress(), owner);
    const TokenA = await ethers.getContractFactory("XianPazTokenA");
    tokenA = await TokenA.deploy(owner.address);
    await tokenA.waitForDeployment();

    // Mint Token A
    await tokenA.mint(owner.address, ethers.parseEther("100000"));

    // Deploy Token B
    const TokenB = await ethers.getContractFactory("XianPazTokenB");
    tokenB = await TokenB.deploy(owner.address);
    await tokenB.waitForDeployment();

    // Mint Token B
    await tokenB.mint(owner.address, ethers.parseEther("100000"));

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
      owner.address,
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

    await tokenA.transfer(user.address, amountIn);

    await tokenA.approve(swap.getAddress(), amountIn);

    const path = [tokenA.getAddress(), tokenB.getAddress()];
    const deadline = Math.floor(Date.now() / 1000) + 60;

    const balBefore = await tokenB.balanceOf(user.address);

    await swap.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      user.address,
      deadline
    );

    const balAfter = await tokenB.balanceOf(user.address);
    expect(balAfter).to.be.gt(balBefore);
  });

  it("should return the correct price A → B", async () => {
    const price = await swap.getPrice(tokenA.getAddress(), tokenB.getAddress());
    const formatted = parseFloat(ethers.formatUnits(price, 18));

    // Expect 1 A ≈ 0.5 B (25000 / 50000)
    expect(formatted).to.be.closeTo(0.5, 0.02);
  });

  it("should remove liquidity", async () => {
    /* const liquidity = await swap.totalLiquidity(); */
    const liquidity = ethers.parseEther("10");

    const balABefore = await tokenA.balanceOf(owner.address);
    const balBBefore = await tokenB.balanceOf(owner.address);

    await swap.removeLiquidity(
      tokenA.getAddress(),
      tokenB.getAddress(),
      liquidity,
      0,
      0,
      owner.address,
      Math.floor(Date.now() / 1000) + 60
    );

    const balAAfter = await tokenA.balanceOf(owner.address);
    const balBAfter = await tokenB.balanceOf(owner.address);

    expect(balAAfter).to.be.gt(balABefore);
    expect(balBAfter).to.be.gt(balBBefore);
  });

  /* Second wave of tests */

  it("should revert on adding liquidity with invalid token addresses", async () => {
  const deadline = Math.floor(Date.now() / 1000) + 60;
  await expect(
    swap.addLiquidity(
      ethers.ZeroAddress,
      tokenB.getAddress(),
      ethers.parseEther("100"),
      ethers.parseEther("50"),
      0,
      0,
      owner.address,
      deadline
    )
  ).to.be.revertedWith("invalid tokens");
});

it("should revert on expired deadline when adding liquidity", async () => {
  await expect(
    swap.addLiquidity(
      tokenA.getAddress(),
      tokenB.getAddress(),
      ethers.parseEther("100"),
      ethers.parseEther("50"),
      0,
      0,
      owner.address,
      Math.floor(Date.now() / 1000) - 10
    )
  ).to.be.revertedWith("expired");
});

it("should revert when removing more liquidity than owned", async () => {
  await expect(
    swap.removeLiquidity(
      tokenA.getAddress(),
      tokenB.getAddress(),
      ethers.parseEther("1000000"), // too much
      0,
      0,
      owner.address,
      Math.floor(Date.now() / 1000) + 60
    )
  ).to.be.revertedWith("not enough liquidity");
});

it("should revert if swap uses wrong token pair", async () => {
  const wrongToken = await (await ethers.getContractFactory("XianPazTokenA")).deploy(owner.address);
  await wrongToken.waitForDeployment();

  const path = [tokenA.getAddress(), wrongToken.getAddress()];
  await expect(
    swap.swapExactTokensForTokens(
      ethers.parseEther("100"),
      0,
      path,
      owner.address,
      Math.floor(Date.now() / 1000) + 60
    )
  ).to.be.revertedWith("invalid token pair");
});

it("should revert on expired swap", async () => {
  const path = [tokenA.getAddress(), tokenB.getAddress()];
  await expect(
    swap.swapExactTokensForTokens(
      ethers.parseEther("10"),
      0,
      path,
      owner.address,
      Math.floor(Date.now() / 1000) - 10
    )
  ).to.be.revertedWith("expired");
});

it("should return correct output amount via getAmountOut", async () => {
  const reserveA = await swap.reserveA();
  const reserveB = await swap.reserveB();
  const amountIn = ethers.parseEther("10");

  const amountOut = await swap.getAmountOut(amountIn, reserveA, reserveB);

  expect(amountOut).to.be.gt(0);
});

it("should get reverse price (B → A)", async () => {
  const price = await swap.getPrice(tokenB.getAddress(), tokenA.getAddress());
  const formatted = parseFloat(ethers.formatUnits(price, 18));

  // 1 B ≈ 2 A (50000 / 25000)
  expect(formatted).to.be.closeTo(2.0, 0.1);
});

it("should allow swap B → A", async () => {
  const amountIn = ethers.parseEther("200");

  await tokenB.transfer(user.address, amountIn);
  const userTokenB = tokenB.connect(user);
  const userSwap = swap.connect(user);

  await userTokenB.approve(userSwap.getAddress(), amountIn);

  const path = [tokenB.getAddress(), tokenA.getAddress()];
  const deadline = Math.floor(Date.now() / 1000) + 60;

  const balBefore = await tokenA.balanceOf(user.address);

  await userSwap.swapExactTokensForTokens(
    amountIn,
    0,
    path,
    user.address,
    deadline
  );

  const balAfter = await tokenA.balanceOf(user.address);

  expect(balAfter).to.be.gt(balBefore);
});

});
