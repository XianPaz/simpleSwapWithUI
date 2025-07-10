let userAddress;
let signer;
let price;

async function connect()
{
    let provider;

    if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask!");
        return;
    }

    // Ask user to connect wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Set up ethers provider & signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById('account').innerHTML=userAddress.toString().slice(0,6)+"...";

    await refreshTokenABalance();
    await refreshTokenBBalance();
    await refreshPrice();

    console.log("✅ Connected as:", userAddress);

};

async function refreshTokenABalance () {
    // Load XianPazTokenA contract from JSON
    const res = await fetch("XianPazTokenA.json");
    const { address, abi } = await res.json();
    tokenA = new ethers.Contract(address, abi, signer);

    // Call balanceOf
    const balance = await tokenA.balanceOf(userAddress);
    document.getElementById('balanceXianPazTokenA').innerHTML=formatEtherPretty(ethers.utils.formatEther(balance));
    console.log("Token A balance:", ethers.utils.formatEther(balance));
}

async function refreshTokenBBalance () {
    // Load XianPazTokenB contract from JSON
    const res = await fetch("XianPazTokenB.json");
    const { address, abi } = await res.json();
    tokenB = new ethers.Contract(address, abi, signer);

    // Call balanceOf
    const balance = await tokenB.balanceOf(userAddress);
    document.getElementById('balanceXianPazTokenB').innerHTML=formatEtherPretty(ethers.utils.formatEther(balance));
    console.log("Token B balance:", ethers.utils.formatEther(balance));
}

async function refreshPrice () {

    const resA = await fetch("XianPazTokenA.json");
    const { address: addressA, abi: abiA } = await resA.json();
    tokenA = new ethers.Contract(addressA, abiA, signer);

    const resB = await fetch("XianPazTokenB.json");
    const { address: addressB, abi: abiB } = await resB.json();
    tokenB = new ethers.Contract(addressB, abiB, signer);

    const resSS = await fetch("SimpleSwap.json");
    const { address: addressSS, abi: abiSS } = await resSS.json();
    simpleSwap = new ethers.Contract(addressSS, abiSS, signer);

    // Call getPrice (price of tokenB in terms of tokenA)
    const rawPrice = await simpleSwap.getPrice(addressA, addressB);
    price = ethers.utils.formatUnits(rawPrice, 18);
    document.getElementById('swap-price').innerHTML=price;
    console.log(`💱 1 TokenA = ${price} TokenB`);
}

async function setValueTokenToSpend() {        
    
    const res = await fetch("SimpleSwap.json");
    const { address, abi } = await res.json();
    simpleSwap = new ethers.Contract(address, abi, signer);
    
    amountInHuman = document.getElementsByClassName("IHAVE")[0].value;

    if (amountInHuman <= 0 || userAddress == undefined) {
        document.getElementsByClassName("IHAVE")[0].value = 0;
        return;
    }

    const amountIn = ethers.utils.parseEther(amountInHuman.toString());
    const reserveA = await simpleSwap.reserveA();
    const reserveB = await simpleSwap.reserveB();

    const amountOut = await simpleSwap.getAmountOut(amountIn, reserveA, reserveB);
    const amountOutHuman = ethers.utils.formatEther(amountOut);

	document.getElementsByClassName("IWANT")[0].value=amountOutHuman;
}

async function handleSubmit() {

    amountInHuman = document.getElementsByClassName("IHAVE")[0].value;
    if (amountInHuman <= 0 || userAddress == undefined) {
        document.getElementsByClassName("IHAVE")[0].value = 0;
        return;
    }

    await swapTokenAtoB();

    await refreshTokenABalance();
    await refreshTokenBBalance();
    await refreshPrice();
}

async function swapTokenAtoB() {

    const slippagePercent = 0.5
    amountInHuman = document.getElementsByClassName("IHAVE")[0].value;

    const resA = await fetch("XianPazTokenA.json");
    const { address: addressA, abi: abiA } = await resA.json();
    tokenA = new ethers.Contract(addressA, abiA, signer);

    const res = await fetch("SimpleSwap.json");
    const { address, abi } = await res.json();
    simpleSwap = new ethers.Contract(address, abi, signer);

    // Convert input amount to BigNumber
    const amountIn = ethers.utils.parseEther(amountInHuman.toString());

    // Fetch reserves from SimpleSwap
    const reserveA = await simpleSwap.reserveA();
    const reserveB = await simpleSwap.reserveB();

    // Estimate output
    const amountOut = await simpleSwap.getAmountOut(amountIn, reserveA, reserveB);

    // Apply slippage (e.g. 0.5% => keep 99.5%)
    const slippageFactor = (100 - slippagePercent) / 100;
    const amountOutMin = amountOut.mul(ethers.BigNumber.from(Math.floor(slippageFactor * 1000))).div(1000);

    // Approve SimpleSwap to spend TokenA
    const approveTx = await tokenA.approve(simpleSwap.address, amountIn);
    await approveTx.wait();
    console.log("✅ Approved!");

    // Define path and deadline
    const path = [tokenA.address, tokenB.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

    // Execute the swap
    const tx = await simpleSwap.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        userAddress,
        deadline
    );

    console.log("⏳ Swapping...");
    await tx.wait();
    console.log("✅ Swap successful!");
}

function formatEtherPretty(bigNumber) {
  const raw = ethers.utils.formatEther(ethers.utils.parseEther(bigNumber)); // Convert BigNumber to string
  const float = parseFloat(raw);                                            // Convert to number

  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(float);
}